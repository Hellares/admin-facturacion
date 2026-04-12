import { Button, Table, InputNumber, Input, Select, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { ColumnsType } from 'antd/es/table';
import { IGV_AFECTACION_OPTIONS, UNIDAD_MEDIDA_OPTIONS } from '@/utils/constants';
import { calculateItemTotals } from '@/utils/tax-calculator';
import { formatNumber } from '@/utils/format';
import type { DetalleItem } from '@/types/common.types';

/** Controla que campos estan bloqueados y si se puede agregar/eliminar filas.
 *  Se usa en Notas de Credito donde las restricciones dependen del motivo SUNAT. */
export interface ItemsTableRestrictions {
  allowAdd?: boolean;        // default true
  allowDelete?: boolean;     // default true
  lockCodigo?: boolean;
  lockDescripcion?: boolean;
  lockUnidad?: boolean;
  lockCantidad?: boolean;
  lockPrecio?: boolean;
  lockIgv?: boolean;
}

interface ItemsTableProps {
  name?: string; // field array name, default 'detalles'
  simplified?: boolean; // for dispatch guides - less columns
  restrictions?: ItemsTableRestrictions;
}

interface ItemRow {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  mto_precio_unitario?: number;
  mto_valor_unitario?: number;
  tip_afe_igv: string;
  porcentaje_igv: number;
}

export default function ItemsTable({ name = 'detalles', simplified = false, restrictions }: ItemsTableProps) {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const watchedItems = useWatch({ control, name }) as ItemRow[] | undefined;

  const allowAdd = restrictions?.allowAdd ?? true;
  const allowDelete = restrictions?.allowDelete ?? true;
  const lockCodigo = !!restrictions?.lockCodigo;
  const lockDescripcion = !!restrictions?.lockDescripcion;
  const lockUnidad = !!restrictions?.lockUnidad;
  const lockCantidad = !!restrictions?.lockCantidad;
  const lockPrecio = !!restrictions?.lockPrecio;
  const lockIgv = !!restrictions?.lockIgv;

  const addItem = () => {
    append({
      codigo: '',
      descripcion: '',
      unidad: 'NIU',
      cantidad: 1,
      mto_precio_unitario: 0,
      mto_valor_unitario: undefined,
      tip_afe_igv: '10',
      porcentaje_igv: 18,
    });
  };

  const columns: ColumnsType<ItemRow & { id: string }> = [
    {
      title: '#',
      width: 40,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Codigo',
      width: 100,
      render: (_, __, index) => (
        <Input
          size="small"
          value={watchedItems?.[index]?.codigo}
          onChange={(e) => setValue(`${name}.${index}.codigo`, e.target.value)}
          placeholder="COD"
          disabled={lockCodigo}
        />
      ),
    },
    {
      title: 'Descripcion',
      render: (_, __, index) => (
        <Input
          size="small"
          value={watchedItems?.[index]?.descripcion}
          onChange={(e) => setValue(`${name}.${index}.descripcion`, e.target.value)}
          placeholder="Descripcion del producto o servicio"
          disabled={lockDescripcion}
        />
      ),
    },
    {
      title: 'Und',
      width: 90,
      render: (_, __, index) => (
        <Select
          size="small"
          value={watchedItems?.[index]?.unidad}
          onChange={(val) => setValue(`${name}.${index}.unidad`, val)}
          options={UNIDAD_MEDIDA_OPTIONS.map((u) => ({ value: u.value, label: u.value }))}
          style={{ width: '100%' }}
          disabled={lockUnidad}
        />
      ),
    },
    {
      title: 'Cant.',
      width: 80,
      render: (_, __, index) => (
        <InputNumber
          size="small"
          value={watchedItems?.[index]?.cantidad}
          onChange={(val) => setValue(`${name}.${index}.cantidad`, val || 0)}
          min={0.001}
          step={1}
          style={{ width: '100%' }}
          disabled={lockCantidad}
        />
      ),
    },
    {
      title: 'P. Unit. (inc. IGV)',
      width: 130,
      render: (_, __, index) => (
        <InputNumber
          size="small"
          value={watchedItems?.[index]?.mto_precio_unitario}
          onChange={(val) => {
            setValue(`${name}.${index}.mto_precio_unitario`, val || 0);
            setValue(`${name}.${index}.mto_valor_unitario`, undefined);
          }}
          min={0}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
          disabled={lockPrecio}
        />
      ),
    },
  ];

  if (!simplified) {
    columns.push(
      {
        title: 'Afect. IGV',
        width: 220,
        render: (_, __, index) => (
          <Select
            size="small"
            showSearch
            optionFilterProp="label"
            value={watchedItems?.[index]?.tip_afe_igv}
            onChange={(val) => {
              setValue(`${name}.${index}.tip_afe_igv`, val);
              // Auto-set IGV percentage
              if (val >= '20' && val <= '21') setValue(`${name}.${index}.porcentaje_igv`, 0);
              else if (val >= '30') setValue(`${name}.${index}.porcentaje_igv`, 0);
              else setValue(`${name}.${index}.porcentaje_igv`, 18);
            }}
            options={IGV_AFECTACION_OPTIONS.map((o) => ({ value: o.value, label: `${o.value} - ${o.label}` }))}
            style={{ width: '100%' }}
            disabled={lockIgv}
          />
        ),
      },
      {
        title: 'IGV %',
        width: 70,
        render: (_, __, index) => (
          <InputNumber
            size="small"
            value={watchedItems?.[index]?.porcentaje_igv}
            onChange={(val) => setValue(`${name}.${index}.porcentaje_igv`, val || 0)}
            min={0}
            max={100}
            style={{ width: '100%' }}
            disabled={lockIgv}
          />
        ),
      },
    );
  }

  // Calculated columns
  columns.push(
    {
      title: 'IGV',
      width: 80,
      align: 'right',
      render: (_, __, index) => {
        const item = watchedItems?.[index];
        if (!item) return '-';
        const totals = calculateItemTotals(item as unknown as Partial<DetalleItem>);
        return formatNumber(totals.igv);
      },
    },
    {
      title: 'Total',
      width: 100,
      align: 'right',
      render: (_, __, index) => {
        const item = watchedItems?.[index];
        if (!item) return '-';
        const totals = calculateItemTotals(item as unknown as Partial<DetalleItem>);
        return <strong>{formatNumber(totals.total_item)}</strong>;
      },
    },
    {
      title: '',
      width: 40,
      render: (_, __, index) =>
        allowDelete ? (
          <Tooltip title="Eliminar">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(index)}
            />
          </Tooltip>
        ) : null,
    },
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontWeight: 500, color: '#555', fontSize: 12 }}>Detalle de Items</span>
        {allowAdd && (
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addItem}>
            Agregar Item
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={fields as (ItemRow & { id: string })[]}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: simplified ? 800 : 1100 }}
        locale={{ emptyText: 'Sin items. Haga clic en "Agregar Item"' }}
      />
    </div>
  );
}

import { Button, DatePicker, InputNumber, Select, Space, Table, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFieldArray, useFormContext, useWatch, Controller } from 'react-hook-form';
import type { ColumnsType } from 'antd/es/table';
import dayjs from '@/lib/dayjs';
import { MONEDA_OPTIONS } from '@/utils/constants';

interface CuotaRow {
  id: string;
  moneda: string;
  monto: number;
  fecha_pago: string;
}

export default function PaymentTermsForm() {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'forma_pago_cuotas' });
  const formaPagoTipo = useWatch({ control, name: 'forma_pago_tipo' });
  const moneda = useWatch({ control, name: 'moneda' }) || 'PEN';

  const addCuota = () => {
    append({
      moneda,
      monto: 0,
      fecha_pago: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    });
  };

  const columns: ColumnsType<CuotaRow> = [
    {
      title: 'Cuota',
      width: 60,
      render: (_, __, index) => `${index + 1}`,
    },
    {
      title: 'Moneda',
      width: 100,
      render: (_, __, index) => (
        <Select
          size="small"
          value={fields[index] ? (fields[index] as CuotaRow).moneda || moneda : moneda}
          onChange={(val) => setValue(`forma_pago_cuotas.${index}.moneda`, val)}
          options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.value }))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Monto',
      width: 150,
      render: (_, __, index) => (
        <InputNumber
          size="small"
          value={(fields[index] as CuotaRow)?.monto}
          onChange={(val) => setValue(`forma_pago_cuotas.${index}.monto`, val || 0)}
          min={0.01}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Fecha Pago',
      width: 160,
      render: (_, __, index) => (
        <DatePicker
          size="small"
          value={(fields[index] as CuotaRow)?.fecha_pago ? dayjs((fields[index] as CuotaRow).fecha_pago) : null}
          onChange={(date) => setValue(`forma_pago_cuotas.${index}.fecha_pago`, date?.format('YYYY-MM-DD') || '')}
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '',
      width: 40,
      render: (_, __, index) => (
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(index)} />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 500 }}>Forma de Pago:</span>
        <Controller
          name="forma_pago_tipo"
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio.Button value="Contado">Contado</Radio.Button>
              <Radio.Button value="Credito">Credito</Radio.Button>
            </Radio.Group>
          )}
        />
      </Space>

      {formaPagoTipo === 'Credito' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Cuotas</strong>
            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addCuota}>
              Agregar Cuota
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={fields as CuotaRow[]}
            rowKey="id"
            size="small"
            pagination={false}
            locale={{ emptyText: 'Agregue cuotas de pago' }}
          />
        </div>
      )}
    </div>
  );
}

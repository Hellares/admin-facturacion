import { Button, Collapse, Input, InputNumber, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { ColumnsType } from 'antd/es/table';

interface MedioPagoRow {
  id: string;
  tipo: string;
  monto: number;
  referencia: string;
}

export default function MediosPagoForm() {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'medios_pago' });

  const addMedioPago = () => {
    append({ tipo: '001', monto: 0, referencia: '' });
  };

  const columns: ColumnsType<MedioPagoRow> = [
    {
      title: 'Tipo',
      width: 120,
      render: (_, __, index) => (
        <Input
          size="small"
          value={(fields[index] as MedioPagoRow)?.tipo}
          onChange={(e) => setValue(`medios_pago.${index}.tipo`, e.target.value)}
          placeholder="001"
        />
      ),
    },
    {
      title: 'Monto',
      width: 150,
      render: (_, __, index) => (
        <InputNumber
          size="small"
          value={(fields[index] as MedioPagoRow)?.monto}
          onChange={(val) => setValue(`medios_pago.${index}.monto`, val || 0)}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Referencia',
      render: (_, __, index) => (
        <Input
          size="small"
          value={(fields[index] as MedioPagoRow)?.referencia}
          onChange={(e) => setValue(`medios_pago.${index}.referencia`, e.target.value)}
          placeholder="Nro. operacion"
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
    <Collapse
      size="small"
      items={[{
        key: 'medios_pago',
        label: 'Medios de Pago (opcional)',
        children: (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addMedioPago}>
                Agregar Medio
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={fields as MedioPagoRow[]}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: 'Sin medios de pago' }}
            />
          </div>
        ),
      }]}
    />
  );
}

import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, DatePicker, Button, Space, Table, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useCreateNotaVenta } from './hooks/useNotaVentas';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { clienteDocumentoSchema } from '@/schemas/common.schema';
import { TIPO_DOCUMENTO_OPTIONS, MONEDA_OPTIONS } from '@/utils/constants';
import { formatNumber } from '@/utils/format';

const schema = z.object({
  company_id: z.number().min(1),
  branch_id: z.number().min(1),
  serie: z.string().min(1, 'Requerido'),
  fecha_emision: z.string().min(1, 'Requerida'),
  moneda: z.enum(['PEN', 'USD']),
  client: clienteDocumentoSchema,
  detalles: z.array(z.object({
    codigo: z.string().or(z.literal('')),
    descripcion: z.string().min(1, 'Requerido'),
    unidad: z.string().min(1),
    cantidad: z.number().min(0.01),
    precio_unitario: z.number().min(0),
    codigo_afectacion_igv: z.string().optional().or(z.literal('')),
    porcentaje_igv: z.number().min(0).max(100).optional(),
    descuento: z.number().min(0).optional(),
  })).min(1, 'Agregue al menos un item'),
  observaciones: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function NotaVentaFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId } = useCompanyContextStore();
  const createMutation = useCreateNotaVenta();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: selectedCompanyId || 0, branch_id: selectedBranchId || 0,
      serie: 'NV01', fecha_emision: dayjs().format('YYYY-MM-DD'), moneda: 'PEN',
      client: { tipo_documento: '1', numero_documento: '', razon_social: '' },
      detalles: [{ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1, precio_unitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });
  const watchedItems = watch('detalles');
  const total = watchedItems.reduce((sum, item) => sum + (item.cantidad || 0) * (item.precio_unitario || 0), 0);

  const onSubmit = async (values: FormValues) => {
    try {
      const nv = await createMutation.mutateAsync({
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        observaciones: values.observaciones || undefined,
      });
      message.success(`Nota de venta ${nv.numero_completo} creada`);
      navigate(`/nota-ventas/${nv.id}`);
    } catch (err) { showApiError(err, 'Error al crear nota de venta'); }
  };

  return (
    <div>
      <PageHeader title="Nueva Nota de Venta" showBack breadcrumbs={[{ title: 'Notas de Venta', path: '/nota-ventas' }, { title: 'Nueva' }]} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card title="Datos" size="small">
            <Form layout="vertical" component="div">
              <Row gutter={16}>
                <Col xs={8} md={3}><Form.Item label="Serie"><Controller name="serie" control={control} render={({ field }) => <Input {...field} />} /></Form.Item></Col>
                <Col xs={16} md={4}><Form.Item label="Fecha"><Controller name="fecha_emision" control={control} render={({ field }) => <DatePicker value={dayjs(field.value)} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" style={{ width: '100%' }} />} /></Form.Item></Col>
                <Col xs={8} md={3}><Form.Item label="Moneda"><Controller name="moneda" control={control} render={({ field }) => <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.value }))} />} /></Form.Item></Col>
              </Row>
            </Form>
          </Card>

          <Card title="Cliente" size="small">
            <Form layout="vertical" component="div">
              <Space wrap>
                <Form.Item label="Tipo Doc."><Controller name="client.tipo_documento" control={control} render={({ field }) => <Select {...field} style={{ width: 160 }} options={TIPO_DOCUMENTO_OPTIONS} />} /></Form.Item>
                <Form.Item label="Nro. Doc."><Controller name="client.numero_documento" control={control} render={({ field }) => <Input {...field} style={{ width: 160 }} />} /></Form.Item>
                <Form.Item label="Razon Social" style={{ minWidth: 280 }}><Controller name="client.razon_social" control={control} render={({ field }) => <Input {...field} />} /></Form.Item>
              </Space>
            </Form>
          </Card>

          <Card title="Items" size="small">
            <Table size="small" pagination={false} dataSource={fields} rowKey="id" scroll={{ x: 700 }}
              columns={[
                { title: '#', width: 40, render: (_, __, i) => i + 1 },
                { title: 'Descripcion', render: (_, __, i) => <Input size="small" value={watchedItems[i]?.descripcion} onChange={(e) => setValue(`detalles.${i}.descripcion`, e.target.value)} /> },
                { title: 'Und', width: 80, render: (_, __, i) => <Input size="small" value={watchedItems[i]?.unidad} onChange={(e) => setValue(`detalles.${i}.unidad`, e.target.value)} /> },
                { title: 'Cant.', width: 80, render: (_, __, i) => <InputNumber size="small" value={watchedItems[i]?.cantidad} onChange={(v) => setValue(`detalles.${i}.cantidad`, v || 0)} min={0.01} style={{ width: '100%' }} /> },
                { title: 'Precio', width: 110, render: (_, __, i) => <InputNumber size="small" value={watchedItems[i]?.precio_unitario} onChange={(v) => setValue(`detalles.${i}.precio_unitario`, v || 0)} min={0} precision={2} style={{ width: '100%' }} /> },
                { title: 'Subtotal', width: 100, align: 'right' as const, render: (_, __, i) => <strong>{formatNumber((watchedItems[i]?.cantidad || 0) * (watchedItems[i]?.precio_unitario || 0))}</strong> },
                { title: '', width: 40, render: (_, __, i) => <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(i)} /> },
              ]}
            />
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => append({ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1, precio_unitario: 0 })} style={{ marginTop: 8 }}>Agregar Item</Button>
            {errors.detalles?.message && <div style={{ color: '#ff4d4f', marginTop: 4 }}>{errors.detalles.message}</div>}
            <div style={{ textAlign: 'right', marginTop: 12, fontSize: 18, fontWeight: 600 }}>Total: S/ {formatNumber(total)}</div>
          </Card>

          <div style={{ textAlign: 'right', paddingBottom: 24 }}>
            <Space><Button onClick={() => navigate('/nota-ventas')}>Cancelar</Button><Button type="primary" htmlType="submit" loading={createMutation.isPending} size="large">Crear Nota de Venta</Button></Space>
          </div>
        </Space>
      </form>
    </div>
  );
}

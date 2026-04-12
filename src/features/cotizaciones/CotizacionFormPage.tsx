import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, DatePicker, Space, Button, Row, Col, Divider, message } from 'antd';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import PaymentTermsForm from '@/components/forms/PaymentTermsForm';
import TotalesResumen from '@/components/forms/TotalesResumen';
import { clienteDocumentoSchema, detalleItemSchema, cuotaSchema } from '@/schemas/common.schema';
import { useCreateCotizacion } from './hooks/useCotizaciones';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS } from '@/utils/constants';

const cotizacionSchema = z.object({
  company_id: z.number().min(1),
  branch_id: z.number().min(1),
  serie: z.string().min(1, 'Requerido'),
  fecha_emision: z.string().min(1, 'Requerida'),
  dias_validez: z.number().min(1).max(365),
  moneda: z.enum(['PEN', 'USD']),
  tipo_operacion: z.string(),
  forma_pago_tipo: z.enum(['Contado', 'Credito']),
  forma_pago_cuotas: z.array(cuotaSchema).optional(),
  client: clienteDocumentoSchema,
  detalles: z.array(detalleItemSchema).min(1, 'Agregue al menos un item'),
  condiciones: z.string().max(2000).optional().or(z.literal('')),
  notas: z.string().max(2000).optional().or(z.literal('')),
  contacto_cliente: z.string().max(100).optional().or(z.literal('')),
  telefono_contacto: z.string().max(20).optional().or(z.literal('')),
  email_contacto: z.string().max(100).optional().or(z.literal('')),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof cotizacionSchema>;

export default function CotizacionFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId } = useCompanyContextStore();
  const createMutation = useCreateCotizacion();

  const methods = useForm<FormValues>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0, branch_id: selectedBranchId || 0,
      serie: 'COT1', fecha_emision: dayjs().format('YYYY-MM-DD'), dias_validez: 15,
      moneda: 'PEN', tipo_operacion: '0101', forma_pago_tipo: 'Contado',
      client: { tipo_documento: '6', numero_documento: '', razon_social: '', direccion: '', email: '' },
      detalles: [{ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1, mto_precio_unitario: 0, tip_afe_igv: '10', porcentaje_igv: 18 }],
    },
  });

  const { handleSubmit, control, formState: { errors } } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      const cot = await createMutation.mutateAsync({
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        forma_pago_cuotas: values.forma_pago_tipo === 'Credito' ? values.forma_pago_cuotas : undefined,
        condiciones: values.condiciones || undefined,
        notas: values.notas || undefined,
        contacto_cliente: values.contacto_cliente || undefined,
        telefono_contacto: values.telefono_contacto || undefined,
        email_contacto: values.email_contacto || undefined,
        observaciones: values.observaciones || undefined,
      });
      message.success(`Cotizacion ${cot.numero_completo} creada`);
      navigate(`/cotizaciones/${cot.id}`);
    } catch (err) { showApiError(err, 'Error al crear cotizacion'); }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <PageHeader title="Nueva Cotizacion" showBack breadcrumbs={[{ title: 'Cotizaciones', path: '/cotizaciones' }, { title: 'Nueva' }]} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Datos" size="small">
              <Form layout="vertical" component="div">
                <Row gutter={16}>
                  <Col xs={8} md={3}><Form.Item label="Serie"><Controller name="serie" control={control} render={({ field }) => <Input {...field} />} /></Form.Item></Col>
                  <Col xs={16} md={4}><Form.Item label="Fecha"><Controller name="fecha_emision" control={control} render={({ field }) => <DatePicker value={dayjs(field.value)} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" style={{ width: '100%' }} />} /></Form.Item></Col>
                  <Col xs={8} md={3}><Form.Item label="Dias Validez"><Controller name="dias_validez" control={control} render={({ field }) => <InputNumber {...field} min={1} max={365} style={{ width: '100%' }} />} /></Form.Item></Col>
                  <Col xs={8} md={3}><Form.Item label="Moneda"><Controller name="moneda" control={control} render={({ field }) => <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.label }))} />} /></Form.Item></Col>
                  <Col xs={24} md={5}><Form.Item label="Contacto Cliente"><Controller name="contacto_cliente" control={control} render={({ field }) => <Input {...field} placeholder="Nombre contacto" />} /></Form.Item></Col>
                  <Col xs={12} md={3}><Form.Item label="Telefono Contacto"><Controller name="telefono_contacto" control={control} render={({ field }) => <Input {...field} placeholder="999 999 999" />} /></Form.Item></Col>
                  <Col xs={12} md={4}><Form.Item label="Email Contacto"><Controller name="email_contacto" control={control} render={({ field }) => <Input {...field} placeholder="contacto@email.com" />} /></Form.Item></Col>
                </Row>
              </Form>
            </Card>
            <Card size="small"><Form layout="vertical" component="div"><ClientSelector prefix="client" /></Form></Card>
            <Card size="small">
              <ItemsTable />
              {errors.detalles?.message && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{errors.detalles.message}</div>}
            </Card>
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Card size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <PaymentTermsForm />
                    <Divider style={{ margin: '8px 0' }} />
                    <Form layout="vertical" component="div">
                      <Form.Item label="Condiciones"><Controller name="condiciones" control={control} render={({ field }) => <Input.TextArea {...field} rows={2} />} /></Form.Item>
                      <Form.Item label="Notas"><Controller name="notas" control={control} render={({ field }) => <Input.TextArea {...field} rows={2} />} /></Form.Item>
                    </Form>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={8}><TotalesResumen /></Col>
            </Row>
            <div style={{ textAlign: 'right', paddingBottom: 24 }}>
              <Space><Button onClick={() => navigate('/cotizaciones')}>Cancelar</Button><Button type="primary" htmlType="submit" loading={createMutation.isPending} size="large">Crear Cotizacion</Button></Space>
            </div>
          </Space>
        </form>
      </div>
    </FormProvider>
  );
}

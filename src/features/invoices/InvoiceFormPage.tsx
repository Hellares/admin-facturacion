import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Space, Button, Divider, Row, Col, Tag, Alert, message } from 'antd';
import { FileTextOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined, SendOutlined } from '@ant-design/icons';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import PaymentTermsForm from '@/components/forms/PaymentTermsForm';
import TotalesResumen from '@/components/forms/TotalesResumen';
import DetraccionForm from '@/components/forms/DetraccionForm';
import MediosPagoForm from '@/components/forms/MediosPagoForm';
import { invoiceSchema, type InvoiceFormValues } from '@/schemas/invoice.schema';
import { useCreateInvoice } from './hooks/useInvoices';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS, TIPO_OPERACION_OPTIONS } from '@/utils/constants';

const SectionTitle = ({ icon, title, tag }: { icon: React.ReactNode; title: string; tag?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ color: '#1677ff', fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: '#555' }}>{title}</span>
    {tag && <Tag color="blue" style={{ fontSize: 11 }}>{tag}</Tag>}
  </div>
);

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId, branches } = useCompanyContextStore();
  const createMutation = useCreateInvoice();

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const seriesFactura = selectedBranch?.series_factura || [];

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
      branch_id: selectedBranchId || 0,
      serie: seriesFactura[0] || '',
      fecha_emision: dayjs().format('YYYY-MM-DD'),
      fecha_vencimiento: dayjs().format('YYYY-MM-DD'),
      moneda: 'PEN',
      tipo_operacion: '0101',
      forma_pago_tipo: 'Contado',
      forma_pago_cuotas: [],
      client: {
        tipo_documento: '6',
        numero_documento: '',
        razon_social: '',
        nombre_comercial: '',
        direccion: '',
        email: '',
        telefono: '',
      },
      detalles: [{
        codigo: '',
        descripcion: '',
        unidad: 'NIU',
        cantidad: 1,
        mto_precio_unitario: 0,
        tip_afe_igv: '10',
        porcentaje_igv: 18,
      }],
      medios_pago: [],
      observaciones: '',
      numero_orden_compra: '',
    },
  });

  const { handleSubmit, control, formState: { errors } } = methods;

  const onValidationError = (formErrors: Record<string, unknown>) => {
    const fieldNames = Object.keys(formErrors);
    console.error('Form validation errors:', formErrors);
    message.error(`Campos con error: ${fieldNames.join(', ')}`);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const data = {
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        fecha_vencimiento: values.fecha_vencimiento || undefined,
        forma_pago_cuotas: values.forma_pago_tipo === 'Credito' ? values.forma_pago_cuotas : undefined,
        detraccion: values.detraccion?.codigo_bien_servicio ? values.detraccion : undefined,
        medios_pago: values.medios_pago && values.medios_pago.length > 0 ? values.medios_pago : undefined,
        observaciones: values.observaciones || undefined,
        numero_orden_compra: values.numero_orden_compra || undefined,
      };

      const invoice = await createMutation.mutateAsync(data);
      message.success(`Factura ${invoice.numero_completo} creada exitosamente`);
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      showApiError(err, 'Error al crear factura');
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <PageHeader
          title="Nueva Factura"
          showBack
          breadcrumbs={[
            { title: 'Facturas', path: '/invoices' },
            { title: 'Nueva' },
          ]}
        />

        <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
          <Row gutter={16} style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 100%)', borderRadius: 12, padding: '20px 12px', margin: 0, border: '1px solid #d6e8f7' }}>
            {/* COLUMNA IZQUIERDA — Datos principales */}
            <Col xs={24} xl={20}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>

                {/* DATOS DEL DOCUMENTO */}
                <Card
                  size="small"
                  title={<SectionTitle icon={<FileTextOutlined />} title="Documento" tag="01 - Factura" />}
                  style={{ borderTop: '3px solid #1677ff' }}
                >
                  <Form layout="vertical" component="div">
                    <Row gutter={12}>
                      <Col xs={12} sm={6} md={4}>
                        <Form.Item label="Serie" required validateStatus={errors.serie ? 'error' : ''} help={errors.serie?.message} style={{ marginBottom: 8 }}>
                          <Controller name="serie" control={control} render={({ field }) => (
                            <Select {...field} options={seriesFactura.map((s) => ({ value: s, label: s }))} placeholder="F001" />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6} md={5}>
                        <Form.Item label="Emision" required style={{ marginBottom: 8 }}>
                          <Controller name="fecha_emision" control={control} render={({ field }) => (
                            <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6} md={5}>
                        <Form.Item label="Vencimiento" style={{ marginBottom: 8 }}>
                          <Controller name="fecha_vencimiento" control={control} render={({ field }) => (
                            <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6} md={4}>
                        <Form.Item label="Moneda" style={{ marginBottom: 8 }}>
                          <Controller name="moneda" control={control} render={({ field }) => (
                            <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.label }))} />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={6} md={6}>
                        <Form.Item label="Tipo Operacion" style={{ marginBottom: 8 }}>
                          <Controller name="tipo_operacion" control={control} render={({ field }) => (
                            <Select {...field} options={TIPO_OPERACION_OPTIONS.map((t) => ({ value: t.value, label: `${t.value} - ${t.label}` }))} />
                          )} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                {/* CLIENTE */}
                <Card
                  size="small"
                  title={<SectionTitle icon={<UserOutlined />} title="Cliente" />}
                  styles={{ body: { paddingTop: 0 } }}
                >
                  <Form layout="vertical" component="div">
                    <ClientSelector prefix="client" documentType="factura" />
                  </Form>
                </Card>

                {/* ITEMS */}
                <Card
                  size="small"
                  title={<SectionTitle icon={<ShoppingCartOutlined />} title="Items" />}
                  styles={{ body: { paddingTop: 0 } }}
                >
                  <ItemsTable />
                  {errors.detalles && typeof errors.detalles.message === 'string' && (
                    <Alert type="error" message={errors.detalles.message} showIcon style={{ marginTop: 8 }} />
                  )}
                </Card>

                {/* PAGO + DETRACCION + OBSERVACIONES */}
                <Card
                  size="small"
                  title={<SectionTitle icon={<DollarOutlined />} title="Condiciones de Pago" />}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <PaymentTermsForm />
                    <Divider style={{ margin: '4px 0' }} />
                    <DetraccionForm />
                    <MediosPagoForm />
                    <Form layout="vertical" component="div">
                      <Row gutter={12}>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Orden de Compra" style={{ marginBottom: 8 }}>
                            <Controller name="numero_orden_compra" control={control} render={({ field }) => (
                              <Input {...field} placeholder="Opcional" />
                            )} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item label="Observaciones" style={{ marginBottom: 8 }}>
                            <Controller name="observaciones" control={control} render={({ field }) => (
                              <Input.TextArea {...field} rows={1} placeholder="Opcional" />
                            )} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Space>
                </Card>
              </Space>
            </Col>

            {/* COLUMNA DERECHA — Totales + Acciones */}
            <Col xs={24} xl={4}>
              <div style={{ position: 'sticky', top: 16 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <TotalesResumen />

                  {Object.keys(errors).length > 0 && (
                    <Alert
                      type="error"
                      showIcon
                      message="Errores en el formulario"
                      description={`Campos: ${Object.keys(errors).join(', ')}`}
                    />
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending}
                    size="large"
                    icon={<SendOutlined />}
                    block
                    style={{ height: 50, fontSize: 16, borderRadius: 8 }}
                  >
                    Crear Factura
                  </Button>
                  <Button block onClick={() => navigate('/invoices')}>
                    Cancelar
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </form>
      </div>
    </FormProvider>
  );
}

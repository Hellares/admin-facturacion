import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Space, Button, Divider, Row, Col, Radio, Tag, Alert, message } from 'antd';
import { SnippetsOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined, SendOutlined } from '@ant-design/icons';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import { devLog } from '@/lib/logger';
import PageHeader from '@/components/common/PageHeader';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import PaymentTermsForm from '@/components/forms/PaymentTermsForm';
import TotalesResumen from '@/components/forms/TotalesResumen';
import DetraccionForm from '@/components/forms/DetraccionForm';
import MediosPagoForm from '@/components/forms/MediosPagoForm';
import { boletaSchema, type BoletaFormValues } from '@/schemas/boleta.schema';
import { useCreateBoleta } from './hooks/useBoletas';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS } from '@/utils/constants';

const SectionTitle = ({ icon, title, tag }: { icon: React.ReactNode; title: string; tag?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ color: '#52c41a', fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: '#555' }}>{title}</span>
    {tag && <Tag color="green" style={{ fontSize: 11 }}>{tag}</Tag>}
  </div>
);

export default function BoletaFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId, branches } = useCompanyContextStore();
  const createMutation = useCreateBoleta();

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const seriesBoleta = selectedBranch?.series_boleta || [];

  const methods = useForm<BoletaFormValues>({
    resolver: zodResolver(boletaSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
      branch_id: selectedBranchId || 0,
      serie: seriesBoleta[0] || '',
      fecha_emision: dayjs().format('YYYY-MM-DD'),
      moneda: 'PEN',
      tipo_operacion: '0101',
      metodo_envio: 'individual',
      forma_pago_tipo: 'Contado',
      forma_pago_cuotas: [],
      client: {
        tipo_documento: '1',
        numero_documento: '',
        razon_social: '',
        direccion: '',
        email: '',
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
    },
  });

  const { handleSubmit, control, formState: { errors } } = methods;

  const onValidationError = (formErrors: Record<string, unknown>) => {
    const fieldNames = Object.keys(formErrors);
    devLog.error('Form validation errors:', formErrors);
    message.error(`Campos con error: ${fieldNames.join(', ')}`);
  };

  const onSubmit = async (values: BoletaFormValues) => {
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
      };

      const boleta = await createMutation.mutateAsync(data);
      message.success(`Boleta ${boleta.numero_completo} creada exitosamente`);
      navigate(`/boletas/${boleta.id}`);
    } catch (err) {
      showApiError(err, 'Error al crear boleta');
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <PageHeader title="Nueva Boleta" showBack breadcrumbs={[{ title: 'Boletas', path: '/boletas' }, { title: 'Nueva' }]} />

        <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
          <Row gutter={16} style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 100%)', borderRadius: 12, padding: '20px 12px', margin: 0, border: '1px solid #d6e8f7' }}>
            {/* COLUMNA IZQUIERDA */}
            <Col xs={24} xl={20}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>

                {/* DATOS DEL DOCUMENTO */}
                <Card
                  size="small"
                  title={<SectionTitle icon={<SnippetsOutlined />} title="Documento" tag="03 - Boleta" />}
                  style={{ borderTop: '3px solid #52c41a' }}
                >
                  <Form layout="vertical" component="div">
                    <Row gutter={12}>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Item label="Serie" required validateStatus={errors.serie ? 'error' : ''} style={{ marginBottom: 8 }}>
                          <Controller name="serie" control={control} render={({ field }) => (
                            <Select {...field} options={seriesBoleta.map((s) => ({ value: s, label: s }))} placeholder="B001" />
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
                      <Col xs={12} sm={6} md={4}>
                        <Form.Item label="Moneda" style={{ marginBottom: 8 }}>
                          <Controller name="moneda" control={control} render={({ field }) => (
                            <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.label }))} />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Metodo de Envio" style={{ marginBottom: 8 }}>
                          <Controller name="metodo_envio" control={control} render={({ field }) => (
                            <Radio.Group {...field}>
                              <Radio.Button value="individual">Individual (automatico)</Radio.Button>
                              <Radio.Button value="resumen_diario">Resumen Diario</Radio.Button>
                            </Radio.Group>
                          )} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                {/* CLIENTE */}
                <Card size="small" title={<SectionTitle icon={<UserOutlined />} title="Cliente" />} styles={{ body: { paddingTop: 0 } }}>
                  <Form layout="vertical" component="div">
                    <ClientSelector prefix="client" documentType="boleta" />
                  </Form>
                </Card>

                {/* ITEMS */}
                <Card size="small" title={<SectionTitle icon={<ShoppingCartOutlined />} title="Items" />} styles={{ body: { paddingTop: 0 } }}>
                  <ItemsTable />
                  {errors.detalles && typeof errors.detalles.message === 'string' && (
                    <Alert type="error" message={errors.detalles.message} showIcon style={{ marginTop: 8 }} />
                  )}
                </Card>

                {/* PAGO */}
                <Card size="small" title={<SectionTitle icon={<DollarOutlined />} title="Condiciones de Pago" />}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <PaymentTermsForm />
                    <Divider style={{ margin: '4px 0' }} />
                    <DetraccionForm />
                    <MediosPagoForm />
                    <Form layout="vertical" component="div">
                      <Form.Item label="Observaciones" style={{ marginBottom: 8 }}>
                        <Controller name="observaciones" control={control} render={({ field }) => (
                          <Input.TextArea {...field} rows={1} placeholder="Opcional" />
                        )} />
                      </Form.Item>
                    </Form>
                  </Space>
                </Card>
              </Space>
            </Col>

            {/* COLUMNA DERECHA */}
            <Col xs={24} xl={4}>
              <div style={{ position: 'sticky', top: 16 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <TotalesResumen />

                  {Object.keys(errors).length > 0 && (
                    <Alert type="error" showIcon message="Errores" description={`Campos: ${Object.keys(errors).join(', ')}`} />
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending}
                    size="large"
                    icon={<SendOutlined />}
                    block
                    style={{ height: 50, fontSize: 16, borderRadius: 8, background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Crear Boleta
                  </Button>
                  <Button block onClick={() => navigate('/boletas')}>Cancelar</Button>
                </Space>
              </div>
            </Col>
          </Row>
        </form>
      </div>
    </FormProvider>
  );
}

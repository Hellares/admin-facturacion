import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Collapse, Radio, Alert, message } from 'antd';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import { devLog } from '@/lib/logger';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import PaymentTermsForm from '@/components/forms/PaymentTermsForm';
import DetraccionForm from '@/components/forms/DetraccionForm';
import MediosPagoForm from '@/components/forms/MediosPagoForm';
import ComprobanteFormLayout, { FormSection } from '@/components/forms/ComprobanteFormLayout';
import { boletaSchema, type BoletaFormValues } from '@/schemas/boleta.schema';
import { useCreateBoleta } from './hooks/useBoletas';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS } from '@/utils/constants';

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
      <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
        <ComprobanteFormLayout tipo="boleta" submitting={createMutation.isPending} errorFields={Object.keys(errors)}>

          <FormSection title="Documento">
            <Form layout="vertical" component="div">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <Form.Item label="Serie" required validateStatus={errors.serie ? 'error' : ''} style={{ marginBottom: 0 }}>
                  <Controller name="serie" control={control} render={({ field }) => (
                    <Select {...field} options={seriesBoleta.map((s) => ({ value: s, label: s }))} placeholder="B001" />
                  )} />
                </Form.Item>
                <Form.Item label="Emisión" required style={{ marginBottom: 0 }}>
                  <Controller name="fecha_emision" control={control} render={({ field }) => (
                    <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
                </Form.Item>
                <Form.Item label="Moneda" style={{ marginBottom: 0 }}>
                  <Controller name="moneda" control={control} render={({ field }) => (
                    <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.label }))} />
                  )} />
                </Form.Item>
              </div>
            </Form>
          </FormSection>

          <FormSection title="Cliente">
            <Form layout="vertical" component="div">
              <ClientSelector prefix="client" documentType="boleta" />
            </Form>
          </FormSection>

          <FormSection title="Productos">
            <ItemsTable compacto />
            {errors.detalles && typeof errors.detalles.message === 'string' && (
              <Alert type="error" message={errors.detalles.message} showIcon />
            )}
          </FormSection>

          <FormSection title="Pago">
            <PaymentTermsForm />
            <MediosPagoForm />
            <Collapse
              ghost
              items={[{
                key: 'mas',
                forceRender: true,
                label: <span style={{ fontWeight: 600, color: '#1f3a5f' }}>Más opciones: observaciones, envío a SUNAT, detracción</span>,
                children: (
                  <Form layout="vertical" component="div">
                    <Form.Item label="Observaciones" style={{ marginBottom: 12 }}>
                      <Controller name="observaciones" control={control} render={({ field }) => (
                        <Input.TextArea {...field} rows={2} placeholder="Opcional" />
                      )} />
                    </Form.Item>
                    <Form.Item label="Envío a SUNAT" style={{ marginBottom: 12 }}>
                      <Controller name="metodo_envio" control={control} render={({ field }) => (
                        <Radio.Group {...field}>
                          <Radio.Button value="individual">Individual (automático)</Radio.Button>
                          <Radio.Button value="resumen_diario">Resumen diario</Radio.Button>
                        </Radio.Group>
                      )} />
                    </Form.Item>
                    <DetraccionForm />
                  </Form>
                ),
              }]}
            />
          </FormSection>

        </ComprobanteFormLayout>
      </form>
    </FormProvider>
  );
}

import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Collapse, Alert, message } from 'antd';
import { useEffect } from 'react';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import { devLog } from '@/lib/logger';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import PaymentTermsForm from '@/components/forms/PaymentTermsForm';
import DetraccionForm from '@/components/forms/DetraccionForm';
import MediosPagoForm from '@/components/forms/MediosPagoForm';
import ComprobanteFormLayout, { FormSection } from '@/components/forms/ComprobanteFormLayout';
import { invoiceSchema, type InvoiceFormValues } from '@/schemas/invoice.schema';
import { useCreateInvoice } from './hooks/useInvoices';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS, TIPO_OPERACION_OPTIONS } from '@/utils/constants';

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

  const { handleSubmit, control, setValue, formState: { errors } } = methods;

  // DueDate solo aplica a Credito (SUNAT rechaza Factura Contado con vencimiento, error 0306).
  const formaPagoTipo = useWatch({ control, name: 'forma_pago_tipo' });
  const cuotas = useWatch({ control, name: 'forma_pago_cuotas' });

  // En Credito el vencimiento del documento = fecha de la ultima cuota (se recalcula al editar cuotas).
  // Las fechas estan en formato YYYY-MM-DD, asi que el orden lexicografico coincide con el cronologico.
  useEffect(() => {
    if (formaPagoTipo !== 'Credito') return;
    const fechas = (cuotas ?? []).map((c) => c?.fecha_pago).filter(Boolean) as string[];
    if (fechas.length === 0) return;
    const ultima = fechas.reduce((a, b) => (a > b ? a : b));
    setValue('fecha_vencimiento', ultima);
  }, [cuotas, formaPagoTipo, setValue]);

  const onValidationError = (formErrors: Record<string, unknown>) => {
    const fieldNames = Object.keys(formErrors);
    devLog.error('Form validation errors:', formErrors);
    message.error(`Campos con error: ${fieldNames.join(', ')}`);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const data = {
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        // En Contado no se manda vencimiento: el backend lo ignoraria igual, pero asi el payload es coherente.
        fecha_vencimiento: values.forma_pago_tipo === 'Credito' ? (values.fecha_vencimiento || undefined) : undefined,
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
      <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
        <ComprobanteFormLayout tipo="factura" submitting={createMutation.isPending} errorFields={Object.keys(errors)}>

          <FormSection title="Documento">
            <Form layout="vertical" component="div">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <Form.Item label="Serie" required validateStatus={errors.serie ? 'error' : ''} help={errors.serie?.message} style={{ marginBottom: 0 }}>
                  <Controller name="serie" control={control} render={({ field }) => (
                    <Select {...field} options={seriesFactura.map((s) => ({ value: s, label: s }))} placeholder="F001" />
                  )} />
                </Form.Item>
                <Form.Item label="Emisión" required style={{ marginBottom: 0 }}>
                  <Controller name="fecha_emision" control={control} render={({ field }) => (
                    <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
                </Form.Item>
                {formaPagoTipo === 'Credito' && (
                  <Form.Item label="Vencimiento" style={{ marginBottom: 0 }}>
                    <Controller name="fecha_vencimiento" control={control} render={({ field }) => (
                      <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                    )} />
                  </Form.Item>
                )}
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
              <ClientSelector prefix="client" documentType="factura" />
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
                label: <span style={{ fontWeight: 500, color: '#1f3a5f' }}>Más opciones: orden de compra, observaciones, tipo de operación, detracción</span>,
                children: (
                  <Form layout="vertical" component="div">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <Form.Item label="Orden de compra" style={{ marginBottom: 12 }}>
                        <Controller name="numero_orden_compra" control={control} render={({ field }) => (
                          <Input {...field} placeholder="Opcional" />
                        )} />
                      </Form.Item>
                      <Form.Item label="Tipo de operación" style={{ marginBottom: 12 }}>
                        <Controller name="tipo_operacion" control={control} render={({ field }) => (
                          <Select {...field} options={TIPO_OPERACION_OPTIONS.map((t) => ({ value: t.value, label: `${t.value} - ${t.label}` }))} />
                        )} />
                      </Form.Item>
                    </div>
                    <Form.Item label="Observaciones" style={{ marginBottom: 12 }}>
                      <Controller name="observaciones" control={control} render={({ field }) => (
                        <Input.TextArea {...field} rows={2} placeholder="Opcional" />
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

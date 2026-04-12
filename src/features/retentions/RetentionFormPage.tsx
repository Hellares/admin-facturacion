import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, DatePicker, Button, Space, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useCreateRetention } from './hooks/useRetentions';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { TIPO_DOCUMENTO_OPTIONS } from '@/utils/constants';
import { formatNumber } from '@/utils/format';
import { retentionSchema, type RetentionSchemaValues } from '@/schemas/retention.schema';

const REGIMEN_OPTIONS = [
  { value: '01', label: '01 - Tasa 3%', tasa: 3 },
  { value: '02', label: '02 - Tasa 6%', tasa: 6 },
  { value: '03', label: '03 - Tasa 3% (Liquidacion de compra)', tasa: 3 },
];

const TIPO_DOC_DETALLE_OPTIONS = [
  { value: '01', label: '01 - Factura' },
  { value: '03', label: '03 - Boleta' },
  { value: '12', label: '12 - Ticket' },
  { value: '14', label: '14 - Serv. Publicos' },
];

function makeDefaultTipoCambio() {
  return {
    fecha: dayjs().format('YYYY-MM-DD'),
    factor: 1,
    moneda_obj: 'PEN' as const,
    moneda_ref: 'PEN' as const,
  };
}

function makeDefaultDetalle() {
  return {
    tipo_doc: '01' as const,
    num_doc: '',
    fecha_emision: dayjs().format('YYYY-MM-DD'),
    fecha_retencion: dayjs().format('YYYY-MM-DD'),
    moneda: 'PEN' as const,
    imp_total: 0,
    imp_pagar: 0,
    imp_retenido: 0,
    pagos: [{ moneda: 'PEN' as const, fecha: dayjs().format('YYYY-MM-DD'), importe: 0 }],
    tipo_cambio: makeDefaultTipoCambio(),
  };
}

export default function RetentionFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId } = useCompanyContextStore();
  const createMutation = useCreateRetention();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<RetentionSchemaValues>({
    resolver: zodResolver(retentionSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
      branch_id: selectedBranchId || 0,
      serie: 'R001',
      correlativo: '1',
      fecha_emision: dayjs().format('YYYY-MM-DD'),
      moneda: 'PEN',
      regimen: '01',
      tasa: 3,
      imp_retenido: 0,
      imp_pagado: 0,
      proveedor: { tipo_documento: '6', numero_documento: '', razon_social: '' },
      detalles: [makeDefaultDetalle()],
      observacion: '',
    },
  });

  const { fields: detalleFields, append: addDetalle, remove: removeDetalle } = useFieldArray({ control, name: 'detalles' });
  const watchedDetalles = watch('detalles');
  const totalRetenido = watchedDetalles.reduce((s, d) => s + (d.imp_retenido || 0), 0);
  const totalPagado = watchedDetalles.reduce((s, d) => s + (d.imp_pagar || 0), 0);

  const onSubmit = async (values: RetentionSchemaValues) => {
    try {
      const payload = {
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        imp_retenido: totalRetenido,
        imp_pagado: totalPagado,
        observacion: values.observacion || undefined,
      };
      const ret = await createMutation.mutateAsync(payload);
      message.success(`Retencion ${ret.numero_completo} creada`);
      navigate(`/retentions/${ret.id}`);
    } catch (err) { showApiError(err, 'Error al crear retencion'); }
  };

  return (
    <div>
      <PageHeader title="Nueva Retencion" showBack breadcrumbs={[{ title: 'Retenciones', path: '/retentions' }, { title: 'Nueva' }]} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card title="Datos del Documento" size="small">
            <Form layout="vertical" component="div">
              <Row gutter={16}>
                <Col xs={8} md={3}>
                  <Form.Item label="Serie" validateStatus={errors.serie ? 'error' : undefined} help={errors.serie?.message}>
                    <Controller name="serie" control={control} render={({ field }) => <Input {...field} />} />
                  </Form.Item>
                </Col>
                <Col xs={8} md={3}>
                  <Form.Item label="Correlativo" validateStatus={errors.correlativo ? 'error' : undefined} help={errors.correlativo?.message}>
                    <Controller name="correlativo" control={control} render={({ field }) => <Input {...field} />} />
                  </Form.Item>
                </Col>
                <Col xs={16} md={4}>
                  <Form.Item label="Fecha">
                    <Controller name="fecha_emision" control={control} render={({ field }) => (
                      <DatePicker value={dayjs(field.value)} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" style={{ width: '100%' }} />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={8} md={3}>
                  <Form.Item label="Moneda">
                    <Controller name="moneda" control={control} render={({ field }) => (
                      <Select {...field} options={[{ value: 'PEN', label: 'PEN' }, { value: 'USD', label: 'USD' }]} />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Item label="Regimen" required validateStatus={errors.regimen ? 'error' : undefined} help={errors.regimen?.message}>
                    <Controller name="regimen" control={control} render={({ field }) => (
                      <Select {...field} options={REGIMEN_OPTIONS} onChange={(val) => {
                        field.onChange(val);
                        const r = REGIMEN_OPTIONS.find((o) => o.value === val);
                        if (r) setValue('tasa', r.tasa);
                      }} />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Item label="Tasa %">
                    <Controller name="tasa" control={control} render={({ field }) => <InputNumber {...field} min={0} max={100} style={{ width: '100%' }} />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item label="Observacion">
                    <Controller name="observacion" control={control} render={({ field }) => <Input.TextArea {...field} rows={2} maxLength={500} />} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title="Proveedor" size="small">
            <Form layout="vertical" component="div">
              <Space wrap>
                <Form.Item label="Tipo Doc." validateStatus={errors.proveedor?.tipo_documento ? 'error' : undefined} help={errors.proveedor?.tipo_documento?.message}>
                  <Controller name="proveedor.tipo_documento" control={control} render={({ field }) => <Select {...field} style={{ width: 160 }} options={TIPO_DOCUMENTO_OPTIONS} />} />
                </Form.Item>
                <Form.Item label="Nro. Doc." validateStatus={errors.proveedor?.numero_documento ? 'error' : undefined} help={errors.proveedor?.numero_documento?.message}>
                  <Controller name="proveedor.numero_documento" control={control} render={({ field }) => <Input {...field} style={{ width: 160 }} />} />
                </Form.Item>
                <Form.Item label="Razon Social" style={{ minWidth: 300 }} validateStatus={errors.proveedor?.razon_social ? 'error' : undefined} help={errors.proveedor?.razon_social?.message}>
                  <Controller name="proveedor.razon_social" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </Space>
            </Form>
          </Card>

          <Card title="Documentos Retenidos" size="small">
            {detalleFields.map((field, index) => (
              <Card key={field.id} size="small" style={{ marginBottom: 12 }} title={`Documento ${index + 1}`} extra={<Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeDetalle(index)} />}>
                <Form layout="vertical" component="div">
                  <Row gutter={12}>
                    <Col xs={6} md={2}>
                      <Form.Item label="Tipo">
                        <Controller name={`detalles.${index}.tipo_doc`} control={control} render={({ field: f }) => <Select {...f} size="small" options={TIPO_DOC_DETALLE_OPTIONS} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={18} md={4}>
                      <Form.Item label="Numero">
                        <Controller name={`detalles.${index}.num_doc`} control={control} render={({ field: f }) => <Input {...f} size="small" placeholder="F001-00000001" />} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item label="F. Emision">
                        <Controller name={`detalles.${index}.fecha_emision`} control={control} render={({ field: f }) => (
                          <DatePicker value={dayjs(f.value)} onChange={(d) => f.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" size="small" style={{ width: '100%' }} />
                        )} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item label="F. Retencion">
                        <Controller name={`detalles.${index}.fecha_retencion`} control={control} render={({ field: f }) => (
                          <DatePicker value={dayjs(f.value)} onChange={(d) => f.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" size="small" style={{ width: '100%' }} />
                        )} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item label="Total Doc.">
                        <Controller name={`detalles.${index}.imp_total`} control={control} render={({ field: f }) => <InputNumber {...f} size="small" min={0} precision={2} style={{ width: '100%' }} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item label="Imp. Pagar">
                        <Controller name={`detalles.${index}.imp_pagar`} control={control} render={({ field: f }) => <InputNumber {...f} size="small" min={0} precision={2} style={{ width: '100%' }} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item label="Retenido">
                        <Controller name={`detalles.${index}.imp_retenido`} control={control} render={({ field: f }) => <InputNumber {...f} size="small" min={0} precision={2} style={{ width: '100%' }} />} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* Pago inline */}
                  <Row gutter={12}>
                    <Col xs={8} md={3}>
                      <Form.Item label="Pago Moneda">
                        <Controller name={`detalles.${index}.pagos.0.moneda`} control={control} render={({ field: f }) => (
                          <Select {...f} size="small" options={[{ value: 'PEN', label: 'PEN' }, { value: 'USD', label: 'USD' }]} />
                        )} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item label="Pago Fecha">
                        <Controller name={`detalles.${index}.pagos.0.fecha`} control={control} render={({ field: f }) => (
                          <DatePicker value={dayjs(f.value)} onChange={(d) => f.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" size="small" style={{ width: '100%' }} />
                        )} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item label="Pago Importe">
                        <Controller name={`detalles.${index}.pagos.0.importe`} control={control} render={({ field: f }) => <InputNumber {...f} size="small" min={0} precision={2} style={{ width: '100%' }} />} />
                      </Form.Item>
                    </Col>
                    {/* Tipo de cambio inline */}
                    <Col xs={6} md={3}>
                      <Form.Item label="T.C. Factor">
                        <Controller name={`detalles.${index}.tipo_cambio.factor`} control={control} render={({ field: f }) => <InputNumber {...f} size="small" min={0} precision={4} style={{ width: '100%' }} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Item label="T.C. Fecha">
                        <Controller name={`detalles.${index}.tipo_cambio.fecha`} control={control} render={({ field: f }) => (
                          <DatePicker value={dayjs(f.value)} onChange={(d) => f.onChange(d?.format('YYYY-MM-DD'))} format="DD/MM/YYYY" size="small" style={{ width: '100%' }} />
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => addDetalle(makeDefaultDetalle())}>Agregar Documento</Button>
            {errors.detalles?.message && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{errors.detalles.message}</div>}
            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, fontWeight: 600 }}>Total Retenido: S/ {formatNumber(totalRetenido)}</div>
          </Card>

          <div style={{ textAlign: 'right', paddingBottom: 24 }}>
            <Space>
              <Button onClick={() => navigate('/retentions')}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending} size="large">Crear Retencion</Button>
            </Space>
          </div>
        </Space>
      </form>
    </div>
  );
}

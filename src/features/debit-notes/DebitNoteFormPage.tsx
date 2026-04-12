import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, Space, Button, Row, Col, message } from 'antd';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import TotalesResumen from '@/components/forms/TotalesResumen';
import DocumentoAfectadoSelector from '@/components/forms/DocumentoAfectadoSelector';
import { debitNoteSchema, type DebitNoteFormValues } from '@/schemas/debit-note.schema';
import { useCreateDebitNote, useDebitNoteMotivos } from './hooks/useDebitNotes';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { MONEDA_OPTIONS } from '@/utils/constants';

export default function DebitNoteFormPage() {
  const navigate = useNavigate();
  const { selectedCompanyId, selectedBranchId, branches } = useCompanyContextStore();
  const createMutation = useCreateDebitNote();
  const { data: motivos } = useDebitNoteMotivos();

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const seriesND = selectedBranch?.series_nota_debito || [];

  const methods = useForm<DebitNoteFormValues>({
    resolver: zodResolver(debitNoteSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
      branch_id: selectedBranchId || 0,
      serie: seriesND[0] || '',
      fecha_emision: dayjs().format('YYYY-MM-DD'),
      moneda: 'PEN',
      tipo_doc_afectado: '01',
      num_doc_afectado: '',
      cod_motivo: '',
      des_motivo: '',
      client: { tipo_documento: '6', numero_documento: '', razon_social: '', direccion: '', email: '' },
      detalles: [{ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1, mto_precio_unitario: 0, tip_afe_igv: '10', porcentaje_igv: 18 }],
    },
  });

  const { handleSubmit, control, setValue, formState: { errors } } = methods;

  const onSubmit = async (values: DebitNoteFormValues) => {
    try {
      const data = {
        ...values,
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        observaciones: values.observaciones || undefined,
      };
      const nd = await createMutation.mutateAsync(data);
      message.success(`Nota de Debito ${nd.numero_completo} creada`);
      navigate(`/debit-notes/${nd.id}`);
    } catch (err) {
      showApiError(err, 'Error al crear nota de debito');
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <PageHeader title="Nueva Nota de Debito" showBack breadcrumbs={[{ title: 'Notas de Debito', path: '/debit-notes' }, { title: 'Nueva' }]} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Datos del Documento" size="small">
              <Form layout="vertical" component="div">
                <Row gutter={16}>
                  <Col xs={24} sm={6} md={3}>
                    <Form.Item label="Serie" required>
                      <Controller name="serie" control={control} render={({ field }) => (
                        <Select {...field} options={seriesND.map((s) => ({ value: s, label: s }))} placeholder="FD01" />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={4}>
                    <Form.Item label="Fecha Emision" required>
                      <Controller name="fecha_emision" control={control} render={({ field }) => (
                        <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Item label="Moneda">
                      <Controller name="moneda" control={control} render={({ field }) => (
                        <Select {...field} options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.label }))} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item label="Motivo" required validateStatus={errors.cod_motivo ? 'error' : ''}>
                      <Controller name="cod_motivo" control={control} render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="label" placeholder="Seleccione motivo..." options={(motivos || []).map((m) => ({ value: m.codigo, label: `${m.codigo} - ${m.descripcion}` }))} onChange={(val) => { field.onChange(val); const m = motivos?.find((mo) => mo.codigo === val); setValue('des_motivo', m?.descripcion || ''); }} />
                      )} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card size="small"><Form layout="vertical" component="div"><DocumentoAfectadoSelector /></Form></Card>
            <Card size="small"><Form layout="vertical" component="div"><ClientSelector prefix="client" /></Form></Card>

            <Card size="small">
              <ItemsTable />
              {errors.detalles && typeof errors.detalles.message === 'string' && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{errors.detalles.message}</div>}
            </Card>

            <Row gutter={16}>
              <Col xs={24} lg={16}><div /></Col>
              <Col xs={24} lg={8}><TotalesResumen /></Col>
            </Row>

            <div style={{ textAlign: 'right', paddingBottom: 24 }}>
              <Space>
                <Button onClick={() => navigate('/debit-notes')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} size="large">Crear Nota de Debito</Button>
              </Space>
            </div>
          </Space>
        </form>
      </div>
    </FormProvider>
  );
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Checkbox, Button, Space, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { webhookService } from '@/services/webhook.service';
import { useCompanyContextStore } from '@/stores/company-context.store';

const WEBHOOK_EVENTS = [
  'invoice.created', 'invoice.accepted', 'invoice.rejected', 'invoice.voided',
  'boleta.created', 'boleta.accepted', 'boleta.rejected',
  'credit_note.created', 'credit_note.accepted',
  'debit_note.created', 'debit_note.accepted',
  'dispatch_guide.created', 'dispatch_guide.accepted',
  'daily_summary.accepted', 'voided_document.accepted',
];

interface FormValues {
  name: string;
  url: string;
  method: string;
  events: string[];
  timeout: number;
  max_retries: number;
  retry_delay: number;
  headers: string;
  secret: string;
}

export default function WebhookFormPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams();
  const isEdit = !!id;
  const webhookId = Number(id);
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const { data: webhook, isLoading: loadingWebhook } = useQuery({
    queryKey: ['webhook', webhookId],
    queryFn: () => webhookService.getById(webhookId),
    enabled: isEdit,
  });

  const createMut = useMutation({ mutationFn: (data: Partial<FormValues & { company_id: number }>) => webhookService.create(data as never), onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }) });
  const updateMut = useMutation({
    mutationFn: (data: Partial<FormValues>) => webhookService.update(webhookId, data as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      qc.invalidateQueries({ queryKey: ['webhook', webhookId] });
    },
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: '', url: '', method: 'POST', events: [], timeout: 30, max_retries: 3, retry_delay: 60, headers: '', secret: '' },
  });

  useEffect(() => {
    if (webhook) {
      reset({
        name: webhook.name,
        url: webhook.url,
        method: webhook.method,
        events: webhook.events ?? [],
        timeout: webhook.timeout,
        max_retries: webhook.max_retries,
        retry_delay: webhook.retry_delay,
        headers: webhook.headers ? JSON.stringify(webhook.headers, null, 2) : '',
        secret: '',
      });
    }
  }, [webhook, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      let parsedHeaders: Record<string, string> | undefined;
      if (values.headers.trim()) {
        try {
          parsedHeaders = JSON.parse(values.headers);
        } catch {
          message.error('Headers JSON invalido');
          return;
        }
      }
      if (isEdit) {
        const payload: Partial<FormValues> = { ...values, headers: parsedHeaders } as never;
        if (!values.secret?.trim()) delete (payload as { secret?: string }).secret;
        await updateMut.mutateAsync(payload);
        message.success('Webhook actualizado');
        navigate(`/webhooks/${webhookId}`);
      } else {
        await createMut.mutateAsync({
          ...values,
          headers: parsedHeaders,
          company_id: companyId || undefined,
        } as never);
        message.success('Webhook creado');
        navigate('/webhooks');
      }
    } catch { message.error('Error'); }
  };

  if (isEdit && loadingWebhook) return <LoadingSpinner fullPage />;

  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Editar: ${webhook?.name ?? ''}` : 'Nuevo Webhook'}
        showBack
        breadcrumbs={[{ title: 'Webhooks', path: '/webhooks' }, { title: isEdit ? 'Editar' : 'Nuevo' }]}
      />
      <Card style={{ maxWidth: 700 }}>
        <Form layout="vertical" component="div">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Item label="Nombre" required><Controller name="name" control={control} render={({ field }) => <Input {...field} />} /></Form.Item>
            <Form.Item label="URL" required><Controller name="url" control={control} render={({ field }) => <Input {...field} placeholder="https://..." />} /></Form.Item>
            <Space>
              <Form.Item label="Metodo"><Controller name="method" control={control} render={({ field }) => <Select {...field} style={{ width: 120 }} options={[{ value: 'POST' }, { value: 'PUT' }, { value: 'PATCH' }]} />} /></Form.Item>
              <Form.Item label="Timeout (s)"><Controller name="timeout" control={control} render={({ field }) => <InputNumber {...field} min={5} max={120} />} /></Form.Item>
              <Form.Item label="Max Reintentos"><Controller name="max_retries" control={control} render={({ field }) => <InputNumber {...field} min={0} max={10} />} /></Form.Item>
              <Form.Item label="Retraso entre reintentos (seg)"><Controller name="retry_delay" control={control} render={({ field }) => <InputNumber {...field} min={10} />} /></Form.Item>
            </Space>
            <Form.Item label="Secret (HMAC)" extra={isEdit ? 'Dejar vacio para conservar el secret actual' : undefined}><Controller name="secret" control={control} render={({ field }) => <Input.Password {...field} placeholder={isEdit ? '••••••••' : 'Opcional'} />} /></Form.Item>
            <Form.Item label="Headers personalizados"><Controller name="headers" control={control} render={({ field }) => <Input.TextArea {...field} rows={3} placeholder='{"X-API-Key": "value"}' />} /></Form.Item>
            <Form.Item label="Eventos">
              <Controller name="events" control={control} render={({ field }) => (
                <Checkbox.Group value={field.value} onChange={field.onChange} options={WEBHOOK_EVENTS.map((e) => ({ label: e, value: e }))} style={{ display: 'flex', flexDirection: 'column', gap: 4 }} />
              )} />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space><Button onClick={() => navigate(isEdit ? `/webhooks/${webhookId}` : '/webhooks')}>Cancelar</Button><Button type="primary" htmlType="submit" loading={submitting}>{isEdit ? 'Guardar cambios' : 'Crear Webhook'}</Button></Space>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

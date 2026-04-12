import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Space, Button, message } from 'antd';
import { ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DateCell from '@/components/common/DateCell';
import { webhookService, type WebhookDelivery } from '@/services/webhook.service';

export default function WebhookDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: webhook, isLoading } = useQuery({ queryKey: ['webhook', Number(id)], queryFn: () => webhookService.getById(Number(id)) });
  const { data: deliveries, isLoading: loadingDel } = useQuery({ queryKey: ['webhook-deliveries', Number(id)], queryFn: () => webhookService.getDeliveries(Number(id)) });
  const testMut = useMutation({ mutationFn: () => webhookService.test(Number(id)) });
  const retryMut = useMutation({ mutationFn: (delId: number) => webhookService.retryDelivery(delId), onSuccess: () => qc.invalidateQueries({ queryKey: ['webhook-deliveries'] }) });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!webhook) return <div>Webhook no encontrado</div>;

  const deliveryCols: ColumnsType<WebhookDelivery> = [
    { title: 'Evento', dataIndex: 'event', width: 200 },
    { title: 'Estado', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === 'success' ? 'green' : s === 'failed' ? 'red' : 'orange'}>{s}</Tag> },
    { title: 'Intentos', dataIndex: 'attempts', width: 80, align: 'center' },
    { title: 'HTTP', dataIndex: 'response_code', width: 70 },
    { title: 'Error', dataIndex: 'error_message', ellipsis: true },
    { title: 'Fecha', dataIndex: 'created_at', width: 150, render: (d: string) => <DateCell value={d} withTime /> },
    { title: '', width: 80, render: (_, r) => r.status === 'failed' && <Button size="small" icon={<ReloadOutlined />} loading={retryMut.isPending} onClick={() => { retryMut.mutate(r.id); message.success('Reintentando'); }}>Retry</Button> },
  ];

  return (
    <div>
      <PageHeader title={webhook.name} showBack breadcrumbs={[{ title: 'Webhooks', path: '/webhooks' }, { title: webhook.name }]}
        extra={<Button icon={<ThunderboltOutlined />} loading={testMut.isPending} onClick={async () => { try { await testMut.mutateAsync(); message.success('Test enviado'); } catch { message.error('Error'); } }}>Test</Button>} />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="URL">{webhook.url}</Descriptions.Item>
            <Descriptions.Item label="Metodo"><Tag>{webhook.method}</Tag></Descriptions.Item>
            <Descriptions.Item label="Activo"><Tag color={webhook.active ? 'green' : 'red'}>{webhook.active ? 'Si' : 'No'}</Tag></Descriptions.Item>
            <Descriptions.Item label="Timeout">{webhook.timeout}s</Descriptions.Item>
            <Descriptions.Item label="Max Reintentos">{webhook.max_retries}</Descriptions.Item>
            <Descriptions.Item label="Exitos / Fallos"><Tag color="green">{webhook.success_count}</Tag> / <Tag color="red">{webhook.failure_count}</Tag></Descriptions.Item>
            <Descriptions.Item label="Eventos" span={2}>{webhook.events?.map((e) => <Tag key={e}>{e}</Tag>)}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Historial de Entregas" size="small">
          <Table columns={deliveryCols} dataSource={deliveries} rowKey="id" loading={loadingDel} size="small" pagination={{ pageSize: 10 }} />
        </Card>
      </Space>
    </div>
  );
}

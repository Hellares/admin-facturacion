import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Tag, Switch, message } from 'antd';
import { EyeOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import DateCell from '@/components/common/DateCell';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import { webhookService, type Webhook } from '@/services/webhook.service';
import { useTableFilters } from '@/hooks/useTableFilters';

export default function WebhookListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const { data, isLoading } = useQuery({ queryKey: ['webhooks', getQueryParams()], queryFn: () => webhookService.getAll(getQueryParams()) });
  const deleteMut = useMutation({ mutationFn: (id: number) => webhookService.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }) });
  const testMut = useMutation({ mutationFn: (id: number) => webhookService.test(id) });

  const columns: ColumnsType<Webhook> = [
    { title: 'Nombre', dataIndex: 'name', ellipsis: true },
    { title: 'URL', dataIndex: 'url', ellipsis: true, responsive: ['lg'] },
    { title: 'Eventos', dataIndex: 'events', width: 100, render: (e: string[]) => <Tag>{e?.length || 0} eventos</Tag> },
    { title: 'Activo', key: 'active', width: 70, render: (_, r) => <Switch checked={r.active} disabled size="small" /> },
    { title: 'OK/Fail', key: 'stats', width: 100, render: (_, r) => <span><Tag color="green">{r.success_count}</Tag><Tag color="red">{r.failure_count}</Tag></span> },
    { title: 'Ultimo', dataIndex: 'last_triggered_at', width: 150, responsive: ['xl'], render: (d: string) => <DateCell value={d} withTime /> },
    {
      title: 'Acciones', key: 'actions', width: 180,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/webhooks/${record.id}`)}>Ver</Button>
          <Button size="small" icon={<ThunderboltOutlined />} loading={testMut.isPending} onClick={async () => { try { await testMut.mutateAsync(record.id); message.success('Test enviado'); } catch { message.error('Error'); } }}>Test</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(async () => { await deleteMut.mutateAsync(record.id); message.success('Eliminado'); })} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Webhooks" subtitle="Integraciones y notificaciones" onAdd={() => navigate('/webhooks/new')} addLabel="Nuevo Webhook" />
      <Card>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange,
        }} />
      </Card>
    </div>
  );
}

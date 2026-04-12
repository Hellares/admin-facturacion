import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Tag, Switch, Modal, Typography, Input, Descriptions, message } from 'antd';
import { EditOutlined, LockOutlined, KeyOutlined, ApiOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import DateCell from '@/components/common/DateCell';
import { showConfirm } from '@/components/common/ConfirmModal';
import { userService, type TokenInfoResponse } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { useTableFilters } from '@/hooks/useTableFilters';
import type { User } from '@/types/user.types';
import { formatDateTime } from '@/utils/format';

const { Text, Paragraph } = Typography;

export default function UserListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());
  const { search, setSearch, page, perPage, handlePageChange, getQueryParams } = useTableFilters();

  // Super Admin ve todos los usuarios (sin filtro de empresa)
  const getUserParams = useCallback(() => {
    const params = getQueryParams();
    if (isSuperAdmin) {
      delete params.company_id;
      delete params.branch_id;
    }
    return params;
  }, [getQueryParams, isSuperAdmin]);

  const { data, isLoading } = useQuery({ queryKey: ['users', getUserParams()], queryFn: () => userService.getAll(getUserParams()) });

  const [tokenModal, setTokenModal] = useState(false);
  const [tokenData, setTokenData] = useState<TokenInfoResponse | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const toggleMut = useMutation({ mutationFn: (id: number) => userService.toggleActive(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
  const unlockMut = useMutation({ mutationFn: (id: number) => userService.unlock(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
  const resetMut = useMutation({ mutationFn: (id: number) => userService.resetPassword(id), onSuccess: () => { message.success('Contrasena reseteada'); } });
  const tokenMut = useMutation({
    mutationFn: (id: number) => userService.generateToken(id),
    onSuccess: (data) => {
      setTokenData(data);
      message.success('Token generado exitosamente');
    },
    onError: () => message.error('Error al generar token'),
  });

  const handleViewToken = async (userId: number) => {
    setTokenLoading(true);
    try {
      const data = await userService.getTokenInfo(userId);
      setTokenData(data);
      setTokenModal(true);
    } catch {
      message.error('Error al obtener info del token');
    } finally {
      setTokenLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copiado al portapapeles');
  };

  const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin', company_admin: 'Admin Empresa', company_user: 'Usuario', api_client: 'Cliente API', read_only: 'Solo Lectura',
  };
  const TYPE_LABELS: Record<string, string> = {
    system: 'Sistema', user: 'Usuario', api_client: 'API',
  };
  const TYPE_COLORS: Record<string, string> = {
    system: 'purple', user: 'blue', api_client: 'green',
  };

  const columns: ColumnsType<User> = [
    { title: 'Nombre', dataIndex: 'name', ellipsis: true },
    { title: 'Email', dataIndex: 'email', ellipsis: true },
    { title: 'Rol', key: 'role', width: 140, render: (_, r) => <Tag color="blue">{r.role?.display_name || ROLE_LABELS[r.role?.name || ''] || r.role?.name}</Tag> },
    { title: 'Tipo', key: 'user_type', width: 90, render: (_, r) => <Tag color={TYPE_COLORS[r.user_type] || 'default'}>{TYPE_LABELS[r.user_type] || r.user_type}</Tag> },
    { title: 'Empresa', key: 'company', width: 160, ellipsis: true, responsive: ['lg'], render: (_, r) => r.company?.razon_social || <Tag>Global</Tag> },
    { title: 'Activo', key: 'active', width: 70, render: (_, r) => (
      <Switch checked={r.active} size="small" onChange={() => toggleMut.mutate(r.id)} loading={toggleMut.isPending} />
    )},
    { title: 'Ultimo Login', dataIndex: 'last_login_at', width: 150, responsive: ['xl'], render: (d: string) => <DateCell value={d} withTime /> },
    {
      title: 'Acciones', key: 'actions', width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/users/${record.id}/edit`)} />
          <Button
            size="small"
            type="primary"
            icon={<ApiOutlined />}
            onClick={() => handleViewToken(record.id)}
            loading={tokenLoading}
          >
            API
          </Button>
          {record.locked_until && <Button size="small" icon={<LockOutlined />} onClick={() => { unlockMut.mutate(record.id); message.success('Desbloqueado'); }} />}
          <Button size="small" icon={<KeyOutlined />} onClick={() => showConfirm({ title: 'Reset Password', content: `¿Resetear contrasena de ${record.name}?`, onOk: () => resetMut.mutateAsync(record.id) })} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Gestion de usuarios del sistema" onAdd={() => navigate('/users/new')} addLabel="Nuevo Usuario" />
      <Card>
        <div style={{ marginBottom: 16 }}><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email..." /></div>
        <Table columns={columns} dataSource={data?.data} rowKey="id" loading={isLoading} pagination={{
          current: page, pageSize: perPage, total: data?.pagination?.total, onChange: handlePageChange, showSizeChanger: true,
        }} />
      </Card>

      <Modal
        title="Credenciales API"
        open={tokenModal}
        onCancel={() => setTokenModal(false)}
        footer={[
          <Button key="close" onClick={() => setTokenModal(false)}>Cerrar</Button>,
          ...(tokenData?.has_token && tokenData?.access_token ? [
            <Button
              key="copy-all"
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => {
                if (!tokenData) return;
                const text = [
                  `API Base URL: ${tokenData.api_base_url}`,
                  `Token Type: ${tokenData.token_type}`,
                  `Access Token: ${tokenData.access_token}`,
                  `Company ID: ${tokenData.company_id ?? 'N/A'}`,
                  `Usuario: ${tokenData.user.email}`,
                  `Rol: ${tokenData.user.role}`,
                  `Empresa: ${tokenData.user.company ?? 'N/A'}`,
                ].join('\n');
                copyToClipboard(text);
              }}
            >
              Copiar Todo
            </Button>,
          ] : []),
        ]}
        width={700}
      >
        {tokenData && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Usuario">{tokenData.user.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{tokenData.user.email}</Descriptions.Item>
              <Descriptions.Item label="Rol">{tokenData.user.role}</Descriptions.Item>
              <Descriptions.Item label="Empresa">{tokenData.user.company ?? 'Global'}</Descriptions.Item>
              <Descriptions.Item label="Company ID">{tokenData.company_id ?? 'N/A'}</Descriptions.Item>
            </Descriptions>

            {tokenData.has_token && tokenData.access_token ? (
              <>
                <div style={{ marginTop: 16 }}>
                  <Text strong>API Base URL:</Text>
                  <Input.Search
                    value={tokenData.api_base_url}
                    readOnly
                    enterButton={<CopyOutlined />}
                    onSearch={() => copyToClipboard(tokenData.api_base_url)}
                    style={{ marginTop: 4 }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Bearer Token:</Text>
                  <Input.Search
                    value={tokenData.access_token}
                    readOnly
                    enterButton={<CopyOutlined />}
                    onSearch={() => copyToClipboard(tokenData.access_token ?? '')}
                    style={{ marginTop: 4 }}
                  />
                </div>

                {tokenData.created_at && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Token generado: {formatDateTime(tokenData.created_at)}</Text>
                  </div>
                )}

                <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                  <Text strong>Ejemplo de uso:</Text>
                  <pre style={{ marginTop: 8, fontSize: 12, overflow: 'auto' }}>{`curl -X POST ${tokenData.api_base_url}/v1/invoices \\
  -H "Authorization: Bearer ${tokenData.access_token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": ${tokenData.company_id},
    "branch_id": 1,
    "serie": "F001",
    ...
  }'`}</pre>
                </div>

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button
                    danger
                    icon={<KeyOutlined />}
                    loading={tokenMut.isPending}
                    onClick={() => showConfirm({
                      title: 'Regenerar Token',
                      content: 'El token actual sera revocado y se generara uno nuevo. Los sistemas que usen el token actual dejaran de funcionar. ¿Continuar?',
                      onOk: async () => { await tokenMut.mutateAsync(tokenData.user.id); },
                    })}
                  >
                    Regenerar Token
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  Este usuario no tiene un token API activo.
                </Paragraph>
                <Button
                  type="primary"
                  icon={<ApiOutlined />}
                  loading={tokenMut.isPending}
                  onClick={async () => { await tokenMut.mutateAsync(tokenData.user.id); }}
                  size="large"
                >
                  Generar Token
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

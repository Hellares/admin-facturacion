import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import { useClients, useDeleteClient } from './hooks/useClients';
import { useTableFilters } from '@/hooks/useTableFilters';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import { TIPO_DOCUMENTO_OPTIONS } from '@/utils/constants';
import type { Client } from '@/types/client.types';

export default function ClientListPage() {
  const navigate = useNavigate();
  const { search, setSearch, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const { data, isLoading } = useClients(getQueryParams());
  const deleteMutation = useDeleteClient();

  const handleDelete = (client: Client) => {
    showDeleteConfirm(async () => {
      try {
        await deleteMutation.mutateAsync(client.id);
        message.success('Cliente eliminado');
      } catch {
        message.error('Error al eliminar cliente');
      }
    }, `el cliente ${client.razon_social}`);
  };

  const getTipoDocLabel = (tipo: string) => {
    return TIPO_DOCUMENTO_OPTIONS.find((t) => t.value === tipo)?.label || tipo;
  };

  const columns: ColumnsType<Client> = [
    {
      title: 'Tipo Doc',
      dataIndex: 'tipo_documento',
      key: 'tipo_documento',
      width: 120,
      render: (tipo: string) => <Tag>{getTipoDocLabel(tipo)}</Tag>,
    },
    {
      title: 'Nro Documento',
      dataIndex: 'numero_documento',
      key: 'numero_documento',
      width: 140,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Razon Social',
      dataIndex: 'razon_social',
      key: 'razon_social',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      responsive: ['lg'],
    },
    {
      title: 'Telefono',
      dataIndex: 'telefono',
      key: 'telefono',
      responsive: ['xl'],
    },
    {
      title: 'Activo',
      key: 'activo',
      width: 70,
      render: (_, record) => (
        <Tag color={record.activo ? 'green' : 'red'}>{record.activo ? 'Si' : 'No'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/clients/${record.id}/edit`)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gestion de clientes"
        onAdd={() => navigate('/clients/new')}
        addLabel="Nuevo Cliente"
      />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, documento o email..."
          />
        </div>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: perPage,
            total: data?.pagination?.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `${total} clientes`,
          }}
          locale={{ emptyText: 'No hay clientes' }}
        />
      </Card>
    </div>
  );
}

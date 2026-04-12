import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, Button, Switch, Alert, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import {
  useTransportists,
  useDeleteTransportist,
  useActivateTransportist,
} from './hooks/useTransportists';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import type { Transportist } from '@/types/transportist.types';

const TIPO_DOC_LABEL: Record<string, string> = {
  '1': 'DNI',
  '4': 'CE',
  '6': 'RUC',
  '7': 'Pasaporte',
};

export default function TransportistListPage() {
  const navigate = useNavigate();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [search, setSearch] = useState('');

  const { data: transportists, isLoading } = useTransportists({ search: search || undefined });
  const deleteMutation = useDeleteTransportist();
  const activateMutation = useActivateTransportist();

  const handleDelete = (t: Transportist) => {
    showDeleteConfirm(async () => {
      try {
        await deleteMutation.mutateAsync(t.id);
        message.success('Transportista desactivado');
      } catch {
        message.error('Error al desactivar transportista');
      }
    }, `el transportista ${t.razon_social}`);
  };

  const handleActivate = async (t: Transportist) => {
    try {
      await activateMutation.mutateAsync(t.id);
      message.success('Transportista activado');
    } catch {
      message.error('Error al activar transportista');
    }
  };

  const columns: ColumnsType<Transportist> = [
    {
      title: 'Documento',
      key: 'documento',
      width: 180,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag>{TIPO_DOC_LABEL[r.tipo_doc] || r.tipo_doc}</Tag>
          <span style={{ fontFamily: 'monospace' }}>{r.num_doc}</span>
        </Space>
      ),
    },
    { title: 'Razon Social', dataIndex: 'razon_social', key: 'razon_social', ellipsis: true },
    {
      title: 'Nro MTC',
      dataIndex: 'nro_mtc',
      key: 'nro_mtc',
      width: 140,
      responsive: ['md'],
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Telefono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 140,
      responsive: ['lg'],
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Activo',
      key: 'activo',
      width: 80,
      render: (_, r) => <Switch checked={r.activo} disabled size="small" />,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_, r) => (
        <Space>
          {!r.activo && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              loading={activateMutation.isPending}
              onClick={() => handleActivate(r)}
            >
              Activar
            </Button>
          )}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/transportists/${r.id}/edit`)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r)}
            disabled={!r.activo}
          />
        </Space>
      ),
    },
  ];

  if (!selectedCompanyId) {
    return (
      <div>
        <PageHeader title="Transportistas" />
        <Alert
          message="Seleccione una empresa"
          description="Para ver los transportistas, seleccione una empresa en el selector superior."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Transportistas"
        subtitle="Empresas o personas que realizan el traslado fisico (modalidad 01 - Transporte publico)"
        onAdd={() => navigate('/transportists/new')}
        addLabel="Nuevo Transportista"
      />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por razon social, documento o MTC"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={transportists}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'No hay transportistas registrados' }}
        />
      </Card>
    </div>
  );
}

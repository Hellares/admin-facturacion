import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Switch, Alert, Input, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { useDrivers, useDeleteDriver, useActivateDriver } from './hooks/useDrivers';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import type { Driver } from '@/types/driver.types';

const TIPO_DOC_LABEL: Record<string, string> = {
  '1': 'DNI',
  '4': 'CE',
  '7': 'Pasaporte',
};

export default function DriverListPage() {
  const navigate = useNavigate();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [search, setSearch] = useState('');

  const { data: drivers, isLoading } = useDrivers({ search: search || undefined });
  const deleteMutation = useDeleteDriver();
  const activateMutation = useActivateDriver();

  const handleDelete = (d: Driver) => {
    showDeleteConfirm(async () => {
      try {
        await deleteMutation.mutateAsync(d.id);
        message.success('Conductor desactivado');
      } catch {
        message.error('Error al desactivar conductor');
      }
    }, `el conductor ${d.nombres} ${d.apellidos}`);
  };

  const handleActivate = async (d: Driver) => {
    try {
      await activateMutation.mutateAsync(d.id);
      message.success('Conductor activado');
    } catch {
      message.error('Error al activar conductor');
    }
  };

  const columns: ColumnsType<Driver> = [
    {
      title: 'Documento',
      key: 'documento',
      width: 160,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag>{TIPO_DOC_LABEL[r.tipo_doc] || r.tipo_doc}</Tag>
          <span style={{ fontFamily: 'monospace' }}>{r.num_doc}</span>
        </Space>
      ),
    },
    {
      title: 'Nombres y Apellidos',
      key: 'nombre',
      ellipsis: true,
      render: (_, r) => `${r.nombres} ${r.apellidos}`,
    },
    {
      title: 'Brevete',
      dataIndex: 'licencia',
      key: 'licencia',
      width: 140,
      render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span>,
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
            onClick={() => navigate(`/drivers/${r.id}/edit`)}
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
        <PageHeader title="Conductores" />
        <Alert
          message="Seleccione una empresa"
          description="Para ver los conductores, seleccione una empresa en el selector superior."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Conductores"
        subtitle="Conductores usados en guias de remision (modalidad 02 - Transporte privado)"
        onAdd={() => navigate('/drivers/new')}
        addLabel="Nuevo Conductor"
      />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, documento o brevete"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={drivers}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'No hay conductores registrados' }}
        />
      </Card>
    </div>
  );
}

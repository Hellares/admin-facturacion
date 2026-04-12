import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Switch, Alert, Input, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { useVehicles, useDeleteVehicle, useActivateVehicle } from './hooks/useVehicles';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import type { Vehicle } from '@/types/vehicle.types';

export default function VehicleListPage() {
  const navigate = useNavigate();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [search, setSearch] = useState('');

  const { data: vehicles, isLoading } = useVehicles({ search: search || undefined });
  const deleteMutation = useDeleteVehicle();
  const activateMutation = useActivateVehicle();

  const handleDelete = (v: Vehicle) => {
    showDeleteConfirm(async () => {
      try {
        await deleteMutation.mutateAsync(v.id);
        message.success('Vehiculo desactivado');
      } catch {
        message.error('Error al desactivar vehiculo');
      }
    }, `el vehiculo ${v.placa}`);
  };

  const handleActivate = async (v: Vehicle) => {
    try {
      await activateMutation.mutateAsync(v.id);
      message.success('Vehiculo activado');
    } catch {
      message.error('Error al activar vehiculo');
    }
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Placa',
      dataIndex: 'placa',
      key: 'placa',
      width: 120,
      render: (v: string) => <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 14 }}>{v}</Tag>,
    },
    { title: 'Marca', dataIndex: 'marca', key: 'marca', render: (v: string | null) => v || '-' },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo', responsive: ['md'], render: (v: string | null) => v || '-' },
    {
      title: 'Cert. MTC',
      dataIndex: 'nro_certificado_inscripcion',
      key: 'nro_certificado_inscripcion',
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
            onClick={() => navigate(`/vehicles/${r.id}/edit`)}
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
        <PageHeader title="Vehiculos" />
        <Alert
          message="Seleccione una empresa"
          description="Para ver los vehiculos, seleccione una empresa en el selector superior."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vehiculos"
        subtitle="Vehiculos usados en guias de remision (modalidad 02 - Transporte privado)"
        onAdd={() => navigate('/vehicles/new')}
        addLabel="Nuevo Vehiculo"
      />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por placa, marca o modelo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'No hay vehiculos registrados' }}
        />
      </Card>
    </div>
  );
}

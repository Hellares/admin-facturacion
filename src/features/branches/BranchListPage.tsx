import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, Button, Switch, Alert, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { useBranches, useDeleteBranch } from './hooks/useBranches';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showDeleteConfirm } from '@/components/common/ConfirmModal';
import { branchService } from '@/services/branch.service';
import type { Branch } from '@/types/branch.types';

export default function BranchListPage() {
  const navigate = useNavigate();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const qc = useQueryClient();
  const { data: branches, isLoading } = useBranches();
  const deleteMutation = useDeleteBranch();
  const activateMut = useMutation({
    mutationFn: (id: number) => branchService.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); message.success('Sucursal activada'); },
  });

  const handleDelete = (branch: Branch) => {
    showDeleteConfirm(async () => {
      try {
        await deleteMutation.mutateAsync(branch.id);
        message.success('Sucursal eliminada');
      } catch {
        message.error('Error al eliminar sucursal');
      }
    }, `la sucursal ${branch.nombre}`);
  };

  const columns: ColumnsType<Branch> = [
    { title: 'Codigo', dataIndex: 'codigo', key: 'codigo', width: 100 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', ellipsis: true },
    { title: 'Direccion', dataIndex: 'direccion', key: 'direccion', ellipsis: true, responsive: ['lg'] },
    {
      title: 'Series Factura',
      dataIndex: 'series_factura',
      key: 'series_factura',
      responsive: ['md'],
      render: (series: string[]) => series?.map((s) => <Tag key={s}>{s}</Tag>) || '-',
    },
    {
      title: 'Series Boleta',
      dataIndex: 'series_boleta',
      key: 'series_boleta',
      responsive: ['lg'],
      render: (series: string[]) => series?.map((s) => <Tag key={s}>{s}</Tag>) || '-',
    },
    {
      title: 'Activo',
      key: 'activo',
      width: 80,
      render: (_, record) => <Switch checked={record.activo} disabled size="small" />,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          {!record.activo && <Button size="small" icon={<CheckCircleOutlined />} loading={activateMut.isPending} onClick={() => activateMut.mutate(record.id)}>Activar</Button>}
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/branches/${record.id}/edit`)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  if (!selectedCompanyId) {
    return (
      <div>
        <PageHeader title="Sucursales" />
        <Alert message="Seleccione una empresa" description="Para ver las sucursales, seleccione una empresa en el selector superior." type="info" showIcon />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Sucursales" subtitle="Gestion de sucursales" onAdd={() => navigate('/branches/new')} addLabel="Nueva Sucursal" />
      <Card>
        <Table columns={columns} dataSource={branches} rowKey="id" loading={isLoading} pagination={false} locale={{ emptyText: 'No hay sucursales' }} />
      </Card>
    </div>
  );
}

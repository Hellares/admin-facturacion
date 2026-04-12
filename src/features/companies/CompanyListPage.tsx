import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, Button, Switch, message } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { useCompanies, useToggleProduction } from './hooks/useCompanies';
import type { Company } from '@/types/company.types';
import { ROUTES } from '@/config/routes.config';
import { showConfirm } from '@/components/common/ConfirmModal';

export default function CompanyListPage() {
  const navigate = useNavigate();
  const { data: companies, isLoading } = useCompanies();
  const toggleProduction = useToggleProduction();

  const handleToggleProduction = (company: Company) => {
    const action = company.modo_produccion ? 'pasar a BETA' : 'pasar a PRODUCCION';
    showConfirm({
      title: 'Cambiar modo',
      content: `¿Desea ${action} la empresa ${company.razon_social}?`,
      onOk: async () => {
        try {
          await toggleProduction.mutateAsync(company.id);
          message.success(`Modo cambiado correctamente`);
        } catch {
          message.error('Error al cambiar modo');
        }
      },
    });
  };

  const columns: ColumnsType<Company> = [
    {
      title: 'RUC',
      dataIndex: 'ruc',
      key: 'ruc',
      width: 130,
      render: (ruc: string) => <span style={{ fontFamily: 'monospace' }}>{ruc}</span>,
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
      title: 'Modo',
      key: 'modo',
      width: 120,
      render: (_, record) => (
        <Tag color={record.modo_produccion ? 'green' : 'orange'}>
          {record.modo_produccion ? 'Produccion' : 'Beta'}
        </Tag>
      ),
    },
    {
      title: 'Activo',
      key: 'activo',
      width: 80,
      render: (_, record) => (
        <Switch checked={record.activo} disabled size="small" />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/companies/${record.id}`)}>
            Ver
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/companies/${record.id}/edit`)}>
            Editar
          </Button>
          <Button size="small" onClick={() => handleToggleProduction(record)}>
            {record.modo_produccion ? 'Beta' : 'Prod'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle="Gestion de empresas emisoras"
        onAdd={() => navigate(ROUTES.COMPANY_NEW)}
        addLabel="Nueva Empresa"
      />
      <Card>
        <Table
          columns={columns}
          dataSource={companies}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'No hay empresas registradas' }}
        />
      </Card>
    </div>
  );
}

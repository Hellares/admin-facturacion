import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Divider, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCompany } from './hooks/useCompanies';
import { companyService } from '@/services/company.service';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = Number(id);
  const { data: company, isLoading } = useCompany(companyId);
  const { data: correlativosRaw, isLoading: loadingCorrelativos } = useQuery({
    queryKey: ['company-correlativos', companyId],
    queryFn: () => companyService.getCorrelativos(companyId),
    enabled: !!companyId,
  });

  // Aplanar la estructura anidada: branches > documentos > series
  interface CorrelativoRow { sucursal: string; tipo: string; serie: string; correlativo_actual: number; proximo_numero: string }
  const correlativos: CorrelativoRow[] = [];
  if (correlativosRaw && typeof correlativosRaw === 'object' && 'branches' in (correlativosRaw as unknown as Record<string, unknown>)) {
    const raw = correlativosRaw as unknown as { branches: Array<{ branch_nombre: string; documentos: Record<string, { tipo: string; series: Array<{ serie: string; correlativo_actual: number; proximo_numero: string }> }> }> };
    for (const branch of raw.branches || []) {
      for (const [, doc] of Object.entries(branch.documentos || {})) {
        for (const serie of doc.series || []) {
          correlativos.push({
            sucursal: branch.branch_nombre,
            tipo: doc.tipo,
            serie: serie.serie,
            correlativo_actual: serie.correlativo_actual,
            proximo_numero: serie.proximo_numero,
          });
        }
      }
    }
  }

  const correlativoCols: ColumnsType<CorrelativoRow> = [
    { title: 'Sucursal', dataIndex: 'sucursal', width: 150 },
    { title: 'Tipo Documento', dataIndex: 'tipo', width: 160 },
    { title: 'Serie', dataIndex: 'serie', width: 100, render: (s: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{s}</span> },
    { title: 'Correlativo', dataIndex: 'correlativo_actual', width: 100, align: 'center' as const },
    { title: 'Proximo Numero', dataIndex: 'proximo_numero', width: 160, render: (s: string) => <span style={{ fontFamily: 'monospace' }}>{s}</span> },
  ];

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!company) return <div>Empresa no encontrada</div>;

  return (
    <div>
      <PageHeader
        title={company.razon_social}
        subtitle={`RUC: ${company.ruc}`}
        showBack
        breadcrumbs={[
          { title: 'Empresas', path: '/companies' },
          { title: company.razon_social },
        ]}
        extra={
          <Button icon={<EditOutlined />} onClick={() => navigate(`/companies/${id}/edit`)}>
            Editar
          </Button>
        }
      />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="Informacion General">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="RUC">{company.ruc}</Descriptions.Item>
            <Descriptions.Item label="Razon Social">{company.razon_social}</Descriptions.Item>
            <Descriptions.Item label="Nombre Comercial">{company.nombre_comercial || '-'}</Descriptions.Item>
            <Descriptions.Item label="Direccion">{company.direccion}</Descriptions.Item>
            <Descriptions.Item label="Departamento">{company.departamento || '-'}</Descriptions.Item>
            <Descriptions.Item label="Provincia">{company.provincia || '-'}</Descriptions.Item>
            <Descriptions.Item label="Distrito">{company.distrito || '-'}</Descriptions.Item>
            <Descriptions.Item label="Telefono">{company.telefono || '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">{company.email || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Estado">
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Modo">
              <Tag color={company.modo_produccion ? 'green' : 'orange'}>
                {company.modo_produccion ? 'Produccion' : 'Beta'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={company.activo ? 'green' : 'red'}>
                {company.activo ? 'Activo' : 'Inactivo'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Usuario SOL">{company.usuario_sol || 'No configurado'}</Descriptions.Item>
            <Descriptions.Item label="Certificado">
              {company.certificado_pem ? <Tag color="green">Cargado</Tag> : <Tag color="red">No cargado</Tag>}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {company.cuentas_bancarias && company.cuentas_bancarias.length > 0 && (
          <Card title="Cuentas Bancarias">
            {company.cuentas_bancarias.map((cuenta, idx) => (
              <div key={idx}>
                {idx > 0 && <Divider />}
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Banco">{cuenta.banco}</Descriptions.Item>
                  <Descriptions.Item label="Tipo">{cuenta.tipo_cuenta}</Descriptions.Item>
                  <Descriptions.Item label="Cuenta">{cuenta.numero}</Descriptions.Item>
                  <Descriptions.Item label="Moneda">{cuenta.moneda || '-'}</Descriptions.Item>
                </Descriptions>
              </div>
            ))}
          </Card>
        )}

        <Card title="Correlativos">
          <Table
            columns={correlativoCols}
            dataSource={correlativos}
            rowKey={(r) => `${r.sucursal}-${r.tipo}-${r.serie}`}
            size="small"
            loading={loadingCorrelativos}
            pagination={false}
            locale={{ emptyText: 'Sin correlativos configurados' }}
          />
        </Card>
      </Space>
    </div>
  );
}

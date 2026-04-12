import { useState } from 'react';
import { Col, Row, Card, Alert } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import StatsCards from './components/StatsCards';
import PendingDocuments from './components/PendingDocuments';
import MonthlyRevenueChart from '@/components/charts/MonthlyRevenueChart';
import TopClientsChart from '@/components/charts/TopClientsChart';
import { useDashboardStats } from './hooks/useDashboard';
import { useCompanyContextStore } from '@/stores/company-context.store';

export default function DashboardPage() {
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

  const { data, isLoading } = useDashboardStats(
    dateRange[0] ?? undefined,
    dateRange[1] ?? undefined,
  );

  if (!selectedCompanyId) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <Alert
          message="Seleccione una empresa"
          description="Para ver las estadisticas, seleccione una empresa en el selector superior."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de facturacion"
        extra={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      />

      <StatsCards data={data} loading={isLoading} />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <MonthlyRevenueChart data={data?.monthly_chart} loading={isLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <TopClientsChart data={data?.top_clients} loading={isLoading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <PendingDocuments data={data?.pending_documents} loading={isLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Facturas por Vencer" size="small">
            {data?.expiring_invoices && data.expiring_invoices.length > 0 ? (
              <div>
                {data.expiring_invoices.map((inv) => (
                  <div key={inv.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}>
                    <div>
                      <strong>{inv.numero_completo}</strong>
                      <div style={{ fontSize: 12, color: '#999' }}>{inv.cliente}</div>
                    </div>
                    <div style={{
                      color: inv.dias_para_vencer <= 3 ? '#ff4d4f' : inv.dias_para_vencer <= 7 ? '#faad14' : '#52c41a',
                      fontWeight: 500,
                    }}>
                      {inv.dias_para_vencer} dias
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                Sin facturas proximas a vencer
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

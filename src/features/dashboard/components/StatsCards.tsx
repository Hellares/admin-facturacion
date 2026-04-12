import { Card, Col, Row, Statistic } from 'antd';
import {
  FileTextOutlined,
  SnippetsOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { DashboardStatistics } from '@/types/dashboard.types';

interface StatsCardsProps {
  data: DashboardStatistics | undefined;
  loading: boolean;
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  const pen = data?.totals_pen;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Facturas (PEN)"
            value={pen?.total_facturas ?? 0}
            precision={2}
            prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
            suffix={<span style={{ fontSize: 12, color: '#999' }}>({pen?.count_facturas ?? 0})</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Boletas (PEN)"
            value={pen?.total_boletas ?? 0}
            precision={2}
            prefix={<SnippetsOutlined style={{ color: '#52c41a' }} />}
            suffix={<span style={{ fontSize: 12, color: '#999' }}>({pen?.count_boletas ?? 0})</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Notas de Credito"
            value={pen?.total_nc ?? 0}
            precision={2}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            suffix={<span style={{ fontSize: 12, color: '#999' }}>({pen?.count_nc ?? 0})</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Notas de Debito"
            value={pen?.total_nd ?? 0}
            precision={2}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            suffix={<span style={{ fontSize: 12, color: '#999' }}>({pen?.count_nd ?? 0})</span>}
          />
        </Card>
      </Col>
    </Row>
  );
}

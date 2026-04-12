import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TopClient } from '@/types/dashboard.types';

interface TopClientsChartProps {
  data?: TopClient[];
  loading?: boolean;
}

export default function TopClientsChart({ data = [], loading }: TopClientsChartProps) {
  const chartData = (data ?? []).slice(0, 5).map((c) => {
    const name = c.client_name ?? 'Sin nombre';
    return {
      name: name.length > 25 ? name.substring(0, 25) + '...' : name,
      total: c.total_revenue ?? 0,
      count: c.count ?? 0,
    };
  });

  return (
    <Card title="Top 5 Clientes" loading={loading} size="small">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => `S/ ${(Number(value) ?? 0).toFixed(2)}`} />
          <Bar dataKey="total" name="Total Facturado" fill="#722ed1" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

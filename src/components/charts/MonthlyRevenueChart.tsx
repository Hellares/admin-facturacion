import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  facturas: number;
  boletas: number;
}

interface MonthlyRevenueChartProps {
  data?: ChartData[];
  loading?: boolean;
}

const DEFAULT_DATA: ChartData[] = [
  { name: 'Ene', facturas: 0, boletas: 0 },
  { name: 'Feb', facturas: 0, boletas: 0 },
  { name: 'Mar', facturas: 0, boletas: 0 },
  { name: 'Abr', facturas: 0, boletas: 0 },
  { name: 'May', facturas: 0, boletas: 0 },
  { name: 'Jun', facturas: 0, boletas: 0 },
];

export default function MonthlyRevenueChart({ data = DEFAULT_DATA, loading }: MonthlyRevenueChartProps) {
  return (
    <Card title="Ventas Mensuales (PEN)" loading={loading} size="small">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `S/ ${(Number(value) ?? 0).toFixed(2)}`} />
          <Legend />
          <Bar dataKey="facturas" name="Facturas" fill="#1677ff" />
          <Bar dataKey="boletas" name="Boletas" fill="#52c41a" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

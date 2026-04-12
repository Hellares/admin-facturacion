import { Typography } from 'antd';
import type { Moneda } from '@/types/common.types';
import { formatMoney } from '@/utils/format';

const { Text } = Typography;

interface MoneyDisplayProps {
  amount: number;
  moneda?: Moneda;
  strong?: boolean;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'normal' | 'large';
}

export default function MoneyDisplay({ amount, moneda = 'PEN', strong = false, type, size = 'normal' }: MoneyDisplayProps) {
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  return (
    <Text strong={strong} type={type} style={{ fontSize, whiteSpace: 'nowrap' }}>
      {formatMoney(amount, moneda)}
    </Text>
  );
}

import { DatePicker, Space, Typography } from 'antd';
import dayjs from '@/lib/dayjs';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DateRangeFilterProps {
  value?: [string | null, string | null];
  onChange: (dates: [string | null, string | null]) => void;
  label?: string;
}

const presets: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: 'Hoy', value: [dayjs(), dayjs()] },
  { label: 'Esta semana', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'Este mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: 'Mes pasado', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
  { label: 'Ultimos 3 meses', value: [dayjs().subtract(3, 'month').startOf('month'), dayjs().endOf('month')] },
  { label: 'Este ano', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

export default function DateRangeFilter({ value, onChange, label }: DateRangeFilterProps) {
  const dayjsValue: [Dayjs | null, Dayjs | null] | undefined = value
    ? [value[0] ? dayjs(value[0]) : null, value[1] ? dayjs(value[1]) : null]
    : undefined;

  const handleChange = (_: unknown, dateStrings: [string, string]) => {
    onChange([dateStrings[0] || null, dateStrings[1] || null]);
  };

  return (
    <Space size={4}>
      {label && <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>}
      <RangePicker
        value={dayjsValue}
        onChange={handleChange}
        format="DD/MM/YYYY"
        presets={presets}
        allowClear
        size="middle"
        placeholder={['Desde', 'Hasta']}
      />
    </Space>
  );
}

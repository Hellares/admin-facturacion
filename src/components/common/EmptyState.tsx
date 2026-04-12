import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export default function EmptyState({
  description = 'No hay datos disponibles',
  onAdd,
  addLabel = 'Crear nuevo',
}: EmptyStateProps) {
  return (
    <Empty
      description={description}
      style={{ padding: '48px 0' }}
    >
      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </Empty>
  );
}

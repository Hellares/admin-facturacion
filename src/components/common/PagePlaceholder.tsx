import { Card, Typography, Space } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Card>
      <Space direction="vertical" align="center" style={{ width: '100%', padding: '48px 0' }}>
        <ToolOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        <Text type="secondary">{description || 'Este modulo esta en desarrollo'}</Text>
      </Space>
    </Card>
  );
}

import { Space, Typography, Button, Breadcrumb } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

const { Title } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  onAdd?: () => void;
  addLabel?: string;
  addPermission?: string; // permission needed to show add button
  showBack?: boolean;
  extra?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  onAdd,
  addLabel = 'Nuevo',
  addPermission,
  showBack = false,
  extra,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const showAdd = onAdd && (!addPermission || hasPermission(addPermission));

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 8 }}
          items={breadcrumbs.map((b) => ({
            title: b.path ? (
              <a
                onClick={() => navigate(b.path!)}
                style={{
                  padding: '2px 10px',
                  borderRadius: 4,
                  background: '#e6f0fa',
                  color: '#1677ff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#bae0ff'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#e6f0fa'; }}
              >
                {b.title}
              </a>
            ) : (
              <span style={{ color: '#666' }}>{b.title}</span>
            ),
          }))}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {showBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ background: '#e6f0fa', color: '#1677ff', border: 'none', fontWeight: 500 }}
            />
          )}
          <div>
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
            {subtitle && (
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {subtitle}
              </Typography.Text>
            )}
          </div>
        </Space>
        <Space>
          {extra}
          {showAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              {addLabel}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}

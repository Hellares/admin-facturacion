import { Layout, Dropdown, Avatar, Space, Typography, Button, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import CompanyBranchSelector from './CompanyBranchSelector';
import PlazoAlertsBell from './PlazoAlertsBell';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function Header({ onMenuClick, isMobile = false }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedCompanyId, companies } = useCompanyContextStore();
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{user?.role}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesion',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader style={{
      padding: isMobile ? '0 12px' : '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      zIndex: 1,
    }}>
      <Space size={8} style={{ flex: 1, minWidth: 0 }}>
        {isMobile && onMenuClick && (
          <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} style={{ fontSize: 18 }} />
        )}
        {!isMobile && <CompanyBranchSelector />}
        {isMobile && selectedCompany && (
          <Tag
            color="blue"
            icon={<BankOutlined />}
            style={{
              margin: 0,
              fontSize: 12,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedCompany.razon_social}
          </Tag>
        )}
      </Space>

      <Space size={isMobile ? 'small' : 'middle'}>
        {!isMobile && <Text type="secondary" style={{ fontSize: 13 }}>{user?.email}</Text>}
        <PlazoAlertsBell />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar
            icon={<UserOutlined />}
            style={{ cursor: 'pointer', backgroundColor: '#1677ff' }}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
}

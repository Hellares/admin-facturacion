import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  CloudUploadOutlined,
  SafetyOutlined,
  BankOutlined,
  SettingOutlined,
  TeamOutlined,
  AlertOutlined,
  FileSearchOutlined,
  SnippetsOutlined,
  FileDoneOutlined,
  SolutionOutlined,
  ApiOutlined,
  BookOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@/config/routes.config';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
  },
  {
    key: 'ventas',
    icon: <ShoppingCartOutlined />,
    label: 'Ventas',
    children: [
      { key: 'invoices', icon: <FileTextOutlined />, label: 'Facturas', path: ROUTES.INVOICES },
      { key: 'boletas', icon: <SnippetsOutlined />, label: 'Boletas', path: ROUTES.BOLETAS },
      { key: 'credit-notes', icon: <FileDoneOutlined />, label: 'Notas de Credito', path: ROUTES.CREDIT_NOTES },
      { key: 'debit-notes', icon: <FileSearchOutlined />, label: 'Notas de Debito', path: ROUTES.DEBIT_NOTES },
    ],
  },
  {
    key: 'preventa',
    icon: <SolutionOutlined />,
    label: 'Pre-Venta',
    children: [
      { key: 'nota-ventas', label: 'Notas de Venta', path: ROUTES.NOTA_VENTAS },
      { key: 'cotizaciones', label: 'Cotizaciones', path: ROUTES.COTIZACIONES },
    ],
  },
  {
    key: 'despacho',
    icon: <CarOutlined />,
    label: 'Despacho',
    children: [
      { key: 'dispatch-guides', label: 'Guias de Remision', path: ROUTES.DISPATCH_GUIDES },
      { key: 'transportists', label: 'Transportistas', path: ROUTES.TRANSPORTISTS },
      { key: 'vehicles', label: 'Vehiculos', path: ROUTES.VEHICLES },
      { key: 'drivers', label: 'Conductores', path: ROUTES.DRIVERS },
    ],
  },
  {
    key: 'sunat',
    icon: <CloudUploadOutlined />,
    label: 'Procesos SUNAT',
    children: [
      { key: 'anulaciones', label: 'Anulaciones', path: ROUTES.ANULACIONES },
      { key: 'daily-summaries', label: 'Resumenes Diarios', path: ROUTES.DAILY_SUMMARIES },
      { key: 'consulta-cpe', label: 'Consulta CPE', path: ROUTES.CONSULTA_CPE },
    ],
  },
  {
    key: 'retentions',
    icon: <SafetyOutlined />,
    label: 'Retenciones',
    path: ROUTES.RETENTIONS,
  },
  {
    key: 'admin',
    icon: <BankOutlined />,
    label: 'Administracion',
    children: [
      { key: 'companies', icon: <BankOutlined />, label: 'Empresas', path: ROUTES.COMPANIES },
      { key: 'branches', label: 'Sucursales', path: ROUTES.BRANCHES },
      { key: 'clients', icon: <TeamOutlined />, label: 'Clientes', path: ROUTES.CLIENTS },
      { key: 'users', icon: <TeamOutlined />, label: 'Usuarios', path: ROUTES.USERS },
    ],
  },
  {
    key: 'config',
    icon: <SettingOutlined />,
    label: 'Configuracion',
    children: [
      { key: 'system-settings', icon: <SettingOutlined />, label: 'Sistema', path: ROUTES.SYSTEM_SETTINGS },
      { key: 'company-config', label: 'Config. Empresa', path: ROUTES.CONFIG },
      { key: 'gre-credentials', icon: <ApiOutlined />, label: 'Credenciales GRE', path: ROUTES.GRE_CREDENTIALS },
      { key: 'webhooks', icon: <ApiOutlined />, label: 'Webhooks', path: ROUTES.WEBHOOKS },
      { key: 'catalogs', icon: <BookOutlined />, label: 'Catalogos', path: ROUTES.CATALOGS },
    ],
  },
  {
    key: 'alertas',
    icon: <AlertOutlined />,
    label: 'Alertas',
    children: [
      { key: 'plazo-alerts', label: 'Alertas de Plazo', path: ROUTES.PLAZO_ALERTS },
      { key: 'bancarizacion', icon: <AuditOutlined />, label: 'Bancarizacion', path: ROUTES.BANCARIZACION },
    ],
  },
  {
    key: 'api',
    icon: <ApiOutlined />,
    label: 'Integracion API',
    children: [
      { key: 'my-api-token', icon: <ApiOutlined />, label: 'Mi Token API', path: ROUTES.MY_API_TOKEN },
      { key: 'api-docs', icon: <BookOutlined />, label: 'Documentacion', path: ROUTES.API_DOCS },
    ],
  },
];

type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
};

type AntMenuItem = NonNullable<React.ComponentProps<typeof Menu>['items']>[number];

const ROLE_MENU_ACCESS: Record<string, string[]> = {
  super_admin: ['*'], // all
  company_admin: [
    'dashboard', 'ventas', 'invoices', 'boletas', 'credit-notes', 'debit-notes',
    'preventa', 'nota-ventas', 'cotizaciones',
    'despacho', 'dispatch-guides', 'transportists', 'vehicles', 'drivers',
    'sunat', 'anulaciones', 'daily-summaries', 'consulta-cpe',
    'retentions',
    'admin', 'branches', 'clients', 'users',
    'config', 'company-config', 'gre-credentials', 'webhooks', 'catalogs',
    'alertas', 'plazo-alerts', 'bancarizacion',
    'api', 'my-api-token', 'api-docs',
  ],
  company_user: [
    'dashboard', 'ventas', 'invoices', 'boletas', 'credit-notes', 'debit-notes',
    'preventa', 'nota-ventas', 'cotizaciones',
    'despacho', 'dispatch-guides', 'transportists', 'vehicles', 'drivers',
    'sunat', 'anulaciones', 'daily-summaries', 'consulta-cpe',
    'retentions',
    'admin', 'clients',
    'alertas', 'plazo-alerts', 'bancarizacion',
    'api', 'my-api-token', 'api-docs',
    'config', 'catalogs',
  ],
  read_only: [
    'dashboard', 'ventas', 'invoices', 'boletas', 'credit-notes', 'debit-notes',
    'preventa', 'nota-ventas', 'cotizaciones',
    'despacho', 'dispatch-guides', 'transportists', 'vehicles', 'drivers',
    'sunat', 'anulaciones', 'daily-summaries', 'consulta-cpe',
    'retentions',
    'admin', 'clients',
    'alertas', 'plazo-alerts', 'bancarizacion',
    'api', 'my-api-token', 'api-docs',
  ],
  api_client: ['dashboard'],
};

function filterMenuByRole(items: MenuItem[], roleName: string | null): MenuItem[] {
  const allowedKeys = ROLE_MENU_ACCESS[roleName || ''] || ROLE_MENU_ACCESS['read_only'];
  if (allowedKeys.includes('*')) return items;

  return items
    .filter((item) => allowedKeys.includes(item.key))
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) => allowedKeys.includes(child.key));
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[];
}

function buildMenuItems(items: MenuItem[], navigate: (path: string) => void): AntMenuItem[] {
  return items.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: buildMenuItems(item.children, navigate),
      };
    }
    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
      onClick: () => item.path && navigate(item.path),
    };
  });
}

function findSelectedKey(pathname: string, items: MenuItem[]): string[] {
  const flatItems: { key: string; path: string }[] = [];
  const flatten = (menuList: MenuItem[]) => {
    menuList.forEach((item) => {
      if (item.path) flatItems.push({ key: item.key, path: item.path });
      if (item.children) flatten(item.children);
    });
  };
  flatten(items);

  const match = flatItems.find((item) => pathname.startsWith(item.path));
  return match ? [match.key] : ['dashboard'];
}

function findOpenKeys(pathname: string, items: MenuItem[]): string[] {
  const keys: string[] = [];
  items.forEach((item) => {
    if (item.children) {
      const childMatch = item.children.some((child) => child.path && pathname.startsWith(child.path));
      if (childMatch) keys.push(item.key);
    }
  });
  return keys;
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const roleName = useAuthStore((s) => s.user?.role_name ?? null);
  const filteredMenuItems = filterMenuByRole(menuItems, roleName);

  const items = buildMenuItems(filteredMenuItems, navigate);
  const selectedKeys = findSelectedKey(location.pathname, filteredMenuItems);
  const defaultOpenKeys = findOpenKeys(location.pathname, filteredMenuItems);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      style={{ minHeight: '100vh' }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? 16 : 18,
        fontWeight: 600,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        {collapsed ? 'FE' : 'Facturacion SUNAT'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        items={items}
      />
    </Sider>
  );
}

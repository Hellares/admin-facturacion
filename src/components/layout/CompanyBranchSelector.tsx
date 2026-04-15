import { Select, Space, Typography, Tag, Tooltip } from 'antd';
import { BankOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyContextStore } from '@/stores/company-context.store';

const { Text } = Typography;

interface Props {
  vertical?: boolean;
}

export default function CompanyBranchSelector({ vertical = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());
  const userCompanyId = user?.company_id;
  const isLocked = !!userCompanyId && !isSuperAdmin;

  const {
    selectedCompanyId,
    selectedBranchId,
    companies,
    branches,
    setSelectedCompany,
    setSelectedBranch,
  } = useCompanyContextStore();

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // Cuando un super_admin con empresa asignada selecciona otra distinta,
  // esta en "modo administracion" (solo lectura). No puede emitir documentos.
  const isAdminReadOnlyMode =
    isSuperAdmin &&
    !!userCompanyId &&
    !!selectedCompanyId &&
    Number(userCompanyId) !== Number(selectedCompanyId);

  const selectWidth = vertical ? '100%' : undefined;

  return (
    <Space size="middle" direction={vertical ? 'vertical' : 'horizontal'} style={vertical ? { width: '100%' } : undefined}>
      <Space size={4} style={vertical ? { width: '100%' } : undefined}>
        <BankOutlined style={{ color: '#1677ff' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>Empresa:</Text>
        {isLocked ? (
          <Tag color="blue" style={{ margin: 0, fontSize: 13 }}>
            {selectedCompany ? `${selectedCompany.ruc} - ${selectedCompany.razon_social}` : 'Cargando...'}
          </Tag>
        ) : (
          <Select
            value={selectedCompanyId}
            onChange={(value) => setSelectedCompany(value)}
            placeholder="Seleccionar empresa"
            style={{ minWidth: 220, width: selectWidth }}
            size="small"
            allowClear
            showSearch
            optionFilterProp="label"
            options={companies.map((c) => ({
              value: c.id,
              label: `${c.ruc} - ${c.razon_social}`,
            }))}
          />
        )}
        {isAdminReadOnlyMode && (
          <Tooltip title="Esta viendo una empresa distinta a la suya. Solo puede administrar/consultar — no puede emitir documentos.">
            <Tag color="orange" icon={<EyeOutlined />} style={{ margin: 0 }}>
              Solo lectura
            </Tag>
          </Tooltip>
        )}
      </Space>

      <Space size={4} style={vertical ? { width: '100%' } : undefined}>
        <ShopOutlined style={{ color: '#52c41a' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>Sucursal:</Text>
        <Select
          value={selectedBranchId}
          onChange={(value) => setSelectedBranch(value)}
          placeholder="Seleccionar sucursal"
          style={{ minWidth: 180, width: selectWidth }}
          size="small"
          allowClear
          disabled={!selectedCompanyId}
          options={branches.map((b) => ({
            value: b.id,
            label: `${b.codigo} - ${b.nombre}`,
          }))}
        />
      </Space>
    </Space>
  );
}

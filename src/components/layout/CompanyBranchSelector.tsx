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

  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <BankOutlined style={{ color: '#1677ff' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Empresa</Text>
            {isAdminReadOnlyMode && (
              <Tooltip title="Viendo empresa distinta a la suya. Solo puede administrar/consultar.">
                <Tag color="orange" icon={<EyeOutlined />} style={{ margin: 0, fontSize: 11 }}>
                  Solo lectura
                </Tag>
              </Tooltip>
            )}
          </div>
          {isLocked ? (
            <Tag color="blue" style={{ margin: 0, fontSize: 12, whiteSpace: 'normal', display: 'block', padding: '4px 8px' }}>
              {selectedCompany ? `${selectedCompany.ruc} - ${selectedCompany.razon_social}` : 'Cargando...'}
            </Tag>
          ) : (
            <Select
              value={selectedCompanyId}
              onChange={(value) => setSelectedCompany(value)}
              placeholder="Seleccionar empresa"
              style={{ width: '100%' }}
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
        </div>

        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <ShopOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Sucursal</Text>
          </div>
          <Select
            value={selectedBranchId}
            onChange={(value) => setSelectedBranch(value)}
            placeholder="Seleccionar sucursal"
            style={{ width: '100%' }}
            size="small"
            allowClear
            disabled={!selectedCompanyId}
            options={branches.map((b) => ({
              value: b.id,
              label: `${b.codigo} - ${b.nombre}`,
            }))}
          />
        </div>
      </div>
    );
  }

  return (
    <Space size="middle">
      <Space size={4}>
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
            style={{ minWidth: 220 }}
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

      <Space size={4}>
        <ShopOutlined style={{ color: '#52c41a' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>Sucursal:</Text>
        <Select
          value={selectedBranchId}
          onChange={(value) => setSelectedBranch(value)}
          placeholder="Seleccionar sucursal"
          style={{ minWidth: 180 }}
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

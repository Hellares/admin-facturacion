import { useEffect } from 'react';
import { Select, Space, Typography, Tag, Tooltip } from 'antd';
import { BankOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyContextStore } from '@/stores/company-context.store';
import apiClient from '@/lib/axios';
import type { Company } from '@/types/company.types';
import type { Branch } from '@/types/branch.types';
import type { ApiResponse } from '@/types/api.types';

const { Text } = Typography;

export default function CompanyBranchSelector() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());
  // Usuario con empresa asignada no puede cambiar
  const userCompanyId = user?.company_id;
  const isLocked = !!userCompanyId && !isSuperAdmin;

  const {
    selectedCompanyId,
    selectedBranchId,
    companies,
    branches,
    setSelectedCompany,
    setSelectedBranch,
    setCompanies,
    setBranches,
  } = useCompanyContextStore();

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Company[]>>('/v1/companies');
        const data = response.data.data;
        setCompanies(data);

        // Si hay un selectedCompanyId persistido pero no existe en la lista
        // recibida del backend (por ejemplo, IDs de una sesion anterior con
        // DB fresca o empresa eliminada), lo invalidamos.
        const persistedStillValid =
          selectedCompanyId != null && data.some((c) => c.id === selectedCompanyId);

        if (isLocked && userCompanyId) {
          // Usuario con empresa asignada: auto-seleccionar su empresa
          setSelectedCompany(userCompanyId);
        } else if (!persistedStillValid && data.length === 1) {
          // Si solo hay una empresa disponible, seleccionarla
          setSelectedCompany(data[0].id);
        } else if (!persistedStillValid) {
          // Invalidar seleccion obsoleta
          setSelectedCompany(null);
        }
      } catch {
        // Si el usuario tiene empresa asignada pero falla la carga, igual seleccionarla
        if (isLocked && userCompanyId) {
          setSelectedCompany(userCompanyId);
        }
      }
    };
    loadCompanies();
  }, [userCompanyId, isLocked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load branches when company changes
  useEffect(() => {
    if (!selectedCompanyId) {
      setBranches([]);
      return;
    }
    const loadBranches = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Branch[]>>(
          `/v1/companies/${selectedCompanyId}/branches`
        );
        const data = response.data.data;
        setBranches(data);
        if (data.length === 1) {
          setSelectedBranch(data[0].id);
        }
      } catch {
        setBranches([]);
      }
    };
    loadBranches();
  }, [selectedCompanyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // Cuando un super_admin con empresa asignada selecciona otra distinta,
  // esta en "modo administracion" (solo lectura). No puede emitir documentos.
  const isAdminReadOnlyMode =
    isSuperAdmin &&
    !!userCompanyId &&
    !!selectedCompanyId &&
    Number(userCompanyId) !== Number(selectedCompanyId);

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

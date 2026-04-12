import { useState } from 'react';
import { Select, Button, Space, Drawer, Tag, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTransportists } from '@/features/transportists/hooks/useTransportists';
import TransportistFormPage from '@/features/transportists/TransportistFormPage';
import type { Transportist } from '@/types/transportist.types';

interface TransportistSelectorProps {
  /** Id del transportista seleccionado */
  value?: number | null;
  /** Callback cuando cambia la seleccion. Recibe el objeto completo (null si se deselecciona). */
  onChange?: (transportist: Transportist | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Si es true, solo muestra transportistas con nro_mtc (obligatorio para modalidad 01) */
  requireMtc?: boolean;
}

const TIPO_DOC_LABEL: Record<string, string> = {
  '1': 'DNI',
  '4': 'CE',
  '6': 'RUC',
  '7': 'Pas',
};

export default function TransportistSelector({
  value,
  onChange,
  placeholder = 'Seleccionar transportista',
  disabled = false,
  requireMtc = false,
}: TransportistSelectorProps) {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: transportists, isLoading } = useTransportists({
    search: search || undefined,
    activo: true,
  });

  const filtered = (transportists || []).filter((t) => (requireMtc ? !!t.nro_mtc : true));

  const handleSelect = (id: number) => {
    const found = filtered.find((t) => t.id === id);
    onChange?.(found || null);
  };

  const handleClear = () => {
    onChange?.(null);
  };

  const handleCreated = (created: { id: number }) => {
    // Invalida cache para recargar la lista y selecciona automaticamente el nuevo
    qc.invalidateQueries({ queryKey: ['transportists'] });
    qc.refetchQueries({ queryKey: ['transportists'] }).then(() => {
      // Despues del refetch, el nuevo esta en el cache; lo buscamos en la lista actualizada
      const updated = qc.getQueriesData<Transportist[]>({ queryKey: ['transportists'] });
      const list = updated.flatMap(([, data]) => data || []);
      const found = list.find((t) => t.id === created.id);
      if (found) onChange?.(found);
    });
    setDrawerOpen(false);
  };

  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          value={value ?? undefined}
          onChange={handleSelect}
          onClear={handleClear}
          placeholder={placeholder}
          disabled={disabled}
          showSearch
          allowClear
          filterOption={false}
          onSearch={setSearch}
          notFoundContent={isLoading ? <Spin size="small" /> : <Empty description="Sin resultados" />}
          style={{ flex: 1 }}
          options={filtered.map((t) => ({
            value: t.id,
            label: (
              <Space>
                <Tag>{TIPO_DOC_LABEL[t.tipo_doc] || t.tipo_doc}</Tag>
                <span style={{ fontFamily: 'monospace' }}>{t.num_doc}</span>
                <span>-</span>
                <span>{t.razon_social}</span>
                {t.nro_mtc && <Tag color="geekblue">MTC {t.nro_mtc}</Tag>}
              </Space>
            ),
          }))}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
          disabled={disabled}
          title="Nuevo transportista"
        >
          Nuevo
        </Button>
      </Space.Compact>

      <Drawer
        title="Nuevo Transportista"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        destroyOnClose
      >
        <TransportistFormPage
          embedded
          onSuccess={handleCreated}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}

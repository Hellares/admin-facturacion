import { useState } from 'react';
import { Select, Button, Space, Drawer, Tag, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useDrivers } from '@/features/drivers/hooks/useDrivers';
import DriverFormPage from '@/features/drivers/DriverFormPage';
import type { Driver } from '@/types/driver.types';

interface DriverSelectorProps {
  value?: number | null;
  onChange?: (driver: Driver | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TIPO_DOC_LABEL: Record<string, string> = {
  '1': 'DNI',
  '4': 'CE',
  '7': 'Pas',
};

export default function DriverSelector({
  value,
  onChange,
  placeholder = 'Seleccionar conductor',
  disabled = false,
}: DriverSelectorProps) {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: drivers, isLoading } = useDrivers({
    search: search || undefined,
    activo: true,
  });

  const list = drivers || [];

  const handleSelect = (id: number) => {
    const found = list.find((d) => d.id === id);
    onChange?.(found || null);
  };

  const handleClear = () => onChange?.(null);

  const handleCreated = (created: { id: number }) => {
    qc.invalidateQueries({ queryKey: ['drivers'] });
    qc.refetchQueries({ queryKey: ['drivers'] }).then(() => {
      const updated = qc.getQueriesData<Driver[]>({ queryKey: ['drivers'] });
      const all = updated.flatMap(([, data]) => data || []);
      const found = all.find((d) => d.id === created.id);
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
          options={list.map((d) => ({
            value: d.id,
            label: (
              <Space>
                <Tag>{TIPO_DOC_LABEL[d.tipo_doc] || d.tipo_doc}</Tag>
                <span style={{ fontFamily: 'monospace' }}>{d.num_doc}</span>
                <span>-</span>
                <span>{d.nombres} {d.apellidos}</span>
                <Tag color="geekblue">Brevete {d.licencia}</Tag>
              </Space>
            ),
          }))}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
          disabled={disabled}
          title="Nuevo conductor"
        >
          Nuevo
        </Button>
      </Space.Compact>

      <Drawer
        title="Nuevo Conductor"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        destroyOnClose
      >
        <DriverFormPage embedded onSuccess={handleCreated} onCancel={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
}

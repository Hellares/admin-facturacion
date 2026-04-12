import { useState } from 'react';
import { Select, Button, Space, Drawer, Tag, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import VehicleFormPage from '@/features/vehicles/VehicleFormPage';
import type { Vehicle } from '@/types/vehicle.types';

interface VehicleSelectorProps {
  value?: number | null;
  onChange?: (vehicle: Vehicle | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VehicleSelector({
  value,
  onChange,
  placeholder = 'Seleccionar vehiculo',
  disabled = false,
}: VehicleSelectorProps) {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: vehicles, isLoading } = useVehicles({
    search: search || undefined,
    activo: true,
  });

  const list = vehicles || [];

  const handleSelect = (id: number) => {
    const found = list.find((v) => v.id === id);
    onChange?.(found || null);
  };

  const handleClear = () => onChange?.(null);

  const handleCreated = (created: { id: number }) => {
    qc.invalidateQueries({ queryKey: ['vehicles'] });
    qc.refetchQueries({ queryKey: ['vehicles'] }).then(() => {
      const updated = qc.getQueriesData<Vehicle[]>({ queryKey: ['vehicles'] });
      const all = updated.flatMap(([, data]) => data || []);
      const found = all.find((v) => v.id === created.id);
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
          options={list.map((v) => ({
            value: v.id,
            label: (
              <Space>
                <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v.placa}</Tag>
                {(v.marca || v.modelo) && (
                  <span>{[v.marca, v.modelo].filter(Boolean).join(' ')}</span>
                )}
                {v.nro_certificado_inscripcion && (
                  <Tag color="geekblue">MTC {v.nro_certificado_inscripcion}</Tag>
                )}
              </Space>
            ),
          }))}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
          disabled={disabled}
          title="Nuevo vehiculo"
        >
          Nuevo
        </Button>
      </Space.Compact>

      <Drawer
        title="Nuevo Vehiculo"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        destroyOnClose
      >
        <VehicleFormPage embedded onSuccess={handleCreated} onCancel={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
}

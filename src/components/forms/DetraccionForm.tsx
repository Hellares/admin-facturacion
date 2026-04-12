import { useState, useEffect } from 'react';
import { Collapse, Form, Input, InputNumber, Select, Space } from 'antd';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { catalogService, type DetraccionCatalog } from '@/services/catalog.service';

export default function DetraccionForm() {
  const { control, setValue } = useFormContext();
  const [catalogo, setCatalogo] = useState<DetraccionCatalog[]>([]);

  const codigoBienServicio = useWatch({ control, name: 'detraccion.codigo_bien_servicio' });

  useEffect(() => {
    catalogService.getDetracciones().then(setCatalogo).catch(() => {});
  }, []);

  useEffect(() => {
    if (codigoBienServicio && catalogo.length > 0) {
      const item = catalogo.find((c) => c.codigo === codigoBienServicio);
      if (item) {
        setValue('detraccion.porcentaje', item.porcentaje);
      }
    }
  }, [codigoBienServicio, catalogo, setValue]);

  return (
    <Collapse
      size="small"
      items={[{
        key: 'detraccion',
        label: 'Detraccion (opcional)',
        children: (
          <Space size="middle" wrap>
            <Form.Item label="Bien/Servicio">
              <Controller
                name="detraccion.codigo_bien_servicio"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    style={{ width: 300 }}
                    placeholder="Seleccione..."
                    options={catalogo.map((c) => ({
                      value: c.codigo,
                      label: `${c.codigo} - ${c.descripcion} (${c.porcentaje}%)`,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="Cuenta Banco (Nacion)">
              <Controller
                name="detraccion.cuenta_banco"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Nro. cuenta" style={{ width: 200 }} />}
              />
            </Form.Item>
            <Form.Item label="Porcentaje">
              <Controller
                name="detraccion.porcentaje"
                control={control}
                render={({ field }) => <InputNumber {...field} min={0} max={100} suffix="%" style={{ width: 100 }} />}
              />
            </Form.Item>
            <Form.Item label="Medio Pago">
              <Controller
                name="detraccion.codigo_medio_pago"
                control={control}
                render={({ field }) => <Input {...field} placeholder="001" style={{ width: 80 }} />}
              />
            </Form.Item>
          </Space>
        ),
      }]}
    />
  );
}

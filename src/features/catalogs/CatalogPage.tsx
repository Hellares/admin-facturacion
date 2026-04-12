import { useState, useEffect } from 'react';
import { Card, Table, Tabs, Input, Select, InputNumber, Button, Descriptions, Space, message } from 'antd';
import { SearchOutlined, CalculatorOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { catalogService, type DetraccionCatalog } from '@/services/catalog.service';
import { ubigeoService, type UbigeoRegion } from '@/services/ubigeo.service';

interface DetraccionCalcResult {
  codigo_bien_servicio: string;
  descripcion: string;
  monto_total_operacion: number;
  porcentaje_detraccion: number;
  monto_detraccion: number;
  monto_neto_a_pagar: number;
}

export default function CatalogPage() {
  const [detracciones, setDetracciones] = useState<DetraccionCatalog[]>([]);
  const [regiones, setRegiones] = useState<UbigeoRegion[]>([]);
  const [searchDet, setSearchDet] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscador de detracciones
  const [busquedaResults, setBusquedaResults] = useState<unknown[]>([]);
  const buscarMut = useMutation({
    mutationFn: (q: string) => catalogService.buscarDetracciones(q),
    onSuccess: (data) => setBusquedaResults(data),
    onError: () => message.error('Error al buscar detracciones'),
  });

  // Calculadora de detraccion
  const [calcCodigo, setCalcCodigo] = useState<string | undefined>();
  const [calcMonto, setCalcMonto] = useState<number | null>(null);
  const [calcResult, setCalcResult] = useState<DetraccionCalcResult | null>(null);
  const calcularMut = useMutation({
    mutationFn: (data: { codigo_bien_servicio: string; monto_total: number }) => catalogService.calcularDetraccion(data),
    onSuccess: (data) => setCalcResult(data),
    onError: () => message.error('Error al calcular detraccion'),
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      catalogService.getDetracciones().then(setDetracciones).catch(() => {}),
      ubigeoService.getRegiones().then(setRegiones).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredDet = detracciones.filter((d) =>
    d.codigo.includes(searchDet) || d.descripcion.toLowerCase().includes(searchDet.toLowerCase())
  );

  const detCols: ColumnsType<DetraccionCatalog> = [
    { title: 'Codigo', dataIndex: 'codigo', width: 80 },
    { title: 'Descripcion', dataIndex: 'descripcion' },
    { title: 'Porcentaje', dataIndex: 'porcentaje', width: 100, render: (p: number) => `${p}%` },
  ];

  const regionCols: ColumnsType<UbigeoRegion> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Nombre', dataIndex: 'nombre' },
  ];

  const busquedaCols: ColumnsType<Record<string, unknown>> = [
    { title: 'Codigo', dataIndex: 'codigo', width: 80 },
    { title: 'Descripcion', dataIndex: 'descripcion' },
    { title: 'Porcentaje', dataIndex: 'porcentaje', width: 100, render: (p) => p != null ? `${p}%` : '-' },
  ];

  const handleCalcular = () => {
    if (!calcCodigo || !calcMonto) {
      message.warning('Seleccione un codigo y ingrese un monto');
      return;
    }
    calcularMut.mutate({ codigo_bien_servicio: calcCodigo, monto_total: calcMonto });
  };

  return (
    <div>
      <PageHeader title="Catalogos" subtitle="Catalogos SUNAT y datos de referencia" />
      <Tabs items={[
        {
          key: 'detracciones',
          label: `Detracciones (${detracciones.length})`,
          children: (
            <Card size="small">
              <Input.Search placeholder="Buscar detraccion..." value={searchDet} onChange={(e) => setSearchDet(e.target.value)} style={{ width: 300, marginBottom: 16 }} allowClear />
              <Table columns={detCols} dataSource={filteredDet} rowKey="codigo" size="small" loading={loading} pagination={{ pageSize: 20 }} />
            </Card>
          ),
        },
        {
          key: 'ubigeos',
          label: `Ubigeos - Regiones (${regiones.length})`,
          children: (
            <Card size="small">
              <Table columns={regionCols} dataSource={regiones} rowKey="id" size="small" loading={loading} pagination={{ pageSize: 30 }} />
            </Card>
          ),
        },
      ]} />

      <Card title="Buscador de Detracciones" size="small" style={{ marginTop: 24 }}>
        <Input.Search
          placeholder="Buscar detraccion por codigo o descripcion..."
          enterButton={<><SearchOutlined /> Buscar</>}
          onSearch={(q) => { if (q.trim()) buscarMut.mutate(q); }}
          style={{ width: 400, marginBottom: 16 }}
          allowClear
          loading={buscarMut.isPending}
        />
        <Table
          columns={busquedaCols}
          dataSource={busquedaResults as Record<string, unknown>[]}
          rowKey={(r) => String(r.codigo ?? Math.random())}
          size="small"
          loading={buscarMut.isPending}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Ingrese un termino de busqueda' }}
        />
      </Card>

      <Card title="Calculadora de Detraccion" size="small" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Select
              placeholder="Seleccionar detraccion"
              style={{ width: 350 }}
              value={calcCodigo}
              onChange={setCalcCodigo}
              showSearch
              optionFilterProp="label"
              options={detracciones.map((d) => ({ value: d.codigo, label: `${d.codigo} - ${d.descripcion} (${d.porcentaje}%)` }))}
            />
            <InputNumber
              placeholder="Monto total"
              style={{ width: 200 }}
              value={calcMonto}
              onChange={setCalcMonto}
              min={0}
              precision={2}
              prefix="S/"
            />
            <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalcular} loading={calcularMut.isPending}>
              Calcular
            </Button>
          </Space>

          {calcResult && (
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
              <Descriptions.Item label="Codigo">{calcResult.codigo_bien_servicio}</Descriptions.Item>
              <Descriptions.Item label="Descripcion">{calcResult.descripcion}</Descriptions.Item>
              <Descriptions.Item label="Monto Total Operacion">S/ {calcResult.monto_total_operacion.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Porcentaje Detraccion">{calcResult.porcentaje_detraccion}%</Descriptions.Item>
              <Descriptions.Item label="Monto Detraccion">S/ {calcResult.monto_detraccion.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Monto Neto a Pagar">S/ {calcResult.monto_neto_a_pagar.toFixed(2)}</Descriptions.Item>
            </Descriptions>
          )}
        </Space>
      </Card>
    </div>
  );
}

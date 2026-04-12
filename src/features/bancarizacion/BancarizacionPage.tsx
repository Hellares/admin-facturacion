import { useState, useEffect } from 'react';
import { Card, Table, InputNumber, Select, Button, Space, Tag, Row, Col, Statistic, message } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { bancarizacionService, type MedioPagoCatalog } from '@/services/bancarizacion.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { BANCARIZACION_UMBRAL_PEN, BANCARIZACION_UMBRAL_USD } from '@/utils/constants';

export default function BancarizacionPage() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [mediosPago, setMediosPago] = useState<MedioPagoCatalog[]>([]);
  const [monto, setMonto] = useState<number>(0);
  const [moneda, setMoneda] = useState<string>('PEN');
  const [, setValidationResult] = useState<unknown>(null);
  const [, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    bancarizacionService.getMediosPago().then(setMediosPago).catch(() => {});
    if (companyId) bancarizacionService.getEstadisticas({ company_id: companyId }).then((s) => setStats(s as Record<string, unknown>)).catch(() => {});
  }, [companyId]);

  const handleValidar = async () => {
    try {
      const res = await bancarizacionService.validar({ monto, moneda });
      setValidationResult(res);
    } catch { message.error('Error'); }
  };

  const umbral = moneda === 'PEN' ? BANCARIZACION_UMBRAL_PEN : BANCARIZACION_UMBRAL_USD;
  const aplica = monto >= umbral;

  return (
    <div>
      <PageHeader title="Bancarizacion" subtitle="Ley 28194 - Medios de pago obligatorios" />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Umbral PEN" value={BANCARIZACION_UMBRAL_PEN} prefix="S/" />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Umbral USD" value={BANCARIZACION_UMBRAL_USD} prefix="US$" />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Medios de Pago" value={mediosPago.length} suffix="registrados" />
            </Card>
          </Col>
        </Row>

        <Card title="Validador de Bancarizacion">
          <Space wrap>
            <InputNumber value={monto} onChange={(v) => setMonto(v || 0)} placeholder="Monto" style={{ width: 200 }} min={0} precision={2} />
            <Select value={moneda} onChange={setMoneda} style={{ width: 100 }} options={[{ value: 'PEN', label: 'PEN' }, { value: 'USD', label: 'USD' }]} />
            <Button type="primary" onClick={handleValidar}>Validar</Button>
            <Tag color={aplica ? 'red' : 'green'} icon={aplica ? <WarningOutlined /> : <CheckCircleOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
              {aplica ? 'REQUIERE bancarizacion' : 'NO requiere bancarizacion'}
            </Tag>
          </Space>
        </Card>

        <Card title="Catalogo de Medios de Pago" size="small">
          <Table size="small" pagination={false} dataSource={mediosPago} rowKey="codigo" columns={[
            { title: 'Codigo', dataIndex: 'codigo', width: 80 },
            { title: 'Descripcion', dataIndex: 'descripcion' },
          ]} />
        </Card>
      </Space>
    </div>
  );
}

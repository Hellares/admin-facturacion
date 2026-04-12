import { useState } from 'react';
import { Card, Select, InputNumber, Button, Space, Descriptions, Tag, message, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { consultaCpeService, type CpeResult } from '@/services/consulta-cpe.service';

export default function ConsultaCpePage() {
  const [tipoDoc, setTipoDoc] = useState<string>('factura');
  const [docId, setDocId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CpeResult | null>(null);

  const handleConsultar = async () => {
    if (!docId) { message.warning('Ingrese el ID del documento'); return; }
    setLoading(true);
    setResult(null);
    try {
      let res: CpeResult;
      switch (tipoDoc) {
        case 'factura': res = await consultaCpeService.consultarFactura(docId); break;
        case 'boleta': res = await consultaCpeService.consultarBoleta(docId); break;
        case 'nota-credito': res = await consultaCpeService.consultarNotaCredito(docId); break;
        case 'nota-debito': res = await consultaCpeService.consultarNotaDebito(docId); break;
        default: return;
      }
      setResult(res);
      message.success('Consulta realizada');
    } catch { message.error('Error al consultar CPE'); }
    finally { setLoading(false); }
  };

  const statusColor = result?.estado === 'ACEPTADO' ? 'green' : result?.estado === 'RECHAZADO' ? 'red' : 'orange';

  return (
    <div>
      <PageHeader title="Consulta CPE" subtitle="Consultar estado de comprobantes en SUNAT" />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Space wrap>
            <Select value={tipoDoc} onChange={setTipoDoc} style={{ width: 200 }} options={[
              { value: 'factura', label: 'Factura' },
              { value: 'boleta', label: 'Boleta' },
              { value: 'nota-credito', label: 'Nota de Credito' },
              { value: 'nota-debito', label: 'Nota de Debito' },
            ]} />
            <InputNumber value={docId || undefined} onChange={(v) => setDocId(v || 0)} placeholder="ID del documento" style={{ width: 200 }} min={1} />
            <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={handleConsultar}>Consultar</Button>
          </Space>
        </Card>

        {result && (
          <Card title="Resultado de Consulta">
            <Descriptions column={1}>
              <Descriptions.Item label="Estado"><Tag color={statusColor} style={{ fontSize: 14, padding: '4px 16px' }}>{result.estado}</Tag></Descriptions.Item>
              <Descriptions.Item label="Codigo">{result.codigo}</Descriptions.Item>
              <Descriptions.Item label="Mensaje">{result.mensaje}</Descriptions.Item>
              {result.observaciones && result.observaciones.length > 0 && (
                <Descriptions.Item label="Observaciones">
                  {result.observaciones.map((obs, i) => <Alert key={i} message={obs} type="warning" style={{ marginBottom: 4 }} showIcon />)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Space>
    </div>
  );
}

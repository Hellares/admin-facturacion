import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Row, Col, Typography, Spin, Result } from 'antd';
import { FilePdfOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SafetyCertificateOutlined, WarningOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import apiClient from '@/lib/axios';

const { Title, Text } = Typography;

const MONEDA_SYMBOL: Record<string, string> = { PEN: 'S/', USD: '$' };
const TIPO_DOC_CLIENT: Record<string, string> = { '1': 'DNI', '4': 'CE', '6': 'RUC', '7': 'PAS' };

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  ACEPTADO: { color: '#52c41a', icon: <CheckCircleOutlined />, label: 'Aceptado por SUNAT' },
  RECHAZADO: { color: '#ff4d4f', icon: <CloseCircleOutlined />, label: 'Rechazado por SUNAT' },
  PENDIENTE: { color: '#faad14', icon: <ClockCircleOutlined />, label: 'Pendiente' },
  EN_COLA: { color: '#1677ff', icon: <ClockCircleOutlined />, label: 'En proceso' },
};

interface DocRelacionado {
  tipo: string;
  tipo_nombre: string;
  numero_completo: string;
  motivo: string;
  cod_motivo: string;
  estado_sunat: string;
  total: number;
  moneda: string;
  consulta_url: string;
}

interface DocAfectado {
  tipo: string;
  tipo_nombre: string;
  numero_completo: string;
  consulta_url: string | null;
}

interface DocumentData {
  tipo_documento: string;
  tipo_documento_nombre: string;
  numero_completo: string;
  fecha_emision: string;
  moneda: string;
  estado_sunat: string;
  emisor: { ruc: string; razon_social: string; nombre_comercial?: string; direccion?: string };
  receptor: { tipo_documento: string; numero_documento: string; razon_social: string } | null;
  totales: { gravada: number; exonerada: number; inafecta: number; igv: number; total: number };
  detalles: Array<{
    descripcion: string;
    cantidad: number;
    unidad: string;
    mto_valor_unitario?: number;
    mto_precio_unitario?: number;
    mto_valor_venta?: number;
  }>;
  tiene_pdf: boolean;
  documentos_relacionados?: DocRelacionado[];
  documento_afectado?: DocAfectado | null;
}

export default function ConsultaDocumentoPage() {
  const { ruc, tipoDoc, serieCorrelativo } = useParams();
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ruc || !tipoDoc || !serieCorrelativo) return;

    let cancelled = false;
    apiClient
      .get(`/consulta/${ruc}/${tipoDoc}/${serieCorrelativo}`)
      .then((res) => { if (!cancelled) setData(res.data.data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [ruc, tipoDoc, serieCorrelativo]);

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = `/api/consulta/${ruc}/${tipoDoc}/${serieCorrelativo}/pdf`;
    link.download = `${data?.numero_completo || 'documento'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <Spin size="large" tip="Consultando documento..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <Result
          status="404"
          title="Documento no encontrado"
          subTitle="Verifique que la URL o el codigo QR sean correctos."
        />
      </div>
    );
  }

  const sc = STATUS_CONFIG[data.estado_sunat] || STATUS_CONFIG.PENDIENTE;
  const sym = MONEDA_SYMBOL[data.moneda] || 'S/';

  // P. Unit. y Total se muestran CON IGV incluido (precio que paga el cliente).
  // Para items gratuitos mto_precio_unitario es 0; el fallback usa mto_valor_unitario.
  const getPrecioUnit = (record: DocumentData['detalles'][0]) =>
    record.mto_precio_unitario || record.mto_valor_unitario || 0;

  const columns = [
    { title: '#', width: 40, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: 'Descripcion', dataIndex: 'descripcion' },
    { title: 'Cant.', dataIndex: 'cantidad', width: 60, align: 'right' as const },
    { title: 'Und', dataIndex: 'unidad', width: 50 },
    {
      title: 'P. Unit.',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, record: DocumentData['detalles'][0]) => {
        const v = getPrecioUnit(record);
        return v ? `${sym} ${v.toFixed(2)}` : '-';
      },
    },
    {
      title: 'Total',
      width: 100,
      align: 'right' as const,
      render: (_: unknown, record: DocumentData['detalles'][0]) => {
        const total = (record.cantidad || 0) * getPrecioUnit(record);
        return total ? `${sym} ${total.toFixed(2)}` : '-';
      },
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2a3f5f 0%, #3468a8 50%, #5ba3d9 100%)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 24, color: '#fff' }}>
          <SafetyCertificateOutlined style={{ fontSize: 40, marginBottom: 8 }} />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>Comprobante Electronico</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Validado por SUNAT</Text>
        </div>

        {/* ESTADO */}
        <Card size="small" style={{ marginBottom: 12, textAlign: 'center' }}>
          <Space>
            <span style={{ color: sc.color, fontSize: 24 }}>{sc.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{data.numero_completo}</div>
              <Tag color={sc.color}>{sc.label}</Tag>
              <Tag>{data.tipo_documento_nombre}</Tag>
            </div>
          </Space>
        </Card>

        {/* DOCUMENTO AFECTADO (para NC y ND) */}
        {data.documento_afectado && (
          <Card size="small" style={{ marginBottom: 12, borderLeft: '4px solid #1677ff' }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <InfoCircleOutlined style={{ color: '#1677ff' }} />
                <Text strong>Este documento afecta a:</Text>
              </Space>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Tag color="blue">{data.documento_afectado.tipo_nombre}</Tag>
                  <Text strong style={{ fontFamily: 'monospace' }}>{data.documento_afectado.numero_completo}</Text>
                </div>
                {data.documento_afectado.consulta_url && (
                  <Button
                    type="link"
                    size="small"
                    icon={<LinkOutlined />}
                    href={data.documento_afectado.consulta_url}
                  >
                    Ver documento
                  </Button>
                )}
              </div>
            </Space>
          </Card>
        )}

        {/* DOCUMENTOS RELACIONADOS (NC/ND para facturas y boletas) */}
        {data.documentos_relacionados && data.documentos_relacionados.length > 0 && (
          <Card size="small" style={{ marginBottom: 12, borderLeft: '4px solid #faad14' }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <Text strong>Este documento tiene notas asociadas:</Text>
              </Space>
              {data.documentos_relacionados.map((doc, i) => {
                const docSym = MONEDA_SYMBOL[doc.moneda] || 'S/';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: doc.tipo === '07' ? '#fff7e6' : '#fff1f0',
                      borderRadius: 6,
                    }}
                  >
                    <div>
                      <Tag color={doc.tipo === '07' ? 'orange' : 'red'}>{doc.tipo_nombre}</Tag>
                      <Text strong style={{ fontFamily: 'monospace' }}>{doc.numero_completo}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {doc.cod_motivo} - {doc.motivo}
                      </Text>
                      <br />
                      <Text style={{ fontSize: 13, fontWeight: 600 }}>{docSym} {doc.total.toFixed(2)}</Text>
                      {' '}
                      <Tag color={doc.estado_sunat === 'ACEPTADO' ? 'green' : 'default'} style={{ fontSize: 10 }}>
                        {doc.estado_sunat}
                      </Tag>
                    </div>
                    <Space direction="vertical" size={4}>
                      <Button
                        type="link"
                        size="small"
                        icon={<LinkOutlined />}
                        href={doc.consulta_url}
                      >
                        Ver
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<FilePdfOutlined />}
                        href={`/api${doc.consulta_url}/pdf`}
                      >
                        PDF
                      </Button>
                    </Space>
                  </div>
                );
              })}
            </Space>
          </Card>
        )}

        {/* EMISOR + RECEPTOR */}
        <Card size="small" style={{ marginBottom: 12 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Emisor</Text>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{data.emisor.razon_social}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12 }}>RUC {data.emisor.ruc}</div>
              {data.emisor.direccion && <div style={{ fontSize: 11, color: '#888' }}>{data.emisor.direccion}</div>}
            </Col>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Receptor</Text>
              {data.receptor ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{data.receptor.razon_social}</div>
                  <div style={{ fontSize: 12 }}>
                    <Tag style={{ fontSize: 11 }}>{TIPO_DOC_CLIENT[data.receptor.tipo_documento] || data.receptor.tipo_documento}</Tag>
                    <span style={{ fontFamily: 'monospace' }}>{data.receptor.numero_documento}</span>
                  </div>
                </>
              ) : <div style={{ color: '#999' }}>-</div>}
            </Col>
          </Row>
        </Card>

        {/* DATOS DEL DOCUMENTO */}
        <Card size="small" style={{ marginBottom: 12 }}>
          <Descriptions column={{ xs: 2, sm: 4 }} size="small">
            <Descriptions.Item label="Fecha">{String(data.fecha_emision).substring(0, 10)}</Descriptions.Item>
            <Descriptions.Item label="Moneda"><Tag>{data.moneda}</Tag></Descriptions.Item>
            <Descriptions.Item label="IGV">{sym} {data.totales.igv.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Total">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>{sym} {data.totales.total.toFixed(2)}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* ITEMS */}
        {data.detalles && data.detalles.length > 0 && (
          <Card size="small" title={`Items (${data.detalles.length})`} style={{ marginBottom: 12 }}>
            <Table
              columns={columns}
              dataSource={data.detalles}
              rowKey={(_, i) => String(i)}
              size="small"
              pagination={false}
            />
          </Card>
        )}

        {/* TOTALES */}
        <Card size="small" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {data.totales.gravada > 0 && <div><Text type="secondary">Op. Gravada:</Text> {sym} {data.totales.gravada.toFixed(2)}</div>}
            {data.totales.exonerada > 0 && <div><Text type="secondary">Op. Exonerada:</Text> {sym} {data.totales.exonerada.toFixed(2)}</div>}
            {data.totales.inafecta > 0 && <div><Text type="secondary">Op. Inafecta:</Text> {sym} {data.totales.inafecta.toFixed(2)}</div>}
            <div><Text type="secondary">IGV (18%):</Text> {sym} {data.totales.igv.toFixed(2)}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', borderTop: '2px solid #1677ff', paddingTop: 4, marginTop: 4 }}>
              TOTAL: {sym} {data.totales.total.toFixed(2)}
            </div>
          </div>
        </Card>

        {/* DESCARGAR PDF */}
        {data.estado_sunat !== 'PENDIENTE' && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<FilePdfOutlined />}
              onClick={handleDownloadPdf}
              style={{ height: 50, fontSize: 16, borderRadius: 8, paddingInline: 40 }}
            >
              Descargar PDF
            </Button>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, padding: '16px 0' }}>
          Documento electronico generado conforme a la normativa de SUNAT.
          <br />Representacion impresa del comprobante electronico.
        </div>
      </div>
    </div>
  );
}

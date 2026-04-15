import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, Button, Row, Col, Divider, Typography, message } from 'antd';
import {
  SyncOutlined, EditOutlined, CarOutlined, UserOutlined,
  ShopOutlined, EnvironmentOutlined, FileTextOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SunatStatus } from '@/types/common.types';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DocumentActions from '@/components/common/DocumentActions';
import OrigenTag from '@/components/common/OrigenTag';
import { useDispatchGuide, useCheckDispatchGuideStatus } from './hooks/useDispatchGuides';
import { useUbigeos } from '@/hooks/useUbigeos';
import { showApiError } from '@/lib/api-error';
import { formatDate } from '@/utils/format';

const { Text } = Typography;

const s = (obj: Record<string, unknown> | null | undefined, key: string): string =>
  String(obj?.[key] ?? '');

const TIPO_DOC: Record<string, string> = { '1': 'DNI', '4': 'CE', '6': 'RUC', '7': 'PAS' };
const MOD: Record<string, string> = { '01': 'Publico', '02': 'Privado' };

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  ACEPTADO: { color: '#52c41a', icon: <CheckCircleOutlined /> },
  PROCESANDO: { color: '#1677ff', icon: <ClockCircleOutlined spin /> },
  ENVIANDO: { color: '#1677ff', icon: <SendOutlined /> },
  PENDIENTE: { color: '#faad14', icon: <ClockCircleOutlined /> },
  RECHAZADO: { color: '#ff4d4f', icon: <CloseCircleOutlined /> },
  ERROR: { color: '#ff4d4f', icon: <CloseCircleOutlined /> },
};

interface DetalleItem { codigo: string; descripcion: string; unidad: string; cantidad: number; peso_total?: number }

export default function DispatchGuideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawGuide, isLoading, refetch } = useDispatchGuide(Number(id));
  const checkStatus = useCheckDispatchGuideStatus();
  const { ubigeos } = useUbigeos();

  const g = rawGuide as unknown as Record<string, unknown> | undefined;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!g) return <div>Guia no encontrada</div>;

  const traslado = (g.traslado || {}) as Record<string, unknown>;
  const empresa = (g.empresa || {}) as Record<string, unknown>;
  const sucursal = (g.sucursal || {}) as Record<string, unknown>;
  const dest = (g.destinatario || {}) as Record<string, unknown>;
  const partida = (g.partida || {}) as Record<string, unknown>;
  const llegada = (g.llegada || {}) as Record<string, unknown>;
  const trans = g.transportista as Record<string, unknown> | null;
  const veh = g.vehiculo as Record<string, unknown> | null;
  const cond = veh?.conductor as Record<string, unknown> | null;
  const indicadores = (g.indicadores || []) as string[];
  const detalles = (g.detalles || []) as DetalleItem[];
  const archivos = (g.archivos || {}) as Record<string, unknown>;

  const estado = String(g.estado_sunat || 'PENDIENTE');
  const mod = String(traslado.mod_traslado || g.mod_traslado || '');
  const cod = String(traslado.cod_traslado || g.cod_traslado || '');
  const des = String(traslado.des_traslado || g.des_traslado || '');
  const peso = String(traslado.peso_total || g.peso_total || 0);
  const und = String(traslado.und_peso_total || g.und_peso_total || 'KGM');
  const bultos = traslado.num_bultos || g.num_bultos;
  const isM1L = indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L');
  const canEdit = estado === 'PENDIENTE' || estado === 'RECHAZADO';
  const sc = STATUS_CONFIG[estado] || STATUS_CONFIG.PENDIENTE;

  const ubigeoLabel = (code: string) => {
    const f = ubigeos.find((u) => u.ubigeo === code);
    return f ? `${f.departamento} / ${f.provincia} / ${f.distrito}` : code;
  };

  const handleCheckStatus = async () => {
    try {
      await checkStatus.mutateAsync(Number(id));
      message.success('Estado verificado');
      refetch();
    } catch (err) { showApiError(err, 'Error al verificar estado'); }
  };

  const columns: ColumnsType<DetalleItem> = [
    { title: '#', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Codigo', dataIndex: 'codigo', width: 100 },
    { title: 'Descripcion', dataIndex: 'descripcion' },
    { title: 'Und', dataIndex: 'unidad', width: 50, align: 'center' },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70, align: 'right' },
    { title: 'Peso', dataIndex: 'peso_total', width: 70, align: 'right', render: (v: number) => v ? `${v} kg` : '-' },
  ];

  const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
      <Text type="secondary" style={{ minWidth: 110, fontSize: 12 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontFamily: mono ? 'monospace' : undefined }}>{value || '-'}</Text>
    </div>
  );

  const DirBlock = ({ title, data, color }: { title: string; data: Record<string, unknown>; color: string }) => (
    <div>
      <Text strong style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Text>
      <div style={{ marginTop: 4 }}>
        <Tag color={color} style={{ fontFamily: 'monospace', marginBottom: 4 }}>{s(data, 'ubigeo')}</Tag>
        <Text style={{ fontSize: 13 }}>{ubigeoLabel(s(data, 'ubigeo'))}</Text>
      </div>
      <Text style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{s(data, 'direccion')}</Text>
      {!!(data.ruc) && <Text type="secondary" style={{ fontSize: 11 }}>RUC: {s(data, 'ruc')} | Local: {s(data, 'cod_local') || '0000'}</Text>}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Guia ${g.numero_completo}`}
        showBack
        breadcrumbs={[{ title: 'Guias de Remision', path: '/dispatch-guides' }, { title: String(g.numero_completo) }]}
        extra={
          <Space>
            {canEdit && <Button icon={<EditOutlined />} onClick={() => navigate(`/dispatch-guides/${g.id}/edit`)}>Editar</Button>}
            {(estado === 'PROCESANDO' || estado === 'ENVIANDO') && (
              <Button icon={<SyncOutlined />} loading={checkStatus.isPending} onClick={handleCheckStatus}>Verificar Estado</Button>
            )}
            <DocumentActions documentType="dispatch-guides" documentId={g.id as number} documentNumber={String(g.numero_completo)} status={estado as SunatStatus} onStatusChange={() => refetch()} />
          </Space>
        }
      />

      {/* HEADER: Estado + Numero + Fechas */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={16} align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: sc.color, fontSize: 20 }}>{sc.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'monospace' }}>{String(g.numero_completo)}</div>
                <Space size={4}>
                  <Tag color={sc.color} style={{ fontSize: 11 }}>{estado}</Tag>
                  <OrigenTag origen={g.origen as 'web' | 'api' | undefined} />
                </Space>
              </div>
            </div>
          </Col>
          <Col flex="auto">
            <Row gutter={24} justify="end">
              <Col><Text type="secondary" style={{ fontSize: 11 }}>EMISION</Text><div style={{ fontWeight: 500 }}>{formatDate(String(g.fecha_emision))}</div></Col>
              <Col><Text type="secondary" style={{ fontSize: 11 }}>TRASLADO</Text><div style={{ fontWeight: 500 }}>{formatDate(String(g.fecha_traslado))}</div></Col>
              <Col>
                <Text type="secondary" style={{ fontSize: 11 }}>MODALIDAD</Text>
                <div><Tag color={mod === '01' ? 'blue' : 'green'}>{mod} - {MOD[mod] || mod}</Tag>{isM1L && <Tag color="orange">M1L</Tag>}</div>
              </Col>
              <Col><Text type="secondary" style={{ fontSize: 11 }}>MOTIVO</Text><div><Tag>{cod}</Tag> {des}</div></Col>
              <Col><Text type="secondary" style={{ fontSize: 11 }}>PESO</Text><div style={{ fontWeight: 500 }}>{peso} {und}</div></Col>
              {!!bultos && <Col><Text type="secondary" style={{ fontSize: 11 }}>BULTOS</Text><div>{String(bultos)}</div></Col>}
            </Row>
          </Col>
        </Row>
        {!!g.ticket && (
          <div style={{ marginTop: 8, padding: '4px 8px', background: '#f6f6f6', borderRadius: 4, fontSize: 11 }}>
            <Text type="secondary">Ticket: </Text><code>{String(g.ticket)}</code>
          </div>
        )}
        {!!g.observaciones && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
            <Text type="secondary">Obs: </Text>{String(g.observaciones)}
          </div>
        )}
        {indicadores.length > 0 && (
          <div style={{ marginTop: 6 }}>{indicadores.map((i) => <Tag key={i} color="purple" style={{ fontSize: 11 }}>{i}</Tag>)}</div>
        )}
      </Card>

      <Row gutter={12}>
        {/* COL IZQUIERDA */}
        <Col xs={24} lg={14}>
          {/* EMPRESA + DESTINATARIO */}
          <Card size="small" style={{ marginBottom: 12 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div style={{ borderRight: '1px solid #f0f0f0', paddingRight: 16, marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}><ShopOutlined /> Empresa Emisora</Text>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{s(empresa, 'razon_social')}</div>
                  <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>RUC {s(empresa, 'ruc')}</Text>
                  <div style={{ fontSize: 11, color: '#888' }}>Suc: {s(sucursal, 'nombre')} ({s(sucursal, 'codigo')})</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}><UserOutlined /> Destinatario</Text>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{s(dest, 'razon_social')}</div>
                <div>
                  <Tag style={{ fontSize: 11 }}>{TIPO_DOC[s(dest, 'tipo_documento')] || s(dest, 'tipo_documento')}</Tag>
                  <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{s(dest, 'numero_documento')}</Text>
                </div>
                {s(dest, 'direccion') && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s(dest, 'direccion')}</div>}
              </Col>
            </Row>
          </Card>

          {/* DIRECCIONES */}
          <Card size="small" title={<span style={{ fontSize: 13 }}><EnvironmentOutlined /> Direcciones</span>} style={{ marginBottom: 12 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <DirBlock title="Punto de Partida" data={partida} color="blue" />
              </Col>
              <Col xs={24} sm={12}>
                <DirBlock title="Punto de Llegada" data={llegada} color="green" />
              </Col>
            </Row>
          </Card>

          {/* ITEMS */}
          <Card size="small" title={<span style={{ fontSize: 13 }}><FileTextOutlined /> Items ({detalles.length})</span>} style={{ marginBottom: 12 }}>
            <Table columns={columns} dataSource={detalles} rowKey={(_, i) => String(i)} size="small" pagination={false} />
          </Card>
        </Col>

        {/* COL DERECHA */}
        <Col xs={24} lg={10}>
          {/* TRANSPORTE */}
          <Card
            size="small"
            title={<span style={{ fontSize: 13 }}><CarOutlined /> Transporte</span>}
            style={{ marginBottom: 12 }}
          >
            {mod === '01' && trans && (
              <div>
                <Tag color="blue" style={{ marginBottom: 8 }}>Transporte Publico</Tag>
                <InfoRow label="Razon Social" value={s(trans, 'razon_social')} />
                <InfoRow label="Documento" value={`${TIPO_DOC[s(trans, 'tipo_doc')] || s(trans, 'tipo_doc')} ${s(trans, 'num_doc')}`} mono />
                <InfoRow label="Nro. MTC" value={s(trans, 'nro_mtc')} mono />
              </div>
            )}

            {mod === '02' && (
              <div>
                <Tag color="green" style={{ marginBottom: 8 }}>Transporte Privado</Tag>

                {isM1L ? (
                  <Tag color="orange">Vehiculo M1L — Sin conductor ni placa requerido</Tag>
                ) : (
                  <>
                    {cond && (
                      <>
                        <Divider plain style={{ margin: '8px 0', fontSize: 12 }}>Conductor</Divider>
                        <InfoRow label="Nombre" value={`${s(cond, 'nombres')} ${s(cond, 'apellidos')}`} />
                        <InfoRow label="Documento" value={`${TIPO_DOC[s(cond, 'tipo_doc')] || s(cond, 'tipo_doc')} ${s(cond, 'num_doc')}`} mono />
                        <InfoRow label="Licencia" value={s(cond, 'licencia')} mono />
                      </>
                    )}

                    {veh && (
                      <>
                        <Divider plain style={{ margin: '8px 0', fontSize: 12 }}>Vehiculo</Divider>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 16, padding: '4px 12px' }}>
                            {s(veh, 'placa_principal') || s(veh, 'placa')}
                          </Tag>
                          {!!veh.placa_secundaria && (
                            <Tag style={{ fontFamily: 'monospace' }}>{s(veh, 'placa_secundaria')}</Tag>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {!trans && mod === '01' && <Text type="secondary">Sin transportista registrado</Text>}
            {!veh && mod === '02' && !isM1L && <Text type="secondary">Sin vehiculo registrado</Text>}
          </Card>

          {/* ARCHIVOS */}
          {!!(archivos?.xml_existe || archivos?.cdr_existe || archivos?.pdf_existe) && (
            <Card size="small" title={<span style={{ fontSize: 13 }}>Archivos</span>} style={{ marginBottom: 12 }}>
              <Space>
                {archivos.xml_existe ? <Tag color="processing">XML</Tag> : null}
                {archivos.cdr_existe ? <Tag color="success">CDR</Tag> : null}
                {archivos.pdf_existe ? <Tag color="error">PDF</Tag> : null}
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

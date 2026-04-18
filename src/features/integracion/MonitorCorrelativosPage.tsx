import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Select, Space, Tag, Progress, InputNumber, Segmented, Badge,
  Button, Typography, Statistic, Row, Col, Alert, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, MinusCircleOutlined, SearchOutlined,
  UnorderedListOutlined, BarChartOutlined, SwapOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { integracionService } from '@/services/integracion.service';
import type { MonitorDocumento, SerieInfo } from '@/services/integracion.service';

const { Text } = Typography;

const TIPO_DOC_OPTIONS = [
  { value: '01', label: 'Factura' },
  { value: '03', label: 'Boleta' },
  { value: '07', label: 'Nota de Credito' },
  { value: '08', label: 'Nota de Debito' },
  { value: '09', label: 'Guia de Remision' },
];

function estadoColor(estado: string) {
  switch (estado) {
    case 'ACEPTADO': return 'success';
    case 'RECHAZADO': return 'error';
    case 'EN_COLA': case 'ENVIANDO': case 'PROCESANDO': return 'processing';
    case 'PENDIENTE': return 'warning';
    case 'NO_EMITIDO': return 'default';
    case 'ERROR': return 'error';
    default: return 'default';
  }
}

function estadoIcon(estado: string) {
  switch (estado) {
    case 'ACEPTADO': return <CheckCircleOutlined />;
    case 'RECHAZADO': case 'ERROR': return <CloseCircleOutlined />;
    case 'EN_COLA': case 'ENVIANDO': case 'PROCESANDO': return <SyncOutlined spin />;
    case 'PENDIENTE': return <WarningOutlined />;
    case 'NO_EMITIDO': return <MinusCircleOutlined />;
    default: return null;
  }
}

// Resumen por serie (estilo SAP)
interface ResumenSerie {
  tipo_documento: string;
  tipo_documento_nombre: string;
  serie: string;
  tipo_uso: string;
  doc_inicial: number;
  doc_final: number;
  cant_correlativos: number;
  cant_bd: number;
  gaps: number;
}

export default function MonitorCorrelativosPage() {
  const [vista, setVista] = useState<'resumen' | 'detalle'>('resumen');
  const [tipoDocumento, setTipoDocumento] = useState('01');
  const [serie, setSerie] = useState<string | null>(null);
  const [desde, setDesde] = useState<number | null>(null);
  const [hasta, setHasta] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Cargar series disponibles
  const { data: seriesData, isLoading: loadingSeries } = useQuery({
    queryKey: ['series-correlativos'],
    queryFn: integracionService.getSeriesCorrelativos,
  });

  // Construir resumen por serie (estilo SAP)
  const resumenSeries = useMemo((): ResumenSerie[] => {
    if (!seriesData?.branches) return [];
    const rows: ResumenSerie[] = [];
    for (const branch of seriesData.branches) {
      for (const s of branch.series) {
        if (s.correlativo_actual === 0) continue;
        rows.push({
          tipo_documento: s.tipo_documento,
          tipo_documento_nombre: s.tipo_documento_nombre,
          serie: s.serie,
          tipo_uso: s.tipo_uso,
          doc_inicial: 1,
          doc_final: s.correlativo_actual,
          cant_correlativos: s.correlativo_actual,
          cant_bd: s.cant_bd ?? 0,
          gaps: s.gaps ?? 0,
        });
      }
    }
    return rows;
  }, [seriesData]);

  // Filtrar series por tipo de documento seleccionado
  const seriesDisponibles = useMemo(() => {
    if (!seriesData?.branches) return [];
    const all: SerieInfo[] = [];
    for (const branch of seriesData.branches) {
      for (const s of branch.series) {
        if (s.tipo_documento === tipoDocumento) {
          all.push(s);
        }
      }
    }
    return all;
  }, [seriesData, tipoDocumento]);

  const serieSeleccionada = serie && seriesDisponibles.some(s => s.serie === serie)
    ? serie
    : seriesDisponibles[0]?.serie || null;

  // Consultar monitor detalle
  const { data: monitor, isLoading, refetch } = useQuery({
    queryKey: ['monitor-correlativos', tipoDocumento, serieSeleccionada, desde, hasta],
    queryFn: () => integracionService.getMonitorCorrelativos({
      tipo_documento: tipoDocumento,
      serie: serieSeleccionada!,
      desde: desde || undefined,
      hasta: hasta || undefined,
    }),
    enabled: !!serieSeleccionada && vista === 'detalle',
  });

  const documentosFiltrados = useMemo(() => {
    if (!monitor?.documentos) return [];
    if (filtroEstado === 'todos') return monitor.documentos;
    if (filtroEstado === 'gaps') return monitor.documentos.filter(d => d.estado_sunat === 'NO_EMITIDO');
    if (filtroEstado === 'emitidos') return monitor.documentos.filter(d => d.estado_sunat !== 'NO_EMITIDO');
    return monitor.documentos.filter(d => d.estado_sunat === filtroEstado);
  }, [monitor, filtroEstado]);

  const integridad = monitor ? parseFloat(monitor.integridad) : 100;
  const integridadColor = integridad >= 95 ? '#52c41a' : integridad >= 80 ? '#faad14' : '#ff4d4f';

  // Columnas tabla resumen (estilo SAP)
  const resumenColumns: ColumnsType<ResumenSerie> = [
    {
      title: 'Tipo de Documento',
      dataIndex: 'tipo_documento_nombre',
      width: 180,
      render: (val: string, record) => (
        <Space size={8}>
          <Text code style={{ color: '#1677ff', fontSize: 13 }}>{val}</Text>
          {record.gaps > 0 && (
            <Badge count={record.gaps} size="small" style={{ backgroundColor: '#ff4d4f' }} title={`${record.gaps} gap(s)`} />
          )}
        </Space>
      ),
    },
    {
      title: 'Serie',
      dataIndex: 'serie',
      width: 90,
      align: 'center',
      render: (val: string, record) => (
        <Space size={4}>
          <Text code>{val}</Text>
          <Tag color={record.tipo_uso === 'api' ? 'geekblue' : 'cyan'} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
            {record.tipo_uso.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'N. Doc. Inicial',
      dataIndex: 'doc_inicial',
      width: 130,
      align: 'center',
      render: (val: number, record) => (
        <Text>{record.serie}-{String(val).padStart(6, '0')}</Text>
      ),
    },
    {
      title: 'N. Doc. Final',
      dataIndex: 'doc_final',
      width: 130,
      align: 'center',
      render: (val: number, record) => (
        <Text strong>{record.serie}-{String(val).padStart(6, '0')}</Text>
      ),
    },
    {
      title: 'Cant. Corr.',
      dataIndex: 'cant_correlativos',
      width: 100,
      align: 'center',
      render: (val: number) => <Text>{val}</Text>,
    },
    {
      title: 'Cant. BD',
      dataIndex: 'cant_bd',
      width: 90,
      align: 'center',
      render: (val: number) => <Text>{val}</Text>,
    },
    {
      title: 'Diferencia',
      dataIndex: 'gaps',
      width: 100,
      align: 'center',
      render: (val: number) => (
        <Text strong style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>{val}</Text>
      ),
    },
    {
      title: 'Proximo',
      width: 130,
      align: 'center',
      render: (_: unknown, record) => (
        <Text type="secondary">{record.serie}-{String(record.doc_final + 1).padStart(6, '0')}</Text>
      ),
    },
    {
      title: 'Acciones',
      width: 100,
      align: 'center',
      render: (_: unknown, record) => (
        <Button
          type="link"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => {
            setTipoDocumento(record.tipo_documento);
            setSerie(record.serie);
            setDesde(null);
            setHasta(null);
            setFiltroEstado('todos');
            setVista('detalle');
          }}
        >
          Detalle
        </Button>
      ),
    },
  ];

  // Columnas tabla detalle
  const detalleColumns: ColumnsType<MonitorDocumento> = [
    {
      title: '#',
      dataIndex: 'correlativo',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (val: number, record) => (
        <Text strong={record.estado_sunat !== 'NO_EMITIDO'} type={record.estado_sunat === 'NO_EMITIDO' ? 'secondary' : undefined}>
          {val}
        </Text>
      ),
    },
    {
      title: 'Documento SUNAT',
      dataIndex: 'numero_completo',
      width: 150,
      fixed: 'left',
      render: (val: string, record) => (
        record.estado_sunat === 'NO_EMITIDO'
          ? <Text type="secondary" italic>{val}</Text>
          : <Text copyable={{ text: val }} strong>{val}</Text>
      ),
    },
    {
      title: 'Match',
      width: 50,
      align: 'center',
      render: (_: unknown, record) => {
        if (record.estado_sunat === 'NO_EMITIDO') return <Tag color="red">GAP</Tag>;
        if (record.referencia_interna) return <Tooltip title="Referencia vinculada"><SwapOutlined style={{ color: '#52c41a', fontSize: 16 }} /></Tooltip>;
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Ref. Sistema Tercero',
      dataIndex: 'referencia_interna',
      width: 180,
      render: (val: string | null, record) => {
        if (record.estado_sunat === 'NO_EMITIDO') return <Text type="secondary" italic>Sin emitir</Text>;
        if (!val) return <Text type="secondary">Sin referencia</Text>;
        return (
          <Tooltip title={`${val} = ${record.numero_completo}`}>
            <Tag color="blue" style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Cliente',
      width: 220,
      render: (_: unknown, record) => {
        if (!record.cliente) return <Text type="secondary">-</Text>;
        const tipoLabel = record.cliente.tipo_documento === '6' ? 'RUC' : record.cliente.tipo_documento === '1' ? 'DNI' : 'DOC';
        return (
          <div>
            <div style={{ fontSize: 13, lineHeight: '18px' }}>{record.cliente.razon_social}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{tipoLabel}: {record.cliente.numero_documento}</Text>
          </div>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado_sunat',
      width: 130,
      align: 'center',
      render: (val: string) => (
        <Tag icon={estadoIcon(val)} color={estadoColor(val)}>
          {val === 'NO_EMITIDO' ? 'NO EMITIDO' : val}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      width: 110,
      align: 'right',
      render: (val: number | null, record) => {
        if (val === null) return <Text type="secondary">-</Text>;
        return <Text>{record.moneda === 'USD' ? 'US$ ' : 'S/ '}{val.toFixed(2)}</Text>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_emision',
      width: 100,
      render: (val: string | null) => {
        if (!val) return <Text type="secondary">-</Text>;
        return new Date(val).toLocaleDateString('es-PE');
      },
    },
    {
      title: 'Origen',
      dataIndex: 'origen',
      width: 70,
      align: 'center',
      render: (val: string | null) => {
        if (!val) return <Text type="secondary">-</Text>;
        return <Tag color={val === 'api' ? 'geekblue' : 'cyan'}>{val.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Monitor de Correlativos"
        subtitle="Auditoria y reconciliacion de correlativos emitidos"
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            value={vista}
            onChange={(val) => setVista(val as 'resumen' | 'detalle')}
            options={[
              { value: 'resumen', label: 'Resumen por Serie', icon: <BarChartOutlined /> },
              { value: 'detalle', label: 'Detalle por Correlativo', icon: <UnorderedListOutlined /> },
            ]}
          />

          {vista === 'detalle' && (
            <Space wrap size="middle">
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Tipo doc.</div>
                <Select
                  value={tipoDocumento}
                  onChange={(val) => { setTipoDocumento(val); setSerie(null); setFiltroEstado('todos'); }}
                  options={TIPO_DOC_OPTIONS}
                  style={{ width: 160 }}
                  size="small"
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Serie</div>
                <Select
                  value={serieSeleccionada}
                  onChange={setSerie}
                  placeholder="Serie"
                  style={{ width: 120 }}
                  size="small"
                  options={seriesDisponibles.map(s => ({
                    value: s.serie,
                    label: `${s.serie} (${s.tipo_uso})`,
                  }))}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Desde</div>
                <InputNumber value={desde} onChange={setDesde} placeholder="1" min={1} style={{ width: 80 }} size="small" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Hasta</div>
                <InputNumber value={hasta} onChange={setHasta} placeholder="Ult." min={1} style={{ width: 80 }} size="small" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Filtrar</div>
                <Select
                  value={filtroEstado}
                  onChange={setFiltroEstado}
                  style={{ width: 130 }}
                  size="small"
                  options={[
                    { value: 'todos', label: 'Todos' },
                    { value: 'emitidos', label: 'Emitidos' },
                    { value: 'gaps', label: 'Solo Gaps' },
                    { value: 'ACEPTADO', label: 'Aceptados' },
                    { value: 'RECHAZADO', label: 'Rechazados' },
                    { value: 'PENDIENTE', label: 'Pendientes' },
                  ]}
                />
              </div>
              <div style={{ paddingTop: 14 }}>
                <Button icon={<SyncOutlined />} type="primary" size="small" onClick={() => refetch()} loading={isLoading}>
                  Actualizar
                </Button>
              </div>
            </Space>
          )}
        </div>
      </Card>

      {/* === VISTA RESUMEN === */}
      {vista === 'resumen' && (
        <Card
          size="small"
          title={<Text strong>Resumen de correlativos por serie</Text>}
          extra={<Text type="secondary" style={{ fontSize: 12 }}>Click en "Detalle" para ver cada correlativo</Text>}
        >
          <Table
            columns={resumenColumns}
            dataSource={resumenSeries}
            rowKey={(r) => `${r.tipo_documento}-${r.serie}`}
            loading={loadingSeries}
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* === VISTA DETALLE === */}
      {vista === 'detalle' && (
        <>
          {monitor && (
            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <Statistic title="Counter" value={monitor.correlativo_actual} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <Statistic title="Emitidos" value={monitor.total_emitidos} suffix={`/ ${monitor.total_en_rango}`} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <Statistic
                    title="Gaps"
                    value={monitor.total_gaps}
                    valueStyle={{ fontSize: 20, color: monitor.total_gaps > 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Integridad</div>
                  <Progress percent={integridad} strokeColor={integridadColor} format={(p) => `${p}%`} size="small" />
                </Card>
              </Col>
              <Col span={7}>
                <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                    Serie <Text code>{monitor.serie}</Text> &middot; {monitor.tipo_documento_nombre}
                  </div>
                  <Text>Rango: <Text strong>{monitor.rango_consultado.desde}</Text> al <Text strong>{monitor.rango_consultado.hasta}</Text></Text>
                  {monitor.total_gaps > 0 && (
                    <div style={{ marginTop: 2 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Gaps: {monitor.gaps.slice(0, 10).join(', ')}{monitor.gaps.length > 10 ? ` (+${monitor.gaps.length - 10} mas)` : ''}
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )}

          {monitor && monitor.total_gaps > 0 && filtroEstado === 'todos' && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`${monitor.total_gaps} correlativo(s) sin emitir detectados`}
              description={`Faltantes: ${monitor.gaps.join(', ')}. Estos pueden ser rellenados enviando el correlativo desde el sistema tercero.`}
            />
          )}

          <Card
            size="small"
            title={
              <Space>
                <Text strong>Ref. Sistema Tercero</Text>
                <SwapOutlined />
                <Text strong>Documento SUNAT</Text>
                {monitor && <Tag>{documentosFiltrados.length} registros</Tag>}
              </Space>
            }
          >
            <Table
              columns={detalleColumns}
              dataSource={documentosFiltrados}
              rowKey="correlativo"
              loading={isLoading}
              size="small"
              pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['25', '50', '100', '200'] }}
              scroll={{ x: 1200 }}
              rowClassName={(record) => record.estado_sunat === 'NO_EMITIDO' ? 'ant-table-row-gap' : ''}
            />
          </Card>
        </>
      )}

      <style>{`
        .ant-table-row-gap td { background: #fff2f0 !important; }
        .ant-table-row-gap:hover td { background: #ffe6e6 !important; }
      `}</style>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Select, Space, Tag, Progress, InputNumber,
  Button, Typography, Statistic, Row, Col, Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, MinusCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { integracionService } from '@/services/integracion.service';
import type { MonitorDocumento, MonitorCorrelativosData, SerieInfo } from '@/services/integracion.service';

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

export default function MonitorCorrelativosPage() {
  const [tipoDocumento, setTipoDocumento] = useState('01');
  const [serie, setSerie] = useState<string | null>(null);
  const [desde, setDesde] = useState<number | null>(null);
  const [hasta, setHasta] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Cargar series disponibles
  const { data: seriesData } = useQuery({
    queryKey: ['series-correlativos'],
    queryFn: integracionService.getSeriesCorrelativos,
  });

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

  // Auto-seleccionar primera serie cuando cambia tipo doc
  const serieSeleccionada = serie && seriesDisponibles.some(s => s.serie === serie)
    ? serie
    : seriesDisponibles[0]?.serie || null;

  // Consultar monitor
  const { data: monitor, isLoading, refetch } = useQuery({
    queryKey: ['monitor-correlativos', tipoDocumento, serieSeleccionada, desde, hasta],
    queryFn: () => integracionService.getMonitorCorrelativos({
      tipo_documento: tipoDocumento,
      serie: serieSeleccionada!,
      desde: desde || undefined,
      hasta: hasta || undefined,
    }),
    enabled: !!serieSeleccionada,
  });

  // Filtrar documentos por estado
  const documentosFiltrados = useMemo(() => {
    if (!monitor?.documentos) return [];
    if (filtroEstado === 'todos') return monitor.documentos;
    if (filtroEstado === 'gaps') return monitor.documentos.filter(d => d.estado_sunat === 'NO_EMITIDO');
    if (filtroEstado === 'emitidos') return monitor.documentos.filter(d => d.estado_sunat !== 'NO_EMITIDO');
    return monitor.documentos.filter(d => d.estado_sunat === filtroEstado);
  }, [monitor, filtroEstado]);

  const integridad = monitor ? parseFloat(monitor.integridad) : 100;
  const integridadColor = integridad >= 95 ? '#52c41a' : integridad >= 80 ? '#faad14' : '#ff4d4f';

  const columns: ColumnsType<MonitorDocumento> = [
    {
      title: 'Correlativo',
      dataIndex: 'correlativo',
      width: 100,
      align: 'center',
      render: (val: number, record) => (
        <Text strong={record.estado_sunat !== 'NO_EMITIDO'} type={record.estado_sunat === 'NO_EMITIDO' ? 'secondary' : undefined}>
          {val}
        </Text>
      ),
    },
    {
      title: 'Numero',
      dataIndex: 'numero_completo',
      width: 160,
      render: (val: string, record) => (
        record.estado_sunat === 'NO_EMITIDO'
          ? <Text type="secondary" italic>{val}</Text>
          : <Text copyable={{ text: val }}>{val}</Text>
      ),
    },
    {
      title: 'Referencia Interna',
      dataIndex: 'referencia_interna',
      width: 160,
      render: (val: string | null, record) => {
        if (record.estado_sunat === 'NO_EMITIDO') return <Tag color="red">GAP</Tag>;
        return val ? <Tag color="blue">{val}</Tag> : <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Cliente',
      width: 250,
      render: (_: unknown, record) => {
        if (!record.cliente) return record.estado_sunat === 'NO_EMITIDO' ? <Text type="secondary">-</Text> : '-';
        return (
          <div>
            <div style={{ fontSize: 13 }}>{record.cliente.razon_social}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.cliente.tipo_documento === '6' ? 'RUC' : record.cliente.tipo_documento === '1' ? 'DNI' : 'Doc'}: {record.cliente.numero_documento}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Estado SUNAT',
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
        return (
          <Text>{record.moneda === 'USD' ? 'US$ ' : 'S/ '}{val.toFixed(2)}</Text>
        );
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_emision',
      width: 110,
      render: (val: string | null) => {
        if (!val) return <Text type="secondary">-</Text>;
        return new Date(val).toLocaleDateString('es-PE');
      },
    },
    {
      title: 'Origen',
      dataIndex: 'origen',
      width: 80,
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
        subtitle="Auditoria y reconciliacion de correlativos por serie"
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Tipo documento</div>
            <Select
              value={tipoDocumento}
              onChange={(val) => { setTipoDocumento(val); setSerie(null); setFiltroEstado('todos'); }}
              options={TIPO_DOC_OPTIONS}
              style={{ width: 180 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Serie</div>
            <Select
              value={serieSeleccionada}
              onChange={setSerie}
              placeholder="Seleccionar serie"
              style={{ width: 120 }}
              options={seriesDisponibles.map(s => ({
                value: s.serie,
                label: `${s.serie} (${s.tipo_uso})`,
              }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Desde</div>
            <InputNumber
              value={desde}
              onChange={(val) => setDesde(val)}
              placeholder="1"
              min={1}
              style={{ width: 100 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Hasta</div>
            <InputNumber
              value={hasta}
              onChange={(val) => setHasta(val)}
              placeholder="Ultimo"
              min={1}
              style={{ width: 100 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Filtrar</div>
            <Select
              value={filtroEstado}
              onChange={setFiltroEstado}
              style={{ width: 140 }}
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
          <div style={{ paddingTop: 18 }}>
            <Button icon={<SearchOutlined />} type="primary" onClick={() => refetch()} loading={isLoading}>
              Consultar
            </Button>
          </div>
        </Space>
      </Card>

      {monitor && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card size="small">
              <Statistic title="Counter actual" value={monitor.correlativo_actual} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title="Emitidos" value={monitor.total_emitidos} suffix={`/ ${monitor.total_en_rango}`} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="Gaps"
                value={monitor.total_gaps}
                valueStyle={{ color: monitor.total_gaps > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card size="small">
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Integridad</div>
              <Progress
                percent={integridad}
                strokeColor={integridadColor}
                format={(p) => `${p}%`}
                size="small"
              />
            </Card>
          </Col>
          <Col span={7}>
            <Card size="small">
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Rango consultado</div>
              <Text strong>{monitor.rango_consultado.desde}</Text>
              <Text type="secondary"> al </Text>
              <Text strong>{monitor.rango_consultado.hasta}</Text>
              {monitor.total_gaps > 0 && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Gaps: {monitor.gaps.slice(0, 10).join(', ')}{monitor.gaps.length > 10 ? ` (+${monitor.gaps.length - 10} mas)` : ''}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {monitor?.total_gaps > 0 && filtroEstado === 'todos' && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Se detectaron ${monitor.total_gaps} correlativo(s) sin emitir en el rango consultado`}
          description={`Correlativos faltantes: ${monitor.gaps.join(', ')}. El sistema tercero puede rellenar estos gaps enviando los documentos con el correlativo correspondiente.`}
        />
      )}

      <Card
        size="small"
        title={
          <Space>
            <Text strong>Detalle de correlativos</Text>
            {monitor && <Tag>{documentosFiltrados.length} registros</Tag>}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={documentosFiltrados}
          rowKey="correlativo"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['25', '50', '100', '200'] }}
          scroll={{ x: 1100 }}
          rowClassName={(record) => record.estado_sunat === 'NO_EMITIDO' ? 'ant-table-row-gap' : ''}
        />
      </Card>

      <style>{`
        .ant-table-row-gap td { background: #fff2f0 !important; }
        .ant-table-row-gap:hover td { background: #ffe6e6 !important; }
      `}</style>
    </div>
  );
}

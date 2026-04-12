import { useState } from 'react';
import { Card, Table, Tag, Space, Button, Row, Col, Statistic, message, Tabs, DatePicker, Select, Descriptions, Alert as AntAlert } from 'antd';
import { SyncOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import DateCell from '@/components/common/DateCell';
import { plazoAlertService, type PlazoAlert } from '@/services/plazo-alert.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { formatDate } from '@/utils/format';

const URGENCIA_COLORS: Record<string, string> = {
  vencido: 'red',
  urgente: 'orange',
  proximo: 'gold',
  normal: 'green',
};

const TIPO_DOC_OPTIONS = [
  { value: '01', label: '01 - Factura' },
  { value: '03', label: '03 - Boleta' },
  { value: '07', label: '07 - Nota de Credito' },
  { value: '08', label: '08 - Nota de Debito' },
  { value: '09', label: '09 - Guia de Remision' },
];

function AlertasActivasTab() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const qc = useQueryClient();

  const { data: alertas, isLoading } = useQuery({
    queryKey: ['plazo-alerts', companyId],
    queryFn: () => plazoAlertService.getAll({ company_id: companyId ?? undefined }),
    enabled: !!companyId,
  });

  const { data: resumen } = useQuery({
    queryKey: ['plazo-alerts-resumen', companyId],
    queryFn: () => plazoAlertService.getResumen({ company_id: companyId ?? undefined }),
    enabled: !!companyId,
  });

  const verificarMut = useMutation({
    mutationFn: () => plazoAlertService.verificarAhora(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plazo-alerts'] }); message.success('Verificacion completada'); },
  });

  const marcarMut = useMutation({
    mutationFn: (id: number) => plazoAlertService.marcarEnviada(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plazo-alerts'] }),
  });

  const columns: ColumnsType<PlazoAlert> = [
    { title: 'Documento', dataIndex: 'numero_completo', width: 160, render: (t: string) => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: 'Tipo', dataIndex: 'tipo_nombre', width: 120 },
    { title: 'F. Emision', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'F. Limite', dataIndex: 'fecha_limite', width: 110, render: (d: string) => <DateCell value={d} /> },
    {
      title: 'Dias', dataIndex: 'dias_restantes', width: 70, align: 'center',
      render: (d: number) => <span style={{ fontWeight: 600, color: d <= 0 ? '#ff4d4f' : d <= 3 ? '#faad14' : '#52c41a' }}>{d}</span>,
    },
    {
      title: 'Urgencia', dataIndex: 'nivel_urgencia', width: 100,
      render: (n: string) => <Tag color={URGENCIA_COLORS[n] || 'default'}>{n.toUpperCase()}</Tag>,
    },
    {
      title: '', width: 80,
      render: (_, record) => !record.enviada && (
        <Button size="small" icon={<CheckOutlined />} onClick={() => marcarMut.mutate(record.id)}>OK</Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ textAlign: 'right' }}>
        <Button icon={<SyncOutlined />} loading={verificarMut.isPending} onClick={() => verificarMut.mutate()}>Verificar Ahora</Button>
      </div>
      {resumen && (
        <Row gutter={16}>
          <Col xs={12} md={6}><Card><Statistic title="Total Pendientes" value={resumen.total_pendientes} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Vencidos" value={resumen.vencidos} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Urgentes" value={resumen.urgentes} valueStyle={{ color: '#faad14' }} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Proximos" value={resumen.proximos} valueStyle={{ color: '#d4b106' }} /></Card></Col>
        </Row>
      )}
      <Card>
        <Table columns={columns} dataSource={alertas} rowKey={(r) => `${r.tipo_documento}-${r.numero_completo}`} loading={isLoading} size="small" pagination={{ pageSize: 20 }}
          rowClassName={(record) => record.nivel_urgencia === 'vencido' ? 'ant-table-row-danger' : ''} />
      </Card>
    </Space>
  );
}

function PlazosSunatTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['plazos-sunat'],
    queryFn: () => plazoAlertService.getPlazosSunat(),
  });

  const tableData = data?.plazos
    ? Object.entries(data.plazos).map(([codigo, info]) => ({ codigo, nombre: info.nombre, plazo_dias: info.plazo_dias }))
    : [];

  const columns: ColumnsType<{ codigo: string; nombre: string; plazo_dias: number }> = [
    { title: 'Codigo', dataIndex: 'codigo', width: 100, render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Documento', dataIndex: 'nombre' },
    { title: 'Plazo (dias)', dataIndex: 'plazo_dias', width: 120, align: 'center', render: (d: number) => <span style={{ fontWeight: 600 }}>{d}</span> },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Table columns={columns} dataSource={tableData} rowKey="codigo" loading={isLoading} pagination={false} size="small" />
      </Card>
      {data?.referencia_legal && (
        <AntAlert message="Referencia Legal" description={data.referencia_legal} type="info" showIcon />
      )}
      {data?.nota && (
        <AntAlert message="Nota" description={data.nota} type="warning" showIcon />
      )}
    </Space>
  );
}

function VerificarPlazoTab() {
  const [tipoDocumento, setTipoDocumento] = useState<string>('01');
  const [fechaEmision, setFechaEmision] = useState<Dayjs | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null);

  const verificarMut = useMutation({
    mutationFn: ({ tipo, fecha }: { tipo: string; fecha: string }) =>
      plazoAlertService.verificarPlazo(tipo, fecha),
    onSuccess: (data) => setResultado(data),
    onError: () => message.error('Error al verificar plazo'),
  });

  const handleVerificar = () => {
    if (!fechaEmision) {
      message.warning('Seleccione una fecha de emision');
      return;
    }
    verificarMut.mutate({ tipo: tipoDocumento, fecha: fechaEmision.format('YYYY-MM-DD') });
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'vencido') return 'red';
    if (estado === 'urgente') return 'orange';
    if (estado === 'proximo') return 'gold';
    return 'green';
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Space size="middle" wrap>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Tipo de Documento</div>
            <Select
              value={tipoDocumento}
              onChange={setTipoDocumento}
              options={TIPO_DOC_OPTIONS}
              style={{ width: 250 }}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Fecha de Emision</div>
            <DatePicker
              value={fechaEmision}
              onChange={setFechaEmision}
              format="DD/MM/YYYY"
              style={{ width: 200 }}
            />
          </div>
          <div style={{ paddingTop: 22 }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleVerificar} loading={verificarMut.isPending}>
              Verificar
            </Button>
          </div>
        </Space>
      </Card>

      {resultado && (
        <Card title="Resultado de Verificacion">
          <Descriptions bordered column={1} size="small">
            {resultado.fecha_vencimiento && (
              <Descriptions.Item label="Fecha de Vencimiento">{formatDate(resultado.fecha_vencimiento)}</Descriptions.Item>
            )}
            {resultado.dias_faltantes !== undefined && (
              <Descriptions.Item label="Dias Faltantes">
                <span style={{ fontWeight: 600, fontSize: 16, color: resultado.dias_faltantes <= 0 ? '#ff4d4f' : resultado.dias_faltantes <= 3 ? '#faad14' : '#52c41a' }}>
                  {resultado.dias_faltantes}
                </span>
              </Descriptions.Item>
            )}
            {resultado.estado && (
              <Descriptions.Item label="Estado">
                <Tag color={getEstadoColor(resultado.estado)}>{resultado.estado.toUpperCase()}</Tag>
              </Descriptions.Item>
            )}
            {resultado.plazo_dias !== undefined && (
              <Descriptions.Item label="Plazo (dias)">{resultado.plazo_dias}</Descriptions.Item>
            )}
            {resultado.tipo_nombre && (
              <Descriptions.Item label="Tipo de Documento">{resultado.tipo_nombre}</Descriptions.Item>
            )}
            {resultado.mensaje && (
              <Descriptions.Item label="Mensaje">{resultado.mensaje}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </Space>
  );
}

export default function PlazoAlertPage() {
  return (
    <div>
      <PageHeader
        title="Alertas de Plazo"
        subtitle="Control de vencimientos SUNAT"
      />
      <Tabs
        defaultActiveKey="activas"
        items={[
          { key: 'activas', label: 'Alertas Activas', children: <AlertasActivasTab /> },
          { key: 'plazos', label: 'Plazos SUNAT', children: <PlazosSunatTab /> },
          { key: 'verificar', label: 'Verificar Plazo', children: <VerificarPlazoTab /> },
        ]}
      />
    </div>
  );
}

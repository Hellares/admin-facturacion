import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Input, Tooltip, Tag, Segmented, Row, Col, message } from 'antd';
import { EyeOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import OrigenTag from '@/components/common/OrigenTag';
import { useDispatchGuides } from './hooks/useDispatchGuides';
import { useTableFilters } from '@/hooks/useTableFilters';
import { dispatchGuideService } from '@/services/dispatch-guide.service';
import { showApiError } from '@/lib/api-error';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { DispatchGuide, EstadoUI } from '@/types/dispatch-guide.types';
import type { SunatStatus } from '@/types/common.types';
import { useMemo, useState } from 'react';

export default function DispatchGuideListPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branches = useCompanyContextStore((s) => s.branches);

  const [estadoFilter, setEstadoFilter] = useState<EstadoUI>('todos');
  const [clienteDocumento, setClienteDocumento] = useState('');
  const [clienteRazonSocial, setClienteRazonSocial] = useState('');
  const [numeroFilter, setNumeroFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState<string | undefined>();
  const [pdfTarget, setPdfTarget] = useState<DispatchGuide | null>(null);
  const [exporting, setExporting] = useState(false);

  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of branches) {
      for (const s of b.series_guia_remision ?? []) set.add(s);
    }
    return Array.from(set).sort().map((s) => ({ value: s, label: s }));
  }, [branches]);

  const params = {
    ...getQueryParams(),
    estado_ui: estadoFilter === 'todos' ? undefined : estadoFilter,
    cliente_documento: clienteDocumento || undefined,
    cliente_razon_social: clienteRazonSocial || undefined,
    numero: numeroFilter || undefined,
    serie: serieFilter,
  };
  const { data, isLoading, refetch } = useDispatchGuides(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      await dispatchGuideService.exportToExcel(params);
      message.success('Reporte descargado correctamente');
    } catch (err) {
      showApiError(err, 'Error al exportar reporte');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setEstadoFilter('todos');
    setClienteDocumento('');
    setClienteRazonSocial('');
    setNumeroFilter('');
    setSerieFilter(undefined);
    setDateRange([null, null]);
  };

  const columns: ColumnsType<DispatchGuide> = [
    { title: 'Numero', dataIndex: 'numero_completo', width: 110, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha Emision', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Fecha Traslado', dataIndex: 'fecha_traslado', width: 120, render: (d: string) => <DateCell value={d} /> },
    {
      title: 'Modalidad', dataIndex: 'mod_traslado', width: 110,
      render: (m: string) => <Tag color={m === '01' ? 'blue' : 'green'}>{m === '01' ? 'Publico' : 'Privado'}</Tag>,
    },
    { title: 'Destinatario', key: 'dest', ellipsis: true, render: (_, r) => r.destinatario?.razon_social },
    { title: 'Peso (kg)', dataIndex: 'peso_total', width: 90, align: 'right' },
    { title: 'Origen', dataIndex: 'origen', width: 70, responsive: ['md'], render: (origen: 'web' | 'api' | undefined) => <OrigenTag origen={origen} /> },
    { title: 'Estado', dataIndex: 'estado_sunat', width: 110, render: (s: SunatStatus, record: DispatchGuide) => <SunatStatusBadge status={s} sunatInfo={record.respuesta_sunat} /> },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      onCell: () => ({ onClick: (e) => e.stopPropagation() }),
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/dispatch-guides/${record.id}`)}>Ver</Button>
          <DocumentActions
            documentType="dispatch-guides"
            documentId={record.id}
            documentNumber={record.numero_completo}
            status={record.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfTarget(record)}
            compact
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Guias de Remision" subtitle="Gestion de guias de remision" onAdd={() => navigate('/dispatch-guides/new')} addLabel="Nueva Guia" />
      <Card
        title={
          <Space size="middle" wrap>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Guias de Remision Emitidas</span>
            <Segmented
              value={estadoFilter}
              onChange={(v) => setEstadoFilter(v as EstadoUI)}
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'En proceso', value: 'proceso' },
                { label: 'Validado', value: 'validado' },
                { label: 'Error', value: 'error' },
              ]}
            />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Limpiar filtros">
              <Button icon={<ReloadOutlined />} onClick={handleReset} />
            </Tooltip>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              Descargar Reporte
            </Button>
          </Space>
        }
        styles={{ header: { background: '#e6f4ff', borderBottom: '1px solid #91caff' } }}
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="RUC / DNI del destinatario" value={clienteDocumento} onChange={(e) => setClienteDocumento(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="Razon social del destinatario" value={clienteRazonSocial} onChange={(e) => setClienteRazonSocial(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="N° de guia" value={numeroFilter} onChange={(e) => setNumeroFilter(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={selectedCompanyId ? '' : 'Selecciona una empresa primero'}>
              <div>
                <Input
                  placeholder="Serie"
                  value={serieFilter}
                  onChange={(e) => setSerieFilter(e.target.value || undefined)}
                  list="guia-series-list"
                  allowClear
                  disabled={!selectedCompanyId}
                />
                <datalist id="guia-series-list">
                  {seriesOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </datalist>
              </div>
            </Tooltip>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: perPage,
            total: data?.pagination?.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (t) => `${t} guias`,
          }}
          onRow={(record) => ({
            onClick: () => setPdfTarget(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <DocumentPdfViewer
        documentType="dispatch-guides"
        documentId={pdfTarget?.id ?? null}
        documentNumber={pdfTarget?.numero_completo ?? ''}
        estadoSunat={pdfTarget?.estado_sunat}
        sunatInfo={pdfTarget?.respuesta_sunat}
        open={!!pdfTarget}
        onClose={() => setPdfTarget(null)}
      />
    </div>
  );
}

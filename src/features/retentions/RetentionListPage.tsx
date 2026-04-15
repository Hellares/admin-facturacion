import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Input, InputNumber, Tooltip, Segmented, Row, Col, message } from 'antd';
import { EyeOutlined, FileExcelOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import { useRetentions } from './hooks/useRetentions';
import { useTableFilters } from '@/hooks/useTableFilters';
import { retentionService } from '@/services/retention.service';
import { showApiError } from '@/lib/api-error';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { Retention, EstadoUI } from '@/types/retention.types';
import type { SunatStatus } from '@/types/common.types';

export default function RetentionListPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branches = useCompanyContextStore((s) => s.branches);

  const [estadoFilter, setEstadoFilter] = useState<EstadoUI>('todos');
  const [provDocumento, setProvDocumento] = useState('');
  const [provRazonSocial, setProvRazonSocial] = useState('');
  const [numeroFilter, setNumeroFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState<string | undefined>();
  const [montoDesde, setMontoDesde] = useState<number | null>(null);
  const [montoHasta, setMontoHasta] = useState<number | null>(null);
  const [pdfTarget, setPdfTarget] = useState<Retention | null>(null);
  const [exporting, setExporting] = useState(false);

  // Retenciones no tienen series predefinidas en el tipo Branch,
  // pero el backend puede exponerlas como series_retencion. Lookup con cast a unknown.
  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of branches) {
      const anyBranch = b as unknown as Record<string, unknown>;
      const serieList = (anyBranch['series_retencion'] as string[] | undefined) ?? [];
      for (const s of serieList) set.add(s);
    }
    return Array.from(set).sort().map((s) => ({ value: s, label: s }));
  }, [branches]);

  const params = {
    ...getQueryParams(),
    estado_ui: estadoFilter === 'todos' ? undefined : estadoFilter,
    cliente_documento: provDocumento || undefined,
    cliente_razon_social: provRazonSocial || undefined,
    numero: numeroFilter || undefined,
    serie: serieFilter,
    monto_desde: montoDesde ?? undefined,
    monto_hasta: montoHasta ?? undefined,
  };
  const { data, isLoading, refetch } = useRetentions(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      await retentionService.exportToExcel(params);
      message.success('Reporte descargado correctamente');
    } catch (err) {
      showApiError(err, 'Error al exportar reporte');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setEstadoFilter('todos');
    setProvDocumento('');
    setProvRazonSocial('');
    setNumeroFilter('');
    setSerieFilter(undefined);
    setMontoDesde(null);
    setMontoHasta(null);
    setDateRange([null, null]);
  };

  const columns: ColumnsType<Retention> = [
    { title: 'Numero', dataIndex: 'numero_completo', width: 110, render: (t: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{t}</span> },
    { title: 'Fecha', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Proveedor', key: 'prov', ellipsis: true, render: (_, r) => r.proveedor?.razon_social },
    { title: 'Regimen', dataIndex: 'regimen', width: 80 },
    { title: 'Tasa', dataIndex: 'tasa', width: 70, render: (t: number) => `${t}%` },
    { title: 'Retenido', dataIndex: 'imp_retenido', width: 120, align: 'right', render: (m: number) => <MoneyDisplay amount={m} strong /> },
    { title: 'Estado', dataIndex: 'estado_sunat', width: 110, render: (s: SunatStatus, record: Retention) => <SunatStatusBadge status={s} sunatInfo={record.respuesta_sunat} /> },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      onCell: () => ({ onClick: (e) => e.stopPropagation() }),
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/retentions/${record.id}`)}>Ver</Button>
          <DocumentActions
            documentType="retentions"
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
      <PageHeader title="Retenciones" subtitle="Comprobantes de retencion" onAdd={() => navigate('/retentions/new')} addLabel="Nueva Retencion" />
      <Card
        title={
          <Space size="middle" wrap>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Retenciones Emitidas</span>
            <Segmented
              value={estadoFilter}
              onChange={(v) => setEstadoFilter(v as EstadoUI)}
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'Pendiente', value: 'pendiente' },
                { label: 'En cola', value: 'en_cola' },
                { label: 'Validado', value: 'validado' },
                { label: 'Rechazado', value: 'rechazado' },
                { label: 'Error', value: 'error' },
              ]}
            />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Refrescar datos">
              <Button icon={<SyncOutlined spin={isLoading} />} onClick={() => refetch()} />
            </Tooltip>
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
            <Input placeholder="RUC del proveedor" value={provDocumento} onChange={(e) => setProvDocumento(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="Razon social del proveedor" value={provRazonSocial} onChange={(e) => setProvRazonSocial(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="N° comprobante" value={numeroFilter} onChange={(e) => setNumeroFilter(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber placeholder="Retenido desde" style={{ width: '50%' }} value={montoDesde} onChange={(v) => setMontoDesde(typeof v === 'number' ? v : null)} min={0} />
              <InputNumber placeholder="Retenido hasta" style={{ width: '50%' }} value={montoHasta} onChange={(v) => setMontoHasta(typeof v === 'number' ? v : null)} min={0} />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={selectedCompanyId ? '' : 'Selecciona una empresa primero'}>
              <div>
                <Input
                  placeholder="Serie"
                  value={serieFilter}
                  onChange={(e) => setSerieFilter(e.target.value || undefined)}
                  list="ret-series-list"
                  allowClear
                  disabled={!selectedCompanyId}
                />
                <datalist id="ret-series-list">
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
          }}
          onRow={(record) => ({
            onClick: () => setPdfTarget(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <DocumentPdfViewer
        documentType="retentions"
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

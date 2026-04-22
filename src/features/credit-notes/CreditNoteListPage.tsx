import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Input, InputNumber, Tooltip, Segmented, Row, Col, message } from 'antd';
import { EyeOutlined, StopOutlined, FileExcelOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import OrigenTag from '@/components/common/OrigenTag';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import AnularDocumentoDialog, {
  type AnulableDocumento,
} from '@/features/voided-documents/components/AnularDocumentoDialog';
import { useCreditNotes } from './hooks/useCreditNotes';
import { useTableFilters } from '@/hooks/useTableFilters';
import { creditNoteService } from '@/services/credit-note.service';
import { showApiError } from '@/lib/api-error';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { CreditNote, EstadoUI } from '@/types/credit-note.types';
import type { SunatStatus, Moneda } from '@/types/common.types';
import { useMemo, useState } from 'react';

export default function CreditNoteListPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branches = useCompanyContextStore((s) => s.branches);

  const [estadoFilter, setEstadoFilter] = useState<EstadoUI>('todos');
  const [clienteDocumento, setClienteDocumento] = useState('');
  const [clienteRazonSocial, setClienteRazonSocial] = useState('');
  const [numeroFilter, setNumeroFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState<string | undefined>();
  const [montoDesde, setMontoDesde] = useState<number | null>(null);
  const [montoHasta, setMontoHasta] = useState<number | null>(null);
  const [anularTarget, setAnularTarget] = useState<AnulableDocumento | null>(null);
  const [pdfTarget, setPdfTarget] = useState<CreditNote | null>(null);
  const [exporting, setExporting] = useState(false);

  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of branches) {
      for (const s of b.series_nota_credito ?? []) set.add(s);
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
    monto_desde: montoDesde ?? undefined,
    monto_hasta: montoHasta ?? undefined,
  };
  const { data, isLoading, refetch } = useCreditNotes(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      await creditNoteService.exportToExcel(params);
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
    setMontoDesde(null);
    setMontoHasta(null);
    setDateRange([null, null]);
  };

  const toAnulable = (nc: CreditNote): AnulableDocumento => ({
    id: nc.id,
    tipo_documento: '07',
    company_id: nc.company_id,
    branch_id: nc.branch_id,
    numero_completo: nc.numero_completo,
    serie: nc.serie,
    correlativo: nc.correlativo,
    fecha_emision: nc.fecha_emision,
    estado_sunat: nc.estado_sunat,
    cliente: nc.cliente
      ? {
          razon_social: nc.cliente.razon_social,
          tipo_documento: nc.cliente.tipo_documento,
          numero_documento: nc.cliente.numero_documento,
        }
      : undefined,
    moneda: nc.moneda,
    total: nc.totales?.total,
  });

  const columns: ColumnsType<CreditNote> = [
    { title: 'Numero', dataIndex: 'numero_completo', width: 150, render: (t: string) => <span style={{ fontSize: 12, color: '#1677ff', fontWeight: 500, whiteSpace: 'nowrap' }}>{t}</span> },
    { title: 'Fecha', dataIndex: 'fecha_emision', width: 110, render: (d: string) => <DateCell value={d} /> },
    { title: 'Doc. Afectado', dataIndex: 'num_doc_afectado', width: 160, render: (t: string) => <span style={{ fontSize: 12, color: '#1677ff' }}>{t}</span> },
    { title: 'Motivo', dataIndex: 'des_motivo', ellipsis: true },
    { title: 'Cliente', key: 'cliente', ellipsis: true, responsive: ['lg'], render: (_, r) => <span style={{ fontSize: 13 }}>{r.cliente?.razon_social}</span> },
    { title: 'Total', key: 'total', width: 120, align: 'right', render: (_: unknown, r: CreditNote) => <MoneyDisplay amount={r.totales?.total ?? 0} moneda={r.moneda as Moneda} strong fontSize={13} /> },
    { title: 'Origen', dataIndex: 'origen', width: 70, responsive: ['md'], render: (origen: 'web' | 'api' | undefined) => <OrigenTag origen={origen} /> },
    { title: 'Estado', dataIndex: 'estado_sunat', width: 110, render: (s: SunatStatus, record: CreditNote) => <SunatStatusBadge status={s} sunatInfo={record.sunat ?? record.respuesta_sunat} /> },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      onCell: () => ({ onClick: (e) => e.stopPropagation() }),
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/credit-notes/${record.id}`)}>Ver</Button>
          <DocumentActions
            documentType="credit-notes"
            documentId={record.id}
            documentNumber={record.numero_completo}
            status={record.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfTarget(record)}
            compact
          />
          {record.estado_sunat === 'ACEPTADO' && !record.anulado && (
            <Tooltip title="Anular nota de credito">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => setAnularTarget(toAnulable(record))}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Notas de Credito" subtitle="Gestion de notas de credito" onAdd={() => navigate('/credit-notes/new')} addLabel="Nueva NC" />
      <Card
        title={
          <Space size="middle" wrap>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Notas de Credito Emitidas</span>
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
                { label: 'Dado de baja', value: 'baja' },
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
            <Input
              placeholder="RUC / DNI del cliente"
              value={clienteDocumento}
              onChange={(e) => setClienteDocumento(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Razon social del cliente"
              value={clienteRazonSocial}
              onChange={(e) => setClienteRazonSocial(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="N° de comprobante"
              value={numeroFilter}
              onChange={(e) => setNumeroFilter(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                placeholder="Monto desde"
                style={{ width: '50%' }}
                value={montoDesde}
                onChange={(v) => setMontoDesde(typeof v === 'number' ? v : null)}
                min={0}
              />
              <InputNumber
                placeholder="Monto hasta"
                style={{ width: '50%' }}
                value={montoHasta}
                onChange={(v) => setMontoHasta(typeof v === 'number' ? v : null)}
                min={0}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={selectedCompanyId ? '' : 'Selecciona una empresa primero'}>
              <div>
                <Input
                  placeholder="Serie"
                  value={serieFilter}
                  onChange={(e) => setSerieFilter(e.target.value || undefined)}
                  list="nc-series-list"
                  allowClear
                  disabled={!selectedCompanyId}
                />
                <datalist id="nc-series-list">
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
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: perPage,
            total: data?.pagination?.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (t) => `${t} notas`,
          }}
          onRow={(record) => ({
            onClick: () => setPdfTarget(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <AnularDocumentoDialog
        doc={anularTarget}
        open={!!anularTarget}
        onClose={() => setAnularTarget(null)}
        onSuccess={() => refetch()}
      />

      <DocumentPdfViewer
        documentType="credit-notes"
        documentId={pdfTarget?.id ?? null}
        documentNumber={pdfTarget?.numero_completo ?? ''}
        estadoSunat={pdfTarget?.estado_sunat}
        sunatInfo={pdfTarget?.sunat ?? pdfTarget?.respuesta_sunat}
        sourceDocument={pdfTarget}
        open={!!pdfTarget}
        onClose={() => setPdfTarget(null)}
      />
    </div>
  );
}

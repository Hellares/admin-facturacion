import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Input, InputNumber, Tooltip, Segmented, Row, Col, Tag, Select, message } from 'antd';
import OrigenTag from '@/components/common/OrigenTag';
import { EyeOutlined, StopOutlined, FileExcelOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import AnularDocumentoDialog, {
  type AnulableDocumento,
} from '@/features/voided-documents/components/AnularDocumentoDialog';
import { useInvoices } from './hooks/useInvoices';
import { useTableFilters } from '@/hooks/useTableFilters';
import { invoiceService } from '@/services/invoice.service';
import { showApiError } from '@/lib/api-error';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { Invoice, EstadoUI } from '@/types/invoice.types';
import type { SunatStatus, Moneda } from '@/types/common.types';
import { useMemo, useState } from 'react';

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, page, perPage, handlePageChange, getQueryParams } = useTableFilters();
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const branches = useCompanyContextStore((s) => s.branches);

  const [estadoFilter, setEstadoFilter] = useState<EstadoUI>('todos');
  const [clienteDocumento, setClienteDocumento] = useState('');
  const [clienteRazonSocial, setClienteRazonSocial] = useState('');
  const [numeroFilter, setNumeroFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState<string | undefined>();
  const [origenFilter, setOrigenFilter] = useState<'web' | 'api' | undefined>();
  const [montoDesde, setMontoDesde] = useState<number | null>(null);
  const [montoHasta, setMontoHasta] = useState<number | null>(null);
  const [anularTarget, setAnularTarget] = useState<AnulableDocumento | null>(null);
  const [pdfTarget, setPdfTarget] = useState<Invoice | null>(null);
  const [exporting, setExporting] = useState(false);

  // Todas las series de factura disponibles en las sucursales de la empresa actual
  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of branches) {
      for (const s of b.series_factura ?? []) set.add(s);
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
    origen: origenFilter,
    monto_desde: montoDesde ?? undefined,
    monto_hasta: montoHasta ?? undefined,
  };
  const { data, isLoading, refetch } = useInvoices(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      await invoiceService.exportToExcel(params);
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
    setOrigenFilter(undefined);
    setMontoDesde(null);
    setMontoHasta(null);
    setDateRange([null, null]);
  };

  /**
   * Convierte una Invoice al formato generico AnulableDocumento que el dialog espera.
   * El backend validara estado + plazo de 7 dias + ausencia de NC/ND asociadas.
   */
  const toAnulable = (inv: Invoice): AnulableDocumento => ({
    id: inv.id,
    tipo_documento: '01',
    company_id: inv.company_id,
    branch_id: inv.branch_id,
    numero_completo: inv.numero_completo,
    serie: inv.serie,
    correlativo: inv.correlativo,
    fecha_emision: inv.fecha_emision,
    estado_sunat: inv.estado_sunat,
    cliente: inv.cliente
      ? {
          razon_social: inv.cliente.razon_social,
          tipo_documento: inv.cliente.tipo_documento,
          numero_documento: inv.cliente.numero_documento,
        }
      : undefined,
    moneda: inv.moneda,
    total: inv.totales?.total,
  });

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Numero',
      dataIndex: 'numero_completo',
      key: 'numero_completo',
      width: 110,
      render: (text: string) => <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_emision',
      key: 'fecha_emision',
      width: 110,
      render: (date: string) => <DateCell value={date} />,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div>{record.cliente?.razon_social}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{record.cliente?.numero_documento}</div>
        </div>
      ),
    },
    {
      title: 'Moneda',
      dataIndex: 'moneda',
      key: 'moneda',
      width: 70,
      responsive: ['lg'],
    },
    {
      title: 'Total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_: unknown, record) => <MoneyDisplay amount={record.totales?.total ?? 0} moneda={record.moneda as Moneda} strong />,
    },
    {
      title: 'Origen',
      dataIndex: 'origen',
      key: 'origen',
      width: 70,
      responsive: ['md'],
      render: (origen: Invoice['origen']) => <OrigenTag origen={origen} />,
    },
    {
      title: 'Estado',
      dataIndex: 'estado_sunat',
      key: 'estado_sunat',
      width: 110,
      render: (status: SunatStatus, record) => record.anulado
        ? <Tag color="red">Anulado</Tag>
        : <SunatStatusBadge status={status} sunatInfo={record.sunat ?? record.respuesta_sunat} />,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 240,
      // onCell para frenar propagacion: los clicks en esta columna NO deben disparar el onRow (que abre el PDF)
      onCell: () => ({
        onClick: (e) => e.stopPropagation(),
      }),
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/invoices/${record.id}`)}>
            Ver
          </Button>
          <DocumentActions
            documentType="invoices"
            documentId={record.id}
            documentNumber={record.numero_completo}
            status={record.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfTarget(record)}
            compact
          />
          {record.estado_sunat === 'ACEPTADO' && (
            <Tooltip title="Anular factura">
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
      <PageHeader
        title="Facturas"
        subtitle="Gestion de facturas electronicas"
        onAdd={() => navigate('/invoices/new')}
        addLabel="Nueva Factura"
      />
      <Card
        /* Header del card con titulo grande y acciones */
        title={
          <Space size="middle" wrap>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Facturas Emitidas</span>
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
        {/* Grid de filtros en 2 filas */}
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
                  list="invoice-series-list"
                  allowClear
                  disabled={!selectedCompanyId}
                />
                <datalist id="invoice-series-list">
                  {seriesOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </datalist>
              </div>
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Origen: Todos"
              value={origenFilter}
              onChange={(v) => setOrigenFilter(v)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'web', label: 'Web (portal)' },
                { value: 'api', label: 'API (integracion)' },
              ]}
            />
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: perPage,
            total: data?.pagination?.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `${total} facturas`,
          }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: 'No hay facturas' }}
          // Click en cualquier parte de la fila (excepto la columna Acciones) abre el visor PDF
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
        documentType="invoices"
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

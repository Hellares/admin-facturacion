import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Button, Input, InputNumber, Tag, Tooltip, Segmented, Row, Col, message } from 'antd';
import { EyeOutlined, StopOutlined, FileExcelOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import SunatStatusBadge from '@/components/common/SunatStatusBadge';
import MoneyDisplay from '@/components/common/MoneyDisplay';
import DateCell from '@/components/common/DateCell';
import DocumentActions from '@/components/common/DocumentActions';
import DocumentPdfViewer from '@/components/common/DocumentPdfViewer';
import OrigenTag from '@/components/common/OrigenTag';
import EstadoBadge from '@/components/common/EstadoBadge';
import AnularBoletaDialog from './components/AnularBoletaDialog';
import { useBoletas } from './hooks/useBoletas';
import { useTableFilters } from '@/hooks/useTableFilters';
import { boletaService } from '@/services/boleta.service';
import { showApiError } from '@/lib/api-error';
import { useCompanyContextStore } from '@/stores/company-context.store';
import type { Boleta, EstadoUI } from '@/types/boleta.types';
import type { SunatStatus, Moneda } from '@/types/common.types';
import { useMemo, useState } from 'react';

export default function BoletaListPage() {
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
  const [anularTarget, setAnularTarget] = useState<Boleta | null>(null);
  const [pdfTarget, setPdfTarget] = useState<Boleta | null>(null);
  const [exporting, setExporting] = useState(false);

  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of branches) {
      for (const s of b.series_boleta ?? []) set.add(s);
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
  const { data, isLoading, refetch } = useBoletas(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      await boletaService.exportToExcel(params);
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

  /**
   * Una boleta es "anulable" desde la UI si no esta ya anulada ni en cola de anulacion.
   * El backend aun validara el plazo de 3 dias y otros constraints, pero mostramos el
   * boton para permitir intentos razonables.
   */
  const puedeAnular = (b: Boleta): boolean => {
    if (b.anulada_localmente) return false;
    if (b.estado_anulacion === 'pendiente_anulacion' || b.estado_anulacion === 'anulada') return false;
    return true;
  };

  const columns: ColumnsType<Boleta> = [
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
      title: 'Total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_: unknown, record) => <MoneyDisplay amount={record.totales?.total ?? 0} moneda={record.moneda as Moneda} strong />,
    },
    {
      title: 'Envio',
      dataIndex: 'metodo_envio',
      key: 'metodo_envio',
      width: 100,
      responsive: ['lg'],
      render: (method: string) => (
        <Tag color={method === 'individual' ? 'blue' : 'purple'}>
          {method === 'individual' ? 'Individual' : 'Resumen'}
        </Tag>
      ),
    },
    {
      title: 'Origen',
      dataIndex: 'origen',
      key: 'origen',
      width: 70,
      responsive: ['md'],
      render: (origen: 'web' | 'api' | undefined) => <OrigenTag origen={origen} />,
    },
    {
      title: 'Estado',
      dataIndex: 'estado_sunat',
      key: 'estado_sunat',
      width: 110,
      render: (status: SunatStatus, record) => (
        <SunatStatusBadge status={status} sunatInfo={record.sunat ?? record.respuesta_sunat} />
      ),
    },
    {
      title: 'Anulacion',
      dataIndex: 'estado_anulacion',
      key: 'estado_anulacion',
      width: 120,
      responsive: ['xl'],
      render: (estado: string) => estado !== 'sin_anular' ? <EstadoBadge estado={estado} /> : <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      // Los clicks aqui NO deben disparar el onRow que abre el visor PDF
      onCell: () => ({
        onClick: (e) => e.stopPropagation(),
      }),
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => navigate(`/boletas/${record.id}`)}>Ver</Button>
          <DocumentActions
            documentType="boletas"
            documentId={record.id}
            documentNumber={record.numero_completo}
            status={record.estado_sunat}
            onStatusChange={() => refetch()}
            onViewPdf={() => setPdfTarget(record)}
            compact
          />
          {puedeAnular(record) && (
            <Tooltip title="Anular boleta">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => setAnularTarget(record)}
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
        title="Boletas"
        subtitle="Gestion de boletas de venta"
        onAdd={() => navigate('/boletas/new')}
        addLabel="Nueva Boleta"
      />
      <Card
        title={
          <Space size="middle" wrap>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Boletas Emitidas</span>
            <Segmented
              value={estadoFilter}
              onChange={(v) => setEstadoFilter(v as EstadoUI)}
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'En proceso', value: 'proceso' },
                { label: 'Validado', value: 'validado' },
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
        {/* Grid de filtros */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="DNI / RUC del cliente"
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
                  list="boleta-series-list"
                  allowClear
                  disabled={!selectedCompanyId}
                />
                <datalist id="boleta-series-list">
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
            showTotal: (total) => `${total} boletas`,
          }}
          locale={{ emptyText: 'No hay boletas' }}
          // Click en cualquier parte de la fila (excepto la columna Acciones) abre el visor PDF
          onRow={(record) => ({
            onClick: () => setPdfTarget(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <AnularBoletaDialog
        boleta={anularTarget}
        open={!!anularTarget}
        onClose={() => setAnularTarget(null)}
        onSuccess={() => refetch()}
      />

      <DocumentPdfViewer
        documentType="boletas"
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

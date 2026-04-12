import { useState } from 'react';
import {
  Card, Tabs, Form, InputNumber, Select, Switch, Button, Row, Col,
  message, Alert, Space, Popconfirm, Modal, Spin,
} from 'antd';
import {
  SaveOutlined, ReloadOutlined, CheckCircleOutlined, ClearOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { companyConfigService, type ConfigSection } from '@/services/company-config.service';

const MOTIVO_TRASLADO_OPTIONS = [
  { value: '01', label: '01 - Venta' },
  { value: '02', label: '02 - Compra' },
  { value: '03', label: '03 - Venta con entrega a terceros' },
  { value: '04', label: '04 - Traslado entre establecimientos' },
  { value: '05', label: '05 - Consignacion' },
  { value: '06', label: '06 - Devolucion' },
  { value: '07', label: '07 - Recojo de bienes transformados' },
  { value: '08', label: '08 - Importacion' },
  { value: '09', label: '09 - Exportacion' },
  { value: '13', label: '13 - Otros' },
  { value: '14', label: '14 - Venta sujeta a confirmacion' },
  { value: '18', label: '18 - Traslado emisor itinerante' },
  { value: '19', label: '19 - Traslado zona primaria' },
];

function SectionForm({
  section,
  initialValues,
  companyId,
}: {
  section: ConfigSection;
  initialValues: Record<string, unknown>;
  companyId: number;
}) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const updateMut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      companyConfigService.updateSection(companyId, section, data),
    onSuccess: () => {
      message.success('Configuracion guardada correctamente');
      queryClient.invalidateQueries({ queryKey: ['company-config', companyId] });
    },
    onError: () => {
      message.error('Error al guardar la configuracion');
    },
  });

  const handleSave = () => {
    form.validateFields().then((values) => {
      updateMut.mutate(values);
    });
  };

  if (section === 'tax_settings') {
    return (
      <Form form={form} component="div" layout="vertical" initialValues={initialValues}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="igv_porcentaje" label="IGV (%)">
              <InputNumber min={0} max={50} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="isc_porcentaje" label="ISC (%)">
              <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="icbper_monto" label="ICBPER (S/)">
              <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="ivap_porcentaje" label="IVAP (%)">
              <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="regimen_tributario" label="Regimen Tributario">
              <Select options={[
                { value: 'general', label: 'General' },
                { value: 'mype_rht', label: 'MYPE / RHT' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="decimales_precio_unitario" label="Decimales precio">
              <InputNumber min={2} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="decimales_cantidad" label="Decimales cantidad">
              <InputNumber min={2} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="redondeo_automatico" label="Redondeo automatico" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="incluir_leyenda_monto" label="Incluir leyenda monto" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="validar_ruc_cliente" label="Validar RUC cliente" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="permitir_precio_cero" label="Permitir precio cero" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} loading={updateMut.isPending} onClick={handleSave}>
            Guardar Impuestos
          </Button>
        </div>
      </Form>
    );
  }

  if (section === 'invoice_settings') {
    return (
      <Form form={form} component="div" layout="vertical" initialValues={initialValues}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="ubl_version" label="Version UBL">
              <Select options={[
                { value: '2.0', label: '2.0' },
                { value: '2.1', label: '2.1' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="moneda_default" label="Moneda por defecto">
              <Select options={[
                { value: 'PEN', label: 'PEN - Soles' },
                { value: 'USD', label: 'USD - Dolares' },
                { value: 'EUR', label: 'EUR - Euros' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="tipo_operacion_default" label="Tipo operacion default">
              <Select
                options={[
                  { value: '0101', label: '0101 - Venta interna' },
                  { value: '0200', label: '0200 - Exportacion' },
                  { value: '0401', label: '0401 - Ventas no domiciliados' },
                ]}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="formato_numero" label="Formato numero">
              <Select
                options={[
                  { value: 'F001-#', label: 'F001-#' },
                  { value: 'F###-########', label: 'F###-########' },
                ]}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="incluir_leyendas_automaticas" label="Leyendas automaticas" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="envio_automatico" label="Envio automatico" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} loading={updateMut.isPending} onClick={handleSave}>
            Guardar Facturacion
          </Button>
        </div>
      </Form>
    );
  }

  if (section === 'gre_settings') {
    return (
      <Form form={form} component="div" layout="vertical" initialValues={initialValues}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="peso_default_kg" label="Peso default (kg)">
              <InputNumber min={0.001} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="bultos_default" label="Bultos default">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="modalidad_transporte_default" label="Modalidad transporte">
              <Select options={[
                { value: '01', label: '01 - Publico' },
                { value: '02', label: '02 - Privado' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="motivo_traslado_default" label="Motivo traslado">
              <Select options={MOTIVO_TRASLADO_OPTIONS} showSearch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="verificacion_automatica" label="Verificacion automatica" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} loading={updateMut.isPending} onClick={handleSave}>
            Guardar Guias Remision
          </Button>
        </div>
      </Form>
    );
  }

  // document_settings
  return (
    <Form form={form} component="div" layout="vertical" initialValues={initialValues}>
      <Row gutter={[24, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="generar_xml_automatico" label="Generar XML automatico" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="generar_pdf_automatico" label="Generar PDF automatico" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="enviar_sunat_automatico" label="Enviar SUNAT automatico" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="formato_pdf_default" label="Formato PDF">
            <Select options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
            ]} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="orientacion_pdf_default" label="Orientacion PDF">
            <Select options={[
              { value: 'portrait', label: 'Vertical (Portrait)' },
              { value: 'landscape', label: 'Horizontal (Landscape)' },
            ]} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="incluir_qr_pdf" label="Incluir QR en PDF" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="incluir_hash_pdf" label="Incluir Hash en PDF" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="logo_en_pdf" label="Logo en PDF" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button type="primary" icon={<SaveOutlined />} loading={updateMut.isPending} onClick={handleSave}>
          Guardar Documentos
        </Button>
      </div>
    </Form>
  );
}

export default function CompanyConfigPage() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [validateResult, setValidateResult] = useState<unknown>(null);
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['company-config', companyId],
    queryFn: () => companyConfigService.getConfig(companyId!),
    enabled: !!companyId,
  });

  const resetMut = useMutation({
    mutationFn: () => companyConfigService.resetToDefaults(companyId!),
    onSuccess: () => {
      message.success('Configuracion reseteada a valores por defecto');
      queryClient.invalidateQueries({ queryKey: ['company-config', companyId] });
    },
    onError: () => message.error('Error al resetear configuracion'),
  });

  const validateMut = useMutation({
    mutationFn: () => companyConfigService.validateServices(companyId!),
    onSuccess: (data) => {
      setValidateResult(data);
      setValidateModalOpen(true);
    },
    onError: () => message.error('Error al validar servicios'),
  });

  const cacheMut = useMutation({
    mutationFn: () => companyConfigService.clearCache(companyId!),
    onSuccess: () => message.success('Cache limpiado correctamente'),
    onError: () => message.error('Error al limpiar cache'),
  });

  if (!companyId) {
    return (
      <div>
        <PageHeader title="Configuracion de Empresa" />
        <Alert message="Seleccione una empresa para ver su configuracion" type="info" showIcon />
      </div>
    );
  }

  const sections: { key: ConfigSection; label: string }[] = [
    { key: 'tax_settings', label: 'Impuestos' },
    { key: 'invoice_settings', label: 'Facturacion' },
    { key: 'gre_settings', label: 'Guias Remision' },
    { key: 'document_settings', label: 'Documentos' },
  ];

  return (
    <div>
      <PageHeader
        title="Configuracion de Empresa"
        subtitle="Ajustes por seccion"
        extra={
          <Space>
            <Popconfirm
              title="Resetear configuracion"
              description="Se restauraran todos los valores por defecto. Esta seguro?"
              onConfirm={() => resetMut.mutate()}
              okText="Si, resetear"
              cancelText="Cancelar"
            >
              <Button icon={<ReloadOutlined />} loading={resetMut.isPending}>
                Resetear Defaults
              </Button>
            </Popconfirm>
            <Button
              icon={<CheckCircleOutlined />}
              loading={validateMut.isPending}
              onClick={() => validateMut.mutate()}
            >
              Validar Servicios
            </Button>
            <Button
              icon={<ClearOutlined />}
              loading={cacheMut.isPending}
              onClick={() => cacheMut.mutate()}
            >
              Limpiar Cache
            </Button>
          </Space>
        }
      />

      <Card loading={isLoading}>
        {config ? (
          <Tabs
            items={sections.map((s) => ({
              key: s.key,
              label: s.label,
              children: (
                <SectionForm
                  key={`${s.key}-${JSON.stringify(config[s.key] || {})}`}
                  section={s.key}
                  initialValues={(config[s.key] || {}) as Record<string, unknown>}
                  companyId={companyId}
                />
              ),
            }))}
          />
        ) : (
          !isLoading && (
            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
              No hay configuracion disponible
            </div>
          )
        )}
      </Card>

      <Modal
        title="Resultado de Validacion de Servicios"
        open={validateModalOpen}
        onCancel={() => setValidateModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setValidateModalOpen(false)}>
            Cerrar
          </Button>,
        ]}
      >
        {validateResult ? (
          <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            {JSON.stringify(validateResult, null, 2)}
          </pre>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
}

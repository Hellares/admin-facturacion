import { Card, Typography, Collapse, Tag, Alert, Space, Input, Divider } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';

const { Title, Paragraph, Text } = Typography;

/**
 * Pagina de documentacion de la API REST del sistema para desarrolladores
 * terceros que quieran integrar su sistema con este backend.
 *
 * No es un Swagger/OpenAPI completo — es una referencia concisa de los
 * endpoints mas usados con ejemplos practicos de curl.
 */
export default function ApiDocsPage() {
  const baseUrl = `${window.location.origin}/api`;

  return (
    <div>
      <PageHeader
        title="Documentacion API"
        subtitle="Guia para integrar tu sistema con la API REST"
      />

      <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 1100 }}>
        <Alert
          type="info"
          showIcon
          message="Antes de empezar"
          description={
            <>
              <Paragraph style={{ marginBottom: 8 }}>
                Necesitas un <strong>token API</strong> para autenticarte. Generalo en tu{' '}
                <a href="/settings/api-token">Mi Token API</a>.
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                Todas las peticiones deben incluir el header{' '}
                <Text code>Authorization: Bearer TU_TOKEN</Text> y{' '}
                <Text code>Accept: application/json</Text>.
              </Paragraph>
            </>
          }
        />

        <Card>
          <Title level={4}>Base URL</Title>
          <Input value={baseUrl} readOnly style={{ fontFamily: 'monospace' }} />
        </Card>

        <Card title={<Space><ApiOutlined /> Autenticacion</Space>}>
          <Paragraph>
            Todas las llamadas requieren un header de autorizacion Bearer con tu token personal.
          </Paragraph>
          <Input.TextArea
            readOnly
            autoSize
            value={`Authorization: Bearer 1|sunat_xxxxxxxxxxxxxxxxxxxxxx
Accept: application/json
Content-Type: application/json`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Card>

        <Card title="Respuestas estandar">
          <Paragraph>Todas las respuestas siguen el mismo formato:</Paragraph>
          <Divider plain>Exito (2xx)</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`{
  "success": true,
  "data": { ... },
  "message": "Operacion exitosa"
}`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <Divider plain>Error de validacion (422)</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`{
  "success": false,
  "message": "El DNI debe tener exactamente 8 digitos numericos.",
  "errors": {
    "client.numero_documento": ["El DNI debe tener exactamente 8 digitos numericos."]
  }
}`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <Divider plain>Error de permisos (403)</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`{
  "success": false,
  "message": "No esta autorizado para esta empresa.",
  "error_code": "COMPANY_ACCESS_DENIED"
}`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <Divider plain>Rechazo SUNAT (400)</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`{
  "success": false,
  "message": "SUNAT rechazo el documento: El XML no cumple con el esquema",
  "error_code": "2335",
  "timestamp": "2026-04-11T12:00:00Z"
}`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Card>

        <Card title="Endpoints principales">
          <Collapse
            defaultActiveKey={['invoices']}
            items={[
              {
                key: 'invoices',
                label: (
                  <Space>
                    <Tag color="blue">FACTURAS</Tag>
                    <Text>/v1/invoices</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/invoices', desc: 'Lista facturas con filtros (company_id, fecha_desde, fecha_hasta, estado_ui, cliente_razon_social, monto_desde, etc.)' },
                      { method: 'GET', path: '/v1/invoices/export', desc: 'Descarga reporte XLSX con los mismos filtros' },
                      { method: 'GET', path: '/v1/invoices/{id}', desc: 'Obtiene una factura por ID' },
                      { method: 'POST', path: '/v1/invoices', desc: 'Crea una nueva factura' },
                      { method: 'PUT', path: '/v1/invoices/{id}', desc: 'Actualiza una factura (solo si no enviada)' },
                      { method: 'POST', path: '/v1/invoices/{id}/send-sunat', desc: 'Envia la factura a SUNAT' },
                      { method: 'GET', path: '/v1/invoices/{id}/download-pdf', desc: 'Descarga el PDF' },
                      { method: 'GET', path: '/v1/invoices/{id}/download-xml', desc: 'Descarga el XML firmado' },
                      { method: 'GET', path: '/v1/invoices/{id}/download-cdr', desc: 'Descarga el CDR de SUNAT' },
                    ]}
                  />
                ),
              },
              {
                key: 'boletas',
                label: (
                  <Space>
                    <Tag color="cyan">BOLETAS</Tag>
                    <Text>/v1/boletas</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/boletas', desc: 'Lista boletas con filtros' },
                      { method: 'GET', path: '/v1/boletas/export', desc: 'Descarga reporte XLSX' },
                      { method: 'GET', path: '/v1/boletas/{id}', desc: 'Obtiene una boleta por ID' },
                      { method: 'POST', path: '/v1/boletas', desc: 'Crea una nueva boleta' },
                      { method: 'POST', path: '/v1/boletas/{id}/send-sunat', desc: 'Envia a SUNAT' },
                      { method: 'POST', path: '/v1/boletas/anular-oficialmente', desc: 'Crea resumen diario de anulacion' },
                      { method: 'GET', path: '/v1/boletas/{id}/download-pdf', desc: 'Descarga PDF' },
                    ]}
                  />
                ),
              },
              {
                key: 'notas',
                label: (
                  <Space>
                    <Tag color="purple">NOTAS NC/ND</Tag>
                    <Text>/v1/credit-notes, /v1/debit-notes</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/credit-notes', desc: 'Lista notas de credito' },
                      { method: 'POST', path: '/v1/credit-notes', desc: 'Crea nota de credito' },
                      { method: 'POST', path: '/v1/credit-notes/{id}/send-sunat', desc: 'Envia a SUNAT' },
                      { method: 'GET', path: '/v1/debit-notes', desc: 'Lista notas de debito' },
                      { method: 'POST', path: '/v1/debit-notes', desc: 'Crea nota de debito' },
                      { method: 'GET', path: '/v1/credit-notes/export', desc: 'Descarga XLSX NC' },
                      { method: 'GET', path: '/v1/debit-notes/export', desc: 'Descarga XLSX ND' },
                    ]}
                  />
                ),
              },
              {
                key: 'guias',
                label: (
                  <Space>
                    <Tag color="orange">GUIAS</Tag>
                    <Text>/v1/dispatch-guides</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/dispatch-guides', desc: 'Lista guias de remision' },
                      { method: 'POST', path: '/v1/dispatch-guides', desc: 'Crea guia' },
                      { method: 'POST', path: '/v1/dispatch-guides/{id}/send-sunat', desc: 'Envia a SUNAT' },
                      { method: 'GET', path: '/v1/dispatch-guides/export', desc: 'Descarga XLSX' },
                    ]}
                  />
                ),
              },
              {
                key: 'anulacion',
                label: (
                  <Space>
                    <Tag color="red">ANULACIONES</Tag>
                    <Text>/v1/voided-documents, /v1/daily-summaries</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'POST', path: '/v1/voided-documents', desc: 'Crea Comunicacion de Baja (facturas/NC/ND)' },
                      { method: 'POST', path: '/v1/voided-documents/{id}/send-sunat', desc: 'Envia la baja a SUNAT' },
                      { method: 'GET', path: '/v1/voided-documents', desc: 'Lista Comunicaciones de Baja' },
                      { method: 'POST', path: '/v1/boletas/anular-oficialmente', desc: 'Crea Resumen Diario de Anulacion (boletas)' },
                      { method: 'GET', path: '/v1/daily-summaries', desc: 'Lista resumenes diarios (emision + anulacion)' },
                    ]}
                  />
                ),
              },
              {
                key: 'lookup',
                label: (
                  <Space>
                    <Tag color="geekblue">LOOKUP</Tag>
                    <Text>DNI / RUC</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/lookup/dni/{numero}', desc: 'Consulta nombre completo por DNI (via Factiliza)' },
                      { method: 'GET', path: '/v1/lookup/ruc/{numero}', desc: 'Consulta razon social, direccion, estado por RUC' },
                    ]}
                  />
                ),
              },
              {
                key: 'integracion',
                label: (
                  <Space>
                    <Tag color="magenta">INTEGRACION</Tag>
                    <Text>Series y correlativos disponibles</Text>
                  </Space>
                ),
                children: (
                  <div>
                    <EndpointGroup
                      endpoints={[
                        { method: 'GET', path: '/v1/integracion/series-correlativos', desc: 'Lista todas las series (web y api) con sus correlativos actuales y el proximo numero' },
                        { method: 'GET', path: '/v1/integracion/proximo-numero', desc: 'Consulta el proximo numero para un tipo_documento + serie (no reserva ni incrementa)' },
                      ]}
                    />

                    <div style={{ marginTop: 16, fontSize: 13 }}>
                      <strong>Uso tipico:</strong> tu sistema externo usa este endpoint para saber cuales series tiene asignadas
                      y mostrar en su UI el proximo correlativo antes de emitir, sin tener que adivinar.
                    </div>

                    <div style={{ marginTop: 12, fontSize: 13 }}>
                      <strong>tipo_uso:</strong> cada serie devuelta incluye <code>"tipo_uso": "web"</code> o <code>"tipo_uso": "api"</code>.
                      Tu sistema externo debe usar <strong>solo</strong> las series con <code>tipo_uso: "api"</code> para evitar colisiones de correlativo con el portal.
                    </div>

                    <div style={{ marginTop: 16, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Listar series y correlativos</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`curl -H "Authorization: Bearer TU_TOKEN" \\
  https://api.syncrofact.net.pe/api/v1/integracion/series-correlativos

# Filtrar solo series API:
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/series-correlativos?tipo_uso=api"

# Filtrar por sucursal y tipo de documento:
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/series-correlativos?branch_id=1&tipo_documento=01"`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Respuesta de series-correlativos</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`{
  "success": true,
  "data": {
    "company_id": 1,
    "branches": [
      {
        "branch_id": 1,
        "codigo": "0000",
        "nombre": "Principal",
        "series": [
          {
            "serie": "F001",
            "tipo_documento": "01",
            "tipo_documento_nombre": "Factura",
            "tipo_uso": "web",
            "correlativo_actual": 13,
            "proximo_numero": "F001-000014"
          },
          {
            "serie": "F002",
            "tipo_documento": "01",
            "tipo_documento_nombre": "Factura",
            "tipo_uso": "api",
            "correlativo_actual": 0,
            "proximo_numero": "F002-000001"
          }
        ]
      }
    ]
  }
}`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Consultar proximo numero de una serie</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/proximo-numero?tipo_documento=01&serie=F002"

# Respuesta:
{
  "success": true,
  "data": {
    "branch_id": 1,
    "tipo_documento": "01",
    "serie": "F002",
    "correlativo_actual": 42,
    "proximo_correlativo": 43,
    "proximo_numero": "F002-000043"
  }
}`}</pre>
                    </div>

                    <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, fontSize: 13 }}>
                      <strong>Importante:</strong> la consulta NO reserva el numero. El correlativo se asigna y bloquea solo cuando
                      el backend recibe el POST de creacion de documento (<code>/v1/invoices</code>, <code>/v1/boletas</code>, etc.).
                      Entre una consulta y la creacion, si otro proceso emite en la misma serie, el numero devuelto puede quedar obsoleto.
                      En produccion confia en el numero que retorna la API al crear el documento, no en lo que hayas consultado antes.
                    </div>
                  </div>
                ),
              },
              {
                key: 'resiliencia',
                label: (
                  <Space>
                    <Tag color="green">RESILIENCIA</Tag>
                    <Text>Contingencia y correlativos</Text>
                  </Space>
                ),
                children: (
                  <div>
                    <EndpointGroup
                      endpoints={[
                        { method: 'GET', path: '/v1/integracion/series-correlativos', desc: 'Lista todas las series con correlativos, cant. BD y gaps' },
                        { method: 'GET', path: '/v1/integracion/proximo-numero', desc: 'Proximo correlativo para una serie (sincronizar counter del POS)' },
                        { method: 'GET', path: '/v1/integracion/monitor-correlativos', desc: 'Monitor completo: cada correlativo con referencia, cliente, estado y gaps' },
                        { method: 'GET', path: '/v1/integracion/documentos', desc: 'Busca un documento por referencia_interna' },
                        { method: 'POST', path: '/v1/integracion/batch-status', desc: 'Consulta masiva de estado por referencias internas (max 50)' },
                      ]}
                    />

                    <div style={{ marginTop: 16, fontSize: 13 }}>
                      <strong>Problema:</strong> si el sistema de facturacion cae, tu POS no puede emitir porque los correlativos
                      se generan en el servidor. Tu negocio no deberia detenerse por una caida temporal.
                    </div>

                    <div style={{ marginTop: 12, fontSize: 13 }}>
                      <strong>Solucion:</strong> tu POS puede enviar su propio <code>correlativo</code> y/o una <code>referencia_interna</code>
                      en el POST de creacion. Esto permite 3 modos de operacion:
                    </div>

                    <div style={{ marginTop: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, padding: 16, fontSize: 13 }}>
                      <div style={{ marginBottom: 8, padding: 8, background: '#d9f7be', borderRadius: 4 }}>
                        <strong>RECOMENDADO: Enviar ambos campos</strong> (<code>correlativo</code> + <code>referencia_interna</code>).
                        Esto te da control total del correlativo y proteccion contra duplicados, sin importar si cae
                        el sistema de facturacion, SUNAT, o tu propio sistema.
                      </div>
                      <div style={{ marginTop: 6 }}><strong>Modo A+C (recomendado):</strong> tu POS asigna el correlativo + envia su ID interno. Control total + idempotencia.</div>
                      <div style={{ marginTop: 4 }}><strong>Modo A:</strong> solo correlativo desde POS, sin idempotencia.</div>
                      <div style={{ marginTop: 4 }}><strong>Modo C:</strong> solo referencia interna, correlativo auto-generado.</div>
                      <div style={{ marginTop: 4 }}><strong>Auto (default):</strong> sin ambos campos, todo se auto-genera. Compatible con integraciones existentes.</div>
                    </div>

                    <div style={{ marginTop: 16, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Flujo de contingencia (sistema DOWN)</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# 1. Al iniciar el dia, sincroniza tu counter:
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/proximo-numero?tipo_documento=01&serie=F002"
# -> { "proximo_correlativo": 46 }

# 2. Tu POS guarda: siguiente_correlativo = 46

# 3. Sistema CAE - tu POS sigue vendiendo:
#    Ticket TK-983 -> correlativo 47
#    Ticket TK-984 -> correlativo 48
#    Ticket TK-985 -> correlativo 49

# 4. Sistema VUELVE - tu POS envia los documentos pendientes:
curl -X POST -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "F002",
    "correlativo": 47,
    "referencia_interna": "TK-983",
    "fecha_emision": "2026-04-18",
    ...
  }' \\
  https://api.syncrofact.net.pe/api/v1/invoices`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Crear factura con correlativo + referencia_interna</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`POST /api/v1/invoices
{
  "company_id": 1,
  "branch_id": 1,
  "serie": "F002",
  "correlativo": 47,              // Opcional: tu POS asigna el correlativo
  "referencia_interna": "TK-983", // Opcional: tu ID interno para rastreo
  "fecha_emision": "2026-04-18",
  "moneda": "PEN",
  "forma_pago_tipo": "Contado",
  "client": { ... },
  "detalles": [ ... ]
}

// Respuesta exitosa (201):
{
  "success": true,
  "data": {
    "id": 501,
    "numero_completo": "F002-000047",
    "serie": "F002",
    "correlativo": "000047",
    "referencia_interna": "TK-983",
    "estado_sunat": "EN_COLA",
    ...
  },
  "message": "Factura creada correctamente"
}

// Si hay gap en correlativo, incluye warning:
{
  "success": true,
  "data": { ... },
  "warning": "Salto de 3 correlativo(s) detectado (47-49) en serie F002"
}`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Idempotencia: reenviar sin duplicar</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# Si envias la misma referencia_interna dos veces,
# el sistema retorna el documento existente (no crea duplicado):

POST /api/v1/invoices  { "referencia_interna": "TK-983", ... }
-> 201 Created (primera vez)

POST /api/v1/invoices  { "referencia_interna": "TK-983", ... }
-> 200 OK { "idempotent": true, "data": { ... documento existente ... } }`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Consultar documentos por referencia</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# Un documento:
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/documentos?referencia_interna=TK-983&tipo_documento=01"

# Batch (hasta 50):
curl -X POST -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "tipo_documento": "01", "referencias": ["TK-983", "TK-984", "TK-985"] }' \\
  https://api.syncrofact.net.pe/api/v1/integracion/batch-status

# Respuesta batch:
{
  "success": true,
  "data": [
    { "encontrado": true, "referencia_interna": "TK-983", "numero_completo": "F002-000047", "estado_sunat": "ACEPTADO", "total": 118.00 },
    { "encontrado": true, "referencia_interna": "TK-984", "numero_completo": "F002-000048", "estado_sunat": "ACEPTADO", "total": 59.00 },
    { "encontrado": false, "referencia_interna": "TK-985" }
  ],
  "total": 3,
  "encontrados": 2
}`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Monitor de correlativos (auditoria completa)</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# Resumen de todas las series (con gaps):
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/series-correlativos"

# Respuesta incluye por cada serie:
# { serie, correlativo_actual, cant_bd, gaps, proximo_numero }

# Monitor detallado de una serie (cada correlativo con cliente y referencia):
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/monitor-correlativos?tipo_documento=01&serie=F002"

# Filtrar por rango:
curl -H "Authorization: Bearer TU_TOKEN" \\
  "https://api.syncrofact.net.pe/api/v1/integracion/monitor-correlativos?tipo_documento=01&serie=F002&desde=50&hasta=62"

# Respuesta:
{
  "success": true,
  "data": {
    "serie": "F002",
    "tipo_documento_nombre": "Factura",
    "correlativo_actual": 62,
    "total_emitidos": 62,
    "total_gaps": 0,
    "integridad": "100%",
    "gaps": [],
    "documentos": [
      {
        "correlativo": 62,
        "numero_completo": "F002-000062",
        "referencia_interna": "TK-062-F002-000062",
        "cliente": {
          "tipo_documento": "6",
          "numero_documento": "20512528458",
          "razon_social": "SISTEMA TERCERO S.A.C."
        },
        "estado_sunat": "ACEPTADO",
        "total": 295.00,
        "origen": "api"
      }
    ]
  }
}`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Rutas API completas para integracion</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# === EMISION DE DOCUMENTOS (con correlativo + referencia_interna opcionales) ===
POST /api/v1/invoices            # Crear factura
POST /api/v1/boletas             # Crear boleta
POST /api/v1/credit-notes        # Crear nota de credito
POST /api/v1/debit-notes         # Crear nota de debito
POST /api/v1/dispatch-guides     # Crear guia de remision

# === CONSULTA Y SINCRONIZACION ===
GET  /api/v1/integracion/series-correlativos       # Resumen de series con gaps
GET  /api/v1/integracion/proximo-numero            # Proximo correlativo de una serie
GET  /api/v1/integracion/monitor-correlativos      # Detalle completo por correlativo
GET  /api/v1/integracion/documentos                # Buscar por referencia_interna
POST /api/v1/integracion/batch-status              # Estado masivo por referencias

# === DESCARGA DE ARCHIVOS ===
GET  /api/v1/invoices/{id}/download-xml            # XML firmado
GET  /api/v1/invoices/{id}/download-cdr            # CDR de SUNAT
GET  /api/v1/invoices/{id}/download-pdf            # PDF del comprobante

# Todos los endpoints requieren: Authorization: Bearer TU_TOKEN`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Relleno de gaps (caso SAP IDDH)</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`# Si un correlativo fue emitido con error y se limpio en tu sistema,
# puedes reutilizarlo enviandolo nuevamente:

# Counter actual: 62. Correlativo 55 fue anulado/limpiado.
POST /api/v1/invoices  { "correlativo": 55, "referencia_interna": "TK-055-FIX", ... }
-> 201 Created (rellena el gap, counter sigue en 62)

# El sistema acepta cualquier correlativo que NO exista ya en la tabla,
# sin importar si es menor o mayor al counter actual.`}</pre>
                    </div>

                    <div style={{ marginTop: 16, padding: 12, background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4, fontSize: 13 }}>
                      <strong>Validaciones del correlativo:</strong>
                      <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                        <li>Si el correlativo ya <strong>existe en la tabla</strong>: error 422 (duplicado)</li>
                        <li>Si el correlativo esta <strong>libre</strong> (no existe): se acepta, sin importar si es mayor o menor al counter</li>
                        <li>Si hay un <strong>salto hacia adelante</strong> (gap): se acepta con warning informativo. Counter se actualiza</li>
                        <li>Si <strong>rellena un gap</strong> (menor al counter, pero libre): se acepta sin warning. Counter no cambia</li>
                        <li>Si <strong>no envias correlativo</strong>: se auto-genera como siempre (backwards compatible)</li>
                      </ul>
                    </div>

                    <div style={{ marginTop: 12, padding: 12, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4, fontSize: 13 }}>
                      <strong>Por que enviar ambos campos es la mejor opcion:</strong>
                      <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                        <li><strong>Sistema de facturacion cae:</strong> tu POS asigna correlativos localmente y reenvia cuando vuelve</li>
                        <li><strong>SUNAT cae:</strong> los documentos quedan en cola, tu sistema sabe que correlativos envio</li>
                        <li><strong>Tu propio sistema cae:</strong> al reiniciar, consulta <code>batch-status</code> para reconciliar</li>
                        <li><strong>Error de red:</strong> la idempotencia por <code>referencia_interna</code> evita duplicados al reenviar</li>
                        <li><strong>Correlativo mal emitido:</strong> se limpia en tu sistema y se reutiliza (relleno de gap)</li>
                      </ul>
                    </div>
                  </div>
                ),
              },
              {
                key: 'bancarizacion',
                label: (
                  <Space>
                    <Tag color="volcano">BANCARIZACION</Tag>
                    <Text>Ley N° 28194</Text>
                  </Space>
                ),
                children: (
                  <div>
                    <EndpointGroup
                      endpoints={[
                        { method: 'GET', path: '/v1/bancarizacion/medios-pago', desc: 'Catalogo de medios de pago aceptados (codigo, descripcion, requisitos)' },
                        { method: 'POST', path: '/v1/bancarizacion/validar', desc: 'Valida si un monto exige bancarizacion antes de emitir' },
                      ]}
                    />

                    <div style={{ marginTop: 16, padding: 12, background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 4, fontSize: 13 }}>
                      <strong>Cuando aplica:</strong> operaciones con total <strong>{'>='} S/ 2,000 PEN</strong> o <strong>{'>='} US$ 500 USD</strong> requieren
                      datos del medio de pago bancario para ser gasto deducible y otorgar credito fiscal IGV.
                      Syncrofact valida automaticamente en cada POST de factura/boleta.
                    </div>

                    <div style={{ marginTop: 16, fontSize: 13 }}>
                      <strong>Formato recomendado</strong> (<code>medios_pago</code> en el body del POST, soporta multiples medios):
                    </div>

                    <div style={{ marginTop: 8, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`{
  "medios_pago": [
    {
      "tipo": "BANCA_WEB",
      "entidad_financiera": "BCP",
      "referencia": "OP-20260415-0001",
      "fecha_operacion": "2026-04-15",
      "monto": 2832.00
    }
  ],
  "company_id": 1, "branch_id": 1, "serie": "F002",
  ...
}`}</pre>
                    </div>

                    <div style={{ marginTop: 12, fontSize: 13 }}>
                      <strong>Campos importantes:</strong>
                    </div>
                    <ul style={{ fontSize: 13, marginTop: 4 }}>
                      <li><code>tipo</code>: codigo del catalogo (<code>BANCA_WEB</code>, <code>BANCA_APP</code>, <code>TRANSFERENCIA</code>, <code>AGORA</code>, <code>EFECTIVO</code>, etc.). <strong>NO usar codigos SUNAT (008, 009)</strong>.</li>
                      <li><code>referencia</code>: numero de operacion/transaccion. <strong>El campo se llama <code>referencia</code></strong>, no <code>numero_operacion</code> (este ultimo es el nombre del formato legacy <code>bancarizacion</code>).</li>
                      <li><code>entidad_financiera</code>: banco (requerido para tipos bancarios).</li>
                      <li><code>monto</code>: la suma de todos los medios debe cubrir <code>mto_imp_venta</code>.</li>
                    </ul>

                    <div style={{ marginTop: 12, fontSize: 13 }}>
                      <strong>Leyenda automatica:</strong> Syncrofact agrega al XML la leyenda
                      <code> 2005 - "OPERACION SUJETA A BANCARIZACION - LEY N° 28194"</code> cuando detecta que aplica. No la envies manualmente.
                    </div>

                    <div style={{ marginTop: 16, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Consultar catalogo de medios</div>
                      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{`curl -H "Authorization: Bearer TU_TOKEN" \\
  https://api.syncrofact.net.pe/api/v1/bancarizacion/medios-pago`}</pre>
                    </div>

                    <div style={{ marginTop: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, padding: 12, fontSize: 13 }}>
                      <strong>Error comun:</strong> si la API rechaza con "Requiere numero de referencia/operacion", el campo debe llamarse <code>referencia</code> (no <code>numero_operacion</code>). Si envias monto {'>'} S/ 2,000 sin <code>medios_pago</code>, obtienes error 422 con el mensaje de bancarizacion obligatoria.
                    </div>
                  </div>
                ),
              },
              {
                key: 'catalogs',
                label: (
                  <Space>
                    <Tag color="gold">CATALOGOS</Tag>
                    <Text>Tipos de documento, motivos, etc.</Text>
                  </Space>
                ),
                children: (
                  <EndpointGroup
                    endpoints={[
                      { method: 'GET', path: '/v1/credit-notes/catalogs/motivos', desc: 'Motivos SUNAT para NC' },
                      { method: 'GET', path: '/v1/debit-notes/catalogs/motivos', desc: 'Motivos SUNAT para ND' },
                      { method: 'GET', path: '/v1/voided-documents/reasons', desc: 'Motivos de baja' },
                      { method: 'GET', path: '/v1/dispatch-guides/catalogs/transfer-reasons', desc: 'Motivos de traslado' },
                      { method: 'GET', path: '/v1/dispatch-guides/catalogs/transport-modes', desc: 'Modalidades de transporte' },
                      { method: 'GET', path: '/v1/catalogos/detracciones', desc: 'Catalogo No. 54 SUNAT (detracciones)' },
                      { method: 'GET', path: '/v1/ubigeos/search', desc: 'Busqueda de ubigeos SUNAT' },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Card>

        <Card title="Ejemplos de creacion de documentos">
          <Collapse
            items={[
              {
                key: 'factura',
                label: <Space><Tag color="blue">POST</Tag><Text>Crear Factura (precio sin IGV)</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/invoices" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "F001",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "forma_pago_tipo": "Contado",
    "tipo_operacion": "0101",
    "client": {
      "tipo_documento": "6",
      "numero_documento": "20131312955",
      "razon_social": "SUPERINTENDENCIA NAC DE ADM TRIBUTARIA",
      "direccion": "AV. GARCILASO DE LA VEGA NRO. 1472"
    },
    "detalles": [
      {
        "codigo": "PROD001",
        "descripcion": "Producto de prueba",
        "unidad": "NIU",
        "cantidad": 1,
        "mto_valor_unitario": 100,
        "tip_afe_igv": "10"
      }
    ]
  }'

# Notas:
# - mto_valor_unitario = precio SIN IGV (el IGV se calcula automaticamente)
# - mto_precio_unitario = precio CON IGV (alternativa, usar uno u otro)
# - porcentaje_igv es opcional (default: 18%)
# - tip_afe_igv: "10"=Gravado, "20"=Exonerado, "30"=Inafecto`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'factura-credito',
                label: <Space><Tag color="blue">POST</Tag><Text>Crear Factura a Credito (con cuotas)</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/invoices" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "F001",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "forma_pago_tipo": "Credito",
    "forma_pago_cuotas": [
      { "moneda": "PEN", "monto": 590.00, "fecha_pago": "2026-05-13" },
      { "moneda": "PEN", "monto": 590.00, "fecha_pago": "2026-06-13" }
    ],
    "client": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "detalles": [
      {
        "codigo": "SERV001",
        "descripcion": "Servicio de consultoria mensual",
        "unidad": "ZZ",
        "cantidad": 1,
        "mto_valor_unitario": 1000.00,
        "tip_afe_igv": "10"
      }
    ]
  }'`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'factura-retail',
                label: <Space><Tag color="blue">POST</Tag><Text>Crear Factura (precio con IGV - modo retail)</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/invoices" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "F001",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "forma_pago_tipo": "Contado",
    "client": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "detalles": [
      {
        "codigo": "LAP001",
        "descripcion": "LAPTOP HP PAVILION 15",
        "unidad": "NIU",
        "cantidad": 2,
        "mto_precio_unitario": 3540.00,
        "tip_afe_igv": "10"
      },
      {
        "codigo": "INST001",
        "descripcion": "Instalacion y configuracion",
        "unidad": "ZZ",
        "cantidad": 1,
        "mto_precio_unitario": 236.00,
        "tip_afe_igv": "10"
      }
    ]
  }'

# Nota: mto_precio_unitario incluye IGV.
# El sistema calcula automaticamente el valor sin IGV.`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'boleta',
                label: <Space><Tag color="cyan">POST</Tag><Text>Crear Boleta</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/boletas" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "B001",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "metodo_envio": "individual",
    "forma_pago_tipo": "Contado",
    "client": {
      "tipo_documento": "1",
      "numero_documento": "12345678",
      "razon_social": "JUAN PEREZ GARCIA"
    },
    "detalles": [
      {
        "codigo": "PROD001",
        "descripcion": "Producto de venta al publico",
        "unidad": "NIU",
        "cantidad": 3,
        "mto_precio_unitario": 59.00,
        "tip_afe_igv": "10",
        "porcentaje_igv": 18
      }
    ]
  }'

# Notas:
# - metodo_envio: "individual" (envio directo) o "resumen_diario"
# - Si monto > S/ 700, se requiere DNI real (no generico)
# - porcentaje_igv es requerido en boletas`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'nota-credito',
                label: <Space><Tag color="purple">POST</Tag><Text>Crear Nota de Credito</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/credit-notes" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "FC01",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "tipo_doc_afectado": "01",
    "num_doc_afectado": "F001-000001",
    "cod_motivo": "01",
    "des_motivo": "Anulacion de la operacion",
    "client": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "detalles": [
      {
        "codigo": "PROD001",
        "descripcion": "Producto devuelto",
        "unidad": "NIU",
        "cantidad": 1,
        "mto_valor_unitario": 100.00,
        "tip_afe_igv": "10"
      }
    ]
  }'

# Motivos NC: 01=Anulacion, 02=Error RUC, 03=Error descripcion,
# 04=Descuento global, 05=Descuento item, 06=Devolucion total,
# 07=Devolucion item, 08=Bonificacion, 09=Disminucion valor
# tipo_doc_afectado: "01"=Factura, "03"=Boleta`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'nota-debito',
                label: <Space><Tag color="purple">POST</Tag><Text>Crear Nota de Debito</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/debit-notes" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "FD01",
    "fecha_emision": "2026-04-13",
    "moneda": "PEN",
    "tipo_doc_afectado": "01",
    "num_doc_afectado": "F001-000001",
    "cod_motivo": "01",
    "des_motivo": "Intereses por mora",
    "client": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "detalles": [
      {
        "codigo": "INT001",
        "descripcion": "Intereses por mora - 30 dias",
        "unidad": "ZZ",
        "cantidad": 1,
        "mto_valor_unitario": 50.00,
        "tip_afe_igv": "10"
      }
    ]
  }'

# Motivos ND: 01=Intereses por mora, 02=Aumento en el valor,
# 03=Penalidades u otros conceptos`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'guia-privado',
                label: <Space><Tag color="orange">POST</Tag><Text>Crear Guia de Remision (transporte privado)</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/dispatch-guides" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "T001",
    "fecha_emision": "2026-04-13",
    "cod_traslado": "01",
    "mod_traslado": "02",
    "fecha_traslado": "2026-04-14",
    "peso_total": 150.5,
    "und_peso_total": "KGM",
    "destinatario": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "partida": {
      "ubigeo": "130101",
      "direccion": "AV. ESPAÑA 1234, TRUJILLO"
    },
    "llegada": {
      "ubigeo": "150101",
      "direccion": "AV. ARGENTINA 2833, LIMA"
    },
    "conductor_tipo_doc": "1",
    "conductor_num_doc": "41410641",
    "conductor_nombres": "JUAN",
    "conductor_apellidos": "ROMERO AVALOS",
    "conductor_licencia": "Q41410641",
    "vehiculo_placa": "T7R831",
    "detalles": [
      {
        "codigo": "PROD001",
        "descripcion": "Mercaderia general",
        "unidad": "KGM",
        "cantidad": 150.5
      }
    ]
  }'

# mod_traslado: "01"=Publico, "02"=Privado
# cod_traslado: "01"=Venta, "02"=Compra, "04"=Traslado entre establec.
# Transporte privado requiere: conductor + vehiculo`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'guia-publico',
                label: <Space><Tag color="orange">POST</Tag><Text>Crear Guia de Remision (transporte publico)</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`curl -X POST "${baseUrl}/v1/dispatch-guides" \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company_id": 1,
    "branch_id": 1,
    "serie": "T001",
    "fecha_emision": "2026-04-13",
    "cod_traslado": "01",
    "mod_traslado": "01",
    "fecha_traslado": "2026-04-14",
    "peso_total": 500,
    "und_peso_total": "KGM",
    "destinatario": {
      "tipo_documento": "6",
      "numero_documento": "20100039207",
      "razon_social": "RANSA COMERCIAL S.A."
    },
    "partida": {
      "ubigeo": "130101",
      "direccion": "AV. ESPAÑA 1234, TRUJILLO"
    },
    "llegada": {
      "ubigeo": "150101",
      "direccion": "AV. ARGENTINA 2833, LIMA"
    },
    "transportista_tipo_doc": "6",
    "transportista_num_doc": "20100039207",
    "transportista_razon_social": "TRANSPORTES CRUZ DEL SUR S.A.",
    "transportista_nro_mtc": "123456",
    "detalles": [
      {
        "codigo": "PROD001",
        "descripcion": "Mercaderia general",
        "unidad": "NIU",
        "cantidad": 50
      }
    ]
  }'

# Transporte publico requiere datos del transportista
# No requiere conductor ni vehiculo`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
              {
                key: 'consultar',
                label: <Space><Tag color="green">GET</Tag><Text>Consultar estado de documento</Text></Space>,
                children: (
                  <Input.TextArea
                    readOnly
                    autoSize
                    value={`# Consultar factura por ID
curl "${baseUrl}/v1/invoices/3" \\
  -H "Authorization: Bearer TU_TOKEN"

# Descargar PDF
curl -o factura.pdf "${baseUrl}/v1/invoices/3/download-pdf" \\
  -H "Authorization: Bearer TU_TOKEN"

# Descargar XML firmado
curl -o factura.xml "${baseUrl}/v1/invoices/3/download-xml" \\
  -H "Authorization: Bearer TU_TOKEN"

# Descargar CDR de SUNAT
curl -o factura-cdr.zip "${baseUrl}/v1/invoices/3/download-cdr" \\
  -H "Authorization: Bearer TU_TOKEN"

# Reenviar a SUNAT (si fallo o quedo en ERROR)
curl -X POST "${baseUrl}/v1/invoices/3/send-sunat" \\
  -H "Authorization: Bearer TU_TOKEN"

# Reemplazar "invoices" por: boletas, credit-notes,
# debit-notes o dispatch-guides segun el tipo`}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                ),
              },
            ]}
          />
        </Card>

        <Card title="Consulta publica de documentos (sin autenticacion)">
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            message="Estas URLs son publicas — no requieren token. Puedes compartirlas con tus clientes para que consulten y descarguen sus comprobantes."
          />
          <Paragraph>
            Cada documento emitido genera una URL publica de consulta. La estructura es:
          </Paragraph>
          <Input.TextArea
            readOnly
            autoSize
            value={`${window.location.origin}/consulta/{ruc}/{tipo_doc}/{serie-correlativo}
${window.location.origin}/consulta/{ruc}/{tipo_doc}/{serie-correlativo}/pdf`}
            style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 16 }}
          />
          <Divider plain>Codigos de tipo de documento SUNAT</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`01 = Factura
03 = Boleta de Venta
07 = Nota de Credito
08 = Nota de Debito
09 = Guia de Remision
20 = Comprobante de Retencion
40 = Comprobante de Percepcion`}
            style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 16 }}
          />
          <Divider plain>Ejemplos reales</Divider>
          <Input.TextArea
            readOnly
            autoSize
            value={`# Consultar Factura F001-000003
${window.location.origin}/consulta/20132373958/01/F001-00000003

# Descargar PDF de Factura F001-000003
${window.location.origin}/consulta/20132373958/01/F001-00000003/pdf

# Consultar Boleta B001-000001
${window.location.origin}/consulta/20132373958/03/B001-00000001

# Consultar Nota de Credito FC01-000001
${window.location.origin}/consulta/20132373958/07/FC01-00000001

# Consultar Nota de Debito FD01-000001
${window.location.origin}/consulta/20132373958/08/FD01-00000001

# Consultar Guia de Remision T001-000001
${window.location.origin}/consulta/20132373958/09/T001-00000001

# Estructura general:
# /consulta/{RUC_EMISOR}/{TIPO_DOC}/{SERIE-CORRELATIVO}
# /consulta/{RUC_EMISOR}/{TIPO_DOC}/{SERIE-CORRELATIVO}/pdf`}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Card>

        <Card title="Referencia de campos">
          <Collapse
            items={[
              {
                key: 'tipos-doc',
                label: 'Tipos de documento de identidad',
                children: (
                  <Input.TextArea readOnly autoSize value={`"0" = Otros (Sin RUC)
"1" = DNI
"4" = Carnet de Extranjeria
"6" = RUC
"7" = Pasaporte
"A" = Cedula Diplomatica`} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                ),
              },
              {
                key: 'tip-afe',
                label: 'Tipos de afectacion IGV (tip_afe_igv)',
                children: (
                  <Input.TextArea readOnly autoSize value={`"10" = Gravado - Operacion Onerosa (IGV 18%)
"20" = Exonerado - Operacion Onerosa (IGV 0%)
"30" = Inafecto - Operacion Onerosa (IGV 0%)
"40" = Exportacion (IGV 0%)
"11"-"16" = Gravado - Gratuita (no cobra IGV al cliente)
"17" = Gravado - IVAP (tasa variable)
"31"-"36" = Inafecto - Gratuita`} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                ),
              },
              {
                key: 'unidades',
                label: 'Unidades de medida comunes',
                children: (
                  <Input.TextArea readOnly autoSize value={`"NIU" = Unidad
"ZZ"  = Servicio
"KGM" = Kilogramo
"TNE" = Tonelada
"MTR" = Metro
"LTR" = Litro
"GLL" = Galon
"DZN" = Docena
"BX"  = Caja`} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                ),
              },
              {
                key: 'estados',
                label: 'Estados SUNAT',
                children: (
                  <Input.TextArea readOnly autoSize value={`"PENDIENTE"  = Creado, sin enviar
"EN_COLA"    = En cola de envio automatico (se envia en segundos)
"ENVIANDO"   = Enviandose a SUNAT
"ACEPTADO"   = Aceptado por SUNAT
"RECHAZADO"  = Rechazado por SUNAT (revisar mensaje de error)
"ERROR"      = Error en el procesamiento (se puede reintentar)`} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                ),
              },
              {
                key: 'monedas',
                label: 'Monedas',
                children: (
                  <Input.TextArea readOnly autoSize value={`"PEN" = Sol peruano
"USD" = Dolar americano`} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                ),
              },
            ]}
          />
        </Card>

        <Alert
          type="warning"
          showIcon
          message="Seguridad y buenas practicas"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>No expongas tu token en repositorios publicos ni en el frontend de tu app web.</li>
              <li>Usa HTTPS siempre en produccion.</li>
              <li>Si tu token se filtra, regeneralo inmediatamente desde Mi Token API.</li>
              <li>Cada empresa solo puede acceder a SUS documentos; los endpoints validan company_id del token.</li>
              <li>Los errores de SUNAT se propagan con codigo y descripcion en el campo <Text code>error_code</Text>.</li>
            </ul>
          }
        />
      </Space>
    </div>
  );
}

interface EndpointRow {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  desc: string;
}

function EndpointGroup({ endpoints }: { endpoints: EndpointRow[] }) {
  const methodColor: Record<string, string> = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    PATCH: 'orange',
    DELETE: 'red',
  };
  return (
    <Space direction="vertical" size={6} style={{ width: '100%' }}>
      {endpoints.map((e, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'baseline',
            padding: '6px 0',
            borderBottom: i < endpoints.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <Tag color={methodColor[e.method]} style={{ minWidth: 56, textAlign: 'center', margin: 0 }}>
            {e.method}
          </Tag>
          <Text code style={{ fontSize: 13 }}>{e.path}</Text>
          <Text type="secondary" style={{ fontSize: 12, flex: 1 }}>{e.desc}</Text>
        </div>
      ))}
    </Space>
  );
}

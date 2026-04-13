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

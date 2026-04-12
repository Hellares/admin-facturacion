# Guia de Usuario - Sistema de Facturacion Electronica SUNAT

## Indice
1. [Primeros Pasos](#1-primeros-pasos)
2. [Dashboard](#2-dashboard)
3. [Ventas](#3-ventas)
4. [Pre-Venta](#4-pre-venta)
5. [Despacho](#5-despacho)
6. [Procesos SUNAT](#6-procesos-sunat)
7. [Retenciones](#7-retenciones)
8. [Administracion](#8-administracion)
9. [Configuracion](#9-configuracion)
10. [Alertas](#10-alertas)

---

## 1. Primeros Pasos

### 1.1 Setup Inicial (Primera vez)
Acceder a `http://localhost:3000/setup` para configurar el sistema por primera vez.

**Pasos del wizard:**
1. **Estado del Sistema** - Verifica que la base de datos este conectada y las migraciones ejecutadas
2. **Base de Datos** - Ejecuta migraciones y seeders si no se han ejecutado
3. **Crear Empresa** - Ingresa los datos de tu primera empresa (RUC, razon social, direccion, credenciales SOL)
4. **Listo** - El sistema esta configurado, procede al login

### 1.2 Login
- URL: `http://localhost:3000/login`
- Ingresar email y contrasena del usuario administrador
- El sistema redirige al Dashboard

### 1.3 Seleccionar Empresa y Sucursal
- En la barra superior hay selectores de **Empresa** y **Sucursal**
- Todos los documentos se crean bajo la empresa/sucursal seleccionada
- Esta seleccion se mantiene entre sesiones

---

## 2. Dashboard

**Menu:** Dashboard (icono de tablero)

Panel principal con estadisticas de tu empresa:
- **Totales** del periodo: cantidad y montos de facturas, boletas, notas
- **Graficos** de ventas mensuales y por cliente
- **Documentos pendientes** de envio a SUNAT
- **Certificados** proximos a vencer

---

## 3. Ventas

### 3.1 Facturas
**Menu:** Ventas > Facturas

Las facturas electronicas (tipo 01) son comprobantes de pago para clientes con RUC.

**Crear Factura:**
1. Click "Nueva Factura"
2. Seleccionar serie (F001, F002, etc.) - el correlativo es automatico
3. Seleccionar fecha de emision y moneda (PEN/USD)
4. **Cliente:** Ingresar RUC y datos del cliente (tipo documento = 6 para RUC)
5. **Items:** Agregar productos/servicios con codigo, descripcion, cantidad, precio, tipo de IGV
6. **Forma de Pago:** Contado o Credito (con cuotas)
7. **Opcionales:** Detraccion, percepcion, medios de pago, orden de compra
8. Click "Crear Factura"

**Acciones disponibles:**
- **Enviar a SUNAT** - Envia el XML firmado a SUNAT y recibe el CDR
- **Descargar XML** - Descarga el archivo XML del comprobante
- **Descargar CDR** - Descarga la constancia de recepcion de SUNAT
- **Descargar PDF** - Descarga el PDF del comprobante
- **Generar PDF** - Regenera el PDF con el formato actual

**Estados SUNAT:**
- `PENDIENTE` - Creada, no enviada aun
- `ACEPTADO` - SUNAT acepto el comprobante
- `RECHAZADO` - SUNAT rechazo el comprobante (ver motivo en detalle)

### 3.2 Boletas
**Menu:** Ventas > Boletas

Las boletas (tipo 03) son comprobantes para consumidores finales.

**Diferencias con facturas:**
- Cliente puede ser con DNI (tipo 1) o sin documento (tipo 0)
- **Metodo de envio:** Individual (envio directo a SUNAT) o Resumen Diario (se agrupan por fecha)
- No requieren orden de compra
- Soportan anulacion local y oficial

**Funciones especiales:**
- **Panel de Resumenes Pendientes:** Muestra fechas con boletas pendientes de incluir en resumen diario
- **Crear Resumen Diario:** Agrupa boletas de una fecha para envio masivo
- **Anular localmente:** Marca boletas como anuladas sin notificar a SUNAT
- **Anular oficialmente:** Genera comunicacion de baja para boletas

### 3.3 Notas de Credito
**Menu:** Ventas > Notas de Credito

Documentos que anulan o modifican facturas/boletas emitidas.

**Crear Nota de Credito:**
1. Click "Nueva Nota de Credito"
2. Seleccionar tipo de documento afectado (Factura 01 / Boleta 03)
3. Ingresar numero del documento afectado (ej: F001-000001)
4. Seleccionar motivo (anulacion, descuento, devolucion, etc.) - la descripcion se llena automaticamente
5. Ingresar datos del cliente e items
6. Crear y enviar a SUNAT

### 3.4 Notas de Debito
**Menu:** Ventas > Notas de Debito

Documentos que incrementan el monto de facturas/boletas (intereses, penalidades).

Mismo flujo que Notas de Credito pero con motivos de debito.

---

## 4. Pre-Venta

### 4.1 Notas de Venta
**Menu:** Pre-Venta > Notas de Venta

Documentos internos que NO se envian a SUNAT. Sirven como comprobantes provisionales.

**Funciones:**
- Crear nota de venta con items y cliente
- **Convertir a Factura** (codigo 01) o **Convertir a Boleta** (codigo 03): Genera el documento electronico a partir de la nota de venta
- **Revertir conversion:** Si la factura/boleta no se envio a SUNAT, se puede revertir
- Descargar PDF de la nota de venta
- Eliminar notas de venta no convertidas

### 4.2 Cotizaciones
**Menu:** Pre-Venta > Cotizaciones

Propuestas comerciales con validez temporal.

**Estados:**
- `borrador` - En edicion
- `enviada` - Enviada al cliente
- `aceptada` - Cliente acepto
- `rechazada` - Cliente rechazo
- `vencida` - Paso la fecha de validez
- `convertida` - Se convirtio a factura/boleta

**Funciones:**
- Crear cotizacion con items, condiciones, notas, datos de contacto
- **Enviar:** Marca como enviada al cliente
- **Aceptar/Rechazar:** Registra la respuesta del cliente
- **Convertir:** Genera factura o boleta a partir de la cotizacion
- **Duplicar:** Crea una copia de la cotizacion
- **Marcar Vencidas:** Boton en la lista para marcar masivamente las cotizaciones vencidas
- **Estadisticas:** Ver metricas de cotizaciones (tasa de conversion, montos, etc.)

---

## 5. Despacho

### 5.1 Guias de Remision
**Menu:** Despacho > Guias de Remision

Documentos que amparan el traslado de bienes (tipo 09).

**Crear Guia de Remision:**
1. Click "Nueva Guia de Remision"
2. Seleccionar serie (T001, etc.), fechas de emision y traslado
3. Seleccionar motivo de traslado (venta, compra, traslado entre establecimientos, etc.)
4. Seleccionar modalidad: **Publico** (transportista tercero) o **Privado** (vehiculo propio)
5. Ingresar peso total y numero de bultos
6. **Destinatario:** Datos de quien recibe la mercaderia
7. **Direcciones:** Punto de partida (ubigeo + direccion) y punto de llegada
8. **Transporte:**
   - Si Publico: Datos del transportista (RUC, razon social, MTC)
   - Si Privado: Datos del conductor (DNI, nombres, licencia) y placa del vehiculo
9. **Items:** Productos transportados con codigo, descripcion, cantidad, unidad
10. Crear y enviar a SUNAT

**Importante:** Para enviar guias a SUNAT se necesitan las **Credenciales GRE** configuradas (ver seccion 9.2).

---

## 6. Procesos SUNAT

### 6.1 Resumenes Diarios
**Menu:** Procesos SUNAT > Resumenes Diarios

Agrupan boletas del mismo dia para envio masivo a SUNAT.

**Flujo:**
1. Las boletas con `metodo_envio = resumen_diario` se acumulan
2. Crear resumen diario para una fecha especifica
3. Enviar el resumen a SUNAT
4. SUNAT procesa y devuelve un ticket
5. Consultar estado del ticket hasta recibir aceptacion

**Estados:** GENERADO > ENVIADO > PROCESANDO > COMPLETADO

### 6.2 Comunicaciones de Baja
**Menu:** Procesos SUNAT > Com. de Baja

Para anular facturas, notas de credito o debito ya enviadas a SUNAT.

**Crear Comunicacion de Baja:**
1. Click "Nueva Comunicacion de Baja"
2. Seleccionar sucursal y fecha de referencia
3. Ingresar motivo general de baja
4. Seleccionar documentos a anular de la lista de disponibles
5. Ingresar motivo especifico por cada documento
6. Crear, enviar a SUNAT y consultar estado del ticket

### 6.3 Consulta CPE
**Menu:** Procesos SUNAT > Consulta CPE

Consulta el estado de comprobantes electronicos directamente con SUNAT.

**Funciones:**
- Consultar factura, boleta, nota de credito o nota de debito individual
- Consulta masiva de multiples documentos
- Ver estadisticas de consultas realizadas

---

## 7. Retenciones

**Menu:** Retenciones

Comprobantes de retencion del IGV (tipo 20). Se emiten cuando tu empresa retiene impuestos a un proveedor.

**Crear Retencion:**
1. Click "Nueva Retencion"
2. Ingresar serie, correlativo, fecha, moneda
3. Seleccionar regimen de retencion (01, 02 o 03) y tasa
4. **Proveedor:** Datos del proveedor (como un cliente pero es a quien le retienes)
5. **Detalles:** Documentos sobre los que se aplica la retencion:
   - Tipo y numero de documento (factura, boleta, etc.)
   - Fechas de emision y retencion
   - Montos: total, pagado, retenido
   - **Pagos:** Fecha, moneda e importe de cada pago
   - **Tipo de cambio:** Fecha, factor, monedas de referencia y objetivo
6. Crear y enviar a SUNAT

---

## 8. Administracion

### 8.1 Empresas
**Menu:** Administracion > Empresas

Gestion de las empresas que facturan en el sistema (soporte multi-empresa).

**Crear Empresa:**
- **Informacion General:** RUC (11 digitos), razon social, direccion, ubigeo, contacto
- **Contacto y Redes:** Telefonos adicionales, whatsapp, emails de ventas/soporte, redes sociales
- **Credenciales SUNAT:** Usuario SOL, clave SOL, certificado digital (.pfx/.pem)
- **Finanzas:** Cuentas bancarias y billeteras digitales (se administran desde el detalle de la empresa)
- **PDF:** Configurar que mostrar en los PDF (cuentas, billeteras, redes sociales), mensaje personalizado, terminos y condiciones, politica de garantia
- **Configuracion:** Modo produccion (beta/produccion), estado activo

**Detalle de Empresa:**
- Ver toda la informacion registrada
- Ver cuentas bancarias y billeteras digitales
- Ver **correlativos** activos (series y ultimo numero usado)

### 8.2 Sucursales
**Menu:** Administracion > Sucursales

Cada empresa puede tener multiples sucursales con sus propias series de documentos.

**Crear Sucursal:**
- Codigo (ej: 0000 para principal), nombre, direccion, ubigeo
- Series por tipo de documento (F001 para facturas, B001 para boletas, etc.)

**Funciones:**
- **Activar/Desactivar** sucursales desde la lista
- **Correlativos Batch:** En la edicion de sucursal, boton "Crear Serie Batch" permite crear multiples series de golpe (tipo documento + serie + correlativo inicial)

### 8.3 Clientes
**Menu:** Administracion > Clientes

Registro de clientes frecuentes para autocompletar en formularios.

**Tipos de documento:**
- `0` - Sin documento
- `1` - DNI (8 digitos)
- `4` - Carnet de extranjeria
- `6` - RUC (11 digitos)
- `7` - Pasaporte

**Funciones:** Crear, editar, desactivar, buscar por numero de documento.

### 8.4 Usuarios
**Menu:** Administracion > Usuarios

Gestion de usuarios del sistema.

**Roles disponibles:**
- `Super Administrador` - Acceso total al sistema
- `Administrador de Empresa` - Administra una empresa especifica
- `Usuario de Empresa` - Operador con permisos limitados
- `Cliente API` - Para integracion externa via API REST
- `Solo Lectura` - Solo puede consultar, no crear ni modificar

**Funciones:**
- Crear usuarios asignandoles rol y empresa
- **Generar Token API:** Para usuarios tipo "Cliente API", genera un Bearer Token para integracion externa. Muestra URL, token, company_id y ejemplo curl
- **Activar/Desactivar** usuarios
- **Desbloquear** usuarios bloqueados por intentos fallidos
- **Resetear contrasena**

---

## 9. Configuracion

### 9.1 Config. Empresa
**Menu:** Configuracion > Config. Empresa

Configuracion avanzada por secciones:

**Impuestos:**
- Porcentajes de IGV, ISC, ICBPER, IVAP
- Regimen tributario (General / MYPE RHT)
- Decimales para precios y cantidades
- Redondeo automatico
- Validacion de RUC del cliente

**Facturacion:**
- Version UBL (2.0 / 2.1)
- Moneda por defecto (PEN/USD/EUR)
- Tipo de operacion por defecto
- Envio automatico a SUNAT
- Leyendas automaticas

**Guias de Remision:**
- Peso y bultos por defecto
- Modalidad de transporte por defecto
- Motivo de traslado por defecto
- Verificacion automatica de estado

**Documentos:**
- Generacion automatica de XML y PDF
- Envio automatico a SUNAT
- Formato PDF (A4, Letter, Legal)
- Orientacion (Vertical/Horizontal)
- Incluir QR, hash y logo en PDF

**Acciones:** Resetear a valores por defecto, Validar servicios SUNAT, Limpiar cache

### 9.2 Credenciales GRE
**Menu:** Configuracion > Credenciales GRE

Credenciales para el envio de **Guias de Remision Electronicas** a SUNAT. Son diferentes a las credenciales SOL normales.

**Configuracion por ambiente (Beta / Produccion):**
- `Client ID` - Identificador de la aplicacion en SUNAT
- `Client Secret` - Clave secreta de la aplicacion
- `RUC Proveedor` - RUC del proveedor de servicios (para beta: 20161515648)
- `Usuario SOL` - Usuario SOL para GRE
- `Clave SOL` - Clave SOL para GRE

**Acciones:**
- **Guardar:** Actualiza las credenciales del ambiente seleccionado
- **Probar Conexion:** Verifica que las credenciales sean validas conectandose a SUNAT
- **Cargar Defaults:** Carga las credenciales de prueba de SUNAT (solo para Beta)
- **Copiar:** Copia credenciales del otro ambiente (de Beta a Produccion o viceversa)
- **Limpiar:** Elimina las credenciales del ambiente seleccionado

### 9.3 Webhooks
**Menu:** Configuracion > Webhooks

Notificaciones automaticas a sistemas externos cuando ocurren eventos.

**Crear Webhook:**
- Nombre descriptivo
- URL de destino (endpoint de tu sistema externo)
- Metodo HTTP (POST/GET/PUT)
- Eventos a escuchar (factura creada, enviada a SUNAT, aceptada, rechazada, etc.)
- Secret para firma HMAC
- Timeout, reintentos maximos y retraso entre reintentos
- Headers personalizados (JSON)

**Funciones:**
- Ver historial de entregas (deliveries) por webhook
- Reintentar entregas fallidas
- Ver estadisticas (exitos/fallos)
- Probar webhook manualmente

### 9.4 Catalogos
**Menu:** Configuracion > Catalogos

Consulta de catalogos SUNAT.

**Detracciones:**
- Lista completa del Catalogo 54 SUNAT (bienes y servicios sujetos a detraccion)
- **Buscador:** Busca detracciones por descripcion
- **Calculadora:** Selecciona un codigo de detraccion, ingresa el monto total y calcula automaticamente el monto de detraccion y neto a pagar

---

## 10. Alertas

### 10.1 Alertas de Plazo
**Menu:** Alertas > Alertas de Plazo

Monitoreo de plazos SUNAT para envio de comprobantes electronicos.

**Tab "Alertas Activas":**
- Resumen con contadores: Total pendientes, Vencidos, Urgentes, Proximos
- Tabla de documentos con: numero, tipo, fecha emision, fecha limite, dias restantes, nivel de urgencia
- **Verificar Ahora:** Fuerza una verificacion inmediata de todos los plazos
- Boton "OK" para marcar alertas como atendidas

**Tab "Plazos SUNAT":**
- Tabla de referencia con los plazos maximos por tipo de documento
- Referencia legal aplicable
- Nota sobre como se cuentan los plazos

**Tab "Verificar Plazo":**
- Calculadora manual: selecciona tipo de documento y fecha de emision
- Muestra: fecha de vencimiento, dias faltantes, estado (vigente/urgente/vencido)

### 10.2 Bancarizacion
**Menu:** Alertas > Bancarizacion

Control de la Ley N 28194 (bancarizacion de operaciones).

**Funciones:**
- Ver medios de pago permitidos
- Validar si una operacion requiere bancarizacion (montos mayores a S/ 3,500 o US$ 1,000)
- Reporte de ventas sin bancarizacion
- Estadisticas de bancarizacion

---

## Atajos y Tips

### Navegacion rapida
- El **menu lateral** se puede colapsar/expandir clickeando la flecha inferior
- En movil, el menu se abre como un drawer (panel deslizante)
- La **empresa y sucursal** seleccionadas se mantienen entre sesiones

### Flujo tipico de facturacion
1. Crear empresa con datos y certificado digital
2. Crear sucursal con series de documentos
3. Configurar credenciales SOL y GRE (para guias)
4. Crear factura/boleta
5. Enviar a SUNAT
6. Descargar PDF para el cliente

### Integracion API
1. Crear usuario tipo "Cliente API" vinculado a una empresa
2. Generar token desde la lista de usuarios
3. Usar el token Bearer en las llamadas API
4. Base URL: `http://tu-dominio/api/v1/`
5. Ejemplo: `curl -H "Authorization: Bearer TOKEN" http://tu-dominio/api/v1/invoices`

### Modo Beta vs Produccion
- **Beta:** Usa servidores de prueba de SUNAT. Los documentos no tienen validez tributaria
- **Produccion:** Usa servidores reales de SUNAT. Los documentos son validos tributariamente
- Cambiar en: Administracion > Empresas > Editar > Configuracion > Modo Produccion

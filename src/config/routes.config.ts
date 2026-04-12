export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',

  // Administracion
  COMPANIES: '/companies',
  COMPANY_NEW: '/companies/new',
  COMPANY_DETAIL: '/companies/:id',
  COMPANY_EDIT: '/companies/:id/edit',
  BRANCHES: '/branches',
  BRANCH_NEW: '/branches/new',
  BRANCH_EDIT: '/branches/:id/edit',
  CLIENTS: '/clients',
  CLIENT_NEW: '/clients/new',
  CLIENT_EDIT: '/clients/:id/edit',
  USERS: '/users',
  USER_NEW: '/users/new',
  USER_EDIT: '/users/:id/edit',

  // Ventas
  INVOICES: '/invoices',
  INVOICE_NEW: '/invoices/new',
  INVOICE_DETAIL: '/invoices/:id',
  BOLETAS: '/boletas',
  BOLETA_NEW: '/boletas/new',
  BOLETA_DETAIL: '/boletas/:id',
  CREDIT_NOTES: '/credit-notes',
  CREDIT_NOTE_NEW: '/credit-notes/new',
  CREDIT_NOTE_DETAIL: '/credit-notes/:id',
  DEBIT_NOTES: '/debit-notes',
  DEBIT_NOTE_NEW: '/debit-notes/new',
  DEBIT_NOTE_DETAIL: '/debit-notes/:id',

  // Pre-venta
  NOTA_VENTAS: '/nota-ventas',
  NOTA_VENTA_NEW: '/nota-ventas/new',
  NOTA_VENTA_DETAIL: '/nota-ventas/:id',
  COTIZACIONES: '/cotizaciones',
  COTIZACION_NEW: '/cotizaciones/new',
  COTIZACION_DETAIL: '/cotizaciones/:id',

  // Despacho
  DISPATCH_GUIDES: '/dispatch-guides',
  DISPATCH_GUIDE_NEW: '/dispatch-guides/new',
  DISPATCH_GUIDE_DETAIL: '/dispatch-guides/:id',
  DISPATCH_GUIDE_EDIT: '/dispatch-guides/:id/edit',
  TRANSPORTISTS: '/transportists',
  TRANSPORTIST_NEW: '/transportists/new',
  TRANSPORTIST_EDIT: '/transportists/:id/edit',
  VEHICLES: '/vehicles',
  VEHICLE_NEW: '/vehicles/new',
  VEHICLE_EDIT: '/vehicles/:id/edit',
  DRIVERS: '/drivers',
  DRIVER_NEW: '/drivers/new',
  DRIVER_EDIT: '/drivers/:id/edit',

  // API Integration
  MY_API_TOKEN: '/settings/api-token',
  API_DOCS: '/api-docs',

  // Procesos SUNAT
  ANULACIONES: '/anulaciones',
  DAILY_SUMMARIES: '/daily-summaries',
  DAILY_SUMMARY_DETAIL: '/daily-summaries/:id',
  VOIDED_DOCUMENTS: '/voided-documents',
  CONSULTA_CPE: '/consulta-cpe',

  // Retenciones
  RETENTIONS: '/retentions',
  RETENTION_NEW: '/retentions/new',
  RETENTION_DETAIL: '/retentions/:id',

  // Alertas y reportes
  BANCARIZACION: '/bancarizacion',
  PLAZO_ALERTS: '/plazo-alerts',

  // Setup
  SETUP: '/setup',

  // Configuracion
  WEBHOOKS: '/webhooks',
  WEBHOOK_NEW: '/webhooks/new',
  WEBHOOK_DETAIL: '/webhooks/:id',
  CATALOGS: '/catalogs',
  CONFIG: '/config',
  GRE_CREDENTIALS: '/config/gre-credentials',
  SYSTEM_SETTINGS: '/system-settings',
} as const;

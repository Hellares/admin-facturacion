import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';
import NotFoundPage from '@/components/common/NotFoundPage';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const CompanyListPage = lazy(() => import('@/features/companies/CompanyListPage'));
const CompanyFormPage = lazy(() => import('@/features/companies/CompanyFormPage'));
const CompanyDetailPage = lazy(() => import('@/features/companies/CompanyDetailPage'));
const BranchListPage = lazy(() => import('@/features/branches/BranchListPage'));
const BranchFormPage = lazy(() => import('@/features/branches/BranchFormPage'));
const ClientListPage = lazy(() => import('@/features/clients/ClientListPage'));
const ClientFormPage = lazy(() => import('@/features/clients/ClientFormPage'));
const InvoiceListPage = lazy(() => import('@/features/invoices/InvoiceListPage'));
const InvoiceFormPage = lazy(() => import('@/features/invoices/InvoiceFormPage'));
const InvoiceDetailPage = lazy(() => import('@/features/invoices/InvoiceDetailPage'));
const BoletaListPage = lazy(() => import('@/features/boletas/BoletaListPage'));
const BoletaFormPage = lazy(() => import('@/features/boletas/BoletaFormPage'));
const BoletaDetailPage = lazy(() => import('@/features/boletas/BoletaDetailPage'));
const CreditNoteListPage = lazy(() => import('@/features/credit-notes/CreditNoteListPage'));
const CreditNoteFormPage = lazy(() => import('@/features/credit-notes/CreditNoteFormPage'));
const CreditNoteDetailPage = lazy(() => import('@/features/credit-notes/CreditNoteDetailPage'));
const DebitNoteListPage = lazy(() => import('@/features/debit-notes/DebitNoteListPage'));
const DebitNoteFormPage = lazy(() => import('@/features/debit-notes/DebitNoteFormPage'));
const DebitNoteDetailPage = lazy(() => import('@/features/debit-notes/DebitNoteDetailPage'));
const DispatchGuideListPage = lazy(() => import('@/features/dispatch-guides/DispatchGuideListPage'));
const DispatchGuideFormPage = lazy(() => import('@/features/dispatch-guides/DispatchGuideFormPage'));
const DispatchGuideDetailPage = lazy(() => import('@/features/dispatch-guides/DispatchGuideDetailPage'));
const TransportistListPage = lazy(() => import('@/features/transportists/TransportistListPage'));
const TransportistFormPage = lazy(() => import('@/features/transportists/TransportistFormPage'));
const VehicleListPage = lazy(() => import('@/features/vehicles/VehicleListPage'));
const VehicleFormPage = lazy(() => import('@/features/vehicles/VehicleFormPage'));
const DriverListPage = lazy(() => import('@/features/drivers/DriverListPage'));
const DriverFormPage = lazy(() => import('@/features/drivers/DriverFormPage'));
const DailySummaryListPage = lazy(() => import('@/features/daily-summaries/DailySummaryListPage'));
const DailySummaryDetailPage = lazy(() => import('@/features/daily-summaries/DailySummaryDetailPage'));
const VoidedDocumentListPage = lazy(() => import('@/features/voided-documents/VoidedDocumentListPage'));
const VoidedDocumentDetailPage = lazy(() => import('@/features/voided-documents/VoidedDocumentDetailPage'));
const AnulacionesPage = lazy(() => import('@/features/anulaciones/AnulacionesPage'));
const NotaVentaListPage = lazy(() => import('@/features/nota-ventas/NotaVentaListPage'));
const NotaVentaFormPage = lazy(() => import('@/features/nota-ventas/NotaVentaFormPage'));
const NotaVentaDetailPage = lazy(() => import('@/features/nota-ventas/NotaVentaDetailPage'));
const CotizacionListPage = lazy(() => import('@/features/cotizaciones/CotizacionListPage'));
const CotizacionFormPage = lazy(() => import('@/features/cotizaciones/CotizacionFormPage'));
const CotizacionDetailPage = lazy(() => import('@/features/cotizaciones/CotizacionDetailPage'));
const RetentionListPage = lazy(() => import('@/features/retentions/RetentionListPage'));
const RetentionFormPage = lazy(() => import('@/features/retentions/RetentionFormPage'));
const RetentionDetailPage = lazy(() => import('@/features/retentions/RetentionDetailPage'));
const ConsultaCpePage = lazy(() => import('@/features/consulta-cpe/ConsultaCpePage'));
const BancarizacionPage = lazy(() => import('@/features/bancarizacion/BancarizacionPage'));
const PlazoAlertPage = lazy(() => import('@/features/plazo-alerts/PlazoAlertPage'));
const UserListPage = lazy(() => import('@/features/users/UserListPage'));
const UserFormPage = lazy(() => import('@/features/users/UserFormPage'));
const WebhookListPage = lazy(() => import('@/features/webhooks/WebhookListPage'));
const WebhookFormPage = lazy(() => import('@/features/webhooks/WebhookFormPage'));
const WebhookDetailPage = lazy(() => import('@/features/webhooks/WebhookDetailPage'));
const CatalogPage = lazy(() => import('@/features/catalogs/CatalogPage'));
const CompanyConfigPage = lazy(() => import('@/features/config/CompanyConfigPage'));
const GreCredentialsPage = lazy(() => import('@/features/config/GreCredentialsPage'));
const SetupPage = lazy(() => import('@/features/setup/SetupPage'));
const MyApiTokenPage = lazy(() => import('@/features/settings/MyApiTokenPage'));
const ApiDocsPage = lazy(() => import('@/features/settings/ApiDocsPage'));
const SystemSettingsPage = lazy(() => import('@/features/system-settings/SystemSettingsPage'));
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <Spin size="large" />
    </div>
  );
}

const ConsultaDocumentoPage = lazy(() => import('@/features/public/ConsultaDocumentoPage'));

export const router = createBrowserRouter([
  {
    path: '/consulta/:ruc/:tipoDoc/:serieCorrelativo',
    element: <Suspense fallback={<Loading />}><ConsultaDocumentoPage /></Suspense>,
  },
  {
    path: '/registro',
    element: <Suspense fallback={<Loading />}><LandingPage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={<Loading />}><LoginPage /></Suspense>,
  },
  {
    path: '/setup',
    element: <Suspense fallback={<Loading />}><SetupPage /></Suspense>,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },

      // Ventas
      { path: 'invoices', element: <Suspense fallback={<Loading />}><InvoiceListPage /></Suspense> },
      { path: 'invoices/new', element: <Suspense fallback={<Loading />}><InvoiceFormPage /></Suspense> },
      { path: 'invoices/:id', element: <Suspense fallback={<Loading />}><InvoiceDetailPage /></Suspense> },
      { path: 'boletas', element: <Suspense fallback={<Loading />}><BoletaListPage /></Suspense> },
      { path: 'boletas/new', element: <Suspense fallback={<Loading />}><BoletaFormPage /></Suspense> },
      { path: 'boletas/:id', element: <Suspense fallback={<Loading />}><BoletaDetailPage /></Suspense> },
      { path: 'credit-notes', element: <Suspense fallback={<Loading />}><CreditNoteListPage /></Suspense> },
      { path: 'credit-notes/new', element: <Suspense fallback={<Loading />}><CreditNoteFormPage /></Suspense> },
      { path: 'credit-notes/:id', element: <Suspense fallback={<Loading />}><CreditNoteDetailPage /></Suspense> },
      { path: 'debit-notes', element: <Suspense fallback={<Loading />}><DebitNoteListPage /></Suspense> },
      { path: 'debit-notes/new', element: <Suspense fallback={<Loading />}><DebitNoteFormPage /></Suspense> },
      { path: 'debit-notes/:id', element: <Suspense fallback={<Loading />}><DebitNoteDetailPage /></Suspense> },

      // Pre-venta
      { path: 'nota-ventas', element: <Suspense fallback={<Loading />}><NotaVentaListPage /></Suspense> },
      { path: 'nota-ventas/new', element: <Suspense fallback={<Loading />}><NotaVentaFormPage /></Suspense> },
      { path: 'nota-ventas/:id', element: <Suspense fallback={<Loading />}><NotaVentaDetailPage /></Suspense> },
      { path: 'cotizaciones', element: <Suspense fallback={<Loading />}><CotizacionListPage /></Suspense> },
      { path: 'cotizaciones/new', element: <Suspense fallback={<Loading />}><CotizacionFormPage /></Suspense> },
      { path: 'cotizaciones/:id', element: <Suspense fallback={<Loading />}><CotizacionDetailPage /></Suspense> },

      // Despacho
      { path: 'dispatch-guides', element: <Suspense fallback={<Loading />}><DispatchGuideListPage /></Suspense> },
      { path: 'dispatch-guides/new', element: <Suspense fallback={<Loading />}><DispatchGuideFormPage /></Suspense> },
      { path: 'dispatch-guides/:id', element: <Suspense fallback={<Loading />}><DispatchGuideDetailPage /></Suspense> },
      { path: 'dispatch-guides/:id/edit', element: <Suspense fallback={<Loading />}><DispatchGuideFormPage /></Suspense> },
      { path: 'transportists', element: <Suspense fallback={<Loading />}><TransportistListPage /></Suspense> },
      { path: 'transportists/new', element: <Suspense fallback={<Loading />}><TransportistFormPage /></Suspense> },
      { path: 'transportists/:id/edit', element: <Suspense fallback={<Loading />}><TransportistFormPage /></Suspense> },
      { path: 'vehicles', element: <Suspense fallback={<Loading />}><VehicleListPage /></Suspense> },
      { path: 'vehicles/new', element: <Suspense fallback={<Loading />}><VehicleFormPage /></Suspense> },
      { path: 'vehicles/:id/edit', element: <Suspense fallback={<Loading />}><VehicleFormPage /></Suspense> },
      { path: 'drivers', element: <Suspense fallback={<Loading />}><DriverListPage /></Suspense> },
      { path: 'drivers/new', element: <Suspense fallback={<Loading />}><DriverFormPage /></Suspense> },
      { path: 'drivers/:id/edit', element: <Suspense fallback={<Loading />}><DriverFormPage /></Suspense> },

      // Procesos SUNAT
      { path: 'anulaciones', element: <Suspense fallback={<Loading />}><AnulacionesPage /></Suspense> },
      { path: 'daily-summaries', element: <Suspense fallback={<Loading />}><DailySummaryListPage /></Suspense> },
      { path: 'daily-summaries/:id', element: <Suspense fallback={<Loading />}><DailySummaryDetailPage /></Suspense> },
      { path: 'voided-documents', element: <Suspense fallback={<Loading />}><VoidedDocumentListPage /></Suspense> },
      { path: 'voided-documents/:id', element: <Suspense fallback={<Loading />}><VoidedDocumentDetailPage /></Suspense> },
      { path: 'consulta-cpe', element: <Suspense fallback={<Loading />}><ConsultaCpePage /></Suspense> },

      // Retenciones
      { path: 'retentions', element: <Suspense fallback={<Loading />}><RetentionListPage /></Suspense> },
      { path: 'retentions/new', element: <Suspense fallback={<Loading />}><RetentionFormPage /></Suspense> },
      { path: 'retentions/:id', element: <Suspense fallback={<Loading />}><RetentionDetailPage /></Suspense> },

      // Administracion
      { path: 'companies', element: <Suspense fallback={<Loading />}><CompanyListPage /></Suspense> },
      { path: 'companies/new', element: <PermissionRoute permission="companies.create"><Suspense fallback={<Loading />}><CompanyFormPage /></Suspense></PermissionRoute> },
      { path: 'companies/:id', element: <Suspense fallback={<Loading />}><CompanyDetailPage /></Suspense> },
      { path: 'companies/:id/edit', element: <PermissionRoute permission="companies.update"><Suspense fallback={<Loading />}><CompanyFormPage /></Suspense></PermissionRoute> },
      { path: 'branches', element: <Suspense fallback={<Loading />}><BranchListPage /></Suspense> },
      { path: 'branches/new', element: <Suspense fallback={<Loading />}><BranchFormPage /></Suspense> },
      { path: 'branches/:id/edit', element: <Suspense fallback={<Loading />}><BranchFormPage /></Suspense> },
      { path: 'clients', element: <Suspense fallback={<Loading />}><ClientListPage /></Suspense> },
      { path: 'clients/new', element: <Suspense fallback={<Loading />}><ClientFormPage /></Suspense> },
      { path: 'clients/:id/edit', element: <Suspense fallback={<Loading />}><ClientFormPage /></Suspense> },
      { path: 'users', element: <PermissionRoute permission="users.view"><Suspense fallback={<Loading />}><UserListPage /></Suspense></PermissionRoute> },
      { path: 'users/new', element: <PermissionRoute permission="users.create"><Suspense fallback={<Loading />}><UserFormPage /></Suspense></PermissionRoute> },
      { path: 'users/:id/edit', element: <PermissionRoute permission="users.update"><Suspense fallback={<Loading />}><UserFormPage /></Suspense></PermissionRoute> },

      // Configuracion
      { path: 'config', element: <PermissionRoute permission="config.manage"><Suspense fallback={<Loading />}><CompanyConfigPage /></Suspense></PermissionRoute> },
      { path: 'config/gre-credentials', element: <PermissionRoute permission="config.manage"><Suspense fallback={<Loading />}><GreCredentialsPage /></Suspense></PermissionRoute> },
      { path: 'webhooks', element: <PermissionRoute permission="config.manage"><Suspense fallback={<Loading />}><WebhookListPage /></Suspense></PermissionRoute> },
      { path: 'webhooks/new', element: <PermissionRoute permission="config.manage"><Suspense fallback={<Loading />}><WebhookFormPage /></Suspense></PermissionRoute> },
      { path: 'webhooks/:id', element: <PermissionRoute permission="config.manage"><Suspense fallback={<Loading />}><WebhookDetailPage /></Suspense></PermissionRoute> },
      { path: 'catalogs', element: <Suspense fallback={<Loading />}><CatalogPage /></Suspense> },
      { path: 'system-settings', element: <PermissionRoute permission="system.config"><Suspense fallback={<Loading />}><SystemSettingsPage /></Suspense></PermissionRoute> },

      // Alertas
      { path: 'plazo-alerts', element: <Suspense fallback={<Loading />}><PlazoAlertPage /></Suspense> },
      { path: 'bancarizacion', element: <Suspense fallback={<Loading />}><BancarizacionPage /></Suspense> },

      // Settings / API integration
      { path: 'settings/api-token', element: <Suspense fallback={<Loading />}><MyApiTokenPage /></Suspense> },
      { path: 'api-docs', element: <Suspense fallback={<Loading />}><ApiDocsPage /></Suspense> },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

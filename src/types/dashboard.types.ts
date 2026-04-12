export interface MonthlyChartData {
  name: string;
  facturas: number;
  boletas: number;
}

export interface DashboardStatistics {
  filters: {
    company_id: number | null;
    branch_id: number | null;
    start_date: string;
    end_date: string;
  };
  totals_pen: TotalsByPeriod;
  totals_usd: TotalsByPeriod;
  monthly_chart: MonthlyChartData[];
  top_clients: TopClient[];
  pending_documents: PendingDocument[];
  expiring_invoices: ExpiringInvoice[];
}

export interface TotalsByPeriod {
  total_facturas: number;
  total_boletas: number;
  total_nc: number;
  total_nd: number;
  count_facturas: number;
  count_boletas: number;
  count_nc: number;
  count_nd: number;
}

export interface TopClient {
  client_id: number;
  client_name: string;
  total_revenue: number;
  count: number;
}

export interface PendingDocument {
  id: number;
  numero_completo: string;
  cliente: string;
  monto: number;
  estado_sunat: string;
  fecha_emision: string;
  tipo: string;
}

export interface ExpiringInvoice {
  id: number;
  numero_completo: string;
  cliente: string;
  dias_para_vencer: number;
  fecha_vencimiento: string;
}

export interface MonthlySummary {
  filters: {
    company_id: number | null;
    branch_id: number | null;
    year: number;
    month: number;
  };
  summary: Record<string, unknown>;
}

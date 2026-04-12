export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  timeoutSunatSend: 60000,
  timeoutFileDownload: 45000,
} as const;

export const RATE_LIMITS = {
  general: 60,
  sunatSend: 10,
  cpeConsulta: 30,
  auth: 5,
} as const;

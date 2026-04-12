import apiClient from '@/lib/axios';

export interface SystemSettings {
  grouped: Record<string, Array<{ key: string; value: string; description: string }>>;
  flat: Record<string, string>;
}

export const systemSettingsService = {
  getAll: async (): Promise<SystemSettings> => {
    const res = await apiClient.get('/v1/system-settings');
    return res.data.data;
  },

  update: async (settings: Record<string, string>): Promise<void> => {
    await apiClient.put('/v1/system-settings', { settings });
  },

  getStatus: async (): Promise<SystemStatus> => {
    const res = await apiClient.get('/v1/system-settings/status');
    return res.data.data;
  },
};

export interface SystemStatus {
  database: string;
  environment: string;
  sunat_env: string;
  roles: {
    total: number;
    missing: string[];
    complete: boolean;
    list: Array<{ id: number; name: string; display_name: string; is_system: boolean; active: boolean; users_count: number }>;
  };
  counts: { users: number; companies: number; super_admins: number };
  tables: Record<string, boolean>;
  beta_certificate: boolean;
  db_status: { connected: boolean; version?: string; size_mb?: number; error?: string };
  redis_status: { connected: boolean; memory?: string; keys?: number; db?: number; prefix?: string; error?: string };
  queue_status: { pending_jobs: number; failed_jobs: number };
  storage_status: { path: string; writable: boolean; disk_free_mb: number; disk_total_mb: number };
  php_status: { version: string; extensions: Record<string, boolean>; memory_limit: string; max_execution_time: string; upload_max_filesize: string };
  pending_migrations: string[];
  sunat_endpoints: Array<{ name: string; url: string; reachable: boolean; http_code?: number; latency_ms?: number; error?: string | null }>;
}

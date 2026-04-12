import apiClient from '@/lib/axios';

export const systemService = {
  health: async (): Promise<unknown> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  ping: async (): Promise<unknown> => {
    const response = await apiClient.get('/ping');
    return response.data;
  },
  systemInfo: async (): Promise<unknown> => {
    const response = await apiClient.get('/system/info');
    return response.data;
  },
};

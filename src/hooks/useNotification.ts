import { message } from 'antd';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

export function useNotification() {
  const success = (msg: string) => {
    message.success(msg);
  };

  const error = (msg: string) => {
    message.error(msg);
  };

  const warning = (msg: string) => {
    message.warning(msg);
  };

  const handleApiError = (err: unknown, defaultMsg = 'Ocurrio un error') => {
    const axiosError = err as AxiosError<ApiError>;
    const msg = axiosError.response?.data?.message || defaultMsg;

    if (axiosError.response?.status === 429) {
      message.warning('Demasiadas solicitudes. Espere un momento.');
    } else if (axiosError.response?.status === 422) {
      const errors = axiosError.response.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        message.error(firstError || msg);
      } else {
        message.error(msg);
      }
    } else {
      message.error(msg);
    }
  };

  return { success, error, warning, handleApiError };
}

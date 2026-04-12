import type { Moneda } from '@/types/common.types';
import dayjs from '@/lib/dayjs';

export function formatMoney(amount: number | null | undefined, moneda: Moneda = 'PEN'): string {
  const symbol = moneda === 'PEN' ? 'S/' : 'US$';
  const value = amount ?? 0;
  return `${symbol} ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  const num = value ?? 0;
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(date: string | null | undefined, format = 'DD/MM/YYYY'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatDocumentNumber(serie: string, correlativo: number): string {
  return `${serie}-${String(correlativo).padStart(8, '0')}`;
}

export function formatRuc(ruc: string): string {
  return ruc.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3');
}

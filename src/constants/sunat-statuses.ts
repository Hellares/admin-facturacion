import type { SunatStatus } from '@/types/common.types';

/**
 * Estados SUNAT de un documento electronico.
 * Usar estas constantes en lugar de strings hardcodeadas para mantener single source of truth.
 */
export const SUNAT_STATUS = {
  PENDIENTE: 'PENDIENTE',
  ENVIANDO: 'ENVIANDO',
  ENVIADO: 'ENVIADO',
  PROCESANDO: 'PROCESANDO',
  ACEPTADO: 'ACEPTADO',
  RECHAZADO: 'RECHAZADO',
  ERROR: 'ERROR',
} as const satisfies Record<SunatStatus, SunatStatus>;

/**
 * Lista de todos los estados validos (util para filtros UI, validaciones).
 */
export const SUNAT_STATUS_VALUES: SunatStatus[] = Object.values(SUNAT_STATUS);

/**
 * Estados que indican que el documento esta en flujo de envio (no terminal).
 */
export const SUNAT_STATUS_IN_PROGRESS: SunatStatus[] = [
  SUNAT_STATUS.PENDIENTE,
  SUNAT_STATUS.ENVIANDO,
  SUNAT_STATUS.ENVIADO,
  SUNAT_STATUS.PROCESANDO,
];

/**
 * Estados terminales que requieren accion del usuario.
 */
export const SUNAT_STATUS_ERROR: SunatStatus[] = [
  SUNAT_STATUS.RECHAZADO,
  SUNAT_STATUS.ERROR,
];

/**
 * Etiqueta legible para UI.
 */
export const SUNAT_STATUS_LABELS: Record<SunatStatus, string> = {
  PENDIENTE: 'Pendiente',
  ENVIANDO: 'Enviando',
  ENVIADO: 'Enviado',
  PROCESANDO: 'Procesando',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
  ERROR: 'Error',
};

/**
 * Options para Ant Design Select.
 */
export const SUNAT_STATUS_OPTIONS = SUNAT_STATUS_VALUES.map((value) => ({
  value,
  label: SUNAT_STATUS_LABELS[value],
}));

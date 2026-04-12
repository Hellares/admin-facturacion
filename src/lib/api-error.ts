import { message as antdMessage } from 'antd';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

/**
 * Error normalizado a partir de cualquier respuesta del backend.
 * Permite renderizar toasts consistentes en todo el frontend.
 */
export interface NormalizedApiError {
  /** Mensaje humano listo para mostrar. Nunca vacio. */
  message: string;
  /** Codigo de error de negocio: COMPANY_ACCESS_DENIED, NOT_FOUND, 2335 (SUNAT), etc. */
  code?: string;
  /** HTTP status (422, 403, 500, ...). 0 si fue error de red. */
  httpStatus: number;
  /** Errores por campo del Laravel FormRequest (validacion 422). */
  fieldErrors?: Record<string, string[]>;
  /** Primer error de campo concatenado para mostrar rapido. */
  firstFieldError?: string;
  /** True si parece un rechazo SUNAT real (codigo numerico, estructura conocida). */
  isSunatRejection: boolean;
}

/**
 * Extrae los detalles de un error axios/fetch sin perder informacion.
 *
 * Soporta estas respuestas del backend:
 * - FormRequest 422: `{ success:false, message, errors:{campo:[...]} }`
 * - Middleware 403: `{ success:false, message, error_code:"COMPANY_ACCESS_DENIED" }`
 * - SunatException 400/500: `{ success:false, message, error_code:"2335", timestamp }`
 * - NotFound 404: `{ success:false, message, error:{...} }`
 * - Errores genericos 500: respuesta arbitraria o HTML (Laravel error page)
 * - Errores de red (timeout, CORS, offline): sin respuesta
 */
export function extractApiError(err: unknown, fallback = 'Ocurrio un error'): NormalizedApiError {
  // Caso 1: No es un AxiosError — devolver fallback
  if (!isAxiosError(err)) {
    const msg = err instanceof Error ? err.message : fallback;
    return {
      message: msg || fallback,
      httpStatus: 0,
      isSunatRejection: false,
    };
  }

  const status = err.response?.status ?? 0;
  const body = err.response?.data as Partial<ApiError> | string | undefined;

  // Caso 2: Respuesta HTML (ej. Laravel error page en produccion) — body es string
  if (typeof body === 'string') {
    return {
      message: `Error ${status}: el servidor devolvio una respuesta no procesable`,
      httpStatus: status,
      isSunatRejection: false,
    };
  }

  // Caso 3: Error de red sin respuesta
  if (!body) {
    return {
      message: err.message || fallback,
      httpStatus: status,
      isSunatRejection: false,
    };
  }

  // Caso 4: Respuesta JSON estructurada
  const baseMessage = (body.message || fallback).toString();
  const code = body.error_code;
  const fieldErrors = body.errors;

  const firstFieldError = fieldErrors
    ? Object.values(fieldErrors).flat().find((v): v is string => typeof v === 'string' && v.length > 0)
    : undefined;

  const isSunatRejection =
    !!code &&
    // SUNAT error codes are typically numeric strings like "2335", "3206"
    /^\d{2,5}$/.test(code);

  // Construir mensaje final
  let finalMessage = baseMessage;
  if (isSunatRejection && !baseMessage.includes(code!)) {
    finalMessage = `SUNAT ${code}: ${baseMessage}`;
  } else if (firstFieldError && firstFieldError !== baseMessage) {
    finalMessage = firstFieldError;
  }

  return {
    message: finalMessage,
    code,
    httpStatus: status,
    fieldErrors,
    firstFieldError,
    isSunatRejection,
  };
}

/**
 * Muestra un toast con el mensaje de error mas informativo posible.
 * Usar en lugar de `message.error('generico')` en los catch blocks.
 *
 * @example
 *   try { await apiClient.post(...) }
 *   catch (err) { showApiError(err, 'Error al crear factura') }
 */
export function showApiError(err: unknown, fallback = 'Ocurrio un error'): NormalizedApiError {
  const normalized = extractApiError(err, fallback);

  // Para rechazos SUNAT o errores con codigo, mostramos mas tiempo en pantalla
  const duration = normalized.isSunatRejection || normalized.httpStatus >= 500 ? 8 : 5;

  antdMessage.error({
    content: normalized.message,
    duration,
  });

  return normalized;
}

/**
 * Type guard: detecta si un error es AxiosError sin importar axios.
 * Evita dependencia directa y funciona con errores rehidratados.
 */
function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('isAxiosError' in err || 'response' in err || 'request' in err) &&
    typeof (err as { message?: unknown }).message === 'string'
  );
}

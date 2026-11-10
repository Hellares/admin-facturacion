/**
 * Información resumida de la respuesta SUNAT (código + descripción).
 */
export interface SunatInfo {
  codigo?: string | number | null;
  descripcion?: string | null;
  notas?: string[] | null;
}

/**
 * Normaliza la respuesta SUNAT, que según el endpoint puede llegar como:
 *  - objeto `{ codigo, descripcion, notas }` — facturas/boletas/guías (`data.sunat`)
 *  - string JSON crudo `{"code"|"codigo", "description"|"message"|"descripcion", ...}`
 *    — resúmenes diarios / comunicaciones de baja (`respuesta_sunat` sin transformar)
 *  - string plano (leyenda legacy)
 *
 * Devuelve siempre `{ codigo, descripcion, notas }` o null si no hay info útil.
 */
export function parseSunatInfo(
  raw: SunatInfo | string | null | undefined,
): SunatInfo | null {
  if (!raw) return null;

  if (typeof raw === 'object') {
    if (raw.codigo == null && !raw.descripcion) return null;
    return raw;
  }

  const text = raw.trim();
  if (!text) return null;

  // String que parece JSON (respuesta_sunat crudo) → parsear y mapear llaves.
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const obj = JSON.parse(text);
      const codigo = obj.codigo ?? obj.code ?? null;
      const descripcion =
        obj.descripcion ?? obj.description ?? obj.message ?? obj.error ?? null;
      const notas = obj.notas ?? obj.notes ?? null;
      if (codigo == null && !descripcion) return { descripcion: text };
      return { codigo, descripcion, notas };
    } catch {
      return { descripcion: text };
    }
  }

  // Leyenda plana.
  return { descripcion: text };
}

/**
 * ¿Se puede reenviar el mismo comprobante tras un RECHAZADO?
 * Solo los rechazos por validación de SUNAT (2000–3999) obligan a emitir uno
 * nuevo. Cortes de conexión ("HTTP"), excepciones (0100–1999, ej. 0110 usuario
 * SOL) y errores internos no llegaron a validarse: el número no se quemó.
 * Sin código no se sabe, así que no se ofrece.
 */
export function isRechazoReenviable(codigo: string | number | null | undefined): boolean {
  if (codigo == null || String(codigo).trim() === '') return false;
  const n = Number(codigo);
  if (!Number.isInteger(n)) return true;
  return n < 2000 || n > 3999;
}

/**
 * Texto de una línea para mostrar la respuesta SUNAT (ej. "SUNAT 2335: ...").
 */
export function formatSunatInfo(
  raw: SunatInfo | string | null | undefined,
): string | null {
  const info = parseSunatInfo(raw);
  if (!info || !info.descripcion) return null;
  const codigo = info.codigo != null ? String(info.codigo) : '';
  return codigo ? `SUNAT ${codigo}: ${info.descripcion}` : info.descripcion;
}

// --- Actualización automática del estado SUNAT ---------------------------------
// El envío a SUNAT corre en segundo plano: mientras el documento esté en estos estados,
// la pantalla vuelve a consultar sola. PENDIENTE no: espera un resumen diario o un envío manual.
const SE_ACTUALIZA_SOLO: string[] = ['EN_COLA', 'ENVIANDO', 'ENVIADO', 'PROCESANDO'];
const INTERVALO_MS = 3000;
const MAX_CONSULTAS = 40; // ~2 minutos; si SUNAT tarda más, basta con recargar

type EstadoQuery<T> = { state: { data?: T; dataUpdateCount: number } };

/** refetchInterval para el detalle de un comprobante. */
export function refrescarMientrasSeEnvia(query: EstadoQuery<{ estado_sunat?: string }>): number | false {
  const { data, dataUpdateCount } = query.state;
  return SE_ACTUALIZA_SOLO.includes(data?.estado_sunat ?? '') && dataUpdateCount < MAX_CONSULTAS ? INTERVALO_MS : false;
}

/** refetchInterval para una lista: mientras alguna fila esté en envío. */
export function refrescarListaMientrasSeEnvia(query: EstadoQuery<{ data?: { estado_sunat?: string }[] }>): number | false {
  const { data, dataUpdateCount } = query.state;
  const hayEnEnvio = (data?.data ?? []).some((d) => SE_ACTUALIZA_SOLO.includes(d.estado_sunat ?? ''));
  return hayEnEnvio && dataUpdateCount < MAX_CONSULTAS ? INTERVALO_MS : false;
}

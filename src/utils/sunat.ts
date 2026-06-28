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

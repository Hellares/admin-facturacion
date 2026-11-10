export type TipoComprobante = '01' | '03' | '07' | '08';

const NOMBRE_COMPROBANTE: Record<TipoComprobante, string> = {
  '01': 'Factura Electrónica',
  '03': 'Boleta de Venta Electrónica',
  '07': 'Nota de Crédito Electrónica',
  '08': 'Nota de Débito Electrónica',
};

/**
 * Deja solo dígitos y antepone 51 a un celular peruano de 9 dígitos.
 * Devuelve null si no parece un número de WhatsApp válido.
 */
export function normalizarCelular(valor: string | null | undefined): string | null {
  const digitos = (valor ?? '').replace(/\D/g, '');
  if (/^9\d{8}$/.test(digitos)) return `51${digitos}`;
  if (/^\d{10,15}$/.test(digitos)) return digitos;
  return null;
}

/** Link público de descarga del PDF (consulta pública de Syncrofact). */
export function linkPdfPublico(origen: string, ruc: string, tipo: TipoComprobante, numero: string): string {
  return `${origen}/consulta/${ruc}/${tipo}/${numero}/pdf`;
}

export function mensajeComprobante(args: {
  cliente: string;
  empresa: string;
  tipo: TipoComprobante;
  numero: string;
  total: string;
  link: string;
}): string {
  return [
    `Hola ${args.cliente}, ${args.empresa} le envía su ${NOMBRE_COMPROBANTE[args.tipo]} ${args.numero} por ${args.total}.`,
    '',
    `Puede descargar el PDF aquí: ${args.link}`,
    '',
    'Gracias por su preferencia.',
  ].join('\n');
}

export function urlWhatsApp(celular: string, mensaje: string): string {
  return `https://wa.me/${celular}?text=${encodeURIComponent(mensaje)}`;
}

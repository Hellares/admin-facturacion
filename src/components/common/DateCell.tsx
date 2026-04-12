import { formatDate, formatDateTime } from '@/utils/format';

/**
 * Celda compacta para mostrar fechas en tablas de datos.
 *
 * Reduce el tamaño de letra en 1px respecto al default de la tabla y previene
 * el wrapping del texto con whiteSpace: nowrap. Esto evita que una fecha como
 * "11/04/2026" aparezca partida en dos lineas cuando la columna es ajustada.
 *
 * Uso en una columna de Ant Design Table:
 *   { title: 'Fecha', dataIndex: 'fecha_emision', width: 110,
 *     render: (d: string) => <DateCell value={d} /> }
 */
interface DateCellProps {
  value: string | null | undefined;
  /** Si es true, muestra fecha y hora (DD/MM/YYYY HH:mm). Default: solo fecha. */
  withTime?: boolean;
}

export default function DateCell({ value, withTime = false }: DateCellProps) {
  const text = withTime ? formatDateTime(value) : formatDate(value);
  return (
    <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

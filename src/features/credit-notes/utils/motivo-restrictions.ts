import type { ItemsTableRestrictions } from '@/components/forms/ItemsTable';

/**
 * Reglas de edicion de items de Nota de Credito segun el motivo SUNAT (catalogo 09).
 * La premisa es que una NC nunca puede agregar items que no estaban en la factura original.
 */
export function getCreditNoteItemRestrictions(codMotivo: string | undefined): {
  restrictions: ItemsTableRestrictions;
  aviso: string | null;
} {
  switch (codMotivo) {
    case '01': // Anulacion de la operacion
    case '02': // Anulacion por error en el RUC
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: false,
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: true,
          lockPrecio: true,
          lockIgv: true,
        },
        aviso: 'Los items se copian tal cual de la factura afectada. No puedes editar nada.',
      };

    case '03': // Correccion por error en la descripcion
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: false,
          lockCodigo: true,
          lockDescripcion: false, // unica editable
          lockUnidad: true,
          lockCantidad: true,
          lockPrecio: true,
          lockIgv: true,
        },
        aviso: 'Solo puedes editar la descripcion de cada item (Motivo 03 - Correccion de descripcion).',
      };

    case '04': // Descuento global
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: false,
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: true,
          lockPrecio: true,
          lockIgv: true,
        },
        aviso: 'Los items se mantienen igual. El descuento global se aplica fuera de la tabla.',
      };

    case '05': // Descuento por item
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: true, // eliminar items sin descuento
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: false, // ajustar cantidad afectada
          lockPrecio: false, // monto del descuento por item
          lockIgv: true,
        },
        aviso: 'Descuento por item: elimina los items sin descuento, ajusta cantidad y precio del descuento aplicado.',
      };

    case '06': // Devolucion total
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: false,
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: true,
          lockPrecio: true,
          lockIgv: true,
        },
        aviso: 'Devolucion total: los items se copian exactamente de la factura, sin modificar.',
      };

    case '07': // Devolucion por item (parcial)
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: true, // puedes eliminar los que no se devuelven
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: false, // puedes reducir la cantidad devuelta
          lockPrecio: true,
          lockIgv: true,
        },
        aviso: 'Devolucion parcial: elimina los items que NO se devuelven y ajusta la cantidad de los que se devolvieron parcialmente.',
      };

    case '09': // Disminucion en el valor
      return {
        restrictions: {
          allowAdd: false,
          allowDelete: false,
          lockCodigo: true,
          lockDescripcion: true,
          lockUnidad: true,
          lockCantidad: true,
          lockPrecio: false, // solo puedes ajustar el precio a la baja
          lockIgv: true,
        },
        aviso: 'Disminucion de valor: solo puedes ajustar el precio unitario (a la baja).',
      };

    case '08': // Bonificacion
    case '10': // Otros conceptos
    case '11': // Ajustes de operaciones de exportacion
    case '12': // Ajustes afectos al IVAP
    case '13': // Ajustes - montos y/o fechas de pago
      return {
        restrictions: {
          allowAdd: true,
          allowDelete: true,
        },
        aviso: null,
      };

    default:
      // Sin motivo seleccionado aun: comportamiento libre (igual al de factura)
      return {
        restrictions: {
          allowAdd: true,
          allowDelete: true,
        },
        aviso: null,
      };
  }
}

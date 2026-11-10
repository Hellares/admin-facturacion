import type { DetalleItem, TipoAfectacionIGV } from '@/types/common.types';
import { IGV_PORCENTAJE_DEFAULT } from './constants';

export interface ItemTotals {
  mto_valor_unitario: number;
  mto_precio_unitario: number;
  mto_valor_venta: number;
  mto_base_igv: number;
  igv: number;
  isc: number;
  icbper: number;
  total_impuestos: number;
  total_item: number;
}

export interface DocumentTotals {
  mto_oper_gravadas: number;
  mto_oper_exoneradas: number;
  mto_oper_inafectas: number;
  mto_oper_gratuitas: number;
  mto_igv: number;
  mto_isc: number;
  mto_icbper: number;
  valor_venta: number;
  sub_total: number;
  mto_imp_venta: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isGravado(tip: TipoAfectacionIGV): boolean {
  return tip >= '10' && tip <= '17';
}

function isExonerado(tip: TipoAfectacionIGV): boolean {
  return tip === '20' || tip === '21';
}

function isInafecto(tip: TipoAfectacionIGV): boolean {
  return tip >= '30' && tip <= '37';
}

function isGratuito(tip: TipoAfectacionIGV): boolean {
  const gratuitos: TipoAfectacionIGV[] = ['11', '12', '13', '14', '15', '16', '21', '31', '32', '33', '34', '35', '36', '37'];
  return gratuitos.includes(tip);
}

// Igual que el backend (DocumentService::calculateTotals): todo con decimales completos y se
// redondea solo al mostrar. Redondear el valor unitario antes mostraba 2 x 8.90 = 17.79.
export function calculateItemTotals(item: Partial<DetalleItem>): ItemTotals {
  const raw = calculateItemRaw(item);
  return {
    mto_valor_unitario: raw.mto_valor_unitario,
    mto_precio_unitario: raw.mto_precio_unitario,
    mto_valor_venta: round2(raw.mto_valor_venta),
    mto_base_igv: round2(raw.mto_base_igv),
    igv: round2(raw.igv),
    isc: round2(raw.isc),
    icbper: round2(raw.icbper),
    total_impuestos: round2(raw.total_impuestos),
    total_item: round2(raw.total_item),
  };
}

function calculateItemRaw(item: Partial<DetalleItem>): ItemTotals {
  const cantidad = item.cantidad || 0;
  const porcentajeIgv = item.porcentaje_igv ?? IGV_PORCENTAJE_DEFAULT;
  const tipAfeIgv = item.tip_afe_igv || '10';

  let mtoValorUnitario: number;
  let mtoPrecioUnitario: number;

  if (item.mto_valor_unitario != null && item.mto_valor_unitario > 0) {
    mtoValorUnitario = item.mto_valor_unitario;
    mtoPrecioUnitario = isGravado(tipAfeIgv)
      ? round2(mtoValorUnitario * (1 + porcentajeIgv / 100))
      : mtoValorUnitario;
  } else if (item.mto_precio_unitario != null && item.mto_precio_unitario > 0) {
    mtoPrecioUnitario = item.mto_precio_unitario;
    mtoValorUnitario = isGravado(tipAfeIgv)
      ? mtoPrecioUnitario / (1 + porcentajeIgv / 100)
      : mtoPrecioUnitario;
  } else {
    mtoValorUnitario = 0;
    mtoPrecioUnitario = 0;
  }

  const mtoValorVenta = mtoValorUnitario * cantidad;
  const mtoBaseIgv = mtoValorVenta;

  const igv = isGravado(tipAfeIgv) ? mtoBaseIgv * porcentajeIgv / 100 : 0;

  const isc = item.porcentaje_isc
    ? mtoValorVenta * item.porcentaje_isc / 100
    : 0;

  const icbper = item.factor_icbper
    ? item.factor_icbper * cantidad
    : 0;

  const totalImpuestos = igv + isc + icbper;

  const totalItem = isGratuito(tipAfeIgv) ? 0 : mtoValorVenta + totalImpuestos;

  return {
    mto_valor_unitario: mtoValorUnitario,
    mto_precio_unitario: mtoPrecioUnitario,
    mto_valor_venta: mtoValorVenta,
    mto_base_igv: mtoBaseIgv,
    igv,
    isc,
    icbper,
    total_impuestos: totalImpuestos,
    total_item: totalItem,
  };
}

export function calculateDocumentTotals(items: Partial<DetalleItem>[]): DocumentTotals {
  const totals: DocumentTotals = {
    mto_oper_gravadas: 0,
    mto_oper_exoneradas: 0,
    mto_oper_inafectas: 0,
    mto_oper_gratuitas: 0,
    mto_igv: 0,
    mto_isc: 0,
    mto_icbper: 0,
    valor_venta: 0,
    sub_total: 0,
    mto_imp_venta: 0,
  };

  for (const item of items) {
    const tipAfeIgv = item.tip_afe_igv || '10';
    const itemTotals = calculateItemRaw(item);

    if (isGratuito(tipAfeIgv)) {
      totals.mto_oper_gratuitas += itemTotals.mto_valor_venta;
    } else if (isGravado(tipAfeIgv)) {
      totals.mto_oper_gravadas += itemTotals.mto_valor_venta;
    } else if (isExonerado(tipAfeIgv)) {
      totals.mto_oper_exoneradas += itemTotals.mto_valor_venta;
    } else if (isInafecto(tipAfeIgv)) {
      totals.mto_oper_inafectas += itemTotals.mto_valor_venta;
    }

    totals.mto_igv += itemTotals.igv;
    totals.mto_isc += itemTotals.isc;
    totals.mto_icbper += itemTotals.icbper;
  }

  totals.valor_venta = totals.mto_oper_gravadas + totals.mto_oper_exoneradas + totals.mto_oper_inafectas;
  totals.sub_total = totals.valor_venta + totals.mto_igv + totals.mto_isc;
  totals.mto_imp_venta = totals.sub_total + totals.mto_icbper;

  for (const key of Object.keys(totals) as (keyof DocumentTotals)[]) {
    totals[key] = round2(totals[key]);
  }
  return totals;
}

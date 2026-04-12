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

export function calculateItemTotals(item: Partial<DetalleItem>): ItemTotals {
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
      ? round2(mtoPrecioUnitario / (1 + porcentajeIgv / 100))
      : mtoPrecioUnitario;
  } else {
    mtoValorUnitario = 0;
    mtoPrecioUnitario = 0;
  }

  const mtoValorVenta = round2(mtoValorUnitario * cantidad);
  const mtoBaseIgv = mtoValorVenta;

  const igv = isGravado(tipAfeIgv) ? round2(mtoBaseIgv * porcentajeIgv / 100) : 0;

  const isc = item.porcentaje_isc
    ? round2(mtoValorVenta * item.porcentaje_isc / 100)
    : 0;

  const icbper = item.factor_icbper
    ? round2(item.factor_icbper * cantidad)
    : 0;

  const totalImpuestos = round2(igv + isc + icbper);

  const totalItem = isGratuito(tipAfeIgv) ? 0 : round2(mtoValorVenta + totalImpuestos);

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
    const itemTotals = calculateItemTotals(item);

    if (isGratuito(tipAfeIgv)) {
      totals.mto_oper_gratuitas = round2(totals.mto_oper_gratuitas + itemTotals.mto_valor_venta);
    } else if (isGravado(tipAfeIgv)) {
      totals.mto_oper_gravadas = round2(totals.mto_oper_gravadas + itemTotals.mto_valor_venta);
    } else if (isExonerado(tipAfeIgv)) {
      totals.mto_oper_exoneradas = round2(totals.mto_oper_exoneradas + itemTotals.mto_valor_venta);
    } else if (isInafecto(tipAfeIgv)) {
      totals.mto_oper_inafectas = round2(totals.mto_oper_inafectas + itemTotals.mto_valor_venta);
    }

    totals.mto_igv = round2(totals.mto_igv + itemTotals.igv);
    totals.mto_isc = round2(totals.mto_isc + itemTotals.isc);
    totals.mto_icbper = round2(totals.mto_icbper + itemTotals.icbper);
  }

  totals.valor_venta = round2(
    totals.mto_oper_gravadas + totals.mto_oper_exoneradas + totals.mto_oper_inafectas
  );
  totals.sub_total = round2(totals.valor_venta + totals.mto_igv + totals.mto_isc);
  totals.mto_imp_venta = round2(totals.sub_total + totals.mto_icbper);

  return totals;
}

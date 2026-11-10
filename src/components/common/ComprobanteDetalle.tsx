import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { LeftOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import { formatDate, formatMoney } from '@/utils/format';
import { calculateItemTotals } from '@/utils/tax-calculator';
import { SUNAT_STATUS_LABELS } from '@/constants/sunat-statuses';
import type { ClienteDocumento, DetalleItem, Moneda, SunatStatus } from '@/types/common.types';

const ACENTO = '#1f3a5f';
const ETIQUETA = { fontSize: 11, fontWeight: 600, color: '#1677ff', letterSpacing: 0.3 } as const;
const TARJETA = { background: '#fff', border: '1px solid #e2e7ee', borderRadius: 8 } as const;

export interface DatoDetalle {
  label: string;
  value: ReactNode;
  ancho?: boolean;
}

interface ComprobanteDetalleProps {
  tipoNombre: string;
  numero: string;
  volver: { label: string; path: string };
  fechaEmision: string;
  creadoEn?: string;
  actualizadoEn?: string;
  moneda: Moneda;
  formaPago?: string;
  cliente?: ClienteDocumento;
  detalles: DetalleItem[];
  totales?: { gravada?: number; exonerada?: number; inafecta?: number; igv?: number; isc?: number; total?: number };
  estado: SunatStatus;
  anulado?: boolean;
  respuestaSunat?: string;
  hash?: string;
  /** Botones de acción (PDF, WhatsApp, XML, CDR, enviar a SUNAT). */
  acciones: ReactNode;
  /** Datos secundarios del panel derecho (origen, envío, anulación, vencimiento...). */
  datos: DatoDetalle[];
  /** Avisos arriba del todo (anulación, notas de crédito/débito). */
  avisos?: ReactNode;
  /** Bloques extra bajo el comprobante (p. ej. detracción). */
  extra?: ReactNode;
}

const hora = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '');

function estadoVisual(estado: SunatStatus, anulado?: boolean) {
  if (anulado || estado === 'ANULADO') return { fondo: '#f1f3f5', color: '#4a525c', icono: <StopOutlined />, titulo: 'Anulada' };
  if (estado === 'ACEPTADO') return { fondo: '#e9f7ef', color: '#1e7a4c', icono: <CheckOutlined />, titulo: 'Aceptada por SUNAT' };
  if (estado === 'RECHAZADO' || estado === 'ERROR') return { fondo: '#fdecec', color: '#b42318', icono: <CloseOutlined />, titulo: SUNAT_STATUS_LABELS[estado] };
  if (estado === 'PENDIENTE') return { fondo: '#fff7e6', color: '#ad6800', icono: <ClockCircleOutlined />, titulo: 'Pendiente de envío' };
  return { fondo: '#e8f1ff', color: '#1d5bd6', icono: <Spin size="small" />, titulo: 'Enviando a SUNAT…' };
}

/** Detalle de boleta/factura con el diseño A: el comprobante a la izquierda y el panel de estado a la derecha. */
export default function ComprobanteDetalle(p: ComprobanteDetalleProps) {
  const navigate = useNavigate();
  const v = estadoVisual(p.estado, p.anulado);
  const final = ['ACEPTADO', 'RECHAZADO', 'ERROR', 'ANULADO'].includes(p.estado);
  const t = p.totales ?? {};

  const filasTotales: [string, number | undefined][] = [
    ['Op. gravadas', t.gravada],
    ['Op. exoneradas', t.exonerada],
    ['Op. inafectas', t.inafecta],
    ['IGV (18%)', t.igv],
    ['ISC', t.isc],
  ];

  return (
    <div style={{ background: '#f4f6f8', borderRadius: 8, padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button size="small" icon={<LeftOutlined />} aria-label={`Volver a ${p.volver.label}`} onClick={() => navigate(p.volver.path)} />
        <span style={{ fontSize: 12, color: '#5b6573' }}>{p.volver.label} / <b style={{ color: '#1f2328' }}>{p.numero}</b></span>
      </div>

      {p.avisos}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...TARJETA, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', padding: '18px 22px', borderBottom: `3px solid ${ACENTO}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={ETIQUETA}>{p.tipoNombre.toUpperCase()}</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: ACENTO }}>{p.numero}</span>
                <span style={{ color: '#5b6573' }}>Emitida el {formatDate(p.fechaEmision)}{p.creadoEn ? ` a las ${hora(p.creadoEn)}` : ''}</span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={ETIQUETA}>TOTAL</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: ACENTO }}>{formatMoney(t.total ?? 0, p.moneda)}</span>
                <span style={{ color: '#5b6573' }}>{[p.formaPago, p.moneda === 'USD' ? 'Dólares' : 'Soles'].filter(Boolean).join(' · ')}</span>
              </div>
            </div>

            <div style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e7ee' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={ETIQUETA}>CLIENTE</span><span style={{ fontWeight: 500, fontSize: 13 }}>{p.cliente?.razon_social || '-'}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={ETIQUETA}>{p.cliente?.tipo_documento === '6' ? 'RUC' : 'DOCUMENTO'}</span><span style={{ fontSize: 13 }}>{p.cliente?.numero_documento || '-'}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={ETIQUETA}>DIRECCIÓN</span><span style={{ fontSize: 13 }}>{p.cliente?.direccion || '-'}</span></div>
            </div>

            <div style={{ padding: '12px 22px', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ ...ETIQUETA, textAlign: 'left', borderBottom: '1px solid #e2e7ee' }}>
                    <th style={{ padding: '6px 4px', width: 30 }}>#</th>
                    <th style={{ padding: '6px 4px', width: 120 }}>CÓDIGO</th>
                    <th style={{ padding: '6px 4px' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '6px 4px', width: 60 }}>UND</th>
                    <th style={{ padding: '6px 4px', width: 70, textAlign: 'right' }}>CANT.</th>
                    <th style={{ padding: '6px 4px', width: 100, textAlign: 'right' }}>P. UNIT.</th>
                    <th style={{ padding: '6px 4px', width: 110, textAlign: 'right' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 13 }}>
                  {p.detalles.map((d, i) => {
                    const it = calculateItemTotals(d);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <td style={{ padding: '8px 4px', color: '#5b6573' }}>{i + 1}</td>
                        <td style={{ padding: '8px 4px', color: '#5b6573', whiteSpace: 'nowrap' }}>{d.codigo || '-'}</td>
                        <td style={{ padding: '8px 4px', fontWeight: 500 }}>{d.descripcion}</td>
                        <td style={{ padding: '8px 4px' }}>{d.unidad}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{d.cantidad}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{formatMoney(it.mto_precio_unitario, p.moneda)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{formatMoney(it.total_item, p.moneda)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 22px 18px' }}>
              <div style={{ width: 280, border: '1px solid #e2e7ee', borderRadius: 8, overflow: 'hidden' }}>
                {filasTotales.filter(([label, valor]) => label.startsWith('IGV') || (valor ?? 0) > 0).map(([label, valor]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', color: '#4a525c' }}>
                    <span>{label}</span><span>{formatMoney(valor ?? 0, p.moneda)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: ACENTO, color: '#fff', fontWeight: 500 }}>
                  <span>TOTAL</span><span>{formatMoney(t.total ?? 0, p.moneda)}</span>
                </div>
              </div>
            </div>
          </div>
          {p.extra}
        </div>

        <aside style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <section style={{ ...TARJETA, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: v.fondo, borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: v.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{v.icono}</span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 500, color: v.color }}>{v.titulo}</span>
                {p.respuestaSunat && <span style={{ fontSize: 12, color: '#4a525c' }}>{p.respuestaSunat}</span>}
              </div>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#1677ff' }} />
                <span style={{ flexGrow: 1, fontSize: 12 }}>Creada</span>
                <span style={{ color: '#5b6573', fontSize: 11 }}>{p.creadoEn ? `${formatDate(p.creadoEn)} ${hora(p.creadoEn)}` : '-'}</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: final ? v.color : '#d5dbe2' }} />
                <span style={{ flexGrow: 1, fontSize: 12, fontWeight: final ? 500 : 400 }}>{final ? 'Última actualización' : 'Esperando respuesta de SUNAT'}</span>
                <span style={{ color: '#5b6573', fontSize: 11 }}>{final && p.actualizadoEn ? `${formatDate(p.actualizadoEn)} ${hora(p.actualizadoEn)}` : ''}</span>
              </li>
            </ol>
          </section>

          <section style={{ ...TARJETA, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#333' }}>Acciones</h2>
            {p.acciones}
          </section>

          <section style={{ ...TARJETA, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 14px' }}>
            {p.datos.map((d) => (
              <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, gridColumn: d.ancho ? '1 / -1' : undefined, minWidth: 0 }}>
                <span style={ETIQUETA}>{d.label.toUpperCase()}</span>
                <span style={{ wordBreak: 'break-word' }}>{d.value}</span>
              </div>
            ))}
            {p.hash && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, gridColumn: '1 / -1' }}>
                <span style={ETIQUETA}>HASH</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a525c', wordBreak: 'break-all' }}>{p.hash}</span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

import { Form, Select, Space, message } from 'antd';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice.service';
import { boletaService } from '@/services/boleta.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { devLog } from '@/lib/logger';
import type { DetalleItem } from '@/types/common.types';

interface DocumentoAfectadoSelectorProps {
  tipoDocFieldName?: string;
  numDocFieldName?: string;
  /** Si es true, al elegir el documento se copian cliente e items al formulario */
  autofillFromDocument?: boolean;
}

export default function DocumentoAfectadoSelector({
  tipoDocFieldName = 'tipo_doc_afectado',
  numDocFieldName = 'num_doc_afectado',
  autofillFromDocument = true,
}: DocumentoAfectadoSelectorProps) {
  const { control, setValue, watch } = useFormContext();
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const tipoDoc = watch(tipoDocFieldName);

  const { data: invoices } = useQuery({
    queryKey: ['invoices-for-note', companyId],
    queryFn: () => invoiceService.getAll({ company_id: companyId ?? undefined, estado_sunat: 'ACEPTADO', per_page: 100 }),
    enabled: !!companyId && tipoDoc === '01',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: boletas } = useQuery({
    queryKey: ['boletas-for-note', companyId],
    queryFn: () => boletaService.getAll({ company_id: companyId ?? undefined, estado_sunat: 'ACEPTADO', per_page: 100 }),
    enabled: !!companyId && tipoDoc === '03',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // El endpoint de listado devuelve una version recortada.
  // Usamos totales.total como fallback cuando mto_imp_venta no existe en la respuesta.
  const getTotal = (d: { mto_imp_venta?: number; totales?: { total?: number } }) =>
    d.mto_imp_venta ?? d.totales?.total ?? 0;

  const documentOptions = tipoDoc === '01'
    ? (invoices?.data || []).map((inv) => ({
        value: inv.numero_completo,
        label: `${inv.numero_completo} - ${inv.cliente?.razon_social ?? ''} (S/ ${getTotal(inv).toFixed(2)})`,
      }))
    : (boletas?.data || []).map((bol) => ({
        value: bol.numero_completo,
        label: `${bol.numero_completo} - ${bol.cliente?.razon_social ?? ''} (S/ ${getTotal(bol).toFixed(2)})`,
      }));

  const handleDocumentSelect = async (numeroCompleto: string | undefined) => {
    if (!autofillFromDocument || !numeroCompleto) return;

    // Buscar el id en la lista cacheada y fetchear el documento completo
    // (el endpoint /index devuelve una version recortada sin detalles ni cliente completo).
    const source = tipoDoc === '01' ? invoices?.data : boletas?.data;
    const listRow = source?.find((d) => d.numero_completo === numeroCompleto);
    if (!listRow?.id) return;

    try {
      const fullDoc = tipoDoc === '01'
        ? await invoiceService.getById(listRow.id)
        : await boletaService.getById(listRow.id);

      // Copiar cliente
      if (fullDoc.cliente) {
        setValue('client', {
          tipo_documento: fullDoc.cliente.tipo_documento,
          numero_documento: fullDoc.cliente.numero_documento,
          razon_social: fullDoc.cliente.razon_social,
          direccion: fullDoc.cliente.direccion ?? '',
          email: fullDoc.cliente.email ?? '',
        }, { shouldValidate: true, shouldDirty: true });
      }

      // Copiar items (normalizar mto_precio_unitario si solo viene mto_valor_unitario)
      const detalles: DetalleItem[] = (fullDoc.detalles || []).map((d) => {
        const pu = d.mto_precio_unitario
          ?? (d.mto_valor_unitario != null
            ? Number((d.mto_valor_unitario * (1 + (d.porcentaje_igv ?? 0) / 100)).toFixed(10))
            : 0);
        return {
          codigo: d.codigo,
          descripcion: d.descripcion,
          unidad: d.unidad || 'NIU',
          cantidad: d.cantidad,
          mto_precio_unitario: pu,
          tip_afe_igv: d.tip_afe_igv,
          porcentaje_igv: d.porcentaje_igv ?? 18,
        };
      });

      if (detalles.length > 0) {
        setValue('detalles', detalles, { shouldValidate: true, shouldDirty: true });
      }

      message.success(`Datos del ${tipoDoc === '01' ? 'factura' : 'boleta'} ${numeroCompleto} copiados`);
    } catch (err) {
      devLog.error('Error cargando documento afectado', err);
      message.error('No se pudo cargar el documento seleccionado');
    }
  };

  return (
    <div>
      <strong style={{ display: 'block', marginBottom: 8 }}>Documento Afectado</strong>
      <Space size="middle" wrap>
        <Form.Item label="Tipo Documento" required>
          <Controller
            name={tipoDocFieldName}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: 180 }}
                onChange={(val) => {
                  field.onChange(val);
                  setValue(numDocFieldName, '');
                }}
                options={[
                  { value: '01', label: '01 - Factura' },
                  { value: '03', label: '03 - Boleta' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Numero Documento Afectado"
          required
          style={{ minWidth: 350 }}
          extra={autofillFromDocument ? 'Al seleccionar, se copiaran cliente e items del documento' : undefined}
        >
          <Controller
            name={numDocFieldName}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione documento..."
                options={documentOptions}
                style={{ width: '100%' }}
                allowClear
                onChange={(val) => {
                  field.onChange(val);
                  handleDocumentSelect(val);
                }}
              />
            )}
          />
        </Form.Item>
      </Space>
    </div>
  );
}

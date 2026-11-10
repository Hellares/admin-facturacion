import { useEffect, useRef, useState } from 'react';
import { Input, Select, Space, Form, Button, Divider, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useFormContext } from 'react-hook-form';
import { clientService } from '@/services/client.service';
import { lookupService } from '@/services/lookup.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { TIPO_DOCUMENTO_OPTIONS } from '@/utils/constants';
import type { Client } from '@/types/client.types';

type DocumentType = 'factura' | 'boleta' | 'credit_note' | 'debit_note' | 'dispatch_guide' | 'cotizacion';

interface ClientSelectorProps {
  prefix?: string;
  /**
   * Tipo de documento que se esta emitiendo. Restringe los tipos de documento
   * de identidad disponibles segun reglas SUNAT:
   * - factura: solo RUC (6)
   * - boleta: sin doc (0), DNI (1), CE (4), Pasaporte (7) — sin RUC
   * - resto: todas las opciones
   */
  documentType?: DocumentType;
}

export default function ClientSelector({ prefix = 'client', documentType }: ClientSelectorProps) {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const [searching, setSearching] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const getError = (field: string) => {
    const parts = prefix ? [prefix, field] : [field];
    let err: Record<string, unknown> = errors;
    for (const p of parts) {
      err = err?.[p] as Record<string, unknown>;
      if (!err) return undefined;
    }
    return err as { message?: string };
  };

  const handleSearchByDocument = async (doc: string, tipoDoc: string = watch(`${p}tipo_documento`) as string) => {
    if (!doc) return;
    const isDni = tipoDoc === '1' && doc.length === 8;
    const isRuc = tipoDoc === '6' && doc.length === 11;

    if (!isDni && !isRuc) {
      if (doc.length < 8) return;
      // Fallback: buscar en clientes locales
      return searchLocalClient(doc);
    }

    setSearching(true);
    try {
      if (isDni) {
        const data = await lookupService.dni(doc);
        const fp = prefix ? `${prefix}.` : '';
        setValue(`${fp}numero_documento`, data.numero);
        setValue(`${fp}razon_social`, data.nombre_completo);
        setValue(`${fp}direccion`, data.direccion_completa || data.direccion || '');
        setShowForm(true);
        message.success(`DNI encontrado: ${data.nombre_completo}`);
      } else {
        const data = await lookupService.ruc(doc);
        const fp = prefix ? `${prefix}.` : '';
        setValue(`${fp}numero_documento`, data.numero);
        setValue(`${fp}razon_social`, data.nombre_o_razon_social);
        setValue(`${fp}direccion`, data.direccion_completa || data.direccion || '');
        setShowForm(true);
        message.success(`RUC encontrado: ${data.nombre_o_razon_social}`);
      }
    } catch {
      // API externa fallo, intentar busqueda local
      await searchLocalClient(doc);
    } finally {
      setSearching(false);
    }
  };

  const searchLocalClient = async (doc: string) => {
    if (!companyId) return;
    setSearching(true);
    try {
      const client = await clientService.searchByDocument({
        company_id: companyId,
        numero_documento: doc,
      });
      if (client) {
        fillClientFields(client);
        message.success('Cliente encontrado en registros locales');
      }
    } catch {
      message.info('No se encontraron datos. Complete manualmente.');
    } finally {
      setSearching(false);
    }
  };

  const fillClientFields = (client: Client) => {
    const fp = prefix ? `${prefix}.` : '';
    setValue(`${fp}tipo_documento`, client.tipo_documento);
    setValue(`${fp}numero_documento`, client.numero_documento);
    setValue(`${fp}razon_social`, client.razon_social);
    setValue(`${fp}nombre_comercial`, client.nombre_comercial || '');
    setValue(`${fp}direccion`, client.direccion || '');
    setValue(`${fp}email`, client.email || '');
    setValue(`${fp}telefono`, client.telefono || '');
  };

  const p = prefix ? `${prefix}.` : '';

  // Filtrar opciones de tipo documento segun el tipo de comprobante
  const filteredTipoDocOptions = (() => {
    if (documentType === 'factura') {
      return TIPO_DOCUMENTO_OPTIONS.filter((o) => o.value === '6');
    }
    if (documentType === 'boleta') {
      return TIPO_DOCUMENTO_OPTIONS.filter((o) => o.value !== '6');
    }
    return TIPO_DOCUMENTO_OPTIONS;
  })();

  const tipoDocDisabled = filteredTipoDocOptions.length === 1;
  const currentTipoDoc = watch(`${p}tipo_documento`) as string | undefined;

  // Auto-forzar el tipo de documento cuando hay restriccion y el actual no es valido
  useEffect(() => {
    if (!documentType) return;
    const validValues = filteredTipoDocOptions.map((o) => o.value);
    if (currentTipoDoc && !validValues.includes(currentTipoDoc as typeof validValues[number])) {
      setValue(`${p}tipo_documento`, filteredTipoDocOptions[0].value);
    } else if (!currentTipoDoc && tipoDocDisabled) {
      setValue(`${p}tipo_documento`, filteredTipoDocOptions[0].value);
    }
  }, [documentType, currentTipoDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Búsqueda automática: al completar 8 dígitos (DNI) u 11 (RUC) busca sola, una vez por número.
  const ultimaBusqueda = useRef('');
  const permiteTipo = (v: string) => filteredTipoDocOptions.some((o) => o.value === v);
  const numeroActual = (watch(`${p}numero_documento`) as string | undefined) ?? '';

  const onNumeroChange = (raw: string, onChange: (v: string) => void) => {
    let tipo = currentTipoDoc;
    if (/^\d{8}$/.test(raw) && (!tipo || tipo === '0') && permiteTipo('1')) tipo = '1';
    if (/^\d{11}$/.test(raw) && (!tipo || tipo === '0' || tipo === '1') && permiteTipo('6')) tipo = '6';
    if (tipo !== currentTipoDoc) setValue(`${p}tipo_documento`, tipo);

    const valor = tipo === '1' || tipo === '6' ? raw.replace(/\D/g, '') : raw;
    onChange(valor);

    const largo = tipo === '1' ? 8 : tipo === '6' ? 11 : 0;
    if (largo && valor.length === largo && valor !== ultimaBusqueda.current) {
      ultimaBusqueda.current = valor;
      handleSearchByDocument(valor, tipo);
    }
  };

  const avisoNumero = (() => {
    if (documentType === 'factura' && /^\d{8}$/.test(numeroActual)) {
      return 'La factura requiere RUC (11 dígitos). Para un DNI emita boleta.';
    }
    if (documentType === 'boleta' && /^(10|15|17|20)\d{9}$/.test(numeroActual)) {
      return 'Parece un RUC: para un RUC emita factura.';
    }
    return undefined;
  })();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontWeight: 500, color: '#555', fontSize: 12 }}>Datos del Cliente</span>
        <Button size="small" type="link" icon={showForm ? undefined : <PlusOutlined />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Ocultar' : 'Mostrar campos'}
        </Button>
      </div>

      <Space size="middle" wrap>
        <Form.Item
          label="Tipo Doc."
          validateStatus={getError('tipo_documento') ? 'error' : ''}
          help={getError('tipo_documento')?.message}
          required
        >
          <Controller
            name={`${p}tipo_documento`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: 180 }}
                options={filteredTipoDocOptions}
                disabled={tipoDocDisabled}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Nro. Documento"
          validateStatus={getError('numero_documento') ? 'error' : avisoNumero ? 'warning' : ''}
          help={getError('numero_documento')?.message ?? avisoNumero}
          required
        >
          <Controller
            name={`${p}numero_documento`}
            control={control}
            render={({ field }) => (
              <Input.Search
                {...field}
                onChange={(e) => onNumeroChange(e.target.value, field.onChange)}
                style={{ width: 240 }}
                enterButton={<SearchOutlined />}
                loading={searching}
                onSearch={(v) => handleSearchByDocument(v)}
                inputMode={currentTipoDoc === '1' || currentTipoDoc === '6' ? 'numeric' : undefined}
                // 11 también con DNI: así se puede escribir un RUC y ver el aviso de "emita factura"
                maxLength={currentTipoDoc === '1' || currentTipoDoc === '6' ? 11 : 20}
                placeholder={currentTipoDoc === '6' ? 'RUC: 11 dígitos' : currentTipoDoc === '1' ? 'DNI: 8 dígitos' : 'Número'}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Razon Social / Nombre"
          validateStatus={getError('razon_social') ? 'error' : ''}
          help={getError('razon_social')?.message}
          required
          style={{ minWidth: 300 }}
        >
          <Controller
            name={`${p}razon_social`}
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
      </Space>

      {showForm && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <Space size="middle" wrap>
            <Form.Item label="Direccion" style={{ minWidth: 300 }}>
              <Controller name={`${p}direccion`} control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
            <Form.Item label="Email">
              <Controller name={`${p}email`} control={control} render={({ field }) => <Input {...field} style={{ width: 200 }} />} />
            </Form.Item>
            <Form.Item label="Telefono">
              <Controller name={`${p}telefono`} control={control} render={({ field }) => <Input {...field} style={{ width: 150 }} />} />
            </Form.Item>
          </Space>
        </>
      )}
    </div>
  );
}

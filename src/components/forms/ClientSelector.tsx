import { useState } from 'react';
import { Input, Select, Space, Form, Button, Divider, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useFormContext } from 'react-hook-form';
import { clientService } from '@/services/client.service';
import { lookupService } from '@/services/lookup.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { TIPO_DOCUMENTO_OPTIONS } from '@/utils/constants';
import type { Client } from '@/types/client.types';

interface ClientSelectorProps {
  prefix?: string; // form field prefix e.g. 'client'
}

export default function ClientSelector({ prefix = 'client' }: ClientSelectorProps) {
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

  const handleSearchByDocument = async (doc: string) => {
    if (!doc) return;
    const tipoDoc = watch(`${p}tipo_documento`) as string;
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
              <Select {...field} style={{ width: 180 }} options={TIPO_DOCUMENTO_OPTIONS} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Nro. Documento"
          validateStatus={getError('numero_documento') ? 'error' : ''}
          help={getError('numero_documento')?.message}
          required
        >
          <Controller
            name={`${p}numero_documento`}
            control={control}
            render={({ field }) => (
              <Input.Search
                {...field}
                style={{ width: 200 }}
                enterButton={<SearchOutlined />}
                loading={searching}
                onSearch={handleSearchByDocument}
                placeholder="Buscar..."
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

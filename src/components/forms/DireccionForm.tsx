import { useEffect, useState } from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { Controller, useFormContext } from 'react-hook-form';
import {
  useUbigeos,
  useDepartamentos,
  useProvincias,
  useDistritos,
} from '@/hooks/useUbigeos';

interface DireccionFormProps {
  prefix: string; // 'partida' or 'llegada'
  title: string;
}

export default function DireccionForm({ prefix, title }: DireccionFormProps) {
  const { control, setValue, formState: { errors } } = useFormContext();
  const { ubigeos, isLoading } = useUbigeos();

  const [departamento, setDepartamento] = useState<string>();
  const [provincia, setProvincia] = useState<string>();

  const departamentos = useDepartamentos(ubigeos);
  const provincias = useProvincias(ubigeos, departamento);
  const distritos = useDistritos(ubigeos, departamento, provincia);

  // Cuando cambia departamento, resetea provincia y distrito
  useEffect(() => {
    setProvincia(undefined);
    setValue(`${prefix}.ubigeo`, '');
  }, [departamento, prefix, setValue]);

  // Cuando cambia provincia, resetea distrito/ubigeo
  useEffect(() => {
    setValue(`${prefix}.ubigeo`, '');
  }, [provincia, prefix, setValue]);

  const handleDistritoChange = (distrito: string) => {
    const found = ubigeos.find(
      (u) =>
        u.departamento === departamento &&
        u.provincia === provincia &&
        u.distrito === distrito,
    );
    if (found) {
      setValue(`${prefix}.ubigeo`, found.ubigeo);
    }
  };

  const getError = (field: string) => {
    const parts = prefix.split('.');
    parts.push(field);
    let err: Record<string, unknown> = errors;
    for (const p of parts) {
      err = err?.[p] as Record<string, unknown>;
      if (!err) return undefined;
    }
    return err as { message?: string };
  };

  return (
    <div>
      <strong>{title}</strong>
      <Row gutter={12} style={{ marginTop: 8 }}>
        <Col xs={24} sm={8}>
          <Form.Item label="Departamento">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Seleccionar departamento"
              loading={isLoading}
              value={departamento}
              onChange={(val) => setDepartamento(val)}
              options={departamentos.map((d) => ({ value: d, label: d }))}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Provincia">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={departamento ? 'Seleccionar provincia' : 'Primero seleccione departamento'}
              disabled={!departamento}
              value={provincia}
              onChange={(val) => setProvincia(val)}
              options={provincias.map((p) => ({ value: p, label: p }))}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Distrito">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={provincia ? 'Seleccionar distrito' : 'Primero seleccione provincia'}
              disabled={!provincia}
              onChange={handleDistritoChange}
              options={distritos.map((d) => ({
                value: d.distrito,
                label: `${d.distrito} (${d.ubigeo})`,
              }))}
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={8} sm={4}>
          <Form.Item
            label="Ubigeo"
            required
            validateStatus={getError('ubigeo') ? 'error' : ''}
            help={getError('ubigeo')?.message}
          >
            <Controller
              name={`${prefix}.ubigeo`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  placeholder="150101"
                  maxLength={6}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={16} sm={12}>
          <Form.Item
            label="Direccion"
            required
            validateStatus={getError('direccion') ? 'error' : ''}
            help={getError('direccion')?.message}
          >
            <Controller
              name={`${prefix}.direccion`}
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Direccion completa" />
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={4}>
          <Form.Item label="RUC (opcional)">
            <Controller
              name={`${prefix}.ruc`}
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={4}>
          <Form.Item label="Cod. Local">
            <Controller
              name={`${prefix}.cod_local`}
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="0000" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}

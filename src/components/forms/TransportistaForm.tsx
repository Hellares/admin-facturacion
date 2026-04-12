import { useState, useEffect } from 'react';
import { Form, Input, Divider, Alert, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import TransportistSelector from './TransportistSelector';
import VehicleSelector from './VehicleSelector';
import DriverSelector from './DriverSelector';
import type { Transportist } from '@/types/transportist.types';
import type { Vehicle } from '@/types/vehicle.types';
import type { Driver } from '@/types/driver.types';

/**
 * Formulario de transportista/conductor/vehiculo para guias de remision.
 *
 * Usa los selectores con maestros persistidos (Transportist, Driver, Vehicle):
 * - Modalidad 01 (Publico): TransportistSelector - popula campos transportista.*
 * - Modalidad 02 (Privado): DriverSelector + VehicleSelector - popula conductor.* y vehiculo_placa
 *
 * Al seleccionar un item del maestro, los campos planos del form se rellenan automaticamente
 * para que el payload de creacion de guia siga siendo compatible con el backend existente.
 *
 * El modo "Editar manualmente" permite casos puntuales (ej: transportista ocasional que no
 * vale la pena registrar como maestro).
 */
export default function TransportistaForm() {
  const { control, setValue } = useFormContext();
  const modTraslado = useWatch({ control, name: 'mod_traslado' });
  const codTraslado = useWatch({ control, name: 'cod_traslado' });
  const indicadores = useWatch({ control, name: 'indicadores' });

  const [transportistId, setTransportistId] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Cuando cambia la modalidad, limpia las selecciones previas para evitar datos fantasma
  useEffect(() => {
    setTransportistId(null);
    setDriverId(null);
    setVehicleId(null);
  }, [modTraslado]);

  const handleSelectTransportist = (t: Transportist | null) => {
    setTransportistId(t?.id ?? null);
    if (t) {
      setValue('transportista.tipo_documento', t.tipo_doc);
      setValue('transportista.numero_documento', t.num_doc);
      setValue('transportista.razon_social', t.razon_social);
      setValue('transportista.nro_mtc', t.nro_mtc || '');
    } else {
      setValue('transportista.tipo_documento', '6');
      setValue('transportista.numero_documento', '');
      setValue('transportista.razon_social', '');
      setValue('transportista.nro_mtc', '');
    }
  };

  const handleSelectDriver = (d: Driver | null) => {
    setDriverId(d?.id ?? null);
    if (d) {
      setValue('conductor.tipo_documento', d.tipo_doc);
      setValue('conductor.numero_documento', d.num_doc);
      setValue('conductor.nombres', d.nombres);
      setValue('conductor.apellidos', d.apellidos);
      setValue('conductor.licencia', d.licencia);
    } else {
      setValue('conductor.tipo_documento', '1');
      setValue('conductor.numero_documento', '');
      setValue('conductor.nombres', '');
      setValue('conductor.apellidos', '');
      setValue('conductor.licencia', '');
    }
  };

  const handleSelectVehicle = (v: Vehicle | null) => {
    setVehicleId(v?.id ?? null);
    setValue('vehiculo_placa', v?.placa || '');
  };

  // Caso especial: M1L o codigo 04 (importacion) no requiere conductor/vehiculo
  const isM1L = Array.isArray(indicadores) && indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L');
  const skipConductor = isM1L || codTraslado === '04';

  if (modTraslado === '01') {
    return (
      <div>
        <strong>Transportista (Transporte Publico)</strong>
        <Divider style={{ margin: '8px 0' }} />

        {!manualMode && (
          <Form.Item
            label="Seleccionar Transportista"
            extra="Solo muestra transportistas con registro MTC (requerido por SUNAT para transporte publico)"
          >
            <Space.Compact style={{ width: '100%' }}>
              <TransportistSelector
                value={transportistId}
                onChange={handleSelectTransportist}
                requireMtc
              />
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setManualMode(true)}
              >
                Ingresar manualmente (transportista ocasional)
              </Button>
            </div>
          </Form.Item>
        )}

        {manualMode && (
          <>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="Modo manual"
              description="Esta informacion no se guardara como transportista permanente. Para reutilizar, crea un transportista desde el selector."
              action={
                <Button size="small" onClick={() => {
                  setManualMode(false);
                  handleSelectTransportist(null);
                }}>
                  Volver al selector
                </Button>
              }
            />
            <Space size="middle" wrap>
              <Form.Item label="Tipo Doc.">
                <Controller
                  name="transportista.tipo_documento"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 100 }} />}
                />
              </Form.Item>
              <Form.Item label="Nro. Documento">
                <Controller
                  name="transportista.numero_documento"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 160 }} />}
                />
              </Form.Item>
              <Form.Item label="Razon Social" style={{ minWidth: 280 }}>
                <Controller
                  name="transportista.razon_social"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item label="Nro. MTC">
                <Controller
                  name="transportista.nro_mtc"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 140 }} />}
                />
              </Form.Item>
            </Space>
          </>
        )}
      </div>
    );
  }

  if (modTraslado === '02') {
    return (
      <div>
        <strong>Conductor y Vehiculo (Transporte Privado)</strong>
        <Divider style={{ margin: '8px 0' }} />

        {skipConductor && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message={
              isM1L
                ? 'Vehiculo M1L: no requiere conductor ni placa'
                : 'Motivo importacion: no requiere conductor ni placa'
            }
          />
        )}

        {!skipConductor && !manualMode && (
          <>
            <Form.Item label="Seleccionar Conductor">
              <DriverSelector value={driverId} onChange={handleSelectDriver} />
            </Form.Item>

            <Form.Item label="Seleccionar Vehiculo">
              <VehicleSelector value={vehicleId} onChange={handleSelectVehicle} />
            </Form.Item>

            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setManualMode(true)}
            >
              Ingresar manualmente (conductor o vehiculo ocasional)
            </Button>
          </>
        )}

        {!skipConductor && manualMode && (
          <>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="Modo manual"
              description="Estos datos no se guardaran como conductor/vehiculo permanente."
              action={
                <Button size="small" onClick={() => {
                  setManualMode(false);
                  handleSelectDriver(null);
                  handleSelectVehicle(null);
                }}>
                  Volver al selector
                </Button>
              }
            />
            <Space size="middle" wrap>
              <Form.Item label="Tipo Doc. Conductor">
                <Controller
                  name="conductor.tipo_documento"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 100 }} />}
                />
              </Form.Item>
              <Form.Item label="Nro. Documento">
                <Controller
                  name="conductor.numero_documento"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 140 }} />}
                />
              </Form.Item>
              <Form.Item label="Nombres">
                <Controller
                  name="conductor.nombres"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 160 }} />}
                />
              </Form.Item>
              <Form.Item label="Apellidos">
                <Controller
                  name="conductor.apellidos"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 160 }} />}
                />
              </Form.Item>
              <Form.Item label="Licencia">
                <Controller
                  name="conductor.licencia"
                  control={control}
                  render={({ field }) => <Input {...field} style={{ width: 120 }} />}
                />
              </Form.Item>
              <Form.Item label="Placa Vehiculo">
                <Controller
                  name="vehiculo_placa"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase().replace(/[\s-]/g, ''))
                      }
                      style={{ width: 120, fontFamily: 'monospace' }}
                      placeholder="ABC123"
                      maxLength={8}
                    />
                  )}
                />
              </Form.Item>
            </Space>
          </>
        )}
      </div>
    );
  }

  return null;
}

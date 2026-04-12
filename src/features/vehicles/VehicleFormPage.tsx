import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Select, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import { useVehicle, useCreateVehicle, useUpdateVehicle } from './hooks/useVehicles';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { lookupService } from '@/services/lookup.service';

const schema = z.object({
  placa: z
    .string()
    .min(6, 'Minimo 6 caracteres')
    .max(8, 'Maximo 8 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Solo letras mayusculas y numeros'),
  marca: z.string().max(100).optional().or(z.literal('')),
  modelo: z.string().max(100).optional().or(z.literal('')),
  nro_certificado_inscripcion: z.string().max(50).optional().or(z.literal('')),
  placas_secundarias: z.array(z.string()).optional(),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface VehicleFormPageProps {
  embedded?: boolean;
  onSuccess?: (created: { id: number }) => void;
  onCancel?: () => void;
}

export default function VehicleFormPage({ embedded = false, onSuccess, onCancel }: VehicleFormPageProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && !embedded;
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const [searching, setSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<{ color: string; motor: string; vin: string } | null>(null);

  const { data: vehicle, isLoading: loadingData } = useVehicle(Number(id));
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue: setFormValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      nro_certificado_inscripcion: '',
      placas_secundarias: [],
      observaciones: '',
    },
  });

  useEffect(() => {
    if (vehicle && isEdit) {
      reset({
        placa: vehicle.placa,
        marca: vehicle.marca || '',
        modelo: vehicle.modelo || '',
        nro_certificado_inscripcion: vehicle.nro_certificado_inscripcion || '',
        placas_secundarias: vehicle.placas_secundarias || [],
        observaciones: vehicle.observaciones || '',
      });
    }
  }, [vehicle, isEdit, reset]);

  const handleSearchPlaca = async () => {
    const currentPlaca = getValues('placa');
    if (!currentPlaca || currentPlaca.length < 6) {
      message.warning('Ingrese una placa valida (minimo 6 caracteres)');
      return;
    }
    setSearching(true);
    setVehicleInfo(null);
    try {
      const data = await lookupService.placa(currentPlaca);
      if (data.marca) setFormValue('marca', data.marca);
      if (data.modelo) setFormValue('modelo', data.modelo);
      setVehicleInfo({
        color: data.color || '',
        motor: data.motor || '',
        vin: data.vin || '',
      });
      message.success(`Vehiculo encontrado: ${data.marca} ${data.modelo}`);
    } catch {
      message.error('No se encontraron datos para esta placa');
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompanyId) {
      message.error('Seleccione una empresa');
      return;
    }

    const payload = {
      ...values,
      company_id: selectedCompanyId,
      placa: values.placa.toUpperCase().replace(/[\s-]/g, ''),
      marca: values.marca || undefined,
      modelo: values.modelo || undefined,
      nro_certificado_inscripcion: values.nro_certificado_inscripcion || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        message.success('Vehiculo actualizado');
        navigate('/vehicles');
      } else {
        const created = await createMutation.mutateAsync(payload);
        message.success('Vehiculo creado');
        if (embedded && onSuccess) {
          onSuccess(created);
        } else {
          navigate('/vehicles');
        }
      }
    } catch {
      message.error('Error al guardar vehiculo');
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const formBody = (
    <Form layout="vertical" component="div">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form.Item
            label="Placa"
            validateStatus={errors.placa ? 'error' : ''}
            help={errors.placa?.message || '6 a 8 caracteres alfanumericos (sin espacios ni guiones)'}
            required
          >
            <Controller
              name="placa"
              control={control}
              render={({ field }) => (
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[\s-]/g, ''))}
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase', maxWidth: 200 }}
                    maxLength={8}
                    placeholder="ABC123"
                  />
                  <Button
                    icon={<SearchOutlined />}
                    onClick={handleSearchPlaca}
                    loading={searching}
                    title="Buscar datos del vehiculo por placa en Factiliza"
                  >
                    Buscar
                  </Button>
                </Space.Compact>
              )}
            />
          </Form.Item>

          {vehicleInfo && (
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                {vehicleInfo.color && <Tag color="blue">{vehicleInfo.color}</Tag>}
                {vehicleInfo.motor && <Tag>Motor: {vehicleInfo.motor}</Tag>}
                {vehicleInfo.vin && <Tag>VIN: {vehicleInfo.vin}</Tag>}
              </Space>
            </div>
          )}

          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item
              label="Marca"
              validateStatus={errors.marca ? 'error' : ''}
              help={errors.marca?.message}
              style={{ flex: 1 }}
            >
              <Controller
                name="marca"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Ej: Toyota" />}
              />
            </Form.Item>
            <Form.Item
              label="Modelo"
              validateStatus={errors.modelo ? 'error' : ''}
              help={errors.modelo?.message}
              style={{ flex: 1 }}
            >
              <Controller
                name="modelo"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Ej: Hilux 2020" />}
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Nro Certificado MTC (Constancia de Inscripcion)"
            validateStatus={errors.nro_certificado_inscripcion ? 'error' : ''}
            help={errors.nro_certificado_inscripcion?.message}
          >
            <Controller
              name="nro_certificado_inscripcion"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label="Placas Secundarias"
            help="Para casos con semiremolque o multiples placas"
          >
            <Controller
              name="placas_secundarias"
              control={control}
              render={({ field }) => (
                <Select
                  mode="tags"
                  value={field.value}
                  onChange={(vals: string[]) =>
                    field.onChange(vals.map((v) => v.toUpperCase().replace(/[\s-]/g, '')))
                  }
                  placeholder="Presione Enter despues de cada placa"
                  tokenSeparators={[',']}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Observaciones"
            validateStatus={errors.observaciones ? 'error' : ''}
            help={errors.observaciones?.message}
          >
            <Controller
              name="observaciones"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={3} />}
            />
          </Form.Item>
        </Space>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button
              onClick={() => {
                if (embedded && onCancel) onCancel();
                else navigate('/vehicles');
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Actualizar' : 'Crear Vehiculo'}
            </Button>
          </Space>
        </div>
      </form>
    </Form>
  );

  if (embedded) return formBody;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Vehiculo' : 'Nuevo Vehiculo'}
        showBack
        breadcrumbs={[
          { title: 'Vehiculos', path: '/vehicles' },
          { title: isEdit ? 'Editar' : 'Nuevo' },
        ]}
      />
      <Card loading={isEdit && loadingData} style={{ maxWidth: 800 }}>
        {formBody}
      </Card>
    </div>
  );
}

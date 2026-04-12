import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Select, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import { useDriver, useCreateDriver, useUpdateDriver } from './hooks/useDrivers';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { lookupService } from '@/services/lookup.service';

const schema = z
  .object({
    tipo_doc: z.enum(['1', '4', '7']),
    num_doc: z.string().min(1, 'Requerido').max(15),
    nombres: z.string().min(1, 'Requerido').max(100),
    apellidos: z.string().min(1, 'Requerido').max(100),
    licencia: z.string().min(1, 'Requerido').max(20),
    telefono: z.string().max(20).optional().or(z.literal('')),
    observaciones: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.tipo_doc === '1') return d.num_doc.length === 8;
      return true;
    },
    {
      message: 'DNI debe tener 8 digitos',
      path: ['num_doc'],
    },
  );

type FormValues = z.infer<typeof schema>;

const TIPO_DOC_OPTIONS = [
  { value: '1', label: '1 - DNI' },
  { value: '4', label: '4 - Carnet de Extranjeria' },
  { value: '7', label: '7 - Pasaporte' },
];

interface DriverFormPageProps {
  embedded?: boolean;
  onSuccess?: (created: { id: number }) => void;
  onCancel?: () => void;
}

export default function DriverFormPage({ embedded = false, onSuccess, onCancel }: DriverFormPageProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && !embedded;
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const { data: driver, isLoading: loadingData } = useDriver(Number(id));
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();

  const [searching, setSearching] = useState(false);
  const [licenciaInfo, setLicenciaInfo] = useState<{ estado: string; categoria: string; vencimiento: string; restricciones: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue: setFormValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_doc: '1',
      num_doc: '',
      nombres: '',
      apellidos: '',
      licencia: '',
      telefono: '',
      observaciones: '',
    },
  });

  useEffect(() => {
    if (driver && isEdit) {
      reset({
        tipo_doc: driver.tipo_doc,
        num_doc: driver.num_doc,
        nombres: driver.nombres,
        apellidos: driver.apellidos,
        licencia: driver.licencia,
        telefono: driver.telefono || '',
        observaciones: driver.observaciones || '',
      });
    }
  }, [driver, isEdit, reset]);

  const numDoc = watch('num_doc');
  const tipoDoc = watch('tipo_doc');

  const handleSearchLicencia = async () => {
    if (tipoDoc !== '1' || !numDoc || numDoc.length !== 8) {
      message.warning('Ingrese un DNI valido de 8 digitos para buscar');
      return;
    }
    setSearching(true);
    setLicenciaInfo(null);
    try {
      const data = await lookupService.licencia(numDoc);
      // Autocomplete nombres
      const partes = (data.nombre_completo || '').split(' ');
      // Formato típico: "NOMBRE1 NOMBRE2 APELLIDO1 APELLIDO2" o similar
      // La API devuelve nombre_completo, intentamos separar nombres/apellidos
      if (partes.length >= 4) {
        setFormValue('nombres', partes.slice(0, partes.length - 2).join(' '));
        setFormValue('apellidos', partes.slice(partes.length - 2).join(' '));
      } else if (partes.length === 3) {
        setFormValue('nombres', partes[0]);
        setFormValue('apellidos', partes.slice(1).join(' '));
      } else {
        setFormValue('nombres', data.nombre_completo);
      }

      if (data.licencia?.numero) {
        setFormValue('licencia', data.licencia.numero);
      }

      setLicenciaInfo({
        estado: data.licencia?.estado || '',
        categoria: data.licencia?.categoria || '',
        vencimiento: data.licencia?.fecha_vencimiento || '',
        restricciones: data.licencia?.restricciones || '',
      });

      message.success(`Licencia encontrada: ${data.licencia?.numero || 'N/A'} - ${data.nombre_completo}`);
    } catch {
      message.error('No se encontraron datos de licencia para este DNI');
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
      telefono: values.telefono || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        message.success('Conductor actualizado');
        navigate('/drivers');
      } else {
        const created = await createMutation.mutateAsync(payload);
        message.success('Conductor creado');
        if (embedded && onSuccess) {
          onSuccess(created);
        } else {
          navigate('/drivers');
        }
      }
    } catch {
      message.error('Error al guardar conductor');
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const formBody = (
    <Form layout="vertical" component="div">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item
              label="Tipo Doc"
              validateStatus={errors.tipo_doc ? 'error' : ''}
              help={errors.tipo_doc?.message}
              required
            >
              <Controller
                name="tipo_doc"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={TIPO_DOC_OPTIONS} style={{ width: 220 }} />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Numero Documento"
              validateStatus={errors.num_doc ? 'error' : ''}
              help={errors.num_doc?.message}
              required
              style={{ flex: 1 }}
            >
              <Controller
                name="num_doc"
                control={control}
                render={({ field }) => (
                  <Space.Compact style={{ width: '100%' }}>
                    <Input {...field} maxLength={15} />
                    <Button
                      icon={<SearchOutlined />}
                      onClick={handleSearchLicencia}
                      loading={searching}
                      title="Buscar licencia por DNI en Factiliza"
                    >
                      Buscar
                    </Button>
                  </Space.Compact>
                )}
              />
            </Form.Item>
          </Space>

          {licenciaInfo && (
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Tag color={licenciaInfo.estado === 'VIGENTE' ? 'success' : 'error'}>
                  {licenciaInfo.estado}
                </Tag>
                {licenciaInfo.categoria && <Tag color="blue">Cat. {licenciaInfo.categoria}</Tag>}
                {licenciaInfo.vencimiento && <Tag>Vence: {licenciaInfo.vencimiento}</Tag>}
                {licenciaInfo.restricciones && <Tag color="orange">{licenciaInfo.restricciones}</Tag>}
              </Space>
            </div>
          )}

          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item
              label="Nombres"
              validateStatus={errors.nombres ? 'error' : ''}
              help={errors.nombres?.message}
              required
              style={{ flex: 1 }}
            >
              <Controller
                name="nombres"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Apellidos"
              validateStatus={errors.apellidos ? 'error' : ''}
              help={errors.apellidos?.message}
              required
              style={{ flex: 1 }}
            >
              <Controller
                name="apellidos"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Numero de Licencia (Brevete)"
            validateStatus={errors.licencia ? 'error' : ''}
            help={errors.licencia?.message}
            required
          >
            <Controller
              name="licencia"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Ej: Q12345678" />}
            />
          </Form.Item>

          <Form.Item
            label="Telefono"
            validateStatus={errors.telefono ? 'error' : ''}
            help={errors.telefono?.message}
          >
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => <Input {...field} />}
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
                else navigate('/drivers');
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Actualizar' : 'Crear Conductor'}
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
        title={isEdit ? 'Editar Conductor' : 'Nuevo Conductor'}
        showBack
        breadcrumbs={[
          { title: 'Conductores', path: '/drivers' },
          { title: isEdit ? 'Editar' : 'Nuevo' },
        ]}
      />
      <Card loading={isEdit && loadingData} style={{ maxWidth: 800 }}>
        {formBody}
      </Card>
    </div>
  );
}

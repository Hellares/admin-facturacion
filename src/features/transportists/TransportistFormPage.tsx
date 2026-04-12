import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Select, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import {
  useTransportist,
  useCreateTransportist,
  useUpdateTransportist,
} from './hooks/useTransportists';
import { useCompanyContextStore } from '@/stores/company-context.store';

const schema = z
  .object({
    tipo_doc: z.enum(['1', '4', '6', '7']),
    num_doc: z.string().min(1, 'Requerido').max(15),
    razon_social: z.string().min(1, 'Requerido').max(255),
    nro_mtc: z.string().max(20).optional().or(z.literal('')),
    telefono: z.string().max(20).optional().or(z.literal('')),
    email: z.string().email('Email invalido').optional().or(z.literal('')),
    observaciones: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (d) => {
      if (d.tipo_doc === '6') return d.num_doc.length === 11;
      if (d.tipo_doc === '1') return d.num_doc.length === 8;
      return true;
    },
    {
      message: 'RUC debe tener 11 digitos, DNI 8 digitos',
      path: ['num_doc'],
    },
  );

type FormValues = z.infer<typeof schema>;

const TIPO_DOC_OPTIONS = [
  { value: '6', label: '6 - RUC' },
  { value: '1', label: '1 - DNI' },
  { value: '4', label: '4 - Carnet de Extranjeria' },
  { value: '7', label: '7 - Pasaporte' },
];

interface TransportistFormPageProps {
  /** Cuando se usa embebido en un drawer (desde un selector), llama onSuccess con el recurso creado en vez de navegar */
  embedded?: boolean;
  onSuccess?: (created: { id: number }) => void;
  onCancel?: () => void;
}

export default function TransportistFormPage({ embedded = false, onSuccess, onCancel }: TransportistFormPageProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && !embedded;
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const { data: transportist, isLoading: loadingData } = useTransportist(Number(id));
  const createMutation = useCreateTransportist();
  const updateMutation = useUpdateTransportist();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_doc: '6',
      num_doc: '',
      razon_social: '',
      nro_mtc: '',
      telefono: '',
      email: '',
      observaciones: '',
    },
  });

  const tipoDoc = watch('tipo_doc');

  useEffect(() => {
    if (transportist && isEdit) {
      reset({
        tipo_doc: transportist.tipo_doc,
        num_doc: transportist.num_doc,
        razon_social: transportist.razon_social,
        nro_mtc: transportist.nro_mtc || '',
        telefono: transportist.telefono || '',
        email: transportist.email || '',
        observaciones: transportist.observaciones || '',
      });
    }
  }, [transportist, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompanyId) {
      message.error('Seleccione una empresa');
      return;
    }

    const payload = {
      ...values,
      company_id: selectedCompanyId,
      nro_mtc: values.nro_mtc || undefined,
      telefono: values.telefono || undefined,
      email: values.email || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        message.success('Transportista actualizado');
        navigate('/transportists');
      } else {
        const created = await createMutation.mutateAsync(payload);
        message.success('Transportista creado');
        if (embedded && onSuccess) {
          onSuccess(created);
        } else {
          navigate('/transportists');
        }
      }
    } catch {
      message.error('Error al guardar transportista');
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
              label={tipoDoc === '6' ? 'RUC' : 'Numero Documento'}
              validateStatus={errors.num_doc ? 'error' : ''}
              help={errors.num_doc?.message}
              required
              style={{ flex: 1 }}
            >
              <Controller
                name="num_doc"
                control={control}
                render={({ field }) => <Input {...field} maxLength={15} />}
              />
            </Form.Item>
          </Space>

          <Form.Item
            label={tipoDoc === '6' ? 'Razon Social' : 'Nombre Completo'}
            validateStatus={errors.razon_social ? 'error' : ''}
            help={errors.razon_social?.message}
            required
          >
            <Controller
              name="razon_social"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label="Nro MTC"
            validateStatus={errors.nro_mtc ? 'error' : ''}
            help={errors.nro_mtc?.message || 'Registro MTC (requerido por SUNAT para transporte publico)'}
          >
            <Controller
              name="nro_mtc"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Ej: MC1234567" />}
            />
          </Form.Item>

          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item
              label="Telefono"
              validateStatus={errors.telefono ? 'error' : ''}
              help={errors.telefono?.message}
              style={{ flex: 1 }}
            >
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Email"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              style={{ flex: 1 }}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Space>

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
                else navigate('/transportists');
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Actualizar' : 'Crear Transportista'}
            </Button>
          </Space>
        </div>
      </form>
    </Form>
  );

  if (embedded) {
    return formBody;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Transportista' : 'Nuevo Transportista'}
        showBack
        breadcrumbs={[
          { title: 'Transportistas', path: '/transportists' },
          { title: isEdit ? 'Editar' : 'Nuevo' },
        ]}
      />
      <Card loading={isEdit && loadingData} style={{ maxWidth: 800 }}>
        {formBody}
      </Card>
    </div>
  );
}

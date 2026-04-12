import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Switch, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import { useClient, useCreateClient, useUpdateClient } from './hooks/useClients';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { TIPO_DOCUMENTO_OPTIONS } from '@/utils/constants';

const clientSchema = z.object({
  tipo_documento: z.enum(['0', '1', '4', '6', '7'] as const, { error: 'Seleccione tipo' }),
  numero_documento: z.string().min(1, 'Requerido').max(15),
  razon_social: z.string().min(1, 'Requerido').max(255),
  nombre_comercial: z.string().max(255).optional(),
  direccion: z.string().max(255).optional(),
  ubigeo: z.string().optional(),
  distrito: z.string().optional(),
  provincia: z.string().optional(),
  departamento: z.string().optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

type FormValues = z.infer<typeof clientSchema>;

export default function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const { data: client, isLoading: loadingClient } = useClient(Number(id));
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipo_documento: '6',
      numero_documento: '',
      razon_social: '',
      activo: true,
    },
  });

  useEffect(() => {
    if (client && isEdit) {
      reset({
        tipo_documento: client.tipo_documento,
        numero_documento: client.numero_documento,
        razon_social: client.razon_social,
        nombre_comercial: client.nombre_comercial || '',
        direccion: client.direccion || '',
        distrito: client.distrito || '',
        provincia: client.provincia || '',
        departamento: client.departamento || '',
        telefono: client.telefono || '',
        email: client.email || '',
        activo: client.activo,
      });
    }
  }, [client, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompanyId) {
      message.error('Seleccione una empresa');
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: { ...values, company_id: selectedCompanyId } });
        message.success('Cliente actualizado');
      } else {
        await createMutation.mutateAsync({ ...values, company_id: selectedCompanyId });
        message.success('Cliente creado');
      }
      navigate('/clients');
    } catch {
      message.error('Error al guardar cliente');
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'} showBack breadcrumbs={[{ title: 'Clientes', path: '/clients' }, { title: isEdit ? 'Editar' : 'Nuevo' }]} />
      <Card loading={isEdit && loadingClient} style={{ maxWidth: 700 }}>
        <Form layout="vertical" component="div">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Space size="middle">
              <Form.Item label="Tipo Documento" validateStatus={errors.tipo_documento ? 'error' : ''} help={errors.tipo_documento?.message} required>
                <Controller name="tipo_documento" control={control} render={({ field }) => (
                  <Select {...field} style={{ width: 200 }} options={TIPO_DOCUMENTO_OPTIONS} />
                )} />
              </Form.Item>
              <Form.Item label="Numero Documento" validateStatus={errors.numero_documento ? 'error' : ''} help={errors.numero_documento?.message} required>
                <Controller name="numero_documento" control={control} render={({ field }) => <Input {...field} style={{ width: 200 }} />} />
              </Form.Item>
            </Space>

            <Form.Item label="Razon Social / Nombre" validateStatus={errors.razon_social ? 'error' : ''} help={errors.razon_social?.message} required>
              <Controller name="razon_social" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>

            <Form.Item label="Nombre Comercial">
              <Controller name="nombre_comercial" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>

            <Form.Item label="Direccion">
              <Controller name="direccion" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>

            <Space size="middle">
              <Form.Item label="Departamento">
                <Controller name="departamento" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
              <Form.Item label="Provincia">
                <Controller name="provincia" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
              <Form.Item label="Distrito">
                <Controller name="distrito" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Space>

            <Space size="middle">
              <Form.Item label="Telefono">
                <Controller name="telefono" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
              <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                <Controller name="email" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Space>

            <Form.Item label="Activo">
              <Controller name="activo" control={control} render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )} />
            </Form.Item>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => navigate('/clients')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEdit ? 'Actualizar' : 'Crear Cliente'}
                </Button>
              </Space>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

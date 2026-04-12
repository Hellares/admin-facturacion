import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Switch, message, Alert } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { userService } from '@/services/user.service';
import { useCompanies } from '@/features/companies/hooks/useCompanies';

const ROLES = [
  { value: 'super_admin', label: 'Super Administrador' },
  { value: 'company_admin', label: 'Administrador de Empresa' },
  { value: 'company_user', label: 'Usuario de Empresa' },
  { value: 'api_client', label: 'Cliente API' },
  { value: 'read_only', label: 'Solo Lectura' },
];

const USER_TYPES = [
  { value: 'system', label: 'Sistema (admin interno)' },
  { value: 'user', label: 'Usuario (operador)' },
  { value: 'api_client', label: 'Cliente API (integracion externa)' },
];

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Minimo 8 caracteres').optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  role_name: z.string().min(1, 'Seleccione un rol'),
  company_id: z.number().optional(),
  user_type: z.string().min(1, 'Seleccione tipo'),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', Number(id)],
    queryFn: () => userService.getById(Number(id)),
    enabled: isEdit,
  });
  const { data: companies } = useCompanies();

  const createMut = useMutation({
    mutationFn: (data: FormValues) => userService.create(data as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id: uid, data }: { id: number; data: Partial<FormValues> }) =>
      userService.update(uid, data as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_name: 'api_client',
      user_type: 'api_client',
      active: true,
    },
  });

  const selectedRole = watch('role_name');
  const selectedUserType = watch('user_type');

  useEffect(() => {
    if (user && isEdit) {
      reset({
        name: user.name,
        email: user.email,
        role_name: user.role?.name || user.role_name || '',
        company_id: user.company_id ?? undefined,
        user_type: user.user_type,
        active: user.active,
      });
    }
  }, [user, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        ...values,
        password: values.password || undefined,
        password_confirmation: values.password ? values.password_confirmation : undefined,
      };

      if (!isEdit && !values.password) {
        message.error('La contrasena es obligatoria para nuevos usuarios');
        return;
      }

      if (!isEdit && values.password !== values.password_confirmation) {
        message.error('Las contrasenas no coinciden');
        return;
      }

      if (isEdit) {
        await updateMut.mutateAsync({ id: Number(id), data });
        message.success('Usuario actualizado');
      } else {
        await createMut.mutateAsync(data);
        message.success('Usuario creado exitosamente');
      }
      navigate('/users');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      message.error(axiosError?.response?.data?.message || 'Error al guardar');
    }
  };

  const needsCompany = selectedRole !== 'super_admin';
  const isApiClient = selectedUserType === 'api_client';

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        showBack
        breadcrumbs={[{ title: 'Usuarios', path: '/users' }, { title: isEdit ? 'Editar' : 'Nuevo' }]}
      />
      <Card loading={isEdit && isLoading} style={{ maxWidth: 600 }}>
        {isApiClient && !isEdit && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Usuario para integracion API"
            description="Este usuario podra autenticarse via API y obtener un Bearer Token para emitir comprobantes desde un sistema externo."
          />
        )}
        <Form layout="vertical" component="div">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Item label="Nombre" required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
              <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="Ej: API Mi Empresa" />} />
            </Form.Item>
            <Form.Item label="Email" required validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
              <Controller name="email" control={control} render={({ field }) => <Input {...field} placeholder="Ej: api@miempresa.pe" />} />
            </Form.Item>
            <Form.Item
              label={isEdit ? 'Nueva Contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
              required={!isEdit}
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller name="password" control={control} render={({ field }) => <Input.Password {...field} />} />
            </Form.Item>
            {(!isEdit || watch('password')) && (
              <Form.Item label="Confirmar Contrasena" required={!isEdit}>
                <Controller name="password_confirmation" control={control} render={({ field }) => <Input.Password {...field} />} />
              </Form.Item>
            )}
            <Form.Item label="Rol" required validateStatus={errors.role_name ? 'error' : ''} help={errors.role_name?.message}>
              <Controller name="role_name" control={control} render={({ field }) => (
                <Select {...field} options={ROLES} />
              )} />
            </Form.Item>
            {needsCompany && (
              <Form.Item label="Empresa" required>
                <Controller name="company_id" control={control} render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    placeholder="Seleccione empresa"
                    options={(companies || []).map((c) => ({ value: c.id, label: `${c.ruc} - ${c.razon_social}` }))}
                  />
                )} />
              </Form.Item>
            )}
            <Form.Item label="Tipo de Usuario" required>
              <Controller name="user_type" control={control} render={({ field }) => (
                <Select {...field} options={USER_TYPES} />
              )} />
            </Form.Item>
            <Form.Item label="Activo">
              <Controller name="active" control={control} render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )} />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => navigate('/users')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={createMut.isPending || updateMut.isPending}>
                  {isEdit ? 'Actualizar' : 'Crear Usuario'}
                </Button>
              </Space>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

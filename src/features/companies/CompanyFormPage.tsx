import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Tabs, Button, Switch, Space, Row, Col, Divider, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import CertificateUpload from '@/components/common/CertificateUpload';
import { useCompany, useCreateCompany, useUpdateCompany } from './hooks/useCompanies';
import { lookupService } from '@/services/lookup.service';
import type { CompanyFormData } from '@/types/company.types';

const companySchema = z.object({
  ruc: z.string().length(11, 'El RUC debe tener 11 digitos').regex(/^\d+$/, 'Solo numeros'),
  razon_social: z.string().min(1, 'Requerido').max(255),
  nombre_comercial: z.string().max(255).optional(),
  direccion: z.string().min(1, 'Requerido').max(255),
  ubigeo: z.string().length(6, 'Ubigeo debe tener 6 digitos'),
  distrito: z.string().min(1, 'Requerido').max(100),
  provincia: z.string().min(1, 'Requerido').max(100),
  departamento: z.string().min(1, 'Requerido').max(100),
  telefono: z.string().max(50).optional(),
  telefono_2: z.string().max(50).optional(),
  telefono_3: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  email: z.string().email('Email invalido').min(1, 'Requerido'),
  email_ventas: z.string().max(255).optional(),
  email_soporte: z.string().max(255).optional(),
  web: z.string().max(255).optional(),
  facebook: z.string().max(255).optional(),
  instagram: z.string().max(255).optional(),
  twitter: z.string().max(255).optional(),
  linkedin: z.string().max(255).optional(),
  tiktok: z.string().max(255).optional(),
  usuario_sol: z.string().min(1, 'Requerido').max(50),
  clave_sol: z.string().max(100).optional(),
  modo_produccion: z.boolean().optional(),
  activo: z.boolean().optional(),
  enviar_email_cliente: z.boolean().optional(),
  mostrar_cuentas_en_pdf: z.boolean().optional(),
  mostrar_billeteras_en_pdf: z.boolean().optional(),
  mostrar_redes_sociales_en_pdf: z.boolean().optional(),
  mostrar_contactos_adicionales_en_pdf: z.boolean().optional(),
  mensaje_pdf: z.string().max(500).optional(),
  terminos_condiciones_pdf: z.string().max(2000).optional(),
  politica_garantia: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof companySchema>;

export default function CompanyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: company, isLoading: loadingCompany } = useCompany(Number(id));
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const [searchingRuc, setSearchingRuc] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      ruc: '',
      razon_social: '',
      direccion: '',
      ubigeo: '',
      departamento: '',
      provincia: '',
      distrito: '',
      telefono: '',
      telefono_2: '',
      telefono_3: '',
      whatsapp: '',
      email: '',
      email_ventas: '',
      email_soporte: '',
      web: '',
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      usuario_sol: '',
      clave_sol: '',
      modo_produccion: false,
      activo: true,
      enviar_email_cliente: false,
      mostrar_cuentas_en_pdf: false,
      mostrar_billeteras_en_pdf: false,
      mostrar_redes_sociales_en_pdf: false,
      mostrar_contactos_adicionales_en_pdf: false,
      mensaje_pdf: '',
      terminos_condiciones_pdf: '',
      politica_garantia: '',
    },
  });

  useEffect(() => {
    if (company && isEdit) {
      reset({
        ruc: company.ruc,
        razon_social: company.razon_social,
        nombre_comercial: company.nombre_comercial || '',
        direccion: company.direccion,
        ubigeo: company.ubigeo || '',
        distrito: company.distrito || '',
        provincia: company.provincia || '',
        departamento: company.departamento || '',
        telefono: company.telefono || '',
        telefono_2: company.telefono_2 || '',
        telefono_3: company.telefono_3 || '',
        whatsapp: company.whatsapp || '',
        email: company.email || '',
        email_ventas: company.email_ventas || '',
        email_soporte: company.email_soporte || '',
        web: company.web || '',
        facebook: company.facebook || '',
        instagram: company.instagram || '',
        twitter: company.twitter || '',
        linkedin: company.linkedin || '',
        tiktok: company.tiktok || '',
        usuario_sol: company.usuario_sol || '',
        clave_sol: '',
        modo_produccion: company.modo_produccion,
        activo: company.activo,
        enviar_email_cliente: company.enviar_email_cliente ?? false,
        mostrar_cuentas_en_pdf: company.mostrar_cuentas_en_pdf ?? false,
        mostrar_billeteras_en_pdf: company.mostrar_billeteras_en_pdf ?? false,
        mostrar_redes_sociales_en_pdf: company.mostrar_redes_sociales_en_pdf ?? false,
        mostrar_contactos_adicionales_en_pdf: company.mostrar_contactos_adicionales_en_pdf ?? false,
        mensaje_pdf: company.mensaje_pdf || '',
        terminos_condiciones_pdf: company.terminos_condiciones_pdf || '',
        politica_garantia: company.politica_garantia || '',
      });
    }
  }, [company, isEdit, reset]);

  const handleSearchRuc = async (ruc: string) => {
    if (!ruc || ruc.length !== 11) {
      message.warning('Ingrese un RUC valido de 11 digitos');
      return;
    }
    setSearchingRuc(true);
    try {
      const data = await lookupService.ruc(ruc);
      setValue('razon_social', data.nombre_o_razon_social);
      setValue('direccion', data.direccion || '');
      setValue('departamento', data.departamento || '');
      setValue('provincia', data.provincia || '');
      setValue('distrito', data.distrito || '');
      setValue('ubigeo', data.ubigeo_sunat || '');
      message.success(`RUC encontrado: ${data.nombre_o_razon_social}`);
    } catch {
      message.error('No se encontraron datos para el RUC ingresado');
    } finally {
      setSearchingRuc(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!isEdit && !values.clave_sol) {
        message.error('La clave SOL es obligatoria para crear una empresa');
        return;
      }

      const data: CompanyFormData = {
        ...values,
        nombre_comercial: values.nombre_comercial || undefined,
        clave_sol: values.clave_sol || undefined,
        telefono_2: values.telefono_2 || undefined,
        telefono_3: values.telefono_3 || undefined,
        whatsapp: values.whatsapp || undefined,
        email_ventas: values.email_ventas || undefined,
        email_soporte: values.email_soporte || undefined,
        web: values.web || undefined,
        facebook: values.facebook || undefined,
        instagram: values.instagram || undefined,
        twitter: values.twitter || undefined,
        linkedin: values.linkedin || undefined,
        tiktok: values.tiktok || undefined,
        mensaje_pdf: values.mensaje_pdf || undefined,
        terminos_condiciones_pdf: values.terminos_condiciones_pdf || undefined,
        politica_garantia: values.politica_garantia || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data });
        message.success('Empresa actualizada');
      } else {
        await createMutation.mutateAsync(data);
        message.success('Empresa creada');
      }
      navigate('/companies');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const backendMsg = axiosError?.response?.data?.message;
      message.error(backendMsg || 'Error al guardar empresa');
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const tabItems = [
    {
      key: 'general',
      label: 'Informacion General',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form.Item label="RUC" validateStatus={errors.ruc ? 'error' : ''} help={errors.ruc?.message} required>
            <Controller name="ruc" control={control} render={({ field }) => (
              isEdit
                ? <Input {...field} maxLength={11} disabled />
                : <Input.Search {...field} maxLength={11} enterButton={<SearchOutlined />} loading={searchingRuc} onSearch={handleSearchRuc} placeholder="Ingrese RUC y presione buscar" />
            )} />
          </Form.Item>
          <Form.Item label="Razon Social" validateStatus={errors.razon_social ? 'error' : ''} help={errors.razon_social?.message} required>
            <Controller name="razon_social" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
          <Form.Item label="Nombre Comercial">
            <Controller name="nombre_comercial" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
          <Form.Item label="Direccion" validateStatus={errors.direccion ? 'error' : ''} help={errors.direccion?.message} required>
            <Controller name="direccion" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
          <Form.Item label="Ubigeo" validateStatus={errors.ubigeo ? 'error' : ''} help={errors.ubigeo?.message} required>
            <Controller name="ubigeo" control={control} render={({ field }) => <Input {...field} maxLength={6} placeholder="Ej: 150101" />} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Departamento" validateStatus={errors.departamento ? 'error' : ''} help={errors.departamento?.message} required>
                <Controller name="departamento" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Provincia" validateStatus={errors.provincia ? 'error' : ''} help={errors.provincia?.message} required>
                <Controller name="provincia" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Distrito" validateStatus={errors.distrito ? 'error' : ''} help={errors.distrito?.message} required>
                <Controller name="distrito" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Telefono">
                <Controller name="telefono" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message} required>
                <Controller name="email" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'contacto',
      label: 'Contacto y Redes',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Telefono 2">
                <Controller name="telefono_2" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Telefono 3">
                <Controller name="telefono_3" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="WhatsApp">
                <Controller name="whatsapp" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Email Ventas">
                <Controller name="email_ventas" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Email Soporte">
                <Controller name="email_soporte" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Web">
                <Controller name="web" control={control} render={({ field }) => <Input {...field} placeholder="https://..." />} />
              </Form.Item>
            </Col>
          </Row>
          <Divider>Redes Sociales</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Facebook">
                <Controller name="facebook" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Instagram">
                <Controller name="instagram" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Twitter">
                <Controller name="twitter" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="LinkedIn">
                <Controller name="linkedin" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="TikTok">
                <Controller name="tiktok" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'sunat',
      label: 'Credenciales SUNAT',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500 }}>
          <Form.Item label="Usuario SOL" validateStatus={errors.usuario_sol ? 'error' : ''} help={errors.usuario_sol?.message} required>
            <Controller name="usuario_sol" control={control} render={({ field }) => <Input {...field} placeholder="Ej: MODDATOS" />} />
          </Form.Item>
          <Form.Item label="Clave SOL" required={!isEdit}>
            <Controller name="clave_sol" control={control} render={({ field }) => <Input.Password {...field} placeholder={isEdit ? 'Dejar vacio para no cambiar' : 'Ingrese clave SOL'} />} />
          </Form.Item>
          {isEdit && (
            <Form.Item label="Certificado Digital">
              <CertificateUpload companyId={Number(id)} />
            </Form.Item>
          )}
        </Space>
      ),
    },
    {
      key: 'finanzas',
      label: 'Finanzas',
      children: (
        <Typography.Text type="secondary">
          Administre cuentas bancarias y billeteras desde la pagina de detalle de la empresa.
        </Typography.Text>
      ),
    },
    {
      key: 'pdf',
      label: 'PDF',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Mostrar cuentas bancarias en PDF">
                <Controller name="mostrar_cuentas_en_pdf" control={control} render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mostrar billeteras digitales en PDF">
                <Controller name="mostrar_billeteras_en_pdf" control={control} render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mostrar redes sociales en PDF">
                <Controller name="mostrar_redes_sociales_en_pdf" control={control} render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mostrar contactos adicionales en PDF">
                <Controller name="mostrar_contactos_adicionales_en_pdf" control={control} render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mensaje PDF">
            <Controller name="mensaje_pdf" control={control} render={({ field }) => (
              <Input.TextArea {...field} maxLength={500} rows={3} showCount placeholder="Mensaje personalizado para el PDF" />
            )} />
          </Form.Item>
          <Form.Item label="Terminos y Condiciones PDF">
            <Controller name="terminos_condiciones_pdf" control={control} render={({ field }) => (
              <Input.TextArea {...field} maxLength={2000} rows={4} showCount placeholder="Terminos y condiciones a mostrar en el PDF" />
            )} />
          </Form.Item>
          <Form.Item label="Politica de Garantia">
            <Controller name="politica_garantia" control={control} render={({ field }) => (
              <Input.TextArea {...field} maxLength={2000} rows={4} showCount placeholder="Politica de garantia a mostrar en el PDF" />
            )} />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: 'config',
      label: 'Configuracion',
      children: (
        <Space direction="vertical" size="middle" style={{ maxWidth: 400 }}>
          <Form.Item label="Modo Produccion">
            <Controller name="modo_produccion" control={control} render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} checkedChildren="Produccion" unCheckedChildren="Beta" />
            )} />
          </Form.Item>
          <Form.Item label="Activo">
            <Controller name="activo" control={control} render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} />
            )} />
          </Form.Item>
          <Divider plain>Notificaciones</Divider>
          <Form.Item label="Enviar email al cliente" tooltip="Al emitir un documento aceptado por SUNAT, se envia automaticamente el PDF al email del cliente">
            <Controller name="enviar_email_cliente" control={control} render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} checkedChildren="Si" unCheckedChildren="No" />
            )} />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
        showBack
        breadcrumbs={[
          { title: 'Empresas', path: '/companies' },
          { title: isEdit ? 'Editar' : 'Nuevo' },
        ]}
      />
      <Card loading={isEdit && loadingCompany}>
        <Form layout="vertical" component="div">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs items={tabItems} />
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => navigate('/companies')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEdit ? 'Actualizar' : 'Crear Empresa'}
                </Button>
              </Space>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

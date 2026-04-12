import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Divider, message, Space } from 'antd';
import { LockOutlined, MailOutlined, WhatsAppOutlined, MailFilled } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import apiClient from '@/lib/axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState('Facturacion Electronica');
  const [sunatEnv, setSunatEnv] = useState<string>('');

  useEffect(() => {
    apiClient.get('/system/public-info')
      .then((res) => {
        if (res.data?.app_name) setAppName(res.data.app_name);
        if (res.data?.sunat_env) setSunatEnv(res.data.sunat_env);
      })
      .catch(() => { /* silencioso */ });
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      setAuth(response.user, response.access_token);
      message.success('Inicio de sesion exitoso');
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const msg = error.response?.data?.message || 'Error al iniciar sesion';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2a3f5f 0%, #3468a8 50%, #5ba3d9 100%)',
      padding: 24,
    }}>
      <Card style={{ width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>{appName}</Title>
            <Text type="secondary">Panel de Administracion - SUNAT</Text>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ textAlign: 'left' }}>
            <Form.Item
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              style={{ marginBottom: 16 }}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    size="large"
                    autoComplete="email"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
              style={{ marginBottom: 24 }}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    placeholder="Contrasena"
                    size="large"
                    autoComplete="current-password"
                  />
                )}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Iniciar Sesion
            </Button>
          </form>

          {sunatEnv === 'produccion' && (
            <>
              <Divider style={{ margin: '16px 0 12px', fontSize: 12, color: '#999' }}>Aun no tienes cuenta?</Divider>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                  Para obtener acceso al sistema de produccion, contactanos y te configuramos tu empresa.
                </Text>
                <Space size={12}>
                  <Button
                    icon={<WhatsAppOutlined />}
                    style={{ borderRadius: 20, color: '#25d366', borderColor: '#25d366' }}
                    href="https://wa.me/51999999999?text=Hola,%20me%20interesa%20el%20sistema%20de%20facturacion%20electronica"
                    target="_blank"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    icon={<MailFilled />}
                    style={{ borderRadius: 20 }}
                    href="mailto:ventas@syncronize.net.pe?subject=Solicitud%20de%20acceso%20-%20Facturacion%20Electronica"
                    target="_blank"
                  >
                    Email
                  </Button>
                </Space>
              </div>
            </>
          )}

          {sunatEnv === 'beta' && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>No tienes cuenta? </Text>
              <Button type="link" onClick={() => navigate('/registro')} style={{ padding: 0, fontSize: 12, color: '#1677ff' }}>Registrate gratis</Button>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}

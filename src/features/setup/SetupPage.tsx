import { useState } from 'react';
import {
  Card, Steps, Button, Space, Descriptions, Badge, Alert, Form, Input,
  Result, Typography, message, Spin,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, DatabaseOutlined,
  RocketOutlined, HomeOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setupService, type SystemStatus } from '@/services/setup.service';

const { Title, Text } = Typography;

function StatusStep({
  status,
  isLoading,
  onRefresh,
}: {
  status: SystemStatus | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Verificando estado del sistema...</div>
      </div>
    );
  }

  if (!status) {
    return (
      <Alert
        message="No se pudo obtener el estado del sistema"
        description="Verifique que el servidor API este corriendo."
        type="error"
        showIcon
        action={<Button onClick={onRefresh}>Reintentar</Button>}
      />
    );
  }

  const statusIcon = (ok: boolean) =>
    ok ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;

  return (
    <div>
      <Descriptions bordered column={1} size="middle" title="Estado del Sistema">
        <Descriptions.Item label="Base de datos conectada">
          <Space>{statusIcon(status.database_connected)}{status.database_connected ? 'Conectada' : 'Sin conexion'}</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Migraciones pendientes">
          <Space>
            {statusIcon(!status.migrations_pending)}
            {status.migrations_pending ? 'Hay migraciones pendientes' : 'Al dia'}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Seeders ejecutados">
          <Space>{statusIcon(status.seeders_executed)}{status.seeders_executed ? 'Ejecutados' : 'Pendientes'}</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Almacenamiento escribible">
          <Space>{statusIcon(status.storage_writable)}{status.storage_writable ? 'OK' : 'Sin permisos'}</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Empresas registradas">
          <Badge count={status.companies_count} showZero style={{ backgroundColor: status.companies_count > 0 ? '#52c41a' : '#faad14' }} />
        </Descriptions.Item>
        <Descriptions.Item label="Usuarios registrados">
          <Badge count={status.users_count} showZero style={{ backgroundColor: status.users_count > 0 ? '#52c41a' : '#faad14' }} />
        </Descriptions.Item>
        <Descriptions.Item label="Listo para usar">
          <Space>{statusIcon(status.ready_for_use)}{status.ready_for_use ? 'Si' : 'No'}</Space>
        </Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: 16 }}>
        <Button onClick={onRefresh}>Actualizar estado</Button>
      </div>
    </div>
  );
}

function DatabaseStep() {
  const [migrateOutput, setMigrateOutput] = useState<string>('');
  const [seedOutput, setSeedOutput] = useState<string>('');
  const queryClient = useQueryClient();

  const migrateMut = useMutation({
    mutationFn: () => setupService.migrate(),
    onSuccess: (output) => {
      setMigrateOutput(output);
      message.success('Migraciones ejecutadas correctamente');
      queryClient.invalidateQueries({ queryKey: ['setup-status'] });
    },
    onError: () => message.error('Error al ejecutar migraciones'),
  });

  const seedMut = useMutation({
    mutationFn: () => setupService.seed(),
    onSuccess: (output) => {
      setSeedOutput(output);
      message.success('Seeders ejecutados correctamente');
      queryClient.invalidateQueries({ queryKey: ['setup-status'] });
    },
    onError: () => message.error('Error al ejecutar seeders'),
  });

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={5}><DatabaseOutlined /> Migraciones</Title>
          <Text type="secondary">Ejecutar las migraciones de base de datos para crear las tablas necesarias.</Text>
          <div style={{ marginTop: 12 }}>
            <Button
              type="primary"
              loading={migrateMut.isPending}
              onClick={() => migrateMut.mutate()}
            >
              Ejecutar Migraciones
            </Button>
          </div>
          {migrateOutput && (
            <pre style={{
              marginTop: 12, background: '#1e1e1e', color: '#d4d4d4',
              padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto',
              fontSize: 12, lineHeight: 1.5,
            }}>
              {migrateOutput}
            </pre>
          )}
        </div>

        <div>
          <Title level={5}><DatabaseOutlined /> Seeders</Title>
          <Text type="secondary">Ejecutar los seeders para insertar datos iniciales (catalogos, tipos de documento, etc).</Text>
          <div style={{ marginTop: 12 }}>
            <Button
              type="primary"
              loading={seedMut.isPending}
              onClick={() => seedMut.mutate()}
            >
              Ejecutar Seeders
            </Button>
          </div>
          {seedOutput && (
            <pre style={{
              marginTop: 12, background: '#1e1e1e', color: '#d4d4d4',
              padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto',
              fontSize: 12, lineHeight: 1.5,
            }}>
              {seedOutput}
            </pre>
          )}
        </div>
      </Space>
    </div>
  );
}

function CompanyStep({ onComplete }: { onComplete: (result: unknown) => void }) {
  const [form] = Form.useForm();

  const setupMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => setupService.setup(data),
    onSuccess: (result) => {
      message.success('Empresa creada correctamente');
      onComplete(result);
    },
    onError: () => message.error('Error al crear la empresa'),
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setupMut.mutate(values);
    });
  };

  return (
    <div>
      <Title level={5}><HomeOutlined /> Crear Empresa Inicial</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Configure los datos de la primera empresa para comenzar a facturar.
      </Text>

      <Form form={form} layout="vertical" component="div" style={{ maxWidth: 600 }}>
        <Form.Item name="ruc" label="RUC" rules={[{ required: true, message: 'Ingrese el RUC' }, { len: 11, message: 'El RUC debe tener 11 digitos' }]}>
          <Input placeholder="20123456789" maxLength={11} />
        </Form.Item>
        <Form.Item name="razon_social" label="Razon Social" rules={[{ required: true, message: 'Ingrese la razon social' }]}>
          <Input placeholder="Mi Empresa S.A.C." />
        </Form.Item>
        <Form.Item name="direccion" label="Direccion" rules={[{ required: true, message: 'Ingrese la direccion' }]}>
          <Input placeholder="Av. Principal 123" />
        </Form.Item>
        <Form.Item name="ubigeo" label="Ubigeo" rules={[{ required: true, message: 'Ingrese el ubigeo' }, { len: 6, message: 'El ubigeo debe tener 6 digitos' }]}>
          <Input placeholder="150101" maxLength={6} />
        </Form.Item>
        <Form.Item name="distrito" label="Distrito">
          <Input placeholder="Lima" />
        </Form.Item>
        <Form.Item name="provincia" label="Provincia">
          <Input placeholder="Lima" />
        </Form.Item>
        <Form.Item name="departamento" label="Departamento">
          <Input placeholder="Lima" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email invalido' }]}>
          <Input placeholder="admin@empresa.pe" />
        </Form.Item>
        <Form.Item name="usuario_sol" label="Usuario SOL" rules={[{ required: true, message: 'Ingrese el usuario SOL' }]}>
          <Input placeholder="MODDATOS" />
        </Form.Item>
        <Form.Item name="clave_sol" label="Clave SOL" rules={[{ required: true, message: 'Ingrese la clave SOL' }]}>
          <Input.Password placeholder="moddatos" />
        </Form.Item>

        <Button type="primary" icon={<RocketOutlined />} loading={setupMut.isPending} onClick={handleSubmit}>
          Crear Empresa e Inicializar
        </Button>
      </Form>
    </div>
  );
}

function DoneStep({ result }: { result: unknown }) {
  const navigate = useNavigate();

  return (
    <Result
      status="success"
      title="Sistema Configurado Correctamente"
      subTitle="La empresa ha sido creada y el sistema esta listo para usar."
      extra={[
        <Button type="primary" key="login" onClick={() => navigate('/login')}>
          Ir al Login
        </Button>,
        <Button key="dashboard" onClick={() => navigate('/dashboard')}>
          Ir al Dashboard
        </Button>,
      ]}
    >
      {result != null && (
        <div style={{ textAlign: 'left' }}>
          <Title level={5}>Resultado:</Title>
          <pre style={{
            background: '#f5f5f5', padding: 16, borderRadius: 8,
            maxHeight: 200, overflow: 'auto', fontSize: 12,
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Result>
  );
}

export default function SetupPage() {
  const [current, setCurrent] = useState(0);
  const [setupResult, setSetupResult] = useState<unknown>(null);

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['setup-status'],
    queryFn: setupService.getStatus,
    retry: 1,
  });

  const steps = [
    {
      title: 'Estado del Sistema',
      icon: <CheckCircleOutlined />,
      content: <StatusStep status={status} isLoading={isLoading} onRefresh={() => refetch()} />,
    },
    {
      title: 'Base de Datos',
      icon: <DatabaseOutlined />,
      content: <DatabaseStep />,
    },
    {
      title: 'Crear Empresa',
      icon: <HomeOutlined />,
      content: (
        <CompanyStep
          onComplete={(result) => {
            setSetupResult(result);
            setCurrent(3);
          }}
        />
      ),
    },
    {
      title: 'Listo',
      icon: <RocketOutlined />,
      content: <DoneStep result={setupResult} />,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 24,
    }}>
      <Card style={{ width: '100%', maxWidth: 900, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ marginBottom: 4 }}>Configuracion Inicial</Title>
            <Text type="secondary">Asistente de configuracion del sistema de facturacion electronica</Text>
          </div>

          <Steps
            current={current}
            items={steps.map((s) => ({
              title: s.title,
              icon: current === steps.indexOf(s) && isLoading ? <LoadingOutlined /> : s.icon,
            }))}
          />

          <div style={{ minHeight: 300, padding: '16px 0' }}>
            {steps[current].content}
          </div>

          {current < 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                Anterior
              </Button>
              {current < 2 && (
                <Button type="primary" onClick={() => setCurrent((c) => c + 1)}>
                  Siguiente
                </Button>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}

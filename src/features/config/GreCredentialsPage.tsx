import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Tag, Alert, Space, Row, Col, Divider, Modal, message } from 'antd';
import {
  SafetyCertificateOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { greCredentialsService } from '@/services/gre-credentials.service';
import type { GreEnvCredentials } from '@/services/gre-credentials.service';

type Environment = 'beta' | 'produccion';

export default function GreCredentialsPage() {
  const companyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Environment>('beta');
  const [betaForm] = Form.useForm();
  const [prodForm] = Form.useForm();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['gre-credentials', companyId],
    queryFn: () => greCredentialsService.show(companyId!),
    enabled: !!companyId,
  });

  useEffect(() => {
    if (credentials) {
      betaForm.setFieldsValue(credentials.credenciales.beta);
      prodForm.setFieldsValue(credentials.credenciales.produccion);
    }
  }, [credentials, betaForm, prodForm]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['gre-credentials', companyId] });

  const updateMutation = useMutation({
    mutationFn: (values: GreEnvCredentials) =>
      greCredentialsService.update(companyId!, {
        environment: activeTab,
        client_id: values.client_id,
        client_secret: values.client_secret,
        ruc_proveedor: values.ruc_proveedor,
        usuario_sol: values.usuario_sol,
        clave_sol: values.clave_sol,
      }),
    onSuccess: () => {
      message.success('Credenciales guardadas correctamente');
      invalidate();
    },
    onError: () => message.error('Error al guardar credenciales'),
  });

  const testMutation = useMutation({
    mutationFn: () => greCredentialsService.testConnection(companyId!),
    onSuccess: (res) => message.success(res.message || 'Conexion exitosa'),
    onError: () => message.error('Error en la conexion de prueba'),
  });

  const clearMutation = useMutation({
    mutationFn: (env: Environment) => greCredentialsService.clear(companyId!, env),
    onSuccess: () => {
      message.success('Credenciales limpiadas');
      invalidate();
    },
    onError: () => message.error('Error al limpiar credenciales'),
  });

  const copyMutation = useMutation({
    mutationFn: ({ from, to }: { from: Environment; to: Environment }) =>
      greCredentialsService.copy(companyId!, from, to),
    onSuccess: () => {
      message.success('Credenciales copiadas');
      invalidate();
    },
    onError: () => message.error('Error al copiar credenciales'),
  });

  const defaultsMutation = useMutation({
    mutationFn: (env: Environment) => greCredentialsService.getDefaults(env),
    onSuccess: (data) => {
      const form = activeTab === 'beta' ? betaForm : prodForm;
      form.setFieldsValue(data as GreEnvCredentials);
      message.success('Valores por defecto cargados');
    },
    onError: () => message.error('Error al cargar valores por defecto'),
  });

  if (!companyId) {
    return (
      <div>
        <PageHeader title="Credenciales GRE" subtitle="Guias de Remision Electronicas" />
        <Alert message="Seleccione una empresa para configurar las credenciales GRE" type="info" showIcon />
      </div>
    );
  }

  const handleSave = () => {
    const form = activeTab === 'beta' ? betaForm : prodForm;
    form.validateFields().then((values) => {
      updateMutation.mutate(values);
    });
  };

  const handleClear = () => {
    Modal.confirm({
      title: 'Limpiar credenciales',
      content: `Se eliminaran las credenciales de ${activeTab}. Esta accion no se puede deshacer.`,
      okText: 'Limpiar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => clearMutation.mutate(activeTab),
    });
  };

  const handleCopy = () => {
    const from: Environment = activeTab === 'beta' ? 'produccion' : 'beta';
    const to: Environment = activeTab;
    copyMutation.mutate({ from, to });
  };

  const handleLoadDefaults = () => {
    defaultsMutation.mutate(activeTab);
  };

  const renderForm = (form: ReturnType<typeof Form.useForm>[0]) => (
    <Form form={form} layout="vertical" component="div">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="client_id"
            label="Client ID"
            rules={[{ required: true, message: 'Ingrese el Client ID' }]}
          >
            <Input placeholder="Client ID" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="client_secret"
            label="Client Secret"
            rules={[{ required: true, message: 'Ingrese el Client Secret' }]}
          >
            <Input.Password placeholder="Client Secret" />
          </Form.Item>
        </Col>
      </Row>
      <Divider plain>
        Credenciales SOL (opcional)
      </Divider>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="ruc_proveedor" label="RUC Proveedor">
            <Input placeholder="RUC del proveedor" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="usuario_sol" label="Usuario SOL">
            <Input placeholder="Usuario SOL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="clave_sol" label="Clave SOL">
            <Input.Password placeholder="Clave SOL" />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Space wrap>
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={handleSave}
          loading={updateMutation.isPending}
        >
          Guardar
        </Button>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={() => testMutation.mutate()}
          loading={testMutation.isPending}
        >
          Probar Conexion
        </Button>
        <Button
          icon={<ApiOutlined />}
          onClick={handleLoadDefaults}
          loading={defaultsMutation.isPending}
        >
          Cargar Defaults
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopy}
          loading={copyMutation.isPending}
        >
          Copiar de {activeTab === 'beta' ? 'Produccion' : 'Beta'}
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleClear}
          loading={clearMutation.isPending}
        >
          Limpiar
        </Button>
      </Space>
    </Form>
  );

  return (
    <div>
      <PageHeader
        title="Credenciales GRE"
        subtitle="Guias de Remision Electronicas"
        extra={
          credentials && (
            <Space>
              <Tag color={credentials.modo_actual === 'produccion' ? 'green' : 'blue'}>
                Modo: {credentials.modo_actual}
              </Tag>
              <Tag color={credentials.credenciales_configuradas ? 'success' : 'warning'}>
                {credentials.credenciales_configuradas ? 'Configurado' : 'Sin configurar'}
              </Tag>
            </Space>
          )
        }
      />
      <Card loading={isLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as Environment)}
          items={[
            {
              key: 'beta',
              label: 'Beta',
              children: renderForm(betaForm),
            },
            {
              key: 'produccion',
              label: 'Produccion',
              children: renderForm(prodForm),
            },
          ]}
        />
      </Card>
    </div>
  );
}

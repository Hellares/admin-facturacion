import { useEffect, useState } from 'react';
import { Card, Button, Input, Typography, Space, Alert, Descriptions, message, Modal, Tag } from 'antd';
import {
  KeyOutlined,
  CopyOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { showApiError } from '@/lib/api-error';

const { Text, Paragraph } = Typography;

/**
 * Pagina personal donde cada usuario puede ver y generar SU PROPIO token API
 * para consumir el backend desde sistemas de terceros.
 *
 * Un usuario admin_empresa usa esta pagina para obtener un token que despues
 * entrega a su equipo de IT o lo pega en su sistema ERP/facturador propio.
 */
export default function MyApiTokenPage() {
  const user = useAuthStore((s) => s.user);
  const [tokenData, setTokenData] = useState<{
    has_token: boolean;
    access_token?: string;
    api_base_url: string;
    company_id?: number | null;
    created_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [tokenHidden, setTokenHidden] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    userService
      .getTokenInfo(userId)
      .then((data) => setTokenData(data as typeof tokenData))
      .catch((err) => showApiError(err, 'Error al cargar informacion del token'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleGenerate = () => {
    if (!userId) return;
    Modal.confirm({
      title: '¿Generar nuevo token?',
      icon: <ExclamationCircleOutlined />,
      content:
        'Se revocaran todos los tokens anteriores y se generara uno nuevo. Cualquier sistema que este usando el token actual dejara de funcionar hasta que actualices el token.',
      okText: 'Si, generar nuevo',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        setRegenerating(true);
        try {
          const data = await userService.generateToken(userId);
          setTokenData(data as typeof tokenData);
          setTokenHidden(false);
          message.success('Token generado exitosamente');
        } catch (err) {
          showApiError(err, 'Error al generar token');
        } finally {
          setRegenerating(false);
        }
      },
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copiado al portapapeles`);
  };

  const curlExample = tokenData?.access_token
    ? `curl -X GET "${tokenData.api_base_url}/v1/invoices?company_id=${tokenData.company_id ?? 1}" \\
  -H "Authorization: Bearer ${tokenData.access_token}" \\
  -H "Accept: application/json"`
    : '';

  return (
    <div>
      <PageHeader
        title="Mi Token API"
        subtitle="Token personal para consumir la API desde tu sistema externo"
      />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="¿Que es esto?"
          description={
            <Paragraph style={{ margin: 0 }}>
              Con este token puedes conectar tu sistema ERP o facturador propio a este API para
              emitir facturas, boletas, notas y consultar reportes desde el codigo de tu empresa.
              El token es personal e intransferible: da acceso a TU empresa con TUS permisos.
              <br />
              <strong>Nunca compartas este token publicamente.</strong> Si lo pierdes o crees que
              alguien lo tiene, genera uno nuevo — el anterior quedara revocado al instante.
            </Paragraph>
          }
        />

        <Card title={<Space><KeyOutlined /> Tu Token API</Space>} loading={loading}>
          {tokenData?.has_token && tokenData.access_token ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Usuario">
                {user?.name} <Text type="secondary">({user?.email})</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Empresa ID">
                <Tag color="blue">{tokenData.company_id ?? 'Sin empresa'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Base URL">
                <Space>
                  <Text code>{tokenData.api_base_url}</Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(tokenData.api_base_url, 'Base URL')}
                  />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Token">
                <Space.Compact style={{ width: '100%' }}>
                  <Input.Password
                    value={tokenData.access_token}
                    visibilityToggle={{
                      visible: !tokenHidden,
                      onVisibleChange: (v) => setTokenHidden(!v),
                    }}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                  />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(tokenData.access_token!, 'Token')}
                  >
                    Copiar
                  </Button>
                </Space.Compact>
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {tokenData.created_at
                  ? new Date(tokenData.created_at).toLocaleString('es-PE')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Alert
              type="warning"
              showIcon
              message="No tienes un token activo"
              description="Genera uno nuevo para empezar a consumir la API desde tu sistema externo."
            />
          )}

          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              danger={tokenData?.has_token}
              icon={<ReloadOutlined />}
              loading={regenerating}
              onClick={handleGenerate}
            >
              {tokenData?.has_token ? 'Regenerar Token' : 'Generar Token'}
            </Button>
          </div>
        </Card>

        {tokenData?.has_token && tokenData.access_token && (
          <Card title="Ejemplo de uso (curl)" size="small">
            <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
              Para probar rapido que tu token funciona, ejecuta este comando en tu terminal:
            </Paragraph>
            <Input.TextArea
              value={curlExample}
              readOnly
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(curlExample, 'Comando curl')}
              style={{ marginTop: 8 }}
            >
              Copiar comando
            </Button>
          </Card>
        )}

        <Card title="¿Que puedo hacer con el token?" size="small">
          <Paragraph>
            Con tu token puedes consumir cualquier endpoint de la API REST de este sistema. Los
            principales:
          </Paragraph>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Emitir facturas, boletas, notas de credito y debito</li>
            <li>Consultar el estado SUNAT de tus documentos</li>
            <li>Descargar XML, CDR y PDF de cada comprobante</li>
            <li>Anular documentos via Comunicacion de Baja</li>
            <li>Generar reportes en Excel de tus ventas filtradas</li>
            <li>Consultar DNI/RUC de clientes via Factiliza</li>
          </ul>
          <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
            <strong>
              <a href="/api-docs">Ver documentacion completa de endpoints →</a>
            </strong>
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
}

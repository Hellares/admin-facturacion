import { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Switch, Button, Row, Col, Divider, Tag, Space, Table, message, Spin, Alert } from 'antd';
import { SettingOutlined, GlobalOutlined, CloudOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { systemSettingsService, type SystemSettings, type SystemStatus } from '@/services/system-settings.service';

const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  general: { label: 'General', icon: <GlobalOutlined />, color: '#1677ff' },
  sunat: { label: 'SUNAT', icon: <CloudOutlined />, color: '#52c41a' },
};

const FIELD_CONFIG: Record<string, { label: string; type: 'text' | 'url' | 'select' | 'boolean'; options?: { value: string; label: string }[] }> = {
  public_url: { label: 'URL Publica (Dominio)', type: 'url' },
  app_name: { label: 'Nombre del Sistema', type: 'text' },
  sunat_mode: { label: 'Modo SUNAT por defecto (empresas nuevas)', type: 'select', options: [{ value: 'beta', label: 'Beta (Pruebas)' }, { value: 'produccion', label: 'Produccion' }] },
  auto_send_documents: { label: 'Envio automatico a SUNAT', type: 'boolean' },
  max_queue_retries: { label: 'Reintentos maximos', type: 'text' },
};

const StatusIcon = ({ ok }: { ok: boolean }) => ok
  ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
  : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SystemSettings | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    Promise.all([
      systemSettingsService.getAll(),
      systemSettingsService.getStatus(),
    ])
      .then(([settings, st]) => {
        setData(settings);
        setValues(settings.flat);
        setStatus(st);
      })
      .catch(() => message.error('Error al cargar configuracion'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await systemSettingsService.update(values);
      message.success('Configuracion guardada correctamente');
    } catch {
      message.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <PageHeader
        title="Configuracion del Sistema"
        breadcrumbs={[{ title: 'Configuracion del Sistema' }]}
        extra={
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} size="large">
            Guardar Cambios
          </Button>
        }
      />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>

        {/* ESTADO DEL SISTEMA */}
        {status && (
          <>
            {/* Infraestructura */}
            <Card
              size="small"
              title={<Space><span style={{ color: '#722ed1' }}><DatabaseOutlined /></span><span style={{ fontWeight: 500, color: '#555' }}>Infraestructura</span></Space>}
            >
              <Row gutter={16}>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Base de Datos</div>
                    <Space direction="vertical" size={2}>
                      <Space size={4}><StatusIcon ok={status.db_status.connected} /><Tag color="blue" style={{ fontFamily: 'monospace', margin: 0 }}>{status.database}</Tag></Space>
                      {status.db_status.version && <span style={{ fontSize: 11, color: '#888' }}>MySQL {status.db_status.version}</span>}
                      {status.db_status.size_mb != null && <span style={{ fontSize: 11, color: '#888' }}>{status.db_status.size_mb} MB</span>}
                    </Space>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Redis</div>
                    <Space direction="vertical" size={2}>
                      <Space size={4}><StatusIcon ok={status.redis_status.connected} /><span style={{ fontSize: 13 }}>{status.redis_status.connected ? 'Conectado' : 'Desconectado'}</span></Space>
                      {status.redis_status.memory && <span style={{ fontSize: 11, color: '#888' }}>Memoria: {status.redis_status.memory}</span>}
                      {status.redis_status.keys != null && <span style={{ fontSize: 11, color: '#888' }}>Keys: {status.redis_status.keys} (DB {status.redis_status.db})</span>}
                    </Space>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Cola de Trabajo</div>
                    <Space direction="vertical" size={2}>
                      <span style={{ fontSize: 13 }}>Pendientes: <strong>{status.queue_status.pending_jobs}</strong></span>
                      <span style={{ fontSize: 13, color: status.queue_status.failed_jobs > 0 ? '#ff4d4f' : '#888' }}>Fallidos: <strong>{status.queue_status.failed_jobs}</strong></span>
                    </Space>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Storage</div>
                    <Space direction="vertical" size={2}>
                      <Space size={4}><StatusIcon ok={status.storage_status.writable} /><span style={{ fontSize: 13 }}>{status.storage_status.writable ? 'Escritura OK' : 'Sin permisos'}</span></Space>
                      <span style={{ fontSize: 11, color: '#888' }}>Libre: {Math.round(status.storage_status.disk_free_mb / 1024 * 10) / 10} GB / {Math.round(status.storage_status.disk_total_mb / 1024 * 10) / 10} GB</span>
                    </Space>
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0' }} />

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>PHP {status.php_status.version}</div>
                  <Space wrap size={4}>
                    {Object.entries(status.php_status.extensions).map(([ext, loaded]) => (
                      <Tag key={ext} color={loaded ? 'green' : 'red'} style={{ fontSize: 11 }}>{ext}</Tag>
                    ))}
                  </Space>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                    Mem: {status.php_status.memory_limit} | Upload: {status.php_status.upload_max_filesize}
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Ambiente</div>
                  <Space size={8}>
                    <Tag color={status.sunat_env === 'produccion' ? 'red' : 'orange'}>{status.sunat_env.toUpperCase()}</Tag>
                    {status.beta_certificate != null && <Space size={4}><StatusIcon ok={status.beta_certificate} /><span style={{ fontSize: 12 }}>Cert. Beta</span></Space>}
                  </Space>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Datos</div>
                  <Space size={16}>
                    <span style={{ fontSize: 13 }}>Empresas: <strong style={{ color: '#1677ff' }}>{status.counts.companies}</strong></span>
                    <span style={{ fontSize: 13 }}>Usuarios: <strong style={{ color: '#1677ff' }}>{status.counts.users}</strong></span>
                  </Space>
                </Col>
              </Row>

              {status.pending_migrations.length > 0 && (
                <Alert type="warning" showIcon style={{ marginTop: 8 }} message={`${status.pending_migrations.length} migraciones pendientes`} />
              )}
            </Card>

            {/* Conectividad SUNAT */}
            <Card
              size="small"
              title={<Space><span style={{ color: '#52c41a' }}><CloudOutlined /></span><span style={{ fontWeight: 500, color: '#555' }}>Conectividad SUNAT</span></Space>}
            >
              <Table
                size="small"
                pagination={false}
                dataSource={status.sunat_endpoints}
                rowKey="name"
                columns={[
                  { title: 'Servicio', dataIndex: 'name', render: (t: string) => <span style={{ fontSize: 12, fontWeight: 500 }}>{t}</span> },
                  { title: 'URL', dataIndex: 'url', ellipsis: true, render: (t: string) => <code style={{ fontSize: 11 }}>{t}</code> },
                  { title: 'Estado', dataIndex: 'reachable', width: 90, align: 'center' as const, render: (ok: boolean) => <StatusIcon ok={ok} /> },
                  { title: 'HTTP', dataIndex: 'http_code', width: 60, align: 'center' as const, render: (c: number) => c ? <Tag color={c < 400 ? 'green' : 'orange'} style={{ fontSize: 11 }}>{c}</Tag> : '-' },
                  { title: 'Latencia', dataIndex: 'latency_ms', width: 80, align: 'right' as const, render: (ms: number) => ms ? <span style={{ fontSize: 12, color: ms > 1000 ? '#ff4d4f' : '#52c41a' }}>{ms}ms</span> : '-' },
                ]}
              />
            </Card>

            {/* Roles */}
            <Card
              size="small"
              title={
                <Space>
                  <span style={{ color: '#fa8c16' }}><SettingOutlined /></span>
                  <span style={{ fontWeight: 500, color: '#555' }}>Roles del Sistema</span>
                  {status.roles.complete ? <Tag color="green">Completo</Tag> : <Tag color="red">Faltan: {status.roles.missing.join(', ')}</Tag>}
                </Space>
              }
            >
              <Table
                size="small"
                pagination={false}
                dataSource={status.roles.list}
                rowKey="id"
                columns={[
                  { title: 'ID', dataIndex: 'id', width: 50 },
                  { title: 'Nombre', dataIndex: 'name', width: 140, render: (t: string) => <code style={{ fontSize: 12 }}>{t}</code> },
                  { title: 'Display', dataIndex: 'display_name' },
                  { title: 'Sistema', dataIndex: 'is_system', width: 80, align: 'center' as const, render: (v: boolean) => <StatusIcon ok={v} /> },
                  { title: 'Activo', dataIndex: 'active', width: 70, align: 'center' as const, render: (v: boolean) => <StatusIcon ok={v} /> },
                  { title: 'Usuarios', dataIndex: 'users_count', width: 80, align: 'right' as const },
                ]}
              />

              {!status.roles.complete && (
                <Alert type="warning" showIcon style={{ marginTop: 8 }} message={`Faltan roles: ${status.roles.missing.join(', ')}. Ejecute el seeder de roles.`} />
              )}

              <Divider style={{ margin: '8px 0' }} />
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Tablas del Sistema</div>
              <Space wrap size={4}>
                {Object.entries(status.tables).map(([table, exists]) => (
                  <Tag key={table} color={exists ? 'green' : 'red'} style={{ fontSize: 11 }}>{table}</Tag>
                ))}
              </Space>
            </Card>
          </>
        )}

        {/* CONFIGURACION */}
        {data && Object.entries(data.grouped).map(([group, settings]) => {
          const gc = GROUP_LABELS[group] || { label: group, icon: <SettingOutlined />, color: '#999' };
          return (
            <Card
              key={group}
              size="small"
              title={
                <Space>
                  <span style={{ color: gc.color }}>{gc.icon}</span>
                  <span style={{ fontWeight: 500, color: '#555' }}>{gc.label}</span>
                </Space>
              }
            >
              <Form layout="vertical" component="div">
                <Row gutter={16}>
                  {settings.map((s) => {
                    const fc = FIELD_CONFIG[s.key] || { label: s.key, type: 'text' };
                    return (
                      <Col xs={24} sm={12} lg={8} key={s.key}>
                        <Form.Item
                          label={
                            <Space size={4}>
                              <span>{fc.label}</span>
                              {s.description && <Tag style={{ fontSize: 10, fontWeight: 400 }}>{s.key}</Tag>}
                            </Space>
                          }
                          help={s.description}
                          style={{ marginBottom: 16 }}
                        >
                          {fc.type === 'select' ? (
                            <Select
                              value={values[s.key]}
                              onChange={(v) => setValues((prev) => ({ ...prev, [s.key]: v }))}
                              options={fc.options}
                            />
                          ) : fc.type === 'boolean' ? (
                            <Switch
                              checked={values[s.key] === 'true'}
                              onChange={(checked) => setValues((prev) => ({ ...prev, [s.key]: checked ? 'true' : 'false' }))}
                            />
                          ) : (
                            <Input
                              value={values[s.key] || ''}
                              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                              placeholder={fc.type === 'url' ? 'https://tudominio.com' : ''}
                            />
                          )}
                        </Form.Item>
                      </Col>
                    );
                  })}
                </Row>
              </Form>

              {group === 'general' && values.public_url && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <strong>URL de consulta publica:</strong>{' '}
                    <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
                      {values.public_url}/consulta/{'<RUC>'}/{'<TIPO>'}/{'<SERIE-CORRELATIVO>'}
                    </code>
                  </div>
                </>
              )}

              {group === 'sunat' && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ fontSize: 12, color: '#888' }}>
                    Estos son valores por defecto. Cada empresa puede tener su propio modo (beta/produccion) desde su configuracion individual.
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </Space>
    </div>
  );
}

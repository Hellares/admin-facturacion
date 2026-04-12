import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Row, Col, Space, message, Spin } from 'antd';
import {
  FileTextOutlined, FileDoneOutlined, SwapOutlined, CarOutlined, ApiOutlined, QrcodeOutlined,
  LockOutlined, MailOutlined, UserOutlined, BankOutlined, HomeOutlined, CheckCircleOutlined,
  SearchOutlined, RocketOutlined, SettingOutlined, ThunderboltOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/schemas/register.schema';
import { registerService } from '@/services/register.service';
import { useAuthStore } from '@/stores/auth.store';
import apiClient from '@/lib/axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

const { Title, Text, Paragraph } = Typography;

const FEATURES = [
  { icon: <FileTextOutlined />, title: 'Facturas', desc: 'Emision validada por SUNAT con firma digital' },
  { icon: <FileDoneOutlined />, title: 'Boletas', desc: 'Individual o por resumen diario' },
  { icon: <SwapOutlined />, title: 'NC / ND', desc: 'Correcciones, descuentos y devoluciones' },
  { icon: <CarOutlined />, title: 'Guias', desc: 'Despacho electronico GRE' },
  { icon: <ApiOutlined />, title: 'API REST', desc: 'Integra con cualquier sistema' },
  { icon: <QrcodeOutlined />, title: 'QR', desc: 'Consulta y descarga publica' },
];

const STEPS = [
  { num: '01', icon: <UserOutlined />, title: 'Registrate', desc: 'Crea tu cuenta con tu RUC' },
  { num: '02', icon: <SettingOutlined />, title: 'Configura', desc: 'Se configura automaticamente' },
  { num: '03', icon: <ThunderboltOutlined />, title: 'Emite', desc: 'Comienza a facturar al instante' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [rucLoading, setRucLoading] = useState(false);
  const [rucFound, setRucFound] = useState<string | null>(null);
  const [appName, setAppName] = useState('Facturacion Electronica');

  useEffect(() => {
    apiClient.get('/system/public-info')
      .then((res) => { if (res.data?.app_name) setAppName(res.data.app_name); })
      .catch(() => {});
  }, []);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', email: '', password: '', password_confirmation: '',
      ruc: '', razon_social: '', direccion: '',
      ubigeo: '150101', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LIMA',
    },
  });

  const rucValue = watch('ruc');

  const handleRucLookup = async () => {
    if (!rucValue || rucValue.length !== 11) return;
    setRucLoading(true);
    setRucFound(null);
    try {
      const data = await registerService.lookupRuc(rucValue);
      setValue('razon_social', data.nombre_o_razon_social);
      setValue('direccion', data.direccion_completa || data.direccion);
      if (data.departamento) setValue('departamento', data.departamento);
      if (data.provincia) setValue('provincia', data.provincia);
      if (data.distrito) setValue('distrito', data.distrito);
      if (data.ubigeo_sunat) setValue('ubigeo', data.ubigeo_sunat);
      setRucFound(data.nombre_o_razon_social);
    } catch { /* usuario llena manualmente */ }
    finally { setRucLoading(false); }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await registerService.register(values);
      setAuth(response.user, response.access_token);
      message.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const msg = error.response?.data?.message || 'Error al registrarse';
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) { message.error(Object.values(fieldErrors).flat()[0] || msg); }
      else { message.error(msg); }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav className="landing-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={10} align="center">
            <img src="/logo.svg" alt="Logo" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontFamily: 'Airstrike', fontWeight: 'bold', fontSize: 26, color: '#fff', letterSpacing: 1 }}>
              Syncronize
            </span>
          </Space>
          <Space size={12}>
            <Button type="link" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }} onClick={() => navigate('/login')}>Iniciar Sesion</Button>
            <Button style={{ borderRadius: 20, background: '#fff', color: '#004A94', border: 'none', fontWeight: 600, boxShadow: '0 2px 12px rgba(255,255,255,0.2)' }}>
              Empieza Gratis
            </Button>
          </Space>
        </div>
      </nav>

      {/* HERO + FORMULARIO (dos columnas) */}
      <div className="landing-hero">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
        <div className="landing-scan-line" />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Row gutter={60} align="middle">

            {/* IZQUIERDA: info */}
            <Col xs={24} lg={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <img src="/logo.svg" alt="Logo" className="landing-logo-spin" style={{ height: 90, filter: 'brightness(0) invert(1)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Airstrike', fontWeight: 'bold', fontSize: 72, color: '#fff', letterSpacing: 3, lineHeight: 1 }}>
                  Syncronize
                </span>
              </div>

              <div className="landing-badge">
                <span className="landing-pulse-dot" />
                {appName}
              </div>

              <Title style={{ color: '#fff', fontSize: 36, marginBottom: 4, lineHeight: 1.15, fontFamily: 'Orbitron, sans-serif', fontWeight: 400 }}>
                Facturacion Electronica
              </Title>
              <div className="landing-flare" style={{ marginBottom: 16 }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 40, color: '#fff', textTransform: 'uppercase', letterSpacing: 4 }}>
                  para Peru
                </span>
              </div>

              <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 500, marginBottom: 24 }}>
                Emite facturas, boletas, notas de credito, guias de remision y mas. Validado por SUNAT. Conecta via API REST o usa nuestro panel.
              </Paragraph>

              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                <SafetyCertificateOutlined /> Sin costo. Sin tarjeta. Sin certificado digital.
              </div>
            </Col>

            {/* DERECHA: formulario */}
            <Col xs={24} lg={10}>
              <Card style={{ borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Title level={4} style={{ marginBottom: 2 }}>Crea tu cuenta gratuita</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>Emite comprobantes de prueba en segundos</Text>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Form.Item validateStatus={errors.name ? 'error' : ''} help={errors.name?.message} style={{ marginBottom: 8 }}>
                      <Controller name="name" control={control} render={({ field }) => (
                        <Input {...field} prefix={<UserOutlined style={{ color: '#bbb' }} />} placeholder="Nombre completo" size="large" />
                      )} />
                    </Form.Item>

                    <Form.Item validateStatus={errors.email ? 'error' : ''} help={errors.email?.message} style={{ marginBottom: 8 }}>
                      <Controller name="email" control={control} render={({ field }) => (
                        <Input {...field} prefix={<MailOutlined style={{ color: '#bbb' }} />} placeholder="Email" size="large" autoComplete="email" />
                      )} />
                    </Form.Item>

                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item validateStatus={errors.password ? 'error' : ''} help={errors.password?.message} style={{ marginBottom: 8 }}>
                          <Controller name="password" control={control} render={({ field }) => (
                            <Input.Password {...field} prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="Contrasena" size="large" />
                          )} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item validateStatus={errors.password_confirmation ? 'error' : ''} help={errors.password_confirmation?.message} style={{ marginBottom: 8 }}>
                          <Controller name="password_confirmation" control={control} render={({ field }) => (
                            <Input.Password {...field} prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="Confirmar" size="large" />
                          )} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0 10px', paddingTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}><BankOutlined style={{ marginRight: 4 }} /> Datos de la empresa</Text>
                    </div>

                    <Form.Item validateStatus={errors.ruc ? 'error' : ''} help={errors.ruc?.message} style={{ marginBottom: 8 }}>
                      <Controller name="ruc" control={control} render={({ field }) => (
                        <Input
                          {...field} prefix={<BankOutlined style={{ color: '#bbb' }} />} placeholder="RUC (11 digitos)" size="large" maxLength={11}
                          suffix={
                            rucLoading ? <Spin size="small" /> :
                            rucFound ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                            field.value?.length === 11 ? <SearchOutlined style={{ color: '#06b6d4', cursor: 'pointer' }} onClick={handleRucLookup} /> : null
                          }
                          onBlur={(e) => { field.onBlur(); if (e.target.value.length === 11) handleRucLookup(); }}
                        />
                      )} />
                      {rucFound && <div style={{ fontSize: 11, color: '#52c41a', marginTop: 2 }}><CheckCircleOutlined /> {rucFound}</div>}
                    </Form.Item>

                    <Form.Item validateStatus={errors.razon_social ? 'error' : ''} help={errors.razon_social?.message} style={{ marginBottom: 8 }}>
                      <Controller name="razon_social" control={control} render={({ field }) => (
                        <Input {...field} prefix={<BankOutlined style={{ color: '#bbb' }} />} placeholder="Razon Social" size="large" />
                      )} />
                    </Form.Item>

                    <Form.Item validateStatus={errors.direccion ? 'error' : ''} help={errors.direccion?.message} style={{ marginBottom: 14 }}>
                      <Controller name="direccion" control={control} render={({ field }) => (
                        <Input {...field} prefix={<HomeOutlined style={{ color: '#bbb' }} />} placeholder="Direccion fiscal" size="large" />
                      )} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block loading={loading} className="landing-glow-btn" style={{
                      height: 46, fontSize: 15, borderRadius: 10, fontWeight: 600,
                      background: 'linear-gradient(135deg, #004A94, #06b6d4)', border: 'none',
                    }}>
                      <RocketOutlined /> Crear Cuenta Gratis
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Ya tienes cuenta? </Text>
                      <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0, fontSize: 12, color: '#6ba3d6' }}>Inicia sesion</Button>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text style={{ fontSize: 11, color: '#aaa' }}>Listo para produccion? </Text>
                      <a href="https://app.syncronize.net.pe" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#6ba3d6' }}>Contactanos para activar tu cuenta</a>
                    </div>
                  </Space>
                </form>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #f5f7fa, transparent)', zIndex: 3 }} />
      </div>

      {/* FEATURES */}
      <div style={{ background: '#f5f7fa', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20, display: 'block' }}>Documentos soportados</Text>
          <Row gutter={[16, 16]} justify="center">
            {FEATURES.map((f) => (
              <Col key={f.title} xs={12} sm={8} md={4}>
                <div className="landing-feature-card">
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: '0 auto 10px',
                    background: 'linear-gradient(135deg, #004A94, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: '#fff',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>{f.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* COMO FUNCIONA - compacto */}
      <div style={{ background: '#fff', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={4} style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 500, marginBottom: 4 }}>Como funciona</Title>
            <Text type="secondary">3 simples pasos para empezar</Text>
          </div>

          <Row gutter={24}>
            {STEPS.map((s, i) => (
              <Col xs={24} md={8} key={s.num} style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #004A94, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: '#fff',
                    boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)',
                  }}>
                    {s.icon}
                  </div>
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    background: '#f5a623', color: '#fff', fontSize: 10, fontWeight: 700,
                    width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.num}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#1a1a2e' }}>{s.title}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{s.desc}</Text>
                {i < 2 && <div className="landing-step-line" />}
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#0a0a0a', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Space size={8} style={{ marginBottom: 6 }}>
          <img src="/logo.svg" alt="Logo" style={{ height: 18, filter: 'brightness(0) invert(1)', opacity: 0.5 }} />
          <span style={{ fontFamily: 'Airstrike', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Syncronize</span>
        </Space>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 8 }}>
          Sistema de Facturacion Electronica - SUNAT Peru
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          Listo para produccion? <a href="https://app.syncronize.net.pe" target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4' }}>Contactanos para activar tu cuenta</a>
        </div>
      </div>

      <style>{`
        .landing-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          padding: 12px 24px;
          background: rgba(0, 74, 148, 0.15);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .landing-hero {
          min-height: 100vh;
          background: linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #437EFF 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 90px 24px 100px;
          position: relative; overflow: hidden;
        }
        .landing-blob {
          position: absolute; border-radius: 50%;
          filter: blur(60px); mix-blend-mode: soft-light; opacity: 0.5;
          will-change: transform;
        }
        .landing-blob-1 {
          width: 400px; height: 400px; top: 5%; left: -5%;
          background: #06b6d4;
          animation: blob-float-1 16s ease-in-out infinite;
        }
        .landing-blob-2 {
          width: 350px; height: 350px; top: 35%; right: -8%;
          background: #437EFF;
          animation: blob-float-2 18s ease-in-out infinite;
        }
        .landing-blob-3 {
          width: 320px; height: 320px; bottom: 10%; left: 15%;
          background: #5b8fd4;
          animation: blob-float-3 14s ease-in-out infinite;
        }
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(120px, 80px) scale(1.15); }
          40% { transform: translate(50px, 180px) scale(0.9); }
          60% { transform: translate(-90px, 100px) scale(1.1); }
          80% { transform: translate(-40px, 30px) scale(0.95); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-100px, -60px) scale(1.12); }
          40% { transform: translate(-160px, 50px) scale(0.88); }
          60% { transform: translate(-50px, -120px) scale(1.08); }
          80% { transform: translate(60px, -40px) scale(0.93); }
        }
        @keyframes blob-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(110px, -80px) scale(1.15); }
          50% { transform: translate(-60px, -140px) scale(0.85); }
          75% { transform: translate(80px, -40px) scale(1.1); }
        }
        .landing-scan-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent);
          animation: scan-move 8s linear infinite;
          pointer-events: none; z-index: 1;
        }
        @keyframes scan-move {
          0% { top: -1px; }
          100% { top: 100%; }
        }
        .landing-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 6px 18px;
          color: rgba(255,255,255,0.9); font-size: 14px;
          margin-bottom: 20px;
        }
        .landing-pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #52c41a;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .landing-flare {
          position: relative; display: inline-block;
        }
        .landing-flare::before {
          content: ''; position: absolute;
          top: 50%; left: 50%; width: 160%; height: 6px;
          background: linear-gradient(90deg, transparent 2%, rgba(67, 126, 255, 1), rgba(6, 182, 212, 1), rgba(255, 255, 255, 1), rgba(6, 182, 212, 1), rgba(67, 126, 255, 1), transparent 98%);
          transform: translate(-50%, -50%);
          animation: flare-pulse 3s ease-in-out infinite;
          filter: blur(8px); pointer-events: none; z-index: -1;
        }
        .landing-flare::after {
          content: ''; position: absolute;
          top: 50%; left: 50%; width: 120%; height: 140px;
          background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.5) 0%, rgba(67, 126, 255, 0.25) 35%, transparent 70%);
          transform: translate(-50%, -50%);
          animation: flare-pulse 3s ease-in-out infinite 0.3s;
          filter: blur(25px); pointer-events: none; z-index: -1;
        }
        @keyframes flare-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .landing-logo-spin {
          animation: logo-spin-init 1.5s ease-in-out;
        }
        @keyframes logo-spin-init {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        .landing-glow-btn {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.2), 0 0 40px rgba(67, 126, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(67, 126, 255, 0.25); }
        }
        .landing-feature-card {
          padding: 20px 12px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #eee;
          transition: all 0.3s;
          cursor: default;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          height: 100%;
        }
        .landing-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(6, 182, 212, 0.35);
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.12);
        }
        .landing-step-line {
          display: none;
        }
        @media (min-width: 768px) {
          .landing-step-line {
            display: block;
            position: absolute; top: 30px; right: -50%; width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #06b6d4, rgba(6, 182, 212, 0.1));
            pointer-events: none;
          }
        }
        @media (max-width: 992px) {
          .landing-hero { padding: 80px 16px 60px; }
        }
      `}</style>
    </div>
  );
}

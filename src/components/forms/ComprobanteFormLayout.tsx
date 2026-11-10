import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, ConfigProvider, Segmented, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import TotalesResumen from './TotalesResumen';
import { ROUTES } from '@/config/routes.config';

/** Color de acento del diseño A (el mismo del PDF). */
export const ACENTO = '#1f3a5f';

interface FormSectionProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

/** Tarjeta blanca con título, usada por cada bloque del formulario. */
export function FormSection({ title, extra, children }: FormSectionProps) {
  return (
    <section
      style={{
        background: '#fff', border: '1px solid #e2e7ee', borderRadius: 8,
        padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f2328' }}>{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

interface ComprobanteFormLayoutProps {
  tipo: 'boleta' | 'factura';
  children: ReactNode;
  submitting: boolean;
  errorFields: string[];
}

/**
 * Diseño A del formulario de boleta/factura: secciones a la izquierda y, a la derecha
 * y fija, el total grande con el botón de emitir. Debe ir dentro del <form>.
 */
export default function ComprobanteFormLayout({ tipo, children, submitting, errorFields }: ComprobanteFormLayoutProps) {
  const navigate = useNavigate();
  const nombre = tipo === 'boleta' ? 'boleta' : 'factura';

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ACENTO, borderRadius: 8, controlHeight: 24, fontSize: 12 },
        components: { Table: { headerBg: '#f4f6f8', headerColor: '#4a525c' }, Segmented: { itemSelectedColor: ACENTO } },
      }}
    >
    <div className="form-comprobante" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f4f6f8', borderRadius: 8, padding: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>Comprobantes / Nuevo</Typography.Text>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Nuevo comprobante</h1>
        </div>
        <Segmented
          size="large"
          value={tipo}
          onChange={(v) => navigate(v === 'boleta' ? ROUTES.BOLETA_NEW : ROUTES.INVOICE_NEW)}
          options={[{ label: 'Boleta', value: 'boleta' }, { label: 'Factura', value: 'factura' }]}
          aria-label="Tipo de comprobante"
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>

        <aside style={{ flex: '1 1 300px', maxWidth: 380, position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TotalesResumen />
          {errorFields.length > 0 && (
            <Alert type="error" showIcon message="Revise los campos marcados" description={errorFields.join(', ')} />
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<SendOutlined />}
            block
            style={{ height: 48, fontSize: 14, fontWeight: 700, borderRadius: 8, background: '#1e7a4c', borderColor: '#1e7a4c' }}
          >
            Emitir {nombre}
          </Button>
          <Button block size="large" style={{ borderRadius: 8 }} onClick={() => navigate(tipo === 'boleta' ? ROUTES.BOLETAS : ROUTES.INVOICES)}>
            Cancelar
          </Button>
        </aside>
      </div>
    </div>
    </ConfigProvider>
  );
}

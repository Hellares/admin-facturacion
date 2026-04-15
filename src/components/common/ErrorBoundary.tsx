import { Component, type ReactNode } from 'react';
import { Result, Button } from 'antd';
import { devLog } from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    devLog.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="500"
            title="Error inesperado"
            subTitle="Ha ocurrido un error. Por favor recargue la pagina o contacte al administrador."
            extra={[
              <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                Recargar pagina
              </Button>,
              <Button key="home" onClick={() => { window.location.href = '/dashboard'; }}>
                Ir al Dashboard
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{ textAlign: 'left', background: '#f5f5f5', padding: 16, borderRadius: 8, marginTop: 16, maxWidth: 600, overflow: 'auto' }}>
                <pre style={{ fontSize: 12, color: '#ff4d4f' }}>{this.state.error.message}</pre>
                <pre style={{ fontSize: 11, color: '#999' }}>{this.state.error.stack}</pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

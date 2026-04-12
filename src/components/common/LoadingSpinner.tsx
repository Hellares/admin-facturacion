import { Spin } from 'antd';

interface LoadingSpinnerProps {
  tip?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ tip = 'Cargando...', fullPage = false }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}>
        <Spin size="large" tip={tip}><div style={{ padding: 50 }} /></Spin>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spin size="large" tip={tip}><div style={{ padding: 50 }} /></Spin>
    </div>
  );
}

import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="La pagina que busca no existe."
      extra={[
        <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
          Ir al Dashboard
        </Button>,
        <Button key="back" onClick={() => navigate(-1)}>
          Volver
        </Button>,
      ]}
    />
  );
}

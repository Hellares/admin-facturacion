import { Tag, Tooltip } from 'antd';
import { GlobalOutlined, ApiOutlined } from '@ant-design/icons';

type Origen = 'web' | 'api' | string | null | undefined;

interface Props {
  origen: Origen;
  size?: 'small' | 'default';
}

export default function OrigenTag({ origen, size = 'small' }: Props) {
  const isApi = origen === 'api';
  const tooltip = isApi
    ? 'Documento emitido por sistema externo via API'
    : 'Documento emitido desde el portal web';

  const style: React.CSSProperties = {
    margin: 0,
    fontSize: size === 'small' ? 11 : 12,
    padding: size === 'small' ? '0 6px' : '0 8px',
    lineHeight: size === 'small' ? '18px' : '22px',
  };

  return (
    <Tooltip title={tooltip}>
      {isApi ? (
        <Tag color="purple" icon={<ApiOutlined />} style={style}>API</Tag>
      ) : (
        <Tag color="blue" icon={<GlobalOutlined />} style={style}>Web</Tag>
      )}
    </Tooltip>
  );
}

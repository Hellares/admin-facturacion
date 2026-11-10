import { Form, InputNumber } from 'antd';
import { useFormContext } from 'react-hook-form';

// Afectaciones que llevan IGV (gravadas, onerosas o gratuitas). 17 = IVAP, con su propia tasa.
const GRAVADAS = ['10', '11', '12', '13', '14', '15', '16'];

interface IgvDocumentoInputProps {
  value: number;
  onChange: (igv: number) => void;
}

/** IGV % del comprobante: al cambiarlo se aplica a todos los productos gravados. */
export default function IgvDocumentoInput({ value, onChange }: IgvDocumentoInputProps) {
  const { getValues, setValue } = useFormContext();

  const cambiar = (v: number | null) => {
    const igv = v ?? 0;
    onChange(igv);
    const detalles = (getValues('detalles') ?? []) as { tip_afe_igv?: string }[];
    detalles.forEach((d, i) => {
      if (GRAVADAS.includes(d.tip_afe_igv ?? '10')) setValue(`detalles.${i}.porcentaje_igv`, igv);
    });
  };

  return (
    <Form.Item label="IGV %" style={{ marginBottom: 0 }}>
      <InputNumber value={value} onChange={cambiar} min={0} max={100} step={1} style={{ width: '100%' }} />
    </Form.Item>
  );
}

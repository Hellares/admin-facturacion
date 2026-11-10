// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Form } from 'antd';
import IgvDocumentoInput from './IgvDocumentoInput';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

afterEach(cleanup);

function Envoltorio() {
  const [igv, setIgv] = useState(18);
  const methods = useForm({
    defaultValues: {
      detalles: [
        { tip_afe_igv: '10', porcentaje_igv: 18 },
        { tip_afe_igv: '20', porcentaje_igv: 0 },
      ],
    },
  });
  const detalles = useWatch({ control: methods.control, name: 'detalles' });
  return (
    <FormProvider {...methods}>
      <Form layout="vertical" component="div">
        <IgvDocumentoInput value={igv} onChange={setIgv} />
      </Form>
      <output data-testid="pct">{detalles.map((d) => d.porcentaje_igv).join(',')}</output>
    </FormProvider>
  );
}

describe('IgvDocumentoInput', () => {
  it('aplica el IGV a los productos gravados y deja los exonerados en 0', () => {
    render(<Envoltorio />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    expect(screen.getByTestId('pct').textContent).toBe('10,0');
  });
});

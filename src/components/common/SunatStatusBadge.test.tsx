// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { SunatStatus } from '@/types/common.types';
import SunatStatusBadge from './SunatStatusBadge';

afterEach(cleanup);

describe('SunatStatusBadge', () => {
  it('muestra "Validado" para ACEPTADO (vocabulario alineado al filtro)', () => {
    render(<SunatStatusBadge status="ACEPTADO" />);
    expect(screen.getByText('Validado')).toBeTruthy();
  });

  it('muestra "En cola" para EN_COLA (antes salía el string crudo)', () => {
    render(<SunatStatusBadge status="EN_COLA" />);
    expect(screen.getByText('En cola')).toBeTruthy();
  });

  it('anulado prevalece: "Dado de baja" aunque status sea ACEPTADO', () => {
    const { container } = render(<SunatStatusBadge status="ACEPTADO" anulado />);
    expect(screen.getByText('Dado de baja')).toBeTruthy();
    expect(screen.queryByText('Validado')).toBeNull();
    // color volcano del estado ANULADO
    expect(container.querySelector('.ant-tag-volcano')).toBeTruthy();
  });

  it('sin status → "-"', () => {
    render(<SunatStatusBadge status={'' as SunatStatus} />);
    expect(screen.getByText('-')).toBeTruthy();
  });

  it('RECHAZADO con descripción muestra el icono de tooltip', () => {
    const { container } = render(
      <SunatStatusBadge
        status="RECHAZADO"
        sunatInfo={{ codigo: '2335', descripcion: 'Documento dado de baja' }}
      />,
    );
    expect(screen.getByText('Rechazado')).toBeTruthy();
    expect(container.querySelector('.anticon-info-circle')).toBeTruthy();
  });

  it('RECHAZADO sin info NO muestra icono de tooltip', () => {
    const { container } = render(<SunatStatusBadge status="RECHAZADO" />);
    expect(screen.getByText('Rechazado')).toBeTruthy();
    expect(container.querySelector('.anticon-info-circle')).toBeNull();
  });

  it('ACEPTADO (validado) NO muestra icono de tooltip aunque traiga info', () => {
    const { container } = render(
      <SunatStatusBadge status="ACEPTADO" sunatInfo={{ codigo: '0', descripcion: 'Aceptado' }} />,
    );
    expect(container.querySelector('.anticon-info-circle')).toBeNull();
  });

  it('parsea sunatInfo como string JSON crudo y habilita el tooltip', () => {
    const { container } = render(
      <SunatStatusBadge status="ERROR" sunatInfo={'{"code":"3206","message":"x"}'} />,
    );
    expect(screen.getByText('Error')).toBeTruthy();
    expect(container.querySelector('.anticon-info-circle')).toBeTruthy();
  });
});

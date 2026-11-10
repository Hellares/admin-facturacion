// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useCompanyContextStore } from './company-context.store';

const s = () => useCompanyContextStore.getState();

beforeEach(() => {
  s().reset();
});

describe('company-context store', () => {
  it('re-elegir la misma empresa no borra la sucursal', () => {
    s().setSelectedCompany(7);
    s().setSelectedBranch(3);
    s().setSelectedCompany(7);
    expect(s().selectedBranchId).toBe(3);
  });

  it('cambiar de empresa sí borra la sucursal', () => {
    s().setSelectedCompany(7);
    s().setSelectedBranch(3);
    s().setSelectedCompany(8);
    expect(s().selectedBranchId).toBeNull();
  });

  it('el mismo usuario conserva su elección al volver a entrar; otro usuario no', () => {
    s().asegurarDueno(1);
    s().setSelectedCompany(7);
    s().setSelectedBranch(3);

    s().asegurarDueno(1);
    expect(s().selectedCompanyId).toBe(7);
    expect(s().selectedBranchId).toBe(3);

    s().asegurarDueno(2);
    expect(s().selectedCompanyId).toBeNull();
    expect(s().selectedBranchId).toBeNull();
  });
});

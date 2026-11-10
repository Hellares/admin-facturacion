// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LogoUpload from './LogoUpload';
import { companyService } from '@/services/company.service';

vi.mock('@/services/company.service', () => ({
  companyService: { uploadFiles: vi.fn().mockResolvedValue(undefined) },
}));

afterEach(cleanup);

function montar(hasLogo: boolean) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <LogoUpload companyId={7} hasLogo={hasLogo} />
    </QueryClientProvider>,
  );
}

describe('LogoUpload', () => {
  it('indica si ya hay logo', () => {
    montar(true);
    expect(screen.getByText(/Ya tiene un logo cargado/)).toBeTruthy();
  });

  it('sube el archivo elegido como logo_path de la empresa', async () => {
    const { container } = montar(false);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const archivo = new File(['png'], 'logo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [archivo] } });

    fireEvent.click(await screen.findByText('Subir logo'));

    await waitFor(() => expect(companyService.uploadFiles).toHaveBeenCalledTimes(1));
    const [id, formData] = vi.mocked(companyService.uploadFiles).mock.calls[0];
    expect(id).toBe(7);
    expect((formData.get('logo_path') as File).name).toBe('logo.png');
  });
});

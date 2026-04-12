import apiClient from '@/lib/axios';

export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await apiClient.get(url, {
    responseType: 'blob',
    timeout: 45000,
  });

  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}

export async function openPdfInNewTab(url: string): Promise<void> {
  const response = await apiClient.get(url, {
    responseType: 'blob',
    timeout: 45000,
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const pdfUrl = window.URL.createObjectURL(blob);
  window.open(pdfUrl, '_blank');
}

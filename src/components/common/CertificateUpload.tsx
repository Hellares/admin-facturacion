import { useState } from 'react';
import { Upload, Button, Input, Space, message } from 'antd';
import { UploadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import apiClient from '@/lib/axios';

interface CertificateUploadProps {
  companyId: number;
  onSuccess?: () => void;
}

export default function CertificateUpload({ companyId, onSuccess }: CertificateUploadProps) {
  const [password, setPassword] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Seleccione un archivo de certificado');
      return;
    }

    const file = fileList[0];
    const ext = file.name?.toLowerCase().split('.').pop();
    if ((ext === 'pfx' || ext === 'p12') && !password) {
      message.warning('Ingrese la contrasena del certificado PFX/P12');
      return;
    }

    const formData = new FormData();
    formData.append('certificado_pem', file.originFileObj as File);
    if (password) {
      formData.append('certificado_password', password);
    }

    setUploading(true);
    try {
      const response = await apiClient.post(`/v1/companies/${companyId}/upload-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const certInfo = response.data?.data?.certificate_info;
      if (certInfo) {
        message.success(`Certificado subido. Valido hasta: ${certInfo.valid_to}`);
      } else {
        message.success('Certificado subido correctamente');
      }
      setFileList([]);
      setPassword('');
      onSuccess?.();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      message.error(axiosError?.response?.data?.message || 'Error al subir certificado');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Upload
        accept=".pem,.pfx,.p12"
        maxCount={1}
        fileList={fileList}
        beforeUpload={(file) => {
          const isValidSize = file.size / 1024 / 1024 < 2;
          if (!isValidSize) {
            message.error('El certificado debe ser menor a 2MB');
            return false;
          }
          setFileList([{ ...file, originFileObj: file } as UploadFile]);
          return false;
        }}
        onRemove={() => setFileList([])}
      >
        <Button icon={<SafetyCertificateOutlined />}>Seleccionar certificado (.pfx, .pem, .p12)</Button>
      </Upload>
      {fileList.length > 0 && (
        <>
          <Input.Password
            placeholder="Contrasena del certificado (requerida para PFX/P12)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <Button type="primary" onClick={handleUpload} loading={uploading} icon={<UploadOutlined />}>
            Subir certificado
          </Button>
        </>
      )}
    </Space>
  );
}

import { useState } from 'react';
import { Upload, Button, Space, Typography, message } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';

interface LogoUploadProps {
  companyId: number;
  hasLogo: boolean;
}

// Sube el logo que sale en la cabecera de los PDF (el backend acepta PNG/JPG hasta 2 MB).
export default function LogoUpload({ companyId, hasLogo }: LogoUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('logo_path', fileList[0].originFileObj as File);
    setUploading(true);
    try {
      await companyService.uploadFiles(companyId, formData);
      message.success('Logo subido. Saldrá en los comprobantes nuevos.');
      setFileList([]);
      qc.invalidateQueries({ queryKey: ['company', companyId] });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      message.error(axiosError?.response?.data?.message || 'Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Typography.Text type="secondary">
        {hasLogo ? 'Ya tiene un logo cargado. Si sube otro, lo reemplaza.' : 'Aún no tiene logo.'} PNG o JPG, hasta 2 MB.
      </Typography.Text>
      <Upload
        accept=".png,.jpg,.jpeg"
        maxCount={1}
        fileList={fileList}
        beforeUpload={(file) => {
          if (file.size / 1024 / 1024 >= 2) {
            message.error('El logo debe pesar menos de 2 MB');
            return false;
          }
          setFileList([{ ...file, originFileObj: file } as UploadFile]);
          return false;
        }}
        onRemove={() => setFileList([])}
      >
        <Button icon={<PictureOutlined />}>Seleccionar logo (PNG o JPG)</Button>
      </Upload>
      {fileList.length > 0 && (
        <Button type="primary" onClick={handleUpload} loading={uploading} icon={<UploadOutlined />}>
          Subir logo
        </Button>
      )}
    </Space>
  );
}

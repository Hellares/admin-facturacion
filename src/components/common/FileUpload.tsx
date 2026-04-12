import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import apiClient from '@/lib/axios';

interface FileUploadProps {
  url: string;
  fieldName?: string;
  accept?: string;
  maxSizeMB?: number;
  onSuccess?: () => void;
  buttonText?: string;
}

export default function FileUpload({
  url,
  fieldName = 'file',
  accept,
  maxSizeMB = 10,
  onSuccess,
  buttonText = 'Subir archivo',
}: FileUploadProps) {
  const props: UploadProps = {
    name: fieldName,
    accept,
    maxCount: 1,
    showUploadList: true,
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < maxSizeMB;
      if (!isValidSize) {
        message.error(`El archivo debe ser menor a ${maxSizeMB}MB`);
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess: onUploadSuccess, onError }) => {
      const formData = new FormData();
      formData.append(fieldName, file as File);
      try {
        await apiClient.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onUploadSuccess?.(null);
        message.success('Archivo subido correctamente');
        onSuccess?.();
      } catch (err) {
        onError?.(err as Error);
        message.error('Error al subir el archivo');
      }
    },
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>{buttonText}</Button>
    </Upload>
  );
}

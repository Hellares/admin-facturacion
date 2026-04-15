import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Select, message, Modal, InputNumber, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import PageHeader from '@/components/common/PageHeader';
import { useBranch, useCreateBranch, useUpdateBranch } from './hooks/useBranches';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { branchService } from '@/services/branch.service';

const branchSchema = z.object({
  codigo: z.string().min(1, 'Requerido').max(10),
  nombre: z.string().min(1, 'Requerido').max(255),
  direccion: z.string().min(1, 'Requerido').max(255),
  ubigeo: z.string().length(6, 'Ubigeo debe tener 6 digitos').optional().or(z.literal('')),
  distrito: z.string().optional(),
  provincia: z.string().optional(),
  departamento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  series_factura: z.array(z.string()).optional(),
  series_factura_api: z.array(z.string()).optional(),
  series_boleta: z.array(z.string()).optional(),
  series_boleta_api: z.array(z.string()).optional(),
  series_nota_credito: z.array(z.string()).optional(),
  series_nota_credito_api: z.array(z.string()).optional(),
  series_nota_debito: z.array(z.string()).optional(),
  series_nota_debito_api: z.array(z.string()).optional(),
  series_guia_remision: z.array(z.string()).optional(),
  series_guia_remision_api: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof branchSchema>;

const TIPO_DOCUMENTO_OPTIONS = [
  { value: '01', label: '01 - Factura' },
  { value: '03', label: '03 - Boleta' },
  { value: '07', label: '07 - Nota de Credito' },
  { value: '08', label: '08 - Nota de Debito' },
  { value: '09', label: '09 - Guia de Remision' },
];

interface BatchRow {
  tipo_documento: string;
  serie: string;
  correlativo_inicial?: number;
}

export default function BranchFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchRows, setBatchRows] = useState<BatchRow[]>([{ tipo_documento: '01', serie: '', correlativo_inicial: 1 }]);

  const { data: branch, isLoading: loadingBranch } = useBranch(Number(id));
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const batchMut = useMutation({
    mutationFn: (rows: BatchRow[]) => branchService.createCorrelativeBatch(Number(id), rows),
    onSuccess: () => {
      message.success('Series creadas exitosamente');
      setBatchModalOpen(false);
      setBatchRows([{ tipo_documento: '01', serie: '', correlativo_inicial: 1 }]);
    },
    onError: () => message.error('Error al crear series en batch'),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      direccion: '',
      series_factura: [],
      series_factura_api: [],
      series_boleta: [],
      series_boleta_api: [],
      series_nota_credito: [],
      series_nota_credito_api: [],
      series_nota_debito: [],
      series_nota_debito_api: [],
      series_guia_remision: [],
      series_guia_remision_api: [],
    },
  });

  useEffect(() => {
    if (branch && isEdit) {
      reset({
        codigo: branch.codigo,
        nombre: branch.nombre,
        direccion: branch.direccion,
        ubigeo: branch.ubigeo || '',
        distrito: branch.distrito || '',
        provincia: branch.provincia || '',
        departamento: branch.departamento || '',
        telefono: branch.telefono || '',
        email: branch.email || '',
        series_factura: branch.series_factura || [],
        series_factura_api: branch.series_factura_api || [],
        series_boleta: branch.series_boleta || [],
        series_boleta_api: branch.series_boleta_api || [],
        series_nota_credito: branch.series_nota_credito || [],
        series_nota_credito_api: branch.series_nota_credito_api || [],
        series_nota_debito: branch.series_nota_debito || [],
        series_nota_debito_api: branch.series_nota_debito_api || [],
        series_guia_remision: branch.series_guia_remision || [],
        series_guia_remision_api: branch.series_guia_remision_api || [],
      });
    }
  }, [branch, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompanyId) {
      message.error('Seleccione una empresa');
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: { ...values, company_id: selectedCompanyId } });
        message.success('Sucursal actualizada');
      } else {
        await createMutation.mutateAsync({ ...values, company_id: selectedCompanyId });
        message.success('Sucursal creada');
      }
      navigate('/branches');
    } catch {
      message.error('Error al guardar sucursal');
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const addBatchRow = () => setBatchRows([...batchRows, { tipo_documento: '01', serie: '', correlativo_inicial: 1 }]);

  const removeBatchRow = (index: number) => setBatchRows(batchRows.filter((_, i) => i !== index));

  const updateBatchRow = (index: number, field: keyof BatchRow, value: string | number | undefined) => {
    const updated = [...batchRows];
    updated[index] = { ...updated[index], [field]: value };
    setBatchRows(updated);
  };

  const handleBatchSubmit = () => {
    const valid = batchRows.filter((r) => r.tipo_documento && r.serie);
    if (valid.length === 0) {
      message.warning('Agregue al menos una serie valida');
      return;
    }
    batchMut.mutate(valid);
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Sucursal' : 'Nueva Sucursal'} showBack breadcrumbs={[{ title: 'Sucursales', path: '/branches' }, { title: isEdit ? 'Editar' : 'Nuevo' }]} />
      <Card loading={isEdit && loadingBranch} style={{ maxWidth: 800 }}>
        <Form layout="vertical" component="div">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space size="middle">
                <Form.Item label="Codigo" validateStatus={errors.codigo ? 'error' : ''} help={errors.codigo?.message} required>
                  <Controller name="codigo" control={control} render={({ field }) => <Input {...field} style={{ width: 120 }} />} />
                </Form.Item>
                <Form.Item label="Nombre" validateStatus={errors.nombre ? 'error' : ''} help={errors.nombre?.message} required style={{ flex: 1 }}>
                  <Controller name="nombre" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </Space>

              <Form.Item label="Direccion" validateStatus={errors.direccion ? 'error' : ''} help={errors.direccion?.message} required>
                <Controller name="direccion" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>

              <Space size="middle">
                <Form.Item label="Departamento">
                  <Controller name="departamento" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label="Provincia">
                  <Controller name="provincia" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <Form.Item label="Distrito">
                  <Controller name="distrito" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </Space>

              <Divider orientation="left" style={{ marginTop: 8, marginBottom: 8, fontSize: 13 }}>Series Web (emitidas desde el portal)</Divider>

              <Form.Item label="Series Factura">
                <Controller name="series_factura" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: F001" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Boleta">
                <Controller name="series_boleta" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: B001" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Nota Credito">
                <Controller name="series_nota_credito" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: FC01" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Nota Debito">
                <Controller name="series_nota_debito" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: FD01" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Guia Remision">
                <Controller name="series_guia_remision" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: T001" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Divider orientation="left" style={{ marginTop: 16, marginBottom: 8, fontSize: 13 }}>
                Series API (solo uso por integraciones externas)
              </Divider>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                Estas series solo seran usadas por sistemas externos via API. No apareceran al emitir desde el portal.
                Manten numeracion separada (ej: F002, B002) para evitar colisiones de correlativo.
              </div>

              <Form.Item label="Series Factura (API)">
                <Controller name="series_factura_api" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: F002" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Boleta (API)">
                <Controller name="series_boleta_api" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: B002" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Nota Credito (API)">
                <Controller name="series_nota_credito_api" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: FC02" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Nota Debito (API)">
                <Controller name="series_nota_debito_api" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: FD02" tokenSeparators={[',']} />
                )} />
              </Form.Item>

              <Form.Item label="Series Guia Remision (API)">
                <Controller name="series_guia_remision_api" control={control} render={({ field }) => (
                  <Select mode="tags" value={field.value} onChange={field.onChange} placeholder="Ej: T002" tokenSeparators={[',']} />
                )} />
              </Form.Item>
            </Space>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => navigate('/branches')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEdit ? 'Actualizar' : 'Crear Sucursal'}
                </Button>
              </Space>
            </div>
          </form>
        </Form>
      </Card>

      {isEdit && (
        <>
          <Divider />
          <Card title="Correlativos" extra={<Button icon={<PlusOutlined />} onClick={() => setBatchModalOpen(true)}>Crear Serie Batch</Button>}>
            <p style={{ color: '#888' }}>Use el boton "Crear Serie Batch" para agregar multiples series de correlativos a esta sucursal.</p>
          </Card>

          <Modal
            title="Crear Series en Batch"
            open={batchModalOpen}
            onCancel={() => setBatchModalOpen(false)}
            onOk={handleBatchSubmit}
            confirmLoading={batchMut.isPending}
            okText="Crear Series"
            width={700}
          >
            {batchRows.map((row, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Form.Item label={index === 0 ? 'Tipo' : undefined} style={{ marginBottom: 0 }}>
                  <Select
                    value={row.tipo_documento}
                    onChange={(val) => updateBatchRow(index, 'tipo_documento', val)}
                    options={TIPO_DOCUMENTO_OPTIONS}
                    style={{ width: 200 }}
                  />
                </Form.Item>
                <Form.Item label={index === 0 ? 'Serie' : undefined} style={{ marginBottom: 0 }}>
                  <Input
                    value={row.serie}
                    onChange={(e) => updateBatchRow(index, 'serie', e.target.value)}
                    placeholder="Ej: F001"
                    style={{ width: 140 }}
                  />
                </Form.Item>
                <Form.Item label={index === 0 ? 'Correlativo Inicial' : undefined} style={{ marginBottom: 0 }}>
                  <InputNumber
                    value={row.correlativo_inicial}
                    onChange={(val) => updateBatchRow(index, 'correlativo_inicial', val ?? undefined)}
                    min={1}
                    style={{ width: 140 }}
                  />
                </Form.Item>
                {batchRows.length > 1 && (
                  <Button icon={<DeleteOutlined />} danger size="small" onClick={() => removeBatchRow(index)} style={{ marginTop: index === 0 ? 30 : 0 }} />
                )}
              </Space>
            ))}
            <Button type="dashed" onClick={addBatchRow} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 8 }}>
              Agregar fila
            </Button>
          </Modal>
        </>
      )}
    </div>
  );
}

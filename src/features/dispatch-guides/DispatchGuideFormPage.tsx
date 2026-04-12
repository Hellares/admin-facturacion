import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Card, Form, InputNumber, Select, DatePicker, Space, Button, Row, Col, Divider, Checkbox, Input, message } from 'antd';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from '@/lib/dayjs';
import PageHeader from '@/components/common/PageHeader';
import ClientSelector from '@/components/forms/ClientSelector';
import ItemsTable from '@/components/forms/ItemsTable';
import TransportistaForm from '@/components/forms/TransportistaForm';
import DireccionForm from '@/components/forms/DireccionForm';
import { dispatchGuideSchema, type DispatchGuideFormValues } from '@/schemas/dispatch-guide.schema';
import { useCreateDispatchGuide, useDispatchGuide, useTransferReasons } from './hooks/useDispatchGuides';
import { dispatchGuideService } from '@/services/dispatch-guide.service';
import { useCompanyContextStore } from '@/stores/company-context.store';
import { showApiError } from '@/lib/api-error';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function DispatchGuideFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { selectedCompanyId, selectedBranchId, branches } = useCompanyContextStore();
  const createMutation = useCreateDispatchGuide();
  const updateMutation = useMutation({
    mutationFn: ({ guideId, data }: { guideId: number; data: Record<string, unknown> }) =>
      dispatchGuideService.update(guideId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-guides'] }),
  });
  const { data: existingGuide } = useDispatchGuide(isEdit ? Number(id) : 0);
  const { data: transferReasons } = useTransferReasons();

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const seriesGuia = selectedBranch?.series_guia_remision || [];

  const methods = useForm<DispatchGuideFormValues>({
    resolver: zodResolver(dispatchGuideSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
      branch_id: selectedBranchId || 0,
      serie: seriesGuia[0] || '',
      fecha_emision: dayjs().format('YYYY-MM-DD'),
      fecha_traslado: dayjs().format('YYYY-MM-DD'),
      cod_traslado: '01',
      mod_traslado: '02',
      peso_total: 0,
      und_peso_total: 'KGM',
      destinatario: { tipo_documento: '6', numero_documento: '', razon_social: '', direccion: '', email: '' },
      partida: { ubigeo: '', direccion: '' },
      llegada: { ubigeo: '', direccion: '' },
      transportista: { tipo_documento: '6', numero_documento: '', razon_social: '' },
      conductor: { tipo_documento: '1', numero_documento: '' },
      vehiculo_placa: '',
      indicadores: [],
      observaciones: '',
      detalles: [{ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1 }],
    },
  });

  const { handleSubmit, control, reset, formState: { errors } } = methods;

  // Muestra errores de validación del schema para debugging
  const onValidationError = (formErrors: Record<string, unknown>) => {
    const fieldNames = Object.keys(formErrors);
    console.error('Form validation errors:', formErrors);
    message.error(`Campos con error: ${fieldNames.join(', ')}. Revise los campos marcados.`);
  };

  // Cargar datos existentes al editar
  // Nota: la API devuelve transportista/vehiculo como JSON raw (tipo_doc/num_doc),
  // no con los nombres del type TS (tipo_documento/numero_documento)
  useEffect(() => {
    if (!existingGuide || !isEdit) return;
    const g = existingGuide as unknown as Record<string, unknown>;
    const trans = g.transportista as Record<string, string> | null;
    const vehiculo = g.vehiculo as Record<string, unknown> | null;
    const conductor = vehiculo?.conductor as Record<string, string> | null;

    reset({
      company_id: existingGuide.company_id,
      branch_id: existingGuide.branch_id || selectedBranchId || 0,
      serie: existingGuide.serie,
      fecha_emision: existingGuide.fecha_emision,
      fecha_traslado: existingGuide.fecha_traslado,
      cod_traslado: existingGuide.cod_traslado,
      mod_traslado: existingGuide.mod_traslado,
      peso_total: Number(existingGuide.peso_total),
      und_peso_total: existingGuide.und_peso_total || 'KGM',
      num_bultos: existingGuide.num_bultos || undefined,
      destinatario: existingGuide.destinatario || { tipo_documento: '6', numero_documento: '', razon_social: '', direccion: '', email: '' },
      partida: existingGuide.partida || { ubigeo: '', direccion: '' },
      llegada: existingGuide.llegada || { ubigeo: '', direccion: '' },
      transportista: trans ? {
        tipo_documento: trans.tipo_doc || trans.tipo_documento || '6',
        numero_documento: trans.num_doc || trans.numero_documento || '',
        razon_social: trans.razon_social || '',
        nro_mtc: trans.nro_mtc || '',
      } : { tipo_documento: '6', numero_documento: '', razon_social: '' },
      conductor: conductor ? {
        tipo_documento: conductor.tipo_doc || conductor.tipo_documento || '1',
        numero_documento: conductor.num_doc || conductor.numero_documento || '',
        nombres: conductor.nombres || '',
        apellidos: conductor.apellidos || '',
        licencia: conductor.licencia || '',
      } : { tipo_documento: '1', numero_documento: '' },
      vehiculo_placa: vehiculo?.placa as string || vehiculo?.placa_principal as string || existingGuide.vehiculo_placa || '',
      indicadores: existingGuide.indicadores || [],
      observaciones: (g.observaciones as string) || '',
      detalles: existingGuide.detalles || [{ codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1 }],
    });
  }, [existingGuide, isEdit, reset, selectedBranchId]);

  const onSubmit = async (values: DispatchGuideFormValues) => {
    try {
      const data: Record<string, unknown> = {
        company_id: selectedCompanyId || values.company_id,
        branch_id: selectedBranchId || values.branch_id,
        serie: values.serie,
        fecha_emision: values.fecha_emision,
        fecha_traslado: values.fecha_traslado,
        cod_traslado: values.cod_traslado,
        mod_traslado: values.mod_traslado,
        peso_total: values.peso_total,
        und_peso_total: values.und_peso_total,
        num_bultos: values.num_bultos || undefined,
        destinatario: values.destinatario,
        partida: values.partida,
        llegada: values.llegada,
        indicadores: values.indicadores,
        detalles: values.detalles,
        observaciones: values.observaciones || undefined,
      };

      // Flatten transportista for public transport
      if (values.mod_traslado === '01' && values.transportista) {
        data.transportista_tipo_doc = values.transportista.tipo_documento;
        data.transportista_num_doc = values.transportista.numero_documento;
        data.transportista_razon_social = values.transportista.razon_social;
        data.transportista_nro_mtc = values.transportista.nro_mtc || undefined;
      }

      // Flatten conductor for private transport
      if (values.mod_traslado === '02') {
        if (values.conductor) {
          data.conductor_tipo_doc = values.conductor.tipo_documento;
          data.conductor_num_doc = values.conductor.numero_documento;
          data.conductor_nombres = values.conductor.nombres || undefined;
          data.conductor_apellidos = values.conductor.apellidos || undefined;
          data.conductor_licencia = values.conductor.licencia || undefined;
          data.conductor_tipo = 'Principal';
        }
        data.vehiculo_placa = values.vehiculo_placa || undefined;
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ guideId: Number(id), data });
        message.success('Guia actualizada');
        navigate(`/dispatch-guides/${id}`);
      } else {
        const guide = await createMutation.mutateAsync(data as any);
        message.success(`Guia ${guide.numero_completo} creada`);
        navigate(`/dispatch-guides/${guide.id}`);
      }
    } catch (err) {
      showApiError(err, isEdit ? 'Error al actualizar guia' : 'Error al crear guia de remision');
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <PageHeader
          title={isEdit ? `Editar Guia ${existingGuide?.numero_completo || ''}` : 'Nueva Guia de Remision'}
          showBack
          breadcrumbs={[{ title: 'Guias de Remision', path: '/dispatch-guides' }, { title: isEdit ? 'Editar' : 'Nueva' }]}
        />
        <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Datos del Documento" size="small">
              <Form layout="vertical" component="div">
                <Row gutter={16}>
                  <Col xs={24} sm={6} md={3}>
                    <Form.Item label="Serie" required>
                      <Controller name="serie" control={control} render={({ field }) => (
                        <Select {...field} options={seriesGuia.map((s) => ({ value: s, label: s }))} placeholder="T001" />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={4}>
                    <Form.Item label="Fecha Emision" required>
                      <Controller name="fecha_emision" control={control} render={({ field }) => (
                        <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={4}>
                    <Form.Item label="Fecha Traslado" required>
                      <Controller name="fecha_traslado" control={control} render={({ field }) => (
                        <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') || '')} format="DD/MM/YYYY" style={{ width: '100%' }} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={5}>
                    <Form.Item label="Motivo Traslado" required validateStatus={errors.cod_traslado ? 'error' : ''}>
                      <Controller name="cod_traslado" control={control} render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="label" options={(transferReasons || []).map((r) => ({ value: r.codigo, label: `${r.codigo} - ${r.descripcion}` }))} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Item label="Modalidad" required>
                      <Controller name="mod_traslado" control={control} render={({ field }) => (
                        <Select {...field} options={[{ value: '01', label: '01 - Publico' }, { value: '02', label: '02 - Privado' }]} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={6} sm={4} md={2}>
                    <Form.Item label="Peso (kg)" required>
                      <Controller name="peso_total" control={control} render={({ field }) => (
                        <InputNumber {...field} min={0} step={0.1} style={{ width: '100%' }} />
                      )} />
                    </Form.Item>
                  </Col>
                  <Col xs={6} sm={4} md={2}>
                    <Form.Item label="Bultos">
                      <Controller name="num_bultos" control={control} render={({ field }) => (
                        <InputNumber {...field} min={0} style={{ width: '100%' }} />
                      )} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card title="Destinatario" size="small">
              <Form layout="vertical" component="div"><ClientSelector prefix="destinatario" /></Form>
            </Card>

            <Card title="Direcciones" size="small">
              <Form layout="vertical" component="div">
                <DireccionForm prefix="partida" title="Punto de Partida" />
                <Divider />
                <DireccionForm prefix="llegada" title="Punto de Llegada" />
              </Form>
            </Card>

            <Card title="Transporte" size="small">
              <Form layout="vertical" component="div"><TransportistaForm /></Form>
            </Card>

            <Card title="Opciones Adicionales" size="small">
              <Form layout="vertical" component="div">
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Controller
                      name="indicadores"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={(field.value || []).includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L')}
                          onChange={(e) => {
                            const current = field.value || [];
                            field.onChange(
                              e.target.checked
                                ? [...current, 'SUNAT_Envio_IndicadorTrasladoVehiculoM1L']
                                : current.filter((i: string) => i !== 'SUNAT_Envio_IndicadorTrasladoVehiculoM1L'),
                            );
                          }}
                        >
                          Vehiculo M1L (vehiculo menor - no requiere conductor ni placa)
                        </Checkbox>
                      )}
                    />
                  </Col>
                  <Col xs={24} sm={16}>
                    <Form.Item label="Observaciones">
                      <Controller
                        name="observaciones"
                        control={control}
                        render={({ field }) => (
                          <Input.TextArea {...field} rows={2} maxLength={1000} placeholder="Observaciones opcionales" />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card title="Items" size="small">
              <ItemsTable simplified />
              {errors.detalles && typeof errors.detalles.message === 'string' && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{errors.detalles.message}</div>}
            </Card>

            {Object.keys(errors).length > 0 && (
              <Alert
                type="error"
                showIcon
                message="Hay errores en el formulario"
                description={`Campos con error: ${Object.keys(errors).join(', ')}`}
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ textAlign: 'right', paddingBottom: 24 }}>
              <Space>
                <Button onClick={() => navigate('/dispatch-guides')}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending} size="large">
                  {isEdit ? 'Actualizar Guia' : 'Crear Guia de Remision'}
                </Button>
              </Space>
            </div>
          </Space>
        </form>
      </div>
    </FormProvider>
  );
}

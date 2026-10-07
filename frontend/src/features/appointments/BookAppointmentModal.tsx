import { Modal, Form, Select, DatePicker, TimePicker, Input, Alert, Button } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useCreateAppointmentMutation, useGetProvidersByServiceQuery } from './appointmentsApi';
import { useListUsersQuery } from '../users/usersApi';
import { useListServicesQuery } from '../services/servicesApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  serviceId: string;
  providerServiceId: string;
  requestedDate: Dayjs;
  requestedTime: Dayjs;
  providerId: string;
  reason?: string;
  sessionType: "IN_PERSON" | "ONLINE";
}

export default function BookAppointmentModal({ open, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [create, { isLoading, error }] = useCreateAppointmentMutation();
  const { data: servicesData } = useListServicesQuery();

  // Get the currently selected service
  const selectedServiceId = Form.useWatch("serviceId", form);

  const { data: providersData, isLoading: providersLoading } =
    useGetProvidersByServiceQuery(selectedServiceId!, {
      skip: !selectedServiceId,
    });
  const providerOptions =
    providersData?.data?.map((providerService) => ({
      label: `${providerService.provider?.firstName} ${providerService.provider.lastName}`,
      value: providerService.id,
    })) ?? [];
  console.log("selectedServiceId:", selectedServiceId);
  console.log("providersData:", providersData);
  const serviceOptions = (servicesData?.data ?? []).map((service) => ({
    value: service.id,
    label: service.name,
  }));
  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  useEffect(() => {
    form.setFieldValue("providerId", undefined);
  }, [selectedServiceId, form]);

  // Clear provider whenever service changes
  useEffect(() => {
    form.setFieldValue("providerServiceId", undefined);
  }, [selectedServiceId, form]);


  const onFinish = async (values: FormValues) => {

    try {
      await create({
        serviceId: values.serviceId,
        // Provider's actual user ID
        providerId: values.providerId,
        requestedDate: values.requestedDate.format('YYYY-MM-DD'),
        requestedTime: values.requestedTime.format('HH:mm'),
        reason: values.reason,
        sessionType: values.sessionType,
      }).unwrap();
      onClose();
    } catch {
      // error shown via error state
    }
  };

  const apiError =
    error && 'data' in error
      ? (error.data as { message?: string }).message
      : undefined;


  return (
    <Modal title="Book Appointment" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      {apiError && (
        <Alert message={apiError} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          sessionType: "IN_PERSON",
        }}
      >
        <Form.Item
          label="Service"
          name="serviceId"
          rules={[
            {
              required: true,
              message: 'Please select a service'
            }
          ]}
        >
          <Select
            placeholder="Select a service"
            options={serviceOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Provider"
          name="providerServiceId"
          rules={[
            {
              required: true,
              message: "Please select a provider",
            },
          ]}
        >
          <Select
            placeholder="Select a provider"
            loading={providersLoading}
            disabled={!selectedServiceId}
            options={providerOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item label="Session Type" name="sessionType" rules={[{ required: true, message: "Please select a session type", },]} >

          <Select options={[
            {
              value: "IN_PERSON",
              label: "In Person",
            },
            {
              value: "ONLINE",
              label: "Online",
            },
          ]}
          />
        </Form.Item>

        <Form.Item
          label="Preferred Date"
          name="requestedDate"
          rules={[{ required: true, message: 'Please pick a date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="MMM D, YYYY"
            disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
          />
        </Form.Item>

        <Form.Item
          label="Preferred Time"
          name="requestedTime"
          rules={[{
            required: true, message: 'Please pick a time'
          }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={15}
          />
        </Form.Item>

        <Form.Item label="Reason (optional)" name="reason">
          <Input.TextArea
            rows={3}
            placeholder="Describe why you need this appointment…"
            style={{ resize: 'none' }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Book appointment
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

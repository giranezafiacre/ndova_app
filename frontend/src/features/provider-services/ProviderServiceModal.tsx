import { useEffect } from "react";
import {
  Alert,
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
} from "antd";
import { LinkOutlined, PictureOutlined } from "@ant-design/icons";
import { useListServicesQuery } from "@/features/services/servicesApi";
import {
  useCreateProviderServiceMutation,
  useUpdateProviderServiceMutation,
} from "./providerServicesApi";
import type { ProviderService } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  providerService?: ProviderService | null;
}

interface FormValues {
  serviceId: string;
  location: string;
  description: string;
  durationMinutes: number;
  imageUrl?: string;
  meetingLink?: string;
}

export default function ProviderServiceModal({
  open,
  onClose,
  onSaved,
  providerService,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!providerService;
  const { data: servicesData, isLoading: servicesLoading } =
    useListServicesQuery();
  const [createProviderService, { isLoading: creating, error: createError }] =
    useCreateProviderServiceMutation();
  const [updateProviderService, { isLoading: updating, error: updateError }] =
    useUpdateProviderServiceMutation();
  const imageUrl = Form.useWatch("imageUrl", form);
  const isLoading = creating || updating;
  const error = createError ?? updateError;

  useEffect(() => {
    if (open && providerService) {
      form.setFieldsValue({
        serviceId: providerService.serviceId,
        location: providerService.location,
        description: providerService.description,
        durationMinutes: providerService.durationMinutes,
        imageUrl: providerService.imageUrl,
        meetingLink: providerService.meetingLink,
      });
    }
    if (!open) form.resetFields();
  }, [form, open, providerService]);

  const onFinish = async (values: FormValues) => {
    try {
      const normalizedValues = {
        ...values,
        imageUrl: values.imageUrl || undefined,
        meetingLink: values.meetingLink || undefined,
      };

      if (providerService) {
        await updateProviderService({
          id: providerService.id,
          body: {
            location: normalizedValues.location,
            description: normalizedValues.description,
            durationMinutes: +normalizedValues.durationMinutes,
            imageUrl: normalizedValues.imageUrl,
            meetingLink: normalizedValues.meetingLink,
          },
        }).unwrap();
      } else {
        await createProviderService(normalizedValues).unwrap();
      }

      onSaved?.();
      onClose();
    } catch {
      // The API error is displayed in the modal.
    }
  };

  const apiError =
    error && "data" in error
      ? (error.data as { message?: string }).message
      : undefined;

  return (
    <Modal
      title={isEdit ? "Edit Provider Service" : "Add Provider Service"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {apiError && (
        <Alert
          type="error"
          showIcon
          message={apiError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Service"
          name="serviceId"
          rules={[{ required: true, message: "Please select a service" }]}
        >
          <Select
            loading={servicesLoading}
            disabled={isEdit}
            placeholder="Select a service"
            options={(servicesData?.data ?? []).map((service) => ({
              value: service.id,
              label: service.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Service image URL"
          name="imageUrl"
          rules={[{ type: "url", message: "Enter a valid image URL" }]}
        >
          <Input
            prefix={<PictureOutlined />}
            placeholder="https://example.com/service-image.jpg"
          />
        </Form.Item>

        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Service preview"
            height={140}
            width="100%"
            style={{
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 16,
            }}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='140'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
          />
        )}

        <Form.Item
          label="Online meeting link"
          name="meetingLink"
          rules={[{ type: "url", message: "Enter a valid meeting URL" }]}
          extra="Add a Zoom or Google Meet link when this service is available online."
        >
          <Input
            prefix={<LinkOutlined />}
            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
          />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Location is required" }]}
        >
          <Input placeholder="e.g. Kacyiru, Kigali" />
        </Form.Item>

        <Form.Item
          label="Duration"
          name="durationMinutes"
          rules={[{ required: true, message: "Duration is required" }]}
        >
          <Select
            placeholder="Select duration"
            options={[
              { value: 30, label: "30 minutes" },
              { value: 60, label: "60 minutes (1 hour)" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe how you provide this service"
            style={{ resize: "none" }}
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isEdit ? "Save changes" : "Add service"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

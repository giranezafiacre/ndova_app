import { Modal, Form, Input, Alert, Button } from "antd";
import { useEffect } from "react";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "./servicesApi";
import type { Service } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}

interface FormValues {
  name: string;
  description?: string;
}

export default function ServiceModal({ open, onClose, service }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!service;

  const [create, { isLoading: creating, error: createError }] =
    useCreateServiceMutation();
  const [update, { isLoading: updating, error: updateError }] =
    useUpdateServiceMutation();
  const isLoading = creating || updating;
  const error = createError ?? updateError;

  useEffect(() => {
    if (open && service) {
      form.setFieldsValue({
        name: service.name,
        description: service.description,
      });
    }
    if (!open) form.resetFields();
  }, [open, service, form]);

  const onFinish = async (values: FormValues) => {
    try {
      if (isEdit) {
        await update({ id: service.id, body: values }).unwrap();
      } else {
        await create(values).unwrap();
      }
      onClose();
    } catch {
      // error shown via error state
    }
  };

  const apiError =
    error && "data" in error
      ? (error.data as { message?: string }).message
      : undefined;

  return (
    <Modal
      title={isEdit ? "Edit Service" : "New Service"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {apiError && (
        <Alert
          message={apiError}
          type="error"
          showIcon
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
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="e.g. Hair Cut" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Optional description"
            rows={3}
            style={{ resize: "none" }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 8,
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isEdit ? "Save changes" : "Create service"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

import { Modal, Form, Input, Radio, Typography, Divider, Alert } from "antd";
import { useEffect } from "react";
import type { Dayjs } from "dayjs";
import {
  UserOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/app/hooks";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: BookingFormValues) => Promise<void>;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
  providerName: string;
  serviceType: string;
  durationMinutes: number;
  providerLocation: string;
  meetingLink?: string;
  isLoading?: boolean;
}

export interface BookingFormValues {
  fullName: string;
  email: string;
  sessionType: "IN_PERSON" | "ONLINE";
  discussion?: string;
}

export default function BookingConfirmModal({
  open,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  providerName,
  serviceType,
  durationMinutes,
  providerLocation,
  meetingLink,
  isLoading = false,
}: Props) {
  const [form] = Form.useForm<BookingFormValues>();
  const user = useAppSelector((s) => s.auth.user);

  const sessionType = Form.useWatch("sessionType", form);

  // Pre-fill user details whenever the modal opens
  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        sessionType: "IN_PERSON",
      });
    }
    if (!open) form.resetFields();
  }, [open, user, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onConfirm(values);
        form.resetFields();
      })
      .catch(() => {
        // validation errors shown inline
      });
  };

  return (
    <Modal
      title="Confirm your booking"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Confirm booking"
      okButtonProps={{ size: "large", loading: isLoading }}
      cancelButtonProps={{ size: "large" }}
      width={520}
      centered
      destroyOnHidden
    >
      {/* Booking summary */}
      <div className="bg-blue-50 rounded-lg px-4 py-3 mb-5 flex flex-col gap-1">
        <Text strong className="text-gray-800">
          {serviceType} — {providerName}
        </Text>
        <Text className="text-gray-500 text-sm">
          {selectedDate?.format("ddd, MMM D, YYYY")} &middot; {selectedTime}{" "}
          &middot; {durationMinutes} min
        </Text>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        {/* Full name */}
        <Form.Item
          label="Full name"
          name="fullName"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            disabled
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            disabled
          />
        </Form.Item>

        <Divider className="my-4" />

        {/* Session type toggle */}
        <Form.Item
          label="Session type"
          name="sessionType"
          rules={[{ required: true, message: "Select a session type" }]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="IN_PERSON">In Person</Radio.Button>
            <Radio.Button value="ONLINE" disabled={!meetingLink}>
              Online
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {sessionType === "IN_PERSON" && (
          <Form.Item label="Location">
            <Input
              prefix={<EnvironmentOutlined className="text-gray-400" />}
              value={providerLocation}
              disabled
            />
          </Form.Item>
        )}

        {sessionType === "ONLINE" && meetingLink && (
          <Form.Item label="Meeting link">
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              value={meetingLink}
              disabled
            />
          </Form.Item>
        )}

        {!meetingLink && (
          <Alert
            type="info"
            showIcon
            message="This provider currently accepts in-person bookings only."
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Discussion brief */}
        <Form.Item label="What would you like to discuss?" name="discussion">
          <Input.TextArea
            rows={3}
            placeholder="Briefly describe your reason for booking this appointment..."
            style={{ resize: "none" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

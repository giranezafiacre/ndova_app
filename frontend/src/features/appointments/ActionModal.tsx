import { Modal, Form, Input, Alert, Select } from "antd";
import { useState } from "react";
import {
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
} from "./appointmentsApi";
import { useListUsersQuery } from "@/features/users/usersApi";
import { useAppSelector } from "@/app/hooks";

export type ActionType = "approve" | "reject" | "cancel" | "complete";

interface Props {
  open: boolean;
  onClose: () => void;
  action: ActionType | null;
  appointmentId: string | null;
}

const config: Record<
  ActionType,
  { title: string; okText: string; danger: boolean }
> = {
  approve: { title: "Approve Appointment", okText: "Approve", danger: false },
  reject: { title: "Reject Appointment", okText: "Reject", danger: true },
  cancel: {
    title: "Cancel Appointment",
    okText: "Cancel appointment",
    danger: true,
  },
  complete: { title: "Mark as Complete", okText: "Complete", danger: false },
};

interface ModalFormValues {
  note?: string;
  providerId?: string;
}

export default function ActionModal({
  open,
  onClose,
  action,
  appointmentId,
}: Props) {
  const [form] = Form.useForm<ModalFormValues>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const isAdmin = roles.includes("ADMIN");

  // Fetch providers only when admin is approving
  const shouldFetchProviders = open && action === "approve" && isAdmin;
  const { data: usersData } = useListUsersQuery(undefined, {
    skip: !shouldFetchProviders,
  });

  const providerOptions = (usersData?.data ?? [])
    .filter((u) => u.roles.includes("PROVIDER"))
    .map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    }));

  const [approve, { isLoading: approving }] = useApproveAppointmentMutation();
  const [reject, { isLoading: rejecting }] = useRejectAppointmentMutation();
  const [cancel, { isLoading: cancelling }] = useCancelAppointmentMutation();
  const [complete, { isLoading: completing }] =
    useCompleteAppointmentMutation();

  const isLoading = approving || rejecting || cancelling || completing;

  const handleOk = async () => {
    if (!action || !appointmentId) return;
    const values = form.getFieldsValue();
    setErrorMsg(null);

    try {
      switch (action) {
        case "approve":
          await approve({
            id: appointmentId,
            adminNote: values.note,
            providerId: values.providerId,
          }).unwrap();
          break;
        case "reject":
          await reject({ id: appointmentId, adminNote: values.note }).unwrap();
          break;
        case "cancel":
          await cancel({ id: appointmentId, note: values.note }).unwrap();
          break;
        case "complete":
          await complete({
            id: appointmentId,
            adminNote: values.note,
          }).unwrap();
          break;
      }
      form.resetFields();
      onClose();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } }).data?.message ??
        "Action failed";
      setErrorMsg(msg);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setErrorMsg(null);
    onClose();
  };

  const cfg = action ? config[action] : null;

  return (
    <Modal
      title={cfg?.title}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={cfg?.okText}
      okButtonProps={{ loading: isLoading, danger: cfg?.danger }}
      destroyOnHidden
    >
      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        {action === "approve" && isAdmin && (
          <Form.Item label="Assign Provider (optional)" name="providerId">
            <Select
              placeholder="Select a provider"
              options={providerOptions}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        <Form.Item label="Note (optional)" name="note">
          <Input.TextArea
            rows={3}
            placeholder="Add an optional note…"
            style={{ resize: "none" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { useState } from "react";
import { Table, Button, Typography, Space, Spin, Alert, message } from "antd";
import type { TableColumnsType } from "antd";
// import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useListAppointmentsQuery } from "./appointmentsApi";
import BookAppointmentModal from "./BookAppointmentModal";
import ActionModal from "./ActionModal";
import type { ActionType } from "./ActionModal";
import StatusTag from "@/components/common/StatusTag";
import { useAppSelector } from "@/app/hooks";
import { formatDate } from "@/utils/format";
import type { Appointment, AppointmentStatus } from "@/types";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface ActionConfig {
  action: ActionType;
  label: string;
  danger?: boolean;
  primary?: boolean;
}

function getAvailableActions(
  status: AppointmentStatus,
  roleKey: string,
): ActionConfig[] {
  if (roleKey === "CLIENT") {
    if (status === "PENDING" || status === "APPROVED") {
      return [{ action: "cancel", label: "Cancel", danger: true }];
    }
    return [];
  }
  if (roleKey === "PROVIDER" || roleKey === "ADMIN") {
    if (status === "PENDING") {
      return [
        { action: "approve", label: "Approve", primary: true },
        { action: "reject", label: "Reject", danger: true },
      ];
    }
    if (status === "APPROVED") {
      return [
        { action: "complete", label: "Complete", primary: true },
        { action: "cancel", label: "Cancel", danger: true },
      ];
    }
    return [];
  }
  return [];
}

function getRoleKey(roles: string[]): string {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("PROVIDER")) return "PROVIDER";
  return "CLIENT";
}

export default function AppointmentsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const roleKey = getRoleKey(roles);
  const isClient = roleKey === "CLIENT";

  const { data, isLoading, error } = useListAppointmentsQuery();

  const [bookOpen, setBookOpen] = useState(false);
  const [actionState, setActionState] = useState<{
    open: boolean;
    action: ActionType | null;
    appointmentId: string | null;
  }>({ open: false, action: null, appointmentId: null });
console.log('appointment data: ',data)
  const openAction = (appt: Appointment, action: ActionType) => {
    setActionState({ open: true, action, appointmentId: appt.id });
  };

  const closeAction = () => {
    setActionState({ open: false, action: null, appointmentId: null });
  };

  const handleActionSuccess = () => {
    void messageApi.success("Done");
    closeAction();
  };

  const serviceCol: TableColumnsType<Appointment>[number] = {
    title: "Service",
    key: "service",
    render: (_, r) => r.service?.name ?? "—",
  };

  const clientCol: TableColumnsType<Appointment>[number] = {
    title: "Client",
    key: "client",
    render: (_, r) =>
      r.client ? `${r.client.firstName} ${r.client.lastName}` : "—",
  };

  const providerCol: TableColumnsType<Appointment>[number] = {
    title: "Provider",
    key: "provider",
    render: (_, r) =>
      r.provider
        ? `${r.provider.firstName} ${r.provider.lastName}`
        : "Unassigned",
  };

  const actionsCol: TableColumnsType<Appointment>[number] = {
    title: "",
    key: "actions",
    width: 180,
    render: (_, r) => {
      const actions = getAvailableActions(r.status, roleKey);
      if (actions.length === 0) return null;
      return (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          {actions.map((a) => (
            <Button
              key={a.action}
              size="small"
              danger={a.danger}
              type={a.primary ? "primary" : "default"}
              onClick={() => openAction(r, a.action)}
            >
              {a.label}
            </Button>
          ))}
        </Space>
      );
    },
  };

  const sharedCols: TableColumnsType<Appointment> = [
    {
      title: "Date",
      key: "date",
      width: 120,
      render: (_, r) => formatDate(r.requestedDate),
    },
    { title: "Time", dataIndex: "requestedTime", key: "time", width: 90 },
    {
      title: "Session",
      key: "sessionType",
      width: 120,
      render: (_, r) => (r.sessionType === "ONLINE" ? "Online" : "In person"),
    },
    {
      title: "Duration",
      key: "duration",
      width: 100,
      render: (_, r) => (r.durationMinutes ? `${r.durationMinutes} min` : "—"),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => <StatusTag status={r.status} />,
    },
    actionsCol,
  ];

  const columnsByRole: Record<string, TableColumnsType<Appointment>> = {
    CLIENT: [serviceCol, providerCol, ...sharedCols],
    PROVIDER: [clientCol, serviceCol, ...sharedCols],
    ADMIN: [clientCol, serviceCol, providerCol, ...sharedCols],
  };

  const columns = columnsByRole[roleKey] ?? columnsByRole.CLIENT;

  return (
    <>
      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
            {isClient ? "My Appointments" : "Appointments"}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {isClient
              ? "Track and manage your bookings"
              : "Review and action appointment requests"}
          </Text>
        </div>
        {isClient && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setBookOpen(true)}
          >
            Book appointment
          </Button>
        )} 
      </div>

      {error && (
        <Alert
          type="error"
          message="Failed to load appointments"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? (
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E8EAF0",
            overflow: "hidden",
          }}
        >
          <Table<Appointment>
            columns={columns}
            dataSource={data?.data ?? []}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            locale={{ emptyText: "No appointments found" }}
            onRow={(record) => ({
              onClick: () => navigate(`/appointments/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        </div>
      )}

      <BookAppointmentModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
      />

      <ActionModal
        open={actionState.open}
        onClose={handleActionSuccess}
        action={actionState.action}
        appointmentId={actionState.appointmentId}
      />
    </>
  );
}

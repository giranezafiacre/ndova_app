import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Spin,
  Alert,
  Divider,
} from "antd";
import type { TableColumnsType } from "antd";
import { useGetAdminDashboardQuery } from "./dashboardApi";
import StatusTag from "@/components/common/StatusTag";
import type { Appointment } from "@/types";

const { Title, Text } = Typography;

const recentColumns: TableColumnsType<Appointment> = [
  {
    title: "Client",
    key: "client",
    render: (_, r) =>
      r.client ? `${r.client.firstName} ${r.client.lastName}` : "—",
  },
  {
    title: "Service",
    key: "service",
    render: (_, r) => r.service?.name ?? "—",
  },
  {
    title: "Provider",
    key: "provider",
    render: (_, r) =>
      r.provider
        ? `${r.provider.firstName} ${r.provider.lastName}`
        : "Unassigned",
  },
  { title: "Date", dataIndex: "requestedDate", key: "date" },
  { title: "Time", dataIndex: "requestedTime", key: "time" },
  {
    title: "Status",
    key: "status",
    render: (_, r) => <StatusTag status={r.status} />,
  },
];

const apptStatItems = [
  { key: "total", label: "Total", color: "#006BFF" },
  { key: "pending", label: "Pending", color: "#FA8C16" },
  { key: "approved", label: "Approved", color: "#1677FF" },
  { key: "completed", label: "Completed", color: "#52C41A" },
  { key: "rejected", label: "Rejected", color: "#FF4D4F" },
  { key: "cancelled", label: "Cancelled", color: "#8C8C8C" },
] as const;

export default function AdminDashboard() {
  const { data, isLoading, error } = useGetAdminDashboardQuery();
  const dashboard = data?.data;

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Failed to load dashboard data." showIcon />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Platform overview
        </Text>
      </div>

      {/* Users + Services */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title={
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  Total Users
                </Text>
              }
              value={dashboard?.users.total ?? 0}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: "#006BFF" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title={
                <Text style={{ fontSize: 12, color: "#6B7280" }}>Clients</Text>
              }
              value={dashboard?.users.clients ?? 0}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: "#722ED1" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title={
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  Providers
                </Text>
              }
              value={dashboard?.users.providers ?? 0}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: "#13C2C2" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card styles={{ body: { padding: "16px 20px" } }}>
            <Statistic
              title={
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  Active Services
                </Text>
              }
              value={dashboard?.services.total ?? 0}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: "#52C41A" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0 16px" }} />

      {/* Appointment stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {apptStatItems.map(({ key, label, color }) => (
          <Col xs={12} sm={8} lg={4} key={key}>
            <Card styles={{ body: { padding: "16px 20px" } }}>
              <Statistic
                title={
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {label}
                  </Text>
                }
                value={dashboard?.appointments[key] ?? 0}
                valueStyle={{ fontSize: 28, fontWeight: 700, color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="Recent Appointments"
        styles={{ header: { fontWeight: 600 } }}
      >
        <Table<Appointment>
          columns={recentColumns}
          dataSource={dashboard?.recentAppointments ?? []}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: "No appointments yet" }}
        />
      </Card>
    </div>
  );
}

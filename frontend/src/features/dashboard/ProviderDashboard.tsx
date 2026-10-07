import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Spin,
  Alert,
  Button,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { useGetProviderDashboardQuery } from "./dashboardApi";
import StatusTag from "@/components/common/StatusTag";
import type { Appointment } from "@/types";
import ProviderServiceModal from "@/features/provider-services/ProviderServiceModal";

const { Title, Text } = Typography;

const columns: TableColumnsType<Appointment> = [
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
  { title: "Date", dataIndex: "requestedDate", key: "date" },
  { title: "Time", dataIndex: "requestedTime", key: "time" },
  {
    title: "Status",
    key: "status",
    render: (_, r) => <StatusTag status={r.status} />,
  },
];

const statItems = [
  { key: "total", label: "Total", color: "#006BFF" },
  { key: "pending", label: "Pending", color: "#FA8C16" },
  { key: "approved", label: "Approved", color: "#1677FF" },
  { key: "completed", label: "Completed", color: "#52C41A" },
  { key: "rejected", label: "Rejected", color: "#FF4D4F" },
  { key: "cancelled", label: "Cancelled", color: "#8C8C8C" },
] as const;

export default function ProviderDashboard() {
  const [providerServiceModalOpen, setProviderServiceModalOpen] =
    useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { data, isLoading, error } = useGetProviderDashboardQuery();
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
            Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Your appointment overview
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setProviderServiceModalOpen(true)}
        >
          Create Service
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statItems.map(({ key, label, color }) => (
          <Col xs={12} sm={8} lg={4} key={key}>
            <Card styles={{ body: { padding: "16px 20px" } }}>
              <Statistic
                title={
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {label}
                  </Text>
                }
                value={dashboard?.summary[key] ?? 0}
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
          columns={columns}
          dataSource={dashboard?.recentAppointments ?? []}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: "No appointments yet" }}
        />
      </Card>

      {providerServiceModalOpen && (
        <ProviderServiceModal
          open
          onClose={() => setProviderServiceModalOpen(false)}
          onSaved={() => {
            void messageApi.success("Provider service created");
          }}
        />
      )}
    </div>
  );
}

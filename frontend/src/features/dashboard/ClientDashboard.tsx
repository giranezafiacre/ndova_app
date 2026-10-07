import { Spin, Alert, Typography } from "antd";
import { useGetClientDashboardQuery } from "./dashboardApi";

const {} = Typography;

export default function ClientDashboard() {
  const { isLoading, error } = useGetClientDashboardQuery();

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
      {/* <div style={{ marginBottom: 20 }}> */}
      {/* <Title level={4} style={{ margin: 0, color: '#1A1C1E' }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Your appointment summary
        </Text> */}
      {/* </div> */}
      {/* <Tabs defaultActiveKey="1" items={items} /> */}
    </div>
  );
}

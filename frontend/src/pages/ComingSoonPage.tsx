import { Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  title: string;
}

export default function ComingSoonPage({ title }: Props) {
  return (
    <div>
      <Title level={4} style={{ margin: "0 0 24px", color: "#1A1C1E" }}>
        {title}
      </Title>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E8EAF0",
          borderRadius: 12,
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <ClockCircleOutlined
          style={{ fontSize: 40, color: "#006BFF", marginBottom: 16 }}
        />
        <Title level={5} style={{ color: "#1A1C1E", marginBottom: 4 }}>
          Coming soon
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          This module will be built in the next step.
        </Text>
      </div>
    </div>
  );
}

import { Form, Input, Button, Typography, Alert, Row, Col, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { useRegisterMutation } from "./authApi";
import { setCredentials } from "./authSlice";
import type { RegisterRequest } from "@/types";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();

  const onFinish = async (values: RegisterRequest) => {
    try {
      const res = await register(values).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      navigate("/dashboard");
    } catch {
      // error displayed via RTK Query error state
    }
  };

  const apiError =
    error && "data" in error
      ? (error.data as { message?: string }).message
      : undefined;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 w-full max-w-[680px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl mb-4">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Create your account
          </Title>
          <Text type="secondary" className="text-sm mt-1 block">
            Get started with Ndova
          </Text>
        </div>

        {apiError && (
          <Alert message={apiError} type="error" showIcon className="mb-5" />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="First name"
                name="firstName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="Jane" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last name"
                name="lastName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Enter a valid email",
                  },
                ]}
              >
                <Input placeholder="you@example.com" autoComplete="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone (optional)" name="phone">
                <Input placeholder="+1 555 000 0000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="I want to join as"
            name="role"
            rules={[{ required: true, message: "Select an account type" }]}
          >
            <Select
              placeholder="Choose your account type"
              options={[
                { label: "Client", value: "CLIENT" },
                { label: "Provider", value: "PROVIDER" },
              ]}
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            className="mb-6"
            title="Which account should I choose?"
            description={
              <div className="space-y-1">
                <div>
                  <Text strong>Client:</Text> Find providers and book
                  appointments for services you need.
                </div>
                <div>
                  <Text strong>Provider:</Text> Create service offerings and
                  manage appointments from clients.
                </div>
              </div>
            }
          />

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Create account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text type="secondary" className="text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: "#006BFF" }}
            >
              Sign in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

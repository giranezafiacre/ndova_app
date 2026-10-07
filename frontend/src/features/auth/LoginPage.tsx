import { Form, Input, Button, Typography, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';
import type { LoginRequest } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();

  const onFinish = async (values: LoginRequest) => {
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      navigate('/dashboard');
    } catch {
      // error displayed via RTK Query error state
    }
  };

  const apiError =
    error && 'data' in error
      ? (error.data as { message?: string }).message
      : undefined;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 w-full max-w-[420px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl mb-4">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Sign in to Ndova
          </Title>
          <Text type="secondary" className="text-sm mt-1 block">
            Manage your service appointments
          </Text>
        </div>

        {apiError && (
          <Alert message={apiError} type="error" showIcon className="mb-5" />
        )}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text type="secondary" className="text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: '#006BFF' }}>
              Create one
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

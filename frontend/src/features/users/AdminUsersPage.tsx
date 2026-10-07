import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/app/hooks";
import type { ApiErrorResponse, User, UserRole } from "@/types";
import {
  useDeleteUserMutation,
  useListUsersQuery,
  useUpdateUserMutation,
} from "./usersApi";

const { Text, Title } = Typography;

interface Props {
  role: Extract<UserRole, "CLIENT" | "PROVIDER">;
}

interface UserFormValues {
  firstName: string;
  lastName: string;
  phone?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    return (error.data as ApiErrorResponse).message;
  }
  return fallback;
}

export default function AdminUsersPage({ role }: Props) {
  const isAdmin =
    useAppSelector((state) => state.auth.user?.roles.includes("ADMIN")) ??
    false;
  const [form] = Form.useForm<UserFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { data, isLoading, error } = useListUsersQuery(undefined, {
    skip: !isAdmin,
  });
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const title = role === "CLIENT" ? "Clients" : "Providers";
  const users = useMemo(
    () => (data?.data ?? []).filter((user) => user.roles.includes(role)),
    [data, role],
  );

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    form.resetFields();
  };

  const handleUpdate = async (values: UserFormValues) => {
    if (!editingUser) return;
    try {
      await updateUser({ id: editingUser.id, body: values }).unwrap();
      void messageApi.success(`${title.slice(0, -1)} updated`);
      closeEdit();
    } catch (updateError) {
      void messageApi.error(
        getErrorMessage(updateError, `Failed to update ${title.toLowerCase()}`),
      );
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id).unwrap();
      void messageApi.success(
        `${user.firstName} ${user.lastName} was deleted`,
      );
    } catch (deleteError) {
      void messageApi.error(
        getErrorMessage(deleteError, `Failed to delete ${title.toLowerCase()}`),
      );
    }
  };

  const columns: TableColumnsType<User> = [
    {
      title: "Name",
      key: "name",
      render: (_, user) => (
        <div>
          <Text strong>
            {user.firstName} {user.lastName}
          </Text>
          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            {user.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone?: string) => phone || <Text type="secondary">Not set</Text>,
    },
    {
      title: "Role",
      key: "role",
      render: () => <Tag color={role === "CLIENT" ? "blue" : "green"}>{role}</Tag>,
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, user) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(user)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`Delete ${user.firstName} ${user.lastName}?`}
            description={
              role === "CLIENT"
                ? "Their appointments and appointment history will also be deleted."
                : "Their appointments, appointment history, and provider services will also be deleted."
            }
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(user)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Alert
        type="warning"
        showIcon
        message="This page is available to administrators only."
      />
    );
  }

  return (
    <>
      {contextHolder}
      <div className="mb-6">
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary">
          Manage registered {title.toLowerCase()} and their account details.
        </Text>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={`Failed to load ${title.toLowerCase()}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : users.length ? (
          <Table<User>
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
          />
        ) : (
          <Empty className="py-16" description={`No ${title.toLowerCase()} found`} />
        )}
      </Card>

      <Modal
        title={`Edit ${title.slice(0, -1)}`}
        open={!!editingUser}
        onCancel={closeEdit}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleUpdate}
        >
          <Form.Item
            label="First name"
            name="firstName"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last name"
            name="lastName"
            rules={[{ required: true, message: "Last name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Email">
            <Input value={editingUser?.email} disabled />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={closeEdit}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Save changes
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Image,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/app/hooks";
import type { ProviderService } from "@/types";
import {
  useDeleteProviderServiceMutation,
  useListMyProviderServicesQuery,
} from "./providerServicesApi";
import ProviderServiceModal from "./ProviderServiceModal";

const { Title, Text } = Typography;

export default function ProviderSettingsPage() {
  const roles = useAppSelector((state) => state.auth.user?.roles);
  const isProvider = roles?.includes("PROVIDER") ?? false;
  const [messageApi, contextHolder] = message.useMessage();
  const { data, isLoading, error } = useListMyProviderServicesQuery(undefined, {
    skip: !isProvider,
  });
  const [deleteProviderService, { isLoading: deleting }] =
    useDeleteProviderServiceMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProviderService | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (providerService: ProviderService) => {
    setEditing(providerService);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProviderService(id).unwrap();
      void messageApi.success("Provider service deleted");
    } catch {
      void messageApi.error("Failed to delete provider service");
    }
  };

  if (!isProvider) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Settings are available to provider accounts only."
      />
    );
  }

  const columns: TableColumnsType<ProviderService> = [
    {
      title: "Service",
      key: "service",
      render: (_, record) => (
        <Space>
          {record.imageUrl ? (
            <Image
              src={record.imageUrl}
              alt={record.service.name}
              width={52}
              height={40}
              preview={false}
              style={{ objectFit: "cover", borderRadius: 6 }}
            />
          ) : (
            <div
              style={{
                width: 52,
                height: 40,
                borderRadius: 6,
                background: "#EEF4FF",
              }}
            />
          )}
          <div>
            <Text strong style={{ display: "block" }}>
              {record.service.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.durationMinutes} min
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Online",
      key: "meetingLink",
      render: (_, record) =>
        record.meetingLink ? (
          <a href={record.meetingLink} target="_blank" rel="noreferrer">
            <LinkOutlined /> Meeting link
          </a>
        ) : (
          <Tag>Not configured</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this provider service?"
            description="Clients will no longer be able to book it."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <div className="flex items-start justify-between mb-6">
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
            Settings
          </Title>
          <Text type="secondary">
            Manage your service details, images, and online meeting links.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Service
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Failed to load your provider services"
          style={{ marginBottom: 16 }}
        />
      )}

      <Card styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : data?.data.length ? (
          <Table<ProviderService>
            columns={columns}
            dataSource={data.data}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
          />
        ) : (
          <Empty
            className="py-16"
            description="You have not created any provider services yet"
          />
        )}
      </Card>

      {modalOpen && (
        <ProviderServiceModal
          open
          providerService={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            void messageApi.success(
              editing
                ? "Provider service updated"
                : "Provider service created",
            );
          }}
        />
      )}
    </>
  );
}

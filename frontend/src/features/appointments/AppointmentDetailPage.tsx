import { useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Descriptions,
  Timeline,
  Spin,
  Alert,
  Space,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAppointmentQuery, useGetAppointmentHistoryQuery } from './appointmentsApi';
import ActionModal from './ActionModal';
import type { ActionType } from './ActionModal';
import StatusTag from '@/components/common/StatusTag';
import { useAppSelector } from '@/app/hooks';
import { formatDate, formatDateTime } from '@/utils/format';
import type { AppointmentStatus } from '@/types';

const { Title, Text } = Typography;

interface ActionConfig {
  action: ActionType;
  label: string;
  danger?: boolean;
  primary?: boolean;
}

function getAvailableActions(status: AppointmentStatus, roleKey: string): ActionConfig[] {
  if (roleKey === 'CLIENT') {
    if (status === 'PENDING' || status === 'APPROVED') {
      return [{ action: 'cancel', label: 'Cancel Appointment', danger: true }];
    }
    return [];
  }
  if (roleKey === 'PROVIDER' || roleKey === 'ADMIN') {
    if (status === 'PENDING') {
      return [
        { action: 'approve', label: 'Approve', primary: true },
        { action: 'reject', label: 'Reject', danger: true },
      ];
    }
    if (status === 'APPROVED') {
      return [
        { action: 'complete', label: 'Mark Complete', primary: true },
        { action: 'cancel', label: 'Cancel', danger: true },
      ];
    }
    return [];
  }
  return [];
}

function getRoleKey(roles: string[]): string {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('PROVIDER')) return 'PROVIDER';
  return 'CLIENT';
}

const historyColor: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'blue',
  COMPLETED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);
  const roleKey = getRoleKey(roles);

  const { data, isLoading, error } = useGetAppointmentQuery(id ?? '');
  const { data: historyData } = useGetAppointmentHistoryQuery(id ?? '');

  const [actionState, setActionState] = useState<{
    open: boolean;
    action: ActionType | null;
  }>({ open: false, action: null });

  const appt = data?.data;
  const history = historyData?.data ?? [];

  const availableActions = appt ? getAvailableActions(appt.status, roleKey) : [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !appt) {
    return <Alert type="error" message="Appointment not found." showIcon />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/appointments')}
        />
        <div>
          <Title level={4} style={{ margin: 0, color: '#1A1C1E' }}>
            Appointment Detail
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {appt.service?.name ?? 'Unknown service'}
          </Text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusTag status={appt.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Main info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Service">
                {appt.service?.name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(String(appt.requestedDate))}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {appt.requestedTime}
              </Descriptions.Item>
              <Descriptions.Item label="Session">
                {appt.sessionType === "ONLINE" ? "Online" : "In person"}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {appt.durationMinutes ? `${appt.durationMinutes} min` : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {appt.location ?? "—"}
              </Descriptions.Item>
              {appt.meetingLink && (
                <Descriptions.Item label="Meeting link">
                  <a href={appt.meetingLink} target="_blank" rel="noreferrer">
                    Join online meeting
                  </a>
                </Descriptions.Item>
              )}
              {appt.client && (
                <Descriptions.Item label="Client">
                  {appt.client.firstName} {appt.client.lastName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Provider">
                {appt.provider
                  ? `${appt.provider.firstName} ${appt.provider.lastName}`
                  : 'Unassigned'}
              </Descriptions.Item>
              {appt.reason && (
                <Descriptions.Item label="Reason" span={2}>
                  {appt.reason}
                </Descriptions.Item>
              )}
              {appt.adminNote && (
                <Descriptions.Item label="Note" span={2}>
                  {appt.adminNote}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Actions */}
          {availableActions.length > 0 && (
            <Card title="Actions" styles={{ header: { fontWeight: 600 } }}>
              <Space wrap>
                {availableActions.map((a) => (
                  <Button
                    key={a.action}
                    danger={a.danger}
                    type={a.primary ? 'primary' : 'default'}
                    onClick={() => setActionState({ open: true, action: a.action })}
                  >
                    {a.label}
                  </Button>
                ))}
              </Space>
            </Card>
          )}
        </div>

        {/* Status History */}
        <Card title="History" styles={{ header: { fontWeight: 600 } }}>
          {history.length === 0 ? (
            <Text type="secondary" style={{ fontSize: 13 }}>
              No history yet.
            </Text>
          ) : (
            <Timeline
              items={history.map((h) => ({
                color: historyColor[h.newStatus] ?? 'gray',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>
                      {h.previousStatus ? `${h.previousStatus} → ` : ''}
                      {h.newStatus}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(h.createdAt)}
                    </Text>
                    {h.changedBy && (
                      <>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          by {h.changedBy.firstName} {h.changedBy.lastName}
                        </Text>
                      </>
                    )}
                    {h.note && (
                      <>
                        <br />
                        <Text style={{ fontSize: 12 }}>{h.note}</Text>
                      </>
                    )}
                  </div>
                ),
              }))}
            />
          )}
        </Card>
      </div>

      <ActionModal
        open={actionState.open}
        onClose={() => setActionState({ open: false, action: null })}
        action={actionState.action}
        appointmentId={id ?? null}
      />
    </div>
  );
}

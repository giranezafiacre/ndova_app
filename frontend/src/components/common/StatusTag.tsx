import { Tag } from 'antd';
import type { AppointmentStatus } from '@/types';

const config: Record<AppointmentStatus, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: 'Pending' },
  APPROVED: { color: 'blue', label: 'Approved' },
  COMPLETED: { color: 'green', label: 'Completed' },
  REJECTED: { color: 'red', label: 'Rejected' },
  CANCELLED: { color: 'default', label: 'Cancelled' },
};

export default function StatusTag({ status }: { status: AppointmentStatus }) {
  const { color, label } = config[status];
  return <Tag color={color}>{label}</Tag>;
}

import { useAppSelector } from "@/app/hooks";

import ProviderDashboard from "@/features/dashboard/ProviderDashboard";
import AdminDashboard from "@/features/dashboard/AdminDashboard";
import { AllServices } from "@/components/services/AllServices";

export default function DashboardPage() {
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);

  if (roles.includes("ADMIN")) return <AdminDashboard />;
  if (roles.includes("PROVIDER")) return <ProviderDashboard />;

  return <AllServices />;
}

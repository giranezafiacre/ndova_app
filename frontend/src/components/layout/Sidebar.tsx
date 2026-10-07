import { Layout, Menu, Avatar, Typography, ConfigProvider } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";

const { Sider } = Layout;
const { Text } = Typography;

const roleNavMap: Record<
  string,
  { key: string; label: string; icon: React.ReactNode }[]
> = {
  ADMIN: [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/appointments", label: "Appointments", icon: <CalendarOutlined /> },
    { key: "/services", label: "Services", icon: <AppstoreOutlined /> },
    { key: "/clients", label: "Clients", icon: <TeamOutlined /> },
    { key: "/providers", label: "Providers", icon: <TeamOutlined /> },
  ],
  PROVIDER: [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/appointments", label: "Appointments", icon: <CalendarOutlined /> },
    { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
  ],
  CLIENT: [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      key: "/appointments",
      label: "My Appointments",
      icon: <CalendarOutlined />,
    },
    { key: "/services", label: "Services", icon: <AppstoreOutlined /> },
  ],
};

function getRoleKey(roles: string[]): string {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("PROVIDER")) return "PROVIDER";
  return "CLIENT";
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const roleKey = getRoleKey(user?.roles ?? []);
  const navItems = roleNavMap[roleKey] ?? roleNavMap.CLIENT;

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  const selectedKey =
    navItems.find((item) => location.pathname.startsWith(item.key))?.key ??
    navItems[0]?.key;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: "#1A1F2E",
            darkSubMenuItemBg: "#141820",
            darkItemSelectedBg: "#006BFF",
            darkItemHoverBg: "#252d42",
          },
        },
      }}
    >
      <Sider
        width={220}
        style={{
          background: "#1A1F2E",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 16px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "#006BFF",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                N
              </span>
            </div>
            <Text
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                margin: 0,
              }}
            >
              Ndova
            </Text>
          </div>
          <div style={{ marginTop: 6 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
              {roleKey}
            </Text>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, paddingTop: 8 }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={navItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.key}>{item.label}</Link>,
            }))}
            style={{ background: "transparent", border: "none" }}
          />
        </div>

        {/* User + Logout */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Avatar
              size={32}
              style={{ background: "#006BFF", fontSize: 12, fontWeight: 600 }}
            >
              {initials}
            </Avatar>
            <div style={{ overflow: "hidden" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {fullName}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email}
              </Text>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Sign out",
                onClick: handleLogout,
              },
            ]}
            style={{ background: "transparent", border: "none" }}
          />
        </div>
      </Sider>
    </ConfigProvider>
  );
}

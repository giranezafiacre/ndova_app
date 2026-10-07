import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, Typography, Dropdown, Badge, Tag } from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CalendarOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useGetMeQuery } from "@/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser, logout } from "@/features/auth/authSlice";

const { Text } = Typography;

const roleNavMap: Record<
  string,
  { path: string; label: string; icon: React.ReactNode }[]
> = {
  ADMIN: [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      path: "/appointments",
      label: "Appointments",
      icon: <CalendarOutlined />,
    },
    { path: "/services", label: "Services", icon: <AppstoreOutlined /> },
    { path: "/clients", label: "Clients", icon: <TeamOutlined /> },
    { path: "/providers", label: "Providers", icon: <UserOutlined /> },
  ],
  PROVIDER: [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      path: "/appointments",
      label: "Appointments",
      icon: <CalendarOutlined />,
    },
    { path: "/settings", label: "Settings", icon: <SettingOutlined /> },
  ],
  CLIENT: [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      path: "/appointments",
      label: "My Appointments",
      icon: <CalendarOutlined />,
    },
    { path: "/services", label: "Services", icon: <AppstoreOutlined /> },
  ],
};

function getRoleKey(roles: string[]): string {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("PROVIDER")) return "PROVIDER";
  return "CLIENT";
}

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const { data } = useGetMeQuery(undefined, { skip: !token || !!user });

  useEffect(() => {
    if (data?.data) dispatch(setUser(data.data));
  }, [data, dispatch]);

  const roleKey = getRoleKey(user?.roles ?? []);
  const navItems = roleNavMap[roleKey] ?? roleNavMap.CLIENT;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong style={{ display: "block", fontSize: 14 }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="mb-6 flex relative flex-col gap-2">
      <div className="flex justify-between gap-2">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s a quick overview of services and appointments available.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time */}
          <div className="text-gray-600 bg-blue-100 flex items-center border border-blue-200 gap-1 rounded-full px-3 py-2">
            <Text className="text-gray-500!">⏰</Text>
            <Text className="text-gray-800! font-medium pl-2">
              {moment().format("YY-MM-DD h:mm A")}{" "}
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Text>
          </div>

          {/* Bell */}
          <Badge dot>
            <div
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "1px solid #E8EAF0",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <BellOutlined style={{ color: "#6B7280", fontSize: 16 }} />
            </div>
          </Badge>

          {/* User dropdown */}
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full cursor-pointer bg-white">
              <Avatar
                icon={"😂"}
                size={28}
                className="bg-blue-200! font-xl"
                style={{ fontWeight: 600 }}
              />
              <div className="">
                <Text className="text-gray-800 font-medium text-sm">
                  {user?.firstName}
                </Text>
                <Tag color="green" className="text-gray-500 text-xs! block">
                  {user?.roles[0]}
                </Tag>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>

      <nav className="flex gap-0 border-b border-gray-200">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

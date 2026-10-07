import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#F4F6FA" }}>
      <div className="max-w-7xl relative h-full bg-white mx-auto w-full">
        <div className="sticky z-10 h-6 bg-blue-500" />
        <div className="py-6 px-10">
          <Header />
          <Content className="">
            <Outlet />
          </Content>
        </div>
      </div>
    </Layout>
  );
}

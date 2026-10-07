import { useState } from "react";
import { Alert, Button, Empty, Input, Spin, Typography, Tag } from "antd";
import {
  AppstoreOutlined,
  FilterOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { ServicesCards } from "./card/ServicesCards";
import { useListProviderServicesQuery } from "@/features/provider-services/providerServicesApi";
const { Title, Text } = Typography;

export const AllServices = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading, error } = useListProviderServicesQuery();

  const allProviderServices = data?.data ?? [];
  const serviceNames = Array.from(
    new Set(allProviderServices.map((offering) => offering.service.name)),
  ).filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  const providerServices = allProviderServices.filter((offering) => {
    const query = search.toLowerCase();
    const matchesSearch =
      offering.service.name.toLowerCase().includes(query) ||
      `${offering.provider.firstName} ${offering.provider.lastName}`
        .toLowerCase()
        .includes(query) ||
      offering.location.toLowerCase().includes(query);
    const matchesCategory =
      !selected || offering.service.name.toLowerCase() === selected.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <Title level={4} style={{ margin: 0, color: "#1A1C1E" }}>
            All Services
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Browse services available in Kigali
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<AppstoreOutlined />}
            type={view === "grid" ? "primary" : "default"}
            onClick={() => setView("grid")}
          />
          <Button
            icon={<UnorderedListOutlined />}
            type={view === "list" ? "primary" : "default"}
            onClick={() => setView("list")}
          />
          <Button
            className="flex items-center gap-2"
            icon={<FilterOutlined />}
          >
            Filter
          </Button>
          <Input.Search
            placeholder="Search services"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
      </div>

      {/* Service pills — horizontal scroll */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {serviceNames.map((serviceName) => {
          const isActive = selected === serviceName;
          return (
            <Tag
              key={serviceName}
              onClick={() => setSelected(isActive ? null : serviceName)}
              color={isActive ? "blue" : "default"}
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                border: `1.5px solid ${isActive ? "#006BFF" : "#E8EAF0"}`,
                background: isActive ? "#EEF4FF" : "#fff",
                color: isActive ? "#006BFF" : "#1A1C1E",
                userSelect: "none",
              }}
            >
              {serviceName}
            </Tag>
          );
        })}
      </div>
      {error && (
        <Alert
          className="mt-6"
          type="error"
          showIcon
          message="Failed to load provider services"
        />
      )}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : providerServices.length ? (
        <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providerServices.map((providerService) => (
            <ServicesCards
              key={providerService.id}
              providerService={providerService}
            />
          ))}
        </div>
      ) : (
        <Empty className="mt-16" description="No provider services found" />
      )}
    </div>
  );
};

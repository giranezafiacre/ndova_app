import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Rate, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { ProviderService } from "@/types";

const { Text } = Typography;

interface ServiceCardProps {
  providerService: ProviderService;
}

export const ServicesCards = ({ providerService }: ServiceCardProps) => {
  const navigate = useNavigate();
  const providerName = `${providerService.provider.firstName} ${providerService.provider.lastName}`;
  const initials = `${providerService.provider.firstName[0] ?? ""}${providerService.provider.lastName[0] ?? ""}`;

  return (
    <div
      className="relative h-70 rounded-xl overflow-hidden cursor-pointer group bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500"
      onClick={() => navigate(`/service-details/${providerService.id}`)}
    >
      {providerService.imageUrl ? (
        <img
          src={providerService.imageUrl}
          alt={providerService.service.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-7xl font-bold transition-transform duration-300 group-hover:scale-105">
          {initials}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Rate
            disabled
            value={providerService.stars}
            style={{ fontSize: 12, color: "#FADB14" }}
          />
          <Text className="text-white/75! text-[11px]">
            {providerService.stars.toFixed(1)}
          </Text>
        </div>

        <Text className="text-white/65! text-[11px] uppercase tracking-wider block">
          {providerService.service.name}
        </Text>

        <Text strong className="text-white! text-[15px] block mt-0.5">
          {providerName}
        </Text>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1 min-w-0">
            <EnvironmentOutlined className="text-white/50! text-[11px]" />
            <Text ellipsis className="text-white/50! text-[11px]">
              {providerService.location}
            </Text>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ClockCircleOutlined className="text-white/50! text-[11px]" />
            <Text className="text-white/50! text-[11px]">
              {providerService.durationMinutes} min
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

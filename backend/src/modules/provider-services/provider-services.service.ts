import { ProviderService, Service, User } from "../../models";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateProviderServiceInput,
  UpdateProviderServiceInput,
} from "./provider-services.validation";

const includes = [
  {
    model: Service,
    as: "service",
    attributes: ["id", "name", "description", "isActive"],
    where: { isActive: true },
  },
  {
    model: User,
    as: "provider",
    attributes: ["id", "firstName", "lastName", "email", "phone"],
  },
];

export async function listProviderServices(serviceId?: string) {
  const offerings = await ProviderService.findAll({
    where: serviceId ? { serviceId } : undefined,
    include: includes,
    order: [["createdAt", "DESC"]],
  });
  return offerings.map((offering) => offering.toJSON());
}

export async function getProviderServiceById(id: string) {
  const offering = await ProviderService.findByPk(id, { include: includes });
  if (!offering) throw ApiError.notFound("Provider service not found");
  return offering.toJSON();
}

export async function listMyProviderServices(providerId: string) {
  const offerings = await ProviderService.findAll({
    where: { providerId },
    include: includes,
    order: [["createdAt", "DESC"]],
  });
  return offerings.map((offering) => offering.toJSON());
}

export async function createProviderService(
  providerId: string,
  input: CreateProviderServiceInput,
) {
  const service = await Service.findOne({
    where: { id: input.serviceId, isActive: true },
  });
  if (!service) throw ApiError.notFound("Service not found or inactive");

  const existing = await ProviderService.findOne({
    where: { serviceId: input.serviceId, providerId },
  });
  if (existing) {
    throw ApiError.conflict("You already provide this service");
  }

  const offering = await ProviderService.create({ ...input, providerId });
  return getProviderServiceById(offering.id);
}

export async function updateProviderService(
  id: string,
  providerId: string,
  input: UpdateProviderServiceInput,
) {
  const offering = await ProviderService.findOne({ where: { id, providerId } });
  if (!offering) throw ApiError.notFound("Provider service not found");

  await offering.update(input);
  return getProviderServiceById(offering.id);
}

export async function deleteProviderService(id: string, providerId: string) {
  const offering = await ProviderService.findOne({ where: { id, providerId } });
  if (!offering) throw ApiError.notFound("Provider service not found");
  await offering.destroy();
}

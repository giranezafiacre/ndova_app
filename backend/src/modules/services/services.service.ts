import { Service } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { CreateServiceInput, UpdateServiceInput } from './services.validation';

export async function listServices() {
  const services = await Service.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });
  return services.map((s) => s.toJSON());
}

export async function getServiceById(id: string) {
  // Only return service if it is active (inactive = effectively deleted for public)
  const service = await Service.findOne({ where: { id, isActive: true } });
  if (!service) throw ApiError.notFound('Service not found');
  return service.toJSON();
}

export async function createService(input: CreateServiceInput) {
  const service = await Service.create(input);
  return service.toJSON();
}

export async function updateService(id: string, input: UpdateServiceInput) {
  // Admin can update any service regardless of its isActive status
  const service = await Service.findByPk(id);
  if (!service) throw ApiError.notFound('Service not found');

  await service.update(input);
  return service.toJSON();
}

export async function deleteService(id: string) {
  const service = await Service.findByPk(id);
  if (!service) throw ApiError.notFound('Service not found');
  if (!service.isActive) {
    throw ApiError.conflict('Service is already deactivated');
  }

  // Soft delete — preserves historical appointment references
  await service.update({ isActive: false });
  return service.toJSON();
}

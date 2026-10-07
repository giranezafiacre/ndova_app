import { User } from './User';
import { Role } from './Role';
import { UserRole } from './UserRole';
import { Service } from './Service';
import { ProviderService } from './ProviderService';
import { Appointment } from './Appointment';
import { AppointmentStatusHistory } from './AppointmentStatusHistory';

// -------------------------------------------------------------------------
// Associations
// All relationships are defined here to keep model files lean and avoid
// circular dependency issues.
// -------------------------------------------------------------------------

// User ↔ Role (many-to-many through UserRole)
User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles', onDelete: 'CASCADE' });
Role.hasMany(UserRole, { foreignKey: 'roleId', as: 'userRoles', onDelete: 'CASCADE' });
UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// User (CLIENT) → Appointments
User.hasMany(Appointment, {
  foreignKey: 'clientId',
  as: 'clientAppointments',
  onDelete: 'CASCADE',
});
Appointment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// User (PROVIDER) → Appointments
User.hasMany(Appointment, {
  foreignKey: 'providerId',
  as: 'providerAppointments',
  onDelete: 'CASCADE',
});
Appointment.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// Service → Appointments
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
ProviderService.hasMany(Appointment, {
  foreignKey: 'providerServiceId',
  as: 'appointments',
});
Appointment.belongsTo(ProviderService, {
  foreignKey: 'providerServiceId',
  as: 'providerService',
});

// Provider-specific service offerings
Service.hasMany(ProviderService, { foreignKey: 'serviceId', as: 'providerServices' });
ProviderService.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
User.hasMany(ProviderService, {
  foreignKey: 'providerId',
  as: 'providedServices',
  onDelete: 'CASCADE',
});
ProviderService.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// Appointment → Status History
Appointment.hasMany(AppointmentStatusHistory, {
  foreignKey: 'appointmentId',
  as: 'statusHistory',
  onDelete: 'CASCADE',
});
AppointmentStatusHistory.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment',
});

// User → Status History (who made the change)
User.hasMany(AppointmentStatusHistory, {
  foreignKey: 'changedById',
  as: 'statusChanges',
  onDelete: 'CASCADE',
});
AppointmentStatusHistory.belongsTo(User, { foreignKey: 'changedById', as: 'changedBy' });

export {
  User,
  Role,
  UserRole,
  Service,
  ProviderService,
  Appointment,
  AppointmentStatusHistory,
};

import { Op } from "sequelize";
import {
  Appointment,
  AppointmentStatusHistory,
  ProviderService,
  Role,
  User,
  UserRole,
} from "../../models";
import { sequelize } from "../../config/database";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { ApiError } from "../../utils/ApiError";
import { UpdateUserInput } from "./users.validation";

const withRoles = {
  include: [
    {
      model: UserRole,
      as: "userRoles",
      include: [{ model: Role, as: "role" }],
    },
  ],
};

export async function listUsers() {
  const users = await User.findAll({
    ...withRoles,
    order: [["createdAt", "DESC"]],
  });
  return users.map(sanitizeUser);
}

export async function getUserById(id: string) {
  const user = await User.findByPk(id, withRoles);
  if (!user) throw ApiError.notFound("User not found");
  return sanitizeUser(user);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("User not found");

  await user.update(input);

  const updated = await User.findByPk(id, withRoles);
  return sanitizeUser(updated!);
}

export async function deleteUser(id: string, requestingUserId: string) {
  if (id === requestingUserId) {
    throw ApiError.badRequest("You cannot delete your own account");
  }

  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("User not found");

  await sequelize.transaction(async (transaction) => {
    await AppointmentStatusHistory.destroy({
      where: { changedById: id },
      transaction,
    });
    await Appointment.destroy({
      where: {
        [Op.or]: [{ clientId: id }, { providerId: id }],
      },
      transaction,
    });
    await ProviderService.destroy({
      where: { providerId: id },
      transaction,
    });
    await UserRole.destroy({
      where: { userId: id },
      transaction,
    });
    await user.destroy({ transaction });
  });
}

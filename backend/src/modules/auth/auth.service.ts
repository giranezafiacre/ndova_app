import { User, Role, UserRole } from "../../models";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { ApiError } from "../../utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.validation";

const userWithRoles = {
  include: [
    {
      model: UserRole,
      as: "userRoles",
      include: [{ model: Role, as: "role" }],
    },
  ],
};

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    phone: input.phone,
  });

  const selectedRole = await Role.findOne({ where: { name: input.role } });
  if (!selectedRole)
    throw ApiError.internal(`${input.role} role not found — run db:seed`);

  await UserRole.create({ userId: user.id, roleId: selectedRole.id });

  const token = signToken({
    userId: user.id,
    email: user.email,
    roles: [input.role],
  });

  // Re-fetch with roles so sanitizeUser can build the roles array
  const fullUser = await User.findByPk(user.id, userWithRoles);
  return { user: sanitizeUser(fullUser!), token };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({
    where: { email: input.email },
    ...userWithRoles,
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const roles = ((user as any).userRoles ?? [])
    .map((ur: any) => ur.role?.name)
    .filter(Boolean) as string[];

  const token = signToken({ userId: user.id, email: user.email, roles });

  return { user: sanitizeUser(user), token };
}

export async function getMe(userId: string) {
  const user = await User.findByPk(userId, userWithRoles);
  if (!user) throw ApiError.notFound("User not found");
  return sanitizeUser(user);
}

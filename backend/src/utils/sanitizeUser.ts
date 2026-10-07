import { User } from "../models";

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  roles?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Strips passwordHash and flattens the nested userRoles → roles array.
// Works whether or not userRoles was eager-loaded.
export function sanitizeUser(user: User): SafeUser {
  const json = user.toJSON() as any;
  const { passwordHash, userRoles, ...rest } = json;

  if (Array.isArray(userRoles)) {
    const roles = userRoles
      .map((ur: any) => ur.role?.name)
      .filter(Boolean) as string[];
    return { ...rest, roles };
  }

  return rest;
}

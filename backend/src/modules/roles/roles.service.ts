import { Role } from "../../models";

export async function listRoles() {
  const roles = await Role.findAll({ order: [["name", "ASC"]] });
  return roles.map((r) => r.toJSON());
}

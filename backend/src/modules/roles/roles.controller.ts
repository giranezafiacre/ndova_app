import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as rolesService from "./roles.service";

export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await rolesService.listRoles();
  res.json({ success: true, message: "Roles retrieved", data: roles });
});

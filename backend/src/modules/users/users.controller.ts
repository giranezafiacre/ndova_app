import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as usersService from "./users.service";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await usersService.listUsers();
  res.json({ success: true, message: "Users retrieved", data: users });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getUserById(req.params.id);
  res.json({ success: true, message: "User retrieved", data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.json({ success: true, message: "User updated", data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await usersService.deleteUser(req.params.id, req.user!.id);
  res.json({ success: true, message: "User deleted", data: null });
});

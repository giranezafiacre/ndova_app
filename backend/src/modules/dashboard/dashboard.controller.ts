import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export const getClientDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await dashboardService.getClientDashboard(req.user!.id);
    res.json({ success: true, message: "Client dashboard", data });
  },
);

export const getProviderDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await dashboardService.getProviderDashboard(req.user!.id);
    res.json({ success: true, message: "Provider dashboard", data });
  },
);

export const getAdminDashboard = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getAdminDashboard();
    res.json({ success: true, message: "Admin dashboard", data });
  },
);

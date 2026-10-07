import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as servicesService from "./services.service";

export const listServices = asyncHandler(
  async (_req: Request, res: Response) => {
    const services = await servicesService.listServices();
    res.json({ success: true, message: "Services retrieved", data: services });
  },
);

export const getServiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await servicesService.getServiceById(req.params.id);
    res.json({ success: true, message: "Service retrieved", data: service });
  },
);

export const createService = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await servicesService.createService(req.body);
    res
      .status(201)
      .json({ success: true, message: "Service created", data: service });
  },
);

export const updateService = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await servicesService.updateService(
      req.params.id,
      req.body,
    );
    res.json({ success: true, message: "Service updated", data: service });
  },
);

export const deleteService = asyncHandler(
  async (req: Request, res: Response) => {
    await servicesService.deleteService(req.params.id);
    res.json({ success: true, message: "Service deactivated", data: null });
  },
);

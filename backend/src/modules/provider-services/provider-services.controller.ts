import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as providerServicesService from "./provider-services.service";

export const listProviderServices = asyncHandler(
  async (req: Request, res: Response) => {
    const offerings = await providerServicesService.listProviderServices(
      typeof req.query.serviceId === "string" ? req.query.serviceId : undefined,
    );
    res.json({
      success: true,
      message: "Provider services retrieved",
      data: offerings,
    });
  },
);

export const getProviderServiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const offering = await providerServicesService.getProviderServiceById(
      req.params.id,
    );
    res.json({
      success: true,
      message: "Provider service retrieved",
      data: offering,
    });
  },
);

export const listMyProviderServices = asyncHandler(
  async (req: Request, res: Response) => {
    const offerings = await providerServicesService.listMyProviderServices(
      req.user!.id,
    );
    res.json({
      success: true,
      message: "Provider services retrieved",
      data: offerings,
    });
  },
);

export const createProviderService = asyncHandler(
  async (req: Request, res: Response) => {
    const offering = await providerServicesService.createProviderService(
      req.user!.id,
      req.body,
    );
    res.status(201).json({
      success: true,
      message: "Provider service created",
      data: offering,
    });
  },
);

export const updateProviderService = asyncHandler(
  async (req: Request, res: Response) => {
    const offering = await providerServicesService.updateProviderService(
      req.params.id,
      req.user!.id,
      req.body,
    );
    res.json({
      success: true,
      message: "Provider service updated",
      data: offering,
    });
  },
);

export const deleteProviderService = asyncHandler(
  async (req: Request, res: Response) => {
    await providerServicesService.deleteProviderService(
      req.params.id,
      req.user!.id,
    );
    res.json({
      success: true,
      message: "Provider service deleted",
      data: null,
    });
  },
);

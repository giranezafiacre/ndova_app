import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as appointmentsService from "./appointments.service";

export const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.createAppointment(
      req.user!.id,
      req.body,
    );
    res.status(201).json({
      success: true,
      message: "Appointment created",
      data: appointment,
    });
  },
);

export const listAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const appointments = await appointmentsService.listAppointments(
      req.user!.id,
      req.user!.roles,
    );
    res.json({
      success: true,
      message: "Appointments retrieved",
      data: appointments,
    });
  },
);

export const getProviderServiceAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const availability =
      await appointmentsService.getProviderServiceAvailability(
        String(req.query.providerServiceId),
        String(req.query.date),
      );
    res.json({
      success: true,
      message: "Provider availability retrieved",
      data: availability,
    });
  },
);

export const getAppointmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.getAppointmentById(
      req.params.id,
      req.user!.id,
      req.user!.roles,
    );
    res.json({
      success: true,
      message: "Appointment retrieved",
      data: appointment,
    });
  },
);

export const approveAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.approveAppointment(
      req.params.id,
      req.user!.id,
      req.user!.roles,
      req.body,
    );
    res.json({
      success: true,
      message: "Appointment approved",
      data: appointment,
    });
  },
);

export const rejectAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.rejectAppointment(
      req.params.id,
      req.user!.id,
      req.user!.roles,
      req.body,
    );
    res.json({
      success: true,
      message: "Appointment rejected",
      data: appointment,
    });
  },
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.cancelAppointment(
      req.params.id,
      req.user!.id,
      req.user!.roles,
      req.body,
    );
    res.json({
      success: true,
      message: "Appointment cancelled",
      data: appointment,
    });
  },
);

export const completeAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await appointmentsService.completeAppointment(
      req.params.id,
      req.user!.id,
      req.user!.roles,
      req.body,
    );
    res.json({
      success: true,
      message: "Appointment completed",
      data: appointment,
    });
  },
);

export const getAppointmentHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const history = await appointmentsService.getAppointmentHistory(
      req.params.id,
      req.user!.id,
      req.user!.roles,
    );
    res.json({
      success: true,
      message: "Appointment history retrieved",
      data: history,
    });
  },
);

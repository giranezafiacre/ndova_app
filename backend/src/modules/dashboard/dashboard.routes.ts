import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import * as dashboardController from "./dashboard.controller";

const router = Router();

/**
 * @swagger
 * /dashboard/client:
 *   get:
 *     summary: Get client dashboard (CLIENT only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client dashboard with appointment summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                         completed:
 *                           type: number
 *                     recentAppointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *       403:
 *         description: Forbidden (not client)
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/client",
  authenticate,
  authorize("CLIENT"),
  dashboardController.getClientDashboard,
);

/**
 * @swagger
 * /dashboard/provider:
 *   get:
 *     summary: Get provider dashboard (PROVIDER only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider dashboard with appointment summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                         completed:
 *                           type: number
 *                     recentAppointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *       403:
 *         description: Forbidden (not provider)
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/provider",
  authenticate,
  authorize("PROVIDER"),
  dashboardController.getProviderDashboard,
);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard (ADMIN only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard with platform-wide statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         clients:
 *                           type: number
 *                         providers:
 *                           type: number
 *                     services:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                     appointments:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                         completed:
 *                           type: number
 *                     recentAppointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *       403:
 *         description: Forbidden (not admin)
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  dashboardController.getAdminDashboard,
);

export default router;

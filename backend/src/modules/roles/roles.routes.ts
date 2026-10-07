import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as rolesController from "./roles.controller";

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         enum: [ADMIN, PROVIDER, CLIENT]
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, rolesController.listRoles);

export default router;

import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
} from "./services.validation";
import * as servicesController from "./services.controller";

const router = Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: List active services (public)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of active services
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
 *                     $ref: '#/components/schemas/Service'
 */
router.get("/", servicesController.listServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID (public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service details
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
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get("/:id", servicesController.getServiceById);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create service (ADMIN only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (not admin)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createServiceSchema),
  servicesController.createService,
);

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update service (ADMIN only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 *       404:
 *         description: Service not found
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateServiceSchema),
  servicesController.updateService,
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete service (ADMIN only, soft-delete)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service deleted
 *       404:
 *         description: Service not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  servicesController.deleteService,
);

export default router;

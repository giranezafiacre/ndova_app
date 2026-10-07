import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import * as controller from "./provider-services.controller";
import {
  createProviderServiceSchema,
  updateProviderServiceSchema,
} from "./provider-services.validation";

const router = Router();

/**
 * @swagger
 * /provider-services:
 *   get:
 *     summary: List provider services
 *     description: Returns all active provider service offerings. Optionally filter by a service ID.
 *     tags: [Provider Services]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter offerings by service ID
 *     responses:
 *       200:
 *         description: Provider services retrieved
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
 *                     $ref: '#/components/schemas/ProviderService'
 */
router.get("/", controller.listProviderServices);

/**
 * @swagger
 * /provider-services/mine:
 *   get:
 *     summary: List the authenticated provider's services
 *     tags: [Provider Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider services retrieved
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
 *                     $ref: '#/components/schemas/ProviderService'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Provider role required
 */
router.get(
  "/mine",
  authenticate,
  authorize("PROVIDER"),
  controller.listMyProviderServices,
);

/**
 * @swagger
 * /provider-services/{id}:
 *   get:
 *     summary: Get a provider service by ID
 *     tags: [Provider Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Provider service ID
 *     responses:
 *       200:
 *         description: Provider service retrieved
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
 *                   $ref: '#/components/schemas/ProviderService'
 *       404:
 *         description: Provider service not found
 */
router.get("/:id", controller.getProviderServiceById);

/**
 * @swagger
 * /provider-services:
 *   post:
 *     summary: Create a provider service
 *     description: Creates a service offering for the authenticated provider.
 *     tags: [Provider Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - location
 *               - description
 *               - durationMinutes
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               location:
 *                 type: string
 *                 example: Kigali, Rwanda
 *               description:
 *                 type: string
 *                 example: Professional consultation tailored to your needs.
 *               durationMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 example: 60
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/service.jpg
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *                 example: https://meet.google.com/example
 *     responses:
 *       201:
 *         description: Provider service created
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
 *                   $ref: '#/components/schemas/ProviderService'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Service not found or inactive
 *       409:
 *         description: Provider already offers this service
 */
router.post(
  "/",
  authenticate,
  authorize("PROVIDER"),
  validate(createProviderServiceSchema),
  controller.createProviderService,
);

/**
 * @swagger
 * /provider-services/{id}:
 *   patch:
 *     summary: Update a provider service
 *     description: Updates a service offering owned by the authenticated provider.
 *     tags: [Provider Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Provider service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               durationMinutes:
 *                 type: integer
 *                 minimum: 1
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Provider service updated
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
 *                   $ref: '#/components/schemas/ProviderService'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Provider service not found or not owned by the provider
 */
router.patch(
  "/:id",
  authenticate,
  authorize("PROVIDER"),
  validate(updateProviderServiceSchema),
  controller.updateProviderService,
);

/**
 * @swagger
 * /provider-services/{id}:
 *   delete:
 *     summary: Delete a provider service
 *     description: Deletes a service offering owned by the authenticated provider.
 *     tags: [Provider Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Provider service ID
 *     responses:
 *       200:
 *         description: Provider service deleted
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
 *                   nullable: true
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Provider role required
 *       404:
 *         description: Provider service not found or not owned by the provider
 */
router.delete(
  "/:id",
  authenticate,
  authorize("PROVIDER"),
  controller.deleteProviderService,
);

export default router;

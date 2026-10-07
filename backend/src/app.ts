import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import rolesRoutes from "./modules/roles/roles.routes";
import servicesRoutes from "./modules/services/services.routes";
import appointmentsRoutes from "./modules/appointments/appointments.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import providerServicesRoutes from "./modules/provider-services/provider-services.routes";

const app = express();

// Security and logging
// app.use(helmet());
app.use(cors());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
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
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     environment:
 *                       type: string
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// Swagger docs — override Helmet's CSP for this route so the UI scripts can run
app.use(
  "/api/docs",
  (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/provider-services", providerServicesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler — must come after all routes
app.use(notFoundMiddleware);

// Central error handler — must be last
app.use(errorMiddleware);

export default app;

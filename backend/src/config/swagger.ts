import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ndova API",
      version: "1.0.0",
      description: "Service Request and Appointment Management System API",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            roles: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "role"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: { type: "string", enum: ["CLIENT", "PROVIDER"] },
          },
        },
        Service: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ProviderService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            serviceId: { type: "string", format: "uuid" },
            providerId: { type: "string", format: "uuid" },
            location: { type: "string" },
            description: { type: "string" },
            stars: { type: "number", minimum: 0, maximum: 5 },
            durationMinutes: { type: "integer", minimum: 1 },
            imageUrl: { type: "string", format: "uri", nullable: true },
            meetingLink: { type: "string", format: "uri", nullable: true },
            service: { $ref: "#/components/schemas/Service" },
            provider: { $ref: "#/components/schemas/User" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            clientId: { type: "string", format: "uuid" },
            providerId: { type: "string", format: "uuid" },
            serviceId: { type: "string", format: "uuid" },
            providerServiceId: { type: "string", format: "uuid" },
            requestedDate: { type: "string", format: "date" },
            requestedTime: { type: "string", example: "10:00" },
            durationMinutes: { type: "integer" },
            sessionType: {
              type: "string",
              enum: ["IN_PERSON", "ONLINE"],
            },
            location: { type: "string", nullable: true },
            meetingLink: {
              type: "string",
              format: "uri",
              nullable: true,
            },
            scheduledAt: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
                "COMPLETED",
              ],
            },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ApiErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

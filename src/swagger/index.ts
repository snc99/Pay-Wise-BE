import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { schemas } from "./components/schemas";
import { responses } from "./components/responses";
import { tags } from "./tags";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pay Wise API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas,
      responses,
    },
    tags,
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: `
      section.models {
        display: none !important;
      }
    `,

      customSiteTitle: "Pay Wise API Docs",
    })
  );
}

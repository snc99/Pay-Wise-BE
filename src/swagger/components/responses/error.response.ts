export const errorResponses = {
  // 400: Bad Request (validasi)
  BadRequestError: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/BadRequestError" },
      },
    },
  },

  // 401: Unauthorized
  UnauthorizedError: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UnauthorizedError" },
      },
    },
  },

  // 403: Forbidden
  ForbiddenError: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ForbiddenError" },
      },
    },
  },

  // 404: Not Found
  NotFoundError: {
    description: "Not Found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/NotFoundResponse" },
      },
    },
  },

  // 409: Conflict
  ConflictError: {
    description: "Conflict",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponseConflict" },
      },
    },
  },

  // 422: Unprocessable Entity (misal format benar tapi gagal diproses)
  UnprocessableEntityError: {
    description: "Unprocessable Entity",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UnprocessableEntityError" },
      },
    },
  },

  // 500: Internal Server Error
  InternalServerError: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/InternalServerError" },
      },
    },
  },
};

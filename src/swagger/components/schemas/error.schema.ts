export const errorSchemas = {
  //   Response error 400
  BadRequestError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 400 },
      message: { type: "string" },
      errors: {
        type: "object",
        example: {
          field: ["string"],
        },
      },
    },
  },

  //   Response error 401
  UnauthorizedError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 401 },
      message: { type: "string" },
    },
  },

  //   Response error 403
  ForbiddenError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 403 },
      message: {
        type: "string",
        example: "Token tidak valid",
      },
    },
  },

  //   Response error 404
  NotFoundResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 404 },
      message: { type: "string" },
    },
  },

  //   Response error 409
  ErrorResponseConflict: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "integer", example: 409 },
      message: { type: "string", example: "Data sudah ada / bentrok" },
      errors: {
        type: "object",
        example: {
          field: "string",
        },
      },
    },
  },

  //   Response error 422
  UnprocessableEntityError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "integer", example: 422 },
      message: { type: "string", example: "Permintaan tidak dapat diproses" },
    },
  },

  //   Response error 500
  InternalServerError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 500 },
      message: { type: "string", example: "Terjadi kesalahan pada server" },
    },
  },
};

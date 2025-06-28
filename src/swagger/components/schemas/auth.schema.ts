import { errors } from "@upstash/redis";

export const authSchemas = {
  // Input body untuk login
  LoginInput: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", example: "admin23" },
      password: { type: "string", example: "secret2323" },
    },
  },

  // Response login
  LoginResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      status: { type: "number", example: 200 },
      message: { type: "string", example: "Login berhasil" },
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI..." },
      user: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx001" },
          name: { type: "string", example: "Admin Satu" },
          email: { type: "string", example: "admin@example.com" },
          username: { type: "string", example: "admin1" },
          role: {
            type: "string",
            enum: ["ADMIN", "SUPERADMIN"],
            example: "ADMIN",
          },
        },
      },
    },
  },

  // Response profil admin
  UserProfileResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      status: { type: "number", example: 200 },
      message: { type: "string", example: "Profil pengguna berhasil diambil" },
      user: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx001" },
          name: { type: "string", example: "Admin Satu" },
          email: { type: "string", example: "admin@example.com" },
          username: { type: "string", example: "admin1" },
          role: {
            type: "string",
            enum: ["ADMIN", "SUPERADMIN"],
            example: "ADMIN",
          },
        },
      },
    },
  },

  // Response logout
  LogoutSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      status: { type: "number", example: 200 },
      message: { type: "string", example: "Logout berhasil" },
    },
  },

  // Response error 400
  FieldValidationError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 400 },
      message: {
        type: "string",
        example: "Data yang dikirimkan tidak valid",
      },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },

  // Response error 401
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 401 },
      message: { type: "string" },
    },
  },

  // Response error 404
  NotFoundResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      status: { type: "number", example: 404 },
      message: { type: "string" },
    },
  },
};

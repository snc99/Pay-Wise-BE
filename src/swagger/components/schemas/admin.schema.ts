export const adminSchemas = {
  //  Input body untuk create admin
  AdminCreateInput: {
    type: "object",
    required: ["name", "email", "password", "role"],
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string", format: "password" },
      role: { type: "string", enum: ["ADMIN", "SUPERADMIN"] },
    },
  },

  // Input body untuk update admin
  AdminUpdateInput: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string", format: "password" },
      role: { type: "string", enum: ["ADMIN", "SUPERADMIN"] },
    },
  },

  // Response success (get all admin)
  AdminSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["ADMIN", "SUPERADMIN"] },
        },
      },
      // Schema untuk pagination
      PaginationMeta: {
        type: "object",
        properties: {
          currentPage: { type: "integer", example: 1 },
          totalPages: { type: "integer", example: 3 },
          totalItems: { type: "integer", example: 17 },
        },
      },
    },
  },

  // Response Create Admin (201)
  AdminCreateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 201 },
      message: { type: "string" },
      data: {
        properties: {
          name: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          password: { type: "string", format: "password" },
          role: { type: "string", enum: ["ADMIN", "SUPERADMIN"] },
        },
      },
    },
  },

  // Response Update Admin (200)
  AdminUpdateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string", format: "password" },
          role: { type: "string", enum: ["ADMIN", "SUPERADMIN"] },
        },
      },
    },
  },

  // Delete response (200)
  AdminDeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "number", example: 200 },
      message: { type: "string" },
    },
  },
};

export const userSchemas = {
  // Input body untuk create user
  UserCreateInput: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
    },
  },

  // Input update user
  UserUpdateInput: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
    },
  },

  // Response get all user (200)
  UserSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "integer" },
          address: { type: "string" },
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

  // Response create user (201)
  UserCreateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 201 },
      message: { type: "string" },
      data: {
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
        },
      },
    },
  },

   // Response Update user (200)
    UserUpdateResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        status: { type: "integer", example: 200 },
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
          },
        },
      },
    },

     // Response delete user (200)
    UserDeleteResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        status: { type: "integer", example: 200 },
        message: { type: "string" },
      },
    },

    // Response dropdown user (200)
    UserDropdownResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        status: { type: "integer", example: 200 },
        message: { type: "string" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },

    // Respon dropdown user with amount (200)
    UserDropdownAmountResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        status: { type: "integer", example: 200 },
        message: { type: "string" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              amount: { type: "number" },
            },
          },
        },
      },
    },
  };

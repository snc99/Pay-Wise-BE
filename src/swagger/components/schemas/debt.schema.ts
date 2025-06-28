export const debtSchemas = {
  // Input body untuk create user
  DebtCreateInput: {
    type: "object",
    required: ["userId", "amount", "date"],
    properties: {
      userId: { type: "string" },
      amount: { type: "number", example: 150000 },
      date: { type: "string", format: "date", example: "2025-06-25" },
    },
  },

  // Response success (get all data)
  DebtListSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          amount: { type: "number" },
          date: { type: "string", format: "date" },
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

  // Response create debt
  DebtCreateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 201 },
      message: { type: "string" },
      data: {
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          amount: { type: "number" },
          date: { type: "string", format: "date" },
        },
      },
    },
  },

  // Response delete debt
  DebtDeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
    },
  },
};

export const paymentSchemas = {
  // Input create payment
  PaymentCreateInput: {
    type: "object",
    required: ["userId", "amount", "date"],
    properties: {
      userId: { type: "string" },
      amount: { type: "number", example: 150000 },
      date: { type: "string", format: "date", example: "2025-06-25" },
    },
  },

  // Response status 200 (get all payment))
  PaymentListSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          userId: { type: "string" },
          amount: { type: "number", example: 150000 },
          date: { type: "string", format: "date", example: "2025-06-25" },
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

  // Response status 201 (create payment)
  PaymentCreateResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 201 },
      message: { type: "string" },
      data: {
        properties: {
          userId: { type: "string" },
          amount: { type: "number", example: 150000 },
          date: { type: "string", format: "date", example: "2025-06-25" },
        },
      },
    },
  },

  // Response status 200 (delete payment)
  PaymentDeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
    },
  },
};

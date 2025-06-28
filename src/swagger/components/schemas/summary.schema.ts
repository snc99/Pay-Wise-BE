export const summarySchema = {
  PaymentHistoryListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "integer", example: 200 },
      message: { type: "string" },
      data: {
        properties: {
          userId: { type: "string" },
          amount: { type: "number", example: 150000 },
          remaining: { type: "number", example: 150000 },
          paidAt: { type: "string", format: "date", example: "2025-06-25" },
          userName: { type: "string" },
          totalDebt: { type: "number", example: 300000 },
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
};

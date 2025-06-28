export const summaryResponses = {
  PaymentHistoryListResponse: {
    description: "Payment history berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/PaymentHistoryListResponse" },
      },
    },
  },
};

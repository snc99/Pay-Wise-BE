export const paymentResponses = {
  // Response status 200 (Get all payment)
  PaymentListSuccessResponse: {
    description: "Data user berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/PaymentListSuccessResponse" },
      },
    },
  },

  // Response status 201 (Create payment)
  PaymentCreateResponse: {
    description: "Data user berhasil ditambahkan",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/PaymentCreateResponse" },
      },
    },
  },

  // Response status 200 (Delete payment)
  PaymentDeleteResponse: {
    description: "Data user berhasil dihapus",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/PaymentDeleteResponse" },
      },
    },
  },
};

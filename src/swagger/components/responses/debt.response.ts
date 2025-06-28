export const debtResponses = {
  // Response status 200 (Get all debt)
  DebtListSuccessResponse: {
    description: "Data user berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/DebtListSuccessResponse" },
      },
    },
  },

  // Response status 201 (Create debt)
  DebtCreateResponse: {
   description: "Data user berhasil ditambahkan",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/DebtCreateResponse" },
      },
    },
  },

  // response status 200 (delete debt)
  DebtDeleteResponse: {
    description: "Data utang berhasil dihapus",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/DebtDeleteResponse" },
      },
    },
  },
};

export const adminResponses = {
  // response status 200 (Get all admin)
  AdminListSuccessResponse: {
    description: "Data admin berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/AdminSuccessResponse" },
      },
    },
  },

  // response status 201 (Create admin)
  AdminCreateSuccessResponse: {
    description: "Data admin berhasil ditambahkan",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/AdminCreateResponse" },
      },
    },
  },

  // response status 200 (Update admin)
  AdminUpdateSuccessResponse: {
    description: "Data berhasil di update",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/AdminUpdateResponse" },
      },
    },
  },

  // response status 200 (Delete admin)
  AdminDeleteSuccessResponse: {
    description: "Data berhasil dihapus",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/AdminDeleteResponse" },
      },
    },
  },
};

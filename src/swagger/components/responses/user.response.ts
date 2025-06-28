export const userResponses = {
  // response status 200 (Get all user)
  UserListSuccessResponse: {
    description: "Data user berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserSuccessResponse" },
      },
    },
  },

  // response status 201 (Create user)
  UserCreateResponse: {
    description: "Data user berhasil ditambahkan",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserCreateResponse" },
      },
    },
  },

  // response status 200 (Update user)
  UserUpdateResponse: {
    description: "User berhasil di update",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserUpdateResponse" },
      },
    },
  },

  // response status 200 (Delete user)
  UserDeleteResponse: {
    description: "Data user berhasil dihapus",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserDeleteResponse" },
      },
    },
  },

  // response status 200 (dropdown user)
  UserDropdownResponse: {
    description: "Data user berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserDropdownResponse" },
      },
    },
  },

  // response status 200 (dropdown user with amount)
  UserDropdownAmountResponse: {
    description: "Data user berhasil diambil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserDropdownAmountResponse" },
      },
    },
  },
};

export const authResponses = {
  // response 200 (login berhasil)
  LoginSuccessResponse: {
    description: "Login berhasil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/LoginResponse" },
      },
    },
  },

  // response 200 (profil admin yang sedang login)
  ProfileSuccessResponse: {
    description: "Profil admin yang sedang login",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UserProfileResponse" },
      },
    },
  },

  // response 200 (logout berhasil)
  LogoutSuccessResponse: {
    description: "Logout berhasil",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/LogoutSuccessResponse" },
      },
    },
  },

  // response 400
  // FieldValidationErrorsResponse: {
  //   description: "Bad Request",
  //   content: {
  //     "application/json": {
  //       schema: { $ref: "#/components/schemas/FieldValidationError" },
  //     },
  //   },
  // },

  // response 401
  // UnauthorizedError: {
  //   description: "Unauthorized",
  //   content: {
  //     "application/json": {
  //       schema: { $ref: "#/components/schemas/ErrorResponse" },
  //     },
  //   },
  // },

  // response 404
  //   NotFoundErrorResponse: {
  //     description: "Not Found",
  //     content: {
  //       "application/json": {
  //         schema: { $ref: "#/components/schemas/NotFoundResponse" },
  //       },
  //     },
  //   },
};

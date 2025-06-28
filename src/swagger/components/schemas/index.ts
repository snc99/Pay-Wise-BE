import { adminSchemas } from "./admin.schema";
import { authSchemas } from "./auth.schema";
import { debtSchemas } from "./debt.schema";
import { errorSchemas } from "./error.schema";
import { paymentSchemas } from "./payment.schema";
import { summarySchema } from "./summary.schema";
import { userSchemas } from "./user.schema";

export const schemas = {
  ...authSchemas,
  ...adminSchemas,
  ...userSchemas,
  ...debtSchemas,
  ...paymentSchemas,
  ...summarySchema,
  ...errorSchemas,
};

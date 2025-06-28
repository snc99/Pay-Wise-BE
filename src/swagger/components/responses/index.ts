import { errorResponses } from './error.response';
import { adminResponses } from "./admin.response";
import { authResponses } from "./auth.response";
import { debtResponses } from "./debt.response";
import { paymentResponses } from "./payment.response";
import { summaryResponses } from "./summary.response";
import { userResponses } from "./user.response";

export const responses = {
  ...authResponses,
  ...adminResponses,
  ...userResponses,
  ...debtResponses,
  ...paymentResponses,
  ...summaryResponses,
  ...errorResponses,
};

import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().superRefine((val, ctx) => {
    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username tidak boleh kosong",
      });
      return;
    }

    if (trimmed.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 3,
        inclusive: true,
        type: "string",
        message: "Username minimal 3 karakter",
      });
    }
  }),
  password: z.string().superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password tidak boleh kosong",
      });
      return;
    }

    if (val.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 6,
        inclusive: true,
        type: "string",
        message: "Password minimal 6 karakter",
      });
    }

    if (val.includes(" ")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password tidak boleh mengandung spasi",
      });
    }
  }),
});

import { z } from "zod";

const trimmedString = (msg: string) =>
  z
    .string({ required_error: msg })
    .refine((v) => v.trim().length > 0, msg)
    .transform((v) => v.trim());

// Helper: Nama
const nameSchema = z
  .string()
  .min(3, "Nama minimal 3 karakter")
  .regex(
    /^[a-zA-ZÀ-ž'’. -]+$/,
    "Nama hanya boleh huruf, spasi, titik, kutip, dan tanda hubung",
  )
  .refine((v) => v.trim().length > 0, "Nama wajib diisi")
  .transform((v) => v.trim());

// Email schema yang cek kosong dulu
const emailSchema = z
  .string({ required_error: "Email wajib diisi" })
  .email("Format email tidak valid")
  .transform((v) => v.trim());

// Username dengan validasi angka
const usernameSchema = z
  .string({ required_error: "Username wajib diisi" })
  .min(3, "Username minimal 3 karakter")
  .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
  .refine((v) => /\d/.test(v), "Username harus mengandung minimal satu angka")
  .transform((v) => v.trim());

// Password tanpa spasi
const passwordSchema = z
  .string({ required_error: "Password wajib diisi" })
  .min(6, "Password minimal 6 karakter")
  .refine((v) => !v.includes(" "), "Password tidak boleh mengandung spasi");

// Role khusus
const roleSchema = z.enum(["SUPERADMIN", "ADMIN"], {
  required_error: "Role wajib diisi",
});

// Final schema
export const createAdminSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    role: roleSchema,
    email: emailSchema,
    name: nameSchema,
  })
  .strict();

// Username sama seperti create
const usernameUpdateSchema = z.string().superRefine((val, ctx) => {
  const trimmed = val.trim();

  if (!trimmed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Username wajib diisi",
    });
    return;
  }

  if (trimmed.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      type: "string",
      minimum: 3,
      inclusive: true,
      message: "Username minimal 3 karakter",
    });
    return;
  }

  if (!/\d/.test(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Username harus mengandung minimal satu angka",
    });
  }
});

export const updateAdminSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    role: roleSchema.optional(),
    password: passwordSchema.optional(),
  })
  .strict();

import { z } from "zod";

// Custom helper: Nama, Email, dsb.
const nonEmptyString = (fieldName: string, min = 1) =>
  z.string().superRefine((val, ctx) => {
    const trimmed = val.trim();
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName} wajib diisi`,
      });
      return;
    }
    if (trimmed.length < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        inclusive: true,
        type: "string",
        message: `${fieldName} minimal ${min} karakter`,
      });
    }
  });

// Username dengan validasi angka
const usernameSchema = z.string().superRefine((val, ctx) => {
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

// Role khusus
const roleSchema = z.string().superRefine((val, ctx) => {
  if (!val.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Role wajib diisi",
    });
    return;
  }

  if (!["SUPERADMIN", "ADMIN"].includes(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Role harus SUPERADMIN atau ADMIN",
    });
  }
});

// Password tanpa spasi
const passwordSchema = z.string().superRefine((val, ctx) => {
  if (!val.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password wajib diisi",
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
    return;
  }

  if (val.includes(" ")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password tidak boleh mengandung spasi",
    });
  }
});

// Final schema
export const createAdminSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: roleSchema.transform((val) => val as "SUPERADMIN" | "ADMIN"),
  email: z.string().trim().email("Format email tidak valid"),
  name: nonEmptyString("Nama", 1),
});

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

// Email schema yang cek kosong dulu
const emailSchema = z.string().superRefine((val, ctx) => {
  const trimmed = val.trim();

  if (!trimmed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email wajib diisi",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation

  if (!emailRegex.test(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Format email tidak valid",
    });
  }
});

export const updateAdminSchema = z.object({
  name: nonEmptyString("Nama"),
  email: emailSchema,
  username: usernameUpdateSchema,
  role: roleSchema,
  password: passwordSchema,
});

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

// Helper: Nama
const nameSchema = z
  .string({
    required_error: "Inputan field salah.",
    invalid_type_error: "Nama harus berupa string.",
  })
  .superRefine((val, ctx) => {
    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama wajib diisi.",
      });
      return;
    }

    if (trimmed.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 3,
        inclusive: true,
        type: "string",
        message: "Nama minimal 3 karakter.",
      });
      return;
    }

    if (!/^[a-zA-ZÀ-ž'’. -]+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Nama hanya boleh mengandung huruf, spasi, titik, kutip, dan tanda hubung.",
      });
    }
  });

// Email schema yang cek kosong dulu
const emailSchema = z
  .string({
    required_error: "Email wajib diisi.",
    invalid_type_error: "Email harus berupa string.",
  })
  .superRefine((val, ctx) => {
    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email wajib diisi",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format email tidak valid",
      });
    }
  });

// Username dengan validasi angka
const usernameSchema = z
  .string({
    required_error: "Inputan field salah.",
    invalid_type_error: "Username harus berupa string.",
  })
  .superRefine((val, ctx) => {
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

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Username hanya boleh mengandung huruf, angka, dan underscore (_).",
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

// Password tanpa spasi
const passwordSchema = z
  .string({
    required_error: "Inputan field salah.",
    invalid_type_error: "Password harus berupa string.",
  })
  .superRefine((val, ctx) => {
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

// Role khusus
const roleSchema = z
  .string({
    required_error: "Inputan field salah.",
    invalid_type_error: "Role harus berupa string.",
  })
  .superRefine((val, ctx) => {
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

// Final schema
export const createAdminSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    role: roleSchema.transform((val) => val as "SUPERADMIN" | "ADMIN"),
    email: z
      .string({
        required_error: "Email wajib diisi.",
        invalid_type_error: "Email harus berupa string.",
      })
      .email("Format email tidak valid"),
    name: nameSchema,
  })
  .strict(); // ⬅️ Penting! untuk tangkap field typo

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
    name: nameSchema,
    email: emailSchema,
    username: usernameSchema,
    role: roleSchema,
    password: passwordSchema,
  })
  .strict(); // ⬅️ Wajib biar typo ke-detect

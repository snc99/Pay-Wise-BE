import { z } from "zod";

// Helper: String optional dengan trim & validasi minimal
const optionalTrimmedString = (field: string, min = 3) =>
  z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;

      const trimmed = val.trim();

      if (!trimmed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} tidak boleh hanya berisi spasi.`,
        });
        return;
      }

      if (trimmed.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          type: "string",
          minimum: min,
          inclusive: true,
          message: `${field} minimal ${min} karakter.`,
        });
      }
    });

// Helper: String wajib diisi & tidak hanya spasi
const requiredTrimmedString = (field: string, min = 3) =>
  z
    .string({
      required_error: `${field} wajib diisi.`,
      invalid_type_error: `${field} harus berupa string.`,
    })
    .superRefine((val, ctx) => {
      const trimmed = val.trim();

      if (!trimmed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} tidak boleh hanya berisi spasi.`,
        });
        return;
      }

      if (trimmed.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          type: "string",
          minimum: min,
          inclusive: true,
          message: `${field} minimal ${min} karakter.`,
        });
      }
    });

// =======================
// ✅ CREATE USER
// =======================
export const createUserSchema = z.object({
  name: requiredTrimmedString("Nama", 3),

  phone: z
    .string({
      required_error: "Nomor telepon wajib diisi.",
      invalid_type_error: "Nomor telepon harus berupa string.",
    })
    .superRefine((val, ctx) => {
      const trimmed = val.trim();

      if (!/^\d+$/.test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor telepon hanya boleh berisi angka.",
        });
        return;
      }

      if (trimmed.length < 10 || trimmed.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor telepon harus 10–15 digit.",
        });
        return;
      }

      if (!/^08\d{8,11}$/.test(trimmed) && !/^62\d{9,12}$/.test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Format nomor telepon tidak valid. Gunakan format 08xxx atau 62xxx.",
        });
      }
    }),

  address: requiredTrimmedString("Alamat", 5),
});

// =======================
// ✅ UPDATE USER
// =======================
export const updateUserSchema = z.object({
  name: optionalTrimmedString("Nama", 3),
  address: optionalTrimmedString("Alamat", 5),

  phone: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;

      const trimmed = val.trim();

      if (!/^\d+$/.test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor telepon hanya boleh berisi angka.",
        });
        return;
      }

      if (trimmed.length < 10 || trimmed.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor telepon harus 10–15 digit.",
        });
        return;
      }

      if (!/^08\d{8,11}$/.test(trimmed) && !/^62\d{9,12}$/.test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Format nomor telepon tidak valid. Gunakan format 08xxx atau 62xxx.",
        });
      }
    }),
});

// =======================
// ✅ PARAM VALIDATION
// =======================
export const userIdParamSchema = z.object({
  id: z.string().min(1, "ID user tidak boleh kosong."),
});

export const deleteUserParamSchema = userIdParamSchema;

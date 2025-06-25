import { z } from "zod";

// Helper: String optional dengan trim & validasi minimal
const nameSchema = z
  .string({
    required_error: "Nama wajib diisi.",
    invalid_type_error: "Nama harus berupa string.",
  })
  .superRefine((val, ctx) => {
    if (val === undefined) return;

    if (val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama tidak boleh kosong.",
      });
      return;
    }

    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama tidak boleh hanya berisi spasi.",
      });
      return;
    }

    if (trimmed.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: "string",
        minimum: 3,
        inclusive: true,
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
      return;
    }
  });

// Helper : Phone
const phoneSchema = z
  .string({
    required_error: "Nomor telepon wajib diisi.",
    invalid_type_error: "Nomor telepon harus berupa string.",
  })
  .superRefine((val, ctx) => {
    if (val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nomor telepon tidak boleh kosong.",
      });
      return;
    }

    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nomor telepon tidak boleh hanya berisi spasi.",
      });
      return;
    }

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
      return;
    }
  });

// Helper: address
const addressSchema = z
  .string({
    required_error: "Alamat wajib diisi.",
    invalid_type_error: "Alamat harus berupa string.",
  })
  .superRefine((val, ctx) => {
    if (val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Alamat tidak boleh kosong.",
      });
      return;
    }

    const trimmed = val.trim();

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Alamat tidak boleh hanya berisi spasi.",
      });
      return;
    }

    if (trimmed.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: "string",
        minimum: 3,
        inclusive: true,
        message: "Alamat minimal 3 karakter.",
      });
    }
  });

// =======================
// ✅ CREATE USER
// =======================
export const createUserSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    address: addressSchema,
  })
  .strict();

// =======================
// ✅ UPDATE USER
// =======================
export const updateUserSchema = z
  .object({
    name: nameSchema.optional(),
    address: addressSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .strict();

// =======================
// ✅ PARAM VALIDATION
// =======================
export const userIdParamSchema = z.object({
  id: z.string().min(1, "ID user tidak boleh kosong."),
});

export const deleteUserParamSchema = userIdParamSchema;

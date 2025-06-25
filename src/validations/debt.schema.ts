import { z } from "zod";

// Untuk nominal amount
const amountSchema = z.any().superRefine((val, ctx) => {
  const raw = typeof val === "string" ? val.trim() : String(val);

  // 1. Cek kosong
  if (!raw) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nominal tidak boleh kosong.",
    });
    return;
  }

  // 2. Cek angka valid
  if (isNaN(Number(raw))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nominal harus berupa angka.",
    });
    return;
  }

  // 3. Cek positif
  if (Number(raw) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nominal harus lebih dari 0.",
    });
  }
});

// untuk date
const dateSchema = z
  .string({
    required_error: "Tanggal wajib diisi.",
    invalid_type_error: "Tanggal wajib berupa string.",
  })
  .refine(
    (val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime());
    },
    {
      message: "Format tanggal tidak valid.",
    }
  )
  .refine(
    (val) => {
      const inputDate = new Date(val);
      const now = new Date();
      return inputDate <= now;
    },
    {
      message: "Tanggal tidak boleh lebih dari sekarang.",
    }
  );

export const debtSchema = z
  .object({
    userId: z
      .string({
        required_error: "User wajib diisi.",
        invalid_type_error: "User wajib berupa string.",
      })
      .min(1, "User wajib diisi."),

    amount: amountSchema,
    date: dateSchema,
  })
  .strict();

export const deleteDebtParamsSchema = z.object({
  id: z.string().min(1, "ID utang wajib diisi."),
});

import { z } from "zod";

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

const padAtSchema = z
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

export const paymentSchema = z.object({
  userId: z
    .string({
      required_error: "User wajib dipilih.",
      invalid_type_error: "User tidak valid.",
    })
    .min(1, "User wajib dipilih."),
  amount: amountSchema,
  paidAt: padAtSchema,
});

export const deletePaymentParamsSchema = z.object({
  id: z.string().min(1, "ID payment wajib diisi."),
});

import { z } from "zod";

// Untuk nominal amount
const amountSchema = z
  .union([
    z.string().refine((val) => !isNaN(Number(val)), {
      message: "Nominal harus berupa angka.",
    }),
    z.number(),
  ])
  .refine((val) => Number(val) > 0, {
    message: "Nominal harus lebih dari 0.",
  });

export const debtSchema = z.object({
  userId: z
    .string({
      required_error: "User wajib diisi.",
      invalid_type_error: "User wajib berupa string.",
    })
    .min(1, "User wajib diisi."),

  amount: amountSchema,

  date: z
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
    ),
});

export const deleteDebtParamsSchema = z.object({
  id: z.string().min(1, "ID utang wajib diisi."),
});

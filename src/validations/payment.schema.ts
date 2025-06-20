import { z } from "zod";

export const paymentSchema = z.object({
  userId: z.string({
    required_error: "User wajib dipilih.",
    invalid_type_error: "User tidak valid.",
  }),
  amount: z
    .string()
    .min(1, { message: "Nominal pembayaran tidak boleh kosong." })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal pembayaran harus berupa angka positif.",
    }),
  paidAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Tanggal pembayaran tidak valid.",
  }),
});

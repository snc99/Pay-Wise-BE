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
  paidAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Tanggal pembayaran tidak valid.",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Tanggal pembayaran tidak boleh di masa depan.",
    }),
});

export const deletePaymentParamsSchema = z.object({
  id: z.string().min(1, 'ID payment wajib diisi.'),
});

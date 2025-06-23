import { z } from "zod";

export const paymentSchema = z
  .object({
    userId: z
      .string({
        required_error: "User wajib dipilih.",
        invalid_type_error: "User tidak valid.",
      })
      .min(1, "User wajib dipilih."),
    amount: z
      .string({
        required_error: "Nominal pembayaran wajib diisi.",
        invalid_type_error: "Nominal pembayaran harus berupa string.",
      })
      .min(1, { message: "Nominal pembayaran tidak boleh kosong." })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Nominal pembayaran harus berupa angka positif.",
      }),
    paidAt: z
      .string({
        required_error: "Tanggal pembayaran wajib diisi.",
        invalid_type_error: "Tanggal pembayaran harus berupa string.",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Tanggal pembayaran tidak valid.",
      })
      .refine((val) => new Date(val) <= new Date(), {
        message: "Tanggal pembayaran tidak boleh di masa depan.",
      }),
  })
  .strict({ message: "Field tidak dikenal" });

export const deletePaymentParamsSchema = z.object({
  id: z.string().min(1, "ID payment wajib diisi."),
});

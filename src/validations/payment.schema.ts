import { z } from "zod";

const amountSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return val.replace(/\./g, "").replace(/,/g, ".");
    }
    return val;
  },
  z
    .number({
      required_error: "Nominal wajib diisi",
      invalid_type_error: "Nominal harus berupa angka",
    })
    .positive("Nominal harus lebih dari 0"),
);

const paidAtSchema = z
  .string({ required_error: "Tanggal wajib diisi." })
  .refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Format tanggal tidak valid.",
  })
  .refine((val) => new Date(val) <= new Date(), {
    message: "Tanggal tidak boleh di masa depan.",
  });

export const paymentSchema = z.object({
  userId: z.string().min(1, "User wajib dipilih."),
  amount: amountSchema,
  paidAt: paidAtSchema,
});

import { z } from "zod";

// Untuk nominal amount
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

// untuk date
const dateSchema = z
  .string({ required_error: "Tanggal wajib diisi." })
  .refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Format tanggal tidak valid.",
  })
  .refine((val) => new Date(val) <= new Date(), {
    message: "Tanggal tidak boleh di masa depan.",
  });

export const debtSchema = z.object({
  userId: z.string().min(1, "User wajib diisi."),
  amount: amountSchema,
  date: dateSchema,
  note: z.string().optional(),
});

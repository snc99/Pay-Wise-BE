import { z } from "zod";

export const debtSchema = z.object({
  userId: z.string({
    required_error: "User wajib dipilih",
    invalid_type_error: "User tidak valid",
  }),
  amount: z
    .string()
    .refine((val: any) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Jumlah utang harus berupa angka lebih dari 0",
    }),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Tanggal tidak valid",
    }),
});

import { z } from "zod";

export const debtSchema = z.object({
  userId: z.string().min(1, "User wajib diisi"),

  amount: z.union([
    z.string().refine((val) => !isNaN(Number(val)), "Nominal harus angka"),
    z.number(),
  ]),

  date: z.string().refine(
    (val) => {
      const inputDate = new Date(val);
      const now = new Date();
      return inputDate <= now;
    },
    {
      message: "Tanggal tidak boleh lebih dari sekarang",
    }
  ),
});

export const deleteDebtParamsSchema = z.object({
  id: z.string().min(1, "Utang wajib diisi"),
});

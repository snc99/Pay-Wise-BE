import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username wajib diisi." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

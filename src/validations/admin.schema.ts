import { z } from "zod";

export const createAdminSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  email: z.string().email("Format email tidak valid"),
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(["SUPERADMIN", "ADMIN"], {
    required_error: "Role wajib diisi",
    invalid_type_error: "Role harus SUPERADMIN atau ADMIN",
  }),
});

export const updateAdminSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  role: z.enum(["SUPERADMIN", "ADMIN"], {
    required_error: "Role wajib diisi",
    invalid_type_error: "Role harus SUPERADMIN atau ADMIN",
  }),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

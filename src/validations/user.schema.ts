import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi." }),
  phone: z
    .string()
    .min(8, { message: "Nomor telepon minimal 8 digit." })
    .regex(/^[0-9]+$/, { message: "Nomor telepon hanya boleh berisi angka." }),
  address: z.string().min(1, { message: "Alamat wajib diisi." }),
});

// validasi param ID
export const userIdParamSchema = z.object({
  id: z.string().min(1, "ID user tidak boleh kosong"),
});

// validasi data update (semua opsional tapi tetap tervalidasi)
export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong").optional(),
  phone: z
    .string()
    .min(8, { message: "Nomor telepon minimal 8 digit" })
    .regex(/^[0-9]+$/, { message: "Nomor telepon hanya boleh berisi angka" })
    .optional(),
  address: z.string().min(1, "Alamat tidak boleh kosong").optional(),
});

export const deleteUserParamSchema = z.object({
  id: z.string().min(1, "ID user tidak boleh kosong"),
});



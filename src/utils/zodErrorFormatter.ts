import { ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  const fieldErrors = error.flatten().fieldErrors;
  const formatted: Record<string, string[]> = {};

  // Salin error validasi biasa
  for (const key in fieldErrors) {
    if (fieldErrors[key]) {
      formatted[key] = fieldErrors[key]!;
    }
  }

  // Tangani field tidak dikenal (typo, dll)
  error.issues
    .filter((issue) => issue.code === "unrecognized_keys")
    .forEach((issue) => {
      const keys = (issue as any).keys || []; // Zod belum ketat typing-nya
      for (const key of keys) {
        if (!formatted[key]) {
          formatted[key] = [];
        }
        formatted[key].push("Field tidak dikenal.");
      }
    });

  return formatted;
};

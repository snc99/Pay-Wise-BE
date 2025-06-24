import { ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  const fieldErrors = error.flatten().fieldErrors;
  const formatted: Record<string, string[]> = {};

  // Salin field errors
  for (const key in fieldErrors) {
    if (fieldErrors[key]) {
      formatted[key] = fieldErrors[key]!;
    }
  }

  // Tangani field tidak dikenal
  const unknownFieldIssues = error.issues.filter(
    (issue) => issue.code === "unrecognized_keys"
  );

  unknownFieldIssues.forEach((issue) => {
    const keys = (issue.path?.[0] || "") as string;
    if (keys) {
      if (!formatted[keys]) {
        formatted[keys] = [];
      }
      formatted[keys].push("Field tidak dikenal.");
    }
  });

  return formatted;
};

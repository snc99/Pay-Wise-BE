// import { z } from "zod";

// export const createTrimmedString = (
//   field: string,
//   min = 1,
//   regex?: RegExp,
//   regexMessage?: string
// ) =>
//   z
//     .string({
//       required_error: `Inputan field salah.`,
//       invalid_type_error: `${field} harus berupa string.`,
//     })
//     .superRefine((val, ctx) => {
//       const trimmed = val.trim();

//       if (!trimmed) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: `${field} wajib diisi.`,
//         });
//         return;
//       }

//       if (trimmed.length < min) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.too_small,
//           minimum: min,
//           inclusive: true,
//           type: "string",
//           message: `${field} minimal ${min} karakter.`,
//         });
//         return;
//       }

//       if (regex && !regex.test(trimmed)) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: regexMessage || `${field} format tidak valid.`,
//         });
//       }
//     });

// export const usernameValidator = createTrimmedString(
//   "Username",
//   3,
//   /^[a-zA-Z0-9_]+$/,
//   "Username hanya boleh huruf, angka, dan underscore (_)."
// ).superRefine((val, ctx) => {
//   if (!/\d/.test(val)) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Username harus mengandung minimal satu angka.",
//     });
//   }
// });

// export const passwordValidator = createTrimmedString("Password", 6).superRefine(
//   (val, ctx) => {
//     if (val.includes(" ")) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Password tidak boleh mengandung spasi.",
//       });
//     }
//   }
// );

// export const nameValidator = createTrimmedString(
//   "Nama",
//   3,
//   /^[a-zA-ZÀ-ž'’. -]+$/,
//   "Nama hanya boleh mengandung huruf, spasi, titik, kutip, dan tanda hubung."
// );

// export const emailValidator = z
//   .string({
//     required_error: "Email wajib diisi.",
//     invalid_type_error: "Email harus berupa string.",
//   })
//   .superRefine((val, ctx) => {
//     const trimmed = val.trim();
//     if (!trimmed) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Email wajib diisi.",
//       });
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(trimmed)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Format email tidak valid.",
//       });
//     }
//   });

// export const roleValidator = createTrimmedString("Role").superRefine(
//   (val, ctx) => {
//     if (!["SUPERADMIN", "ADMIN"].includes(val)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Role harus SUPERADMIN atau ADMIN.",
//       });
//     }
//   }
// );

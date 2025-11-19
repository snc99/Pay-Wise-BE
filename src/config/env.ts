import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

function normalizeServerUrl(raw?: string) {
  if (!raw) return "http://localhost:3001";
  try {
    const u = new URL(raw);
    return u.origin; // hanya scheme + host (tanpa path)
  } catch {
    return raw.startsWith("http") ? raw : `http://${raw}`;
  }
}

export const ENV = {
  NODE_ENV,
  IS_PROD: NODE_ENV === "production",
  IS_DEV: NODE_ENV === "development",

  SERVER_URL: normalizeServerUrl(process.env.SERVER_URL),

  DATABASE_URL: process.env.DATABASE_URL!,

  REDIS_URL: process.env.UPSTASH_REDIS_REST_URL!,
  REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,

  JWT_SECRET: process.env.JWT_SECRET!,

  SWAGGER: {
    TITLE: "Pay Wise Express API",
    VERSION: "1.0.0",
    DESCRIPTION: "API documentation for Pay Wise Express backend",
  },
};

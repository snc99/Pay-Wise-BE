import { ENV } from "../config/env";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: { db: { url: ENV.DATABASE_URL } },
});

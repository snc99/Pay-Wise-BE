import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";
import debtRoutes from "./routes/debt.routes";
import paymentRoutes from "./routes/payment.routes";
import pingRoutes from "./routes/ping.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./swagger";
import { ENV } from "./config/env";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Normalize FRONTEND_URLS (fallback http://localhost:3000)
const rawOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const normalizeOrigin = (o: string) => {
  try {
    if (o.startsWith("http://") || o.startsWith("https://")) {
      return new URL(o).origin;
    }
    return o;
  } catch {
    return o;
  }
};

const allowedOrigins = Array.from(new Set(rawOrigins.map(normalizeOrigin)));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("CORS: Origin not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    credentials: true,
  })
);

// Debug logging (bisa dihapus setelah ok)
console.log("ENV.SERVER_URL:", ENV.SERVER_URL);
console.log("FRONTEND_URLS:", process.env.FRONTEND_URLS);

// Mount routes
app.use("/", pingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/payment", paymentRoutes);

// Only enabled Swagger in development
if (process.env.ENABLE_SWAGGER === "true") {
  setupSwagger(app);
  console.log("Swagger enabled (by ENV)");
} else {
  console.log("Swagger disabled");
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins.join(", "));
});

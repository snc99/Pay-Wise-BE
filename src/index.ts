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

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

/**
 * CORS configuration:
 * - Allow origins from env FRONTEND_URL (comma-separated) and http://localhost:3000 for dev.
 * - credentials: true enables cookies if you later use httpOnly cookie auth.
 */
const rawOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());
const allowedOrigins = Array.from(new Set(rawOrigins)); // unique

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like curl, mobile apps, server-to-server
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
    credentials: true, // set true if you plan to use cookies; harmless for Bearer token
  })
);

// ensure preflight requests are handled
app.options("*", cors());

/* Routes */
app.use("/", pingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/payment", paymentRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

/* Error handler */
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins.join(", "));
});

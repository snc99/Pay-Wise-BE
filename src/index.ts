import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";
import debtRoutes from "./routes/debt.routes";
import paymentRoutes from "./routes/payment.routes";
// import "./cron/paymentCleaner";
import pingRoutes from "./routes/ping.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());
setupSwagger(app);

app.use("/", pingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/payment", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

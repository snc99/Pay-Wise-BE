import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

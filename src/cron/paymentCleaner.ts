import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../prisma/client";

// Jadwalkan setiap hari jam 2 pagi
cron.schedule("0 2 * * *", async () => {
  console.log("[CRON] Mulai bersihkan payment yang sudah dihapus >30 hari");

  const batasTanggal = dayjs().subtract(30, "day").toDate();

  try {
    const deleted = await prisma.payment.deleteMany({
      where: {
        deletedAt: {
          lte: batasTanggal,
        },
      },
    });

    console.log(`[CRON] Berhasil hapus ${deleted.count} payment`);
  } catch (error) {
    console.error("[CRON] Gagal hapus payment:", error);
  }
});

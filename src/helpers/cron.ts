import prisma from "@/prisma";
import cron from "node-cron";


// Jalankan cron setiap hari
cron.schedule("* * * * *", async () => {
  console.log("Running cron job every minute...");

  const now = new Date();

  now.setDate(now.getDate() + 9); // Tambahkan 7 hari
  console.log(now);

  const invoices = await prisma.invoice.findMany({
    where: {
      recurringActive : true,
      recurringSchedule: { not: null },
      recurringEndDate: { gte: now },
    },
    include: {
      invoiceItems: true, // Sertakan relasi invoiceItems
    },
  });

  for (const invoice of invoices) {
    const nextDueDate = calculateNextDueDate(invoice.dueDate, invoice.recurringSchedule!);
    if (nextDueDate <= now) {
      const newInvoice = await prisma.invoice.create({
        data: {
          userId: invoice.userId,
          clientId: invoice.clientId,
          dueDate: nextDueDate,
          recurringActive: false,
          recurringRefID: invoice.id,
        },
      });

      // Tambahkan invoiceItems untuk invoice baru
      if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
        const newInvoiceItems = invoice.invoiceItems.map((item) => ({
          invoiceId: newInvoice.id, // Gunakan invoiceId baru
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

        await prisma.invoiceItem.createMany({
          data: newInvoiceItems,
        });
      }

      // Update dueDate untuk jadwal berikutnya
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { dueDate: nextDueDate },
      });
    }
  }
});

function calculateNextDueDate(dueDate: Date, schedule: string): Date {
  const date = new Date(dueDate);
  if (schedule === "daily") date.setDate(date.getDate() + 1);
  if (schedule === "weekly") date.setDate(date.getDate() + 7);
  if (schedule === "monthly") date.setMonth(date.getMonth() + 1);
  if (schedule === "yearly") date.setFullYear(date.getFullYear() + 1);
  return date;
}

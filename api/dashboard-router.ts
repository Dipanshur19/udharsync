import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, transactions } from "../db/schema";
import { desc } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input }: { input?: { date?: string } }) => {
      const db = getDb();
      const targetDate = input?.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const allCustomers = await db.select().from(customers);
      const allTransactions = await db.select().from(transactions);

      const todayTxs = allTransactions.filter(
        (t) => new Date(t.date) >= startOfDay && new Date(t.date) <= endOfDay
      );

      const totalCustomers = allCustomers.length;
      const totalOutstanding = allCustomers.reduce((sum, c) => sum + parseFloat(c.balance), 0);
      const overdueCustomers = allCustomers.filter((c) => parseFloat(c.balance) > 5000).length;

      const todayUPI = todayTxs
        .filter((t) => t.paymentMode?.startsWith("UPI"))
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const todayCash = todayTxs
        .filter((t) => t.paymentMode === "CASH" || t.type === "CASH_SALE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const todayCredit = todayTxs
        .filter((t) => t.type === "CREDIT_GIVEN")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        totalCustomers,
        totalOutstanding,
        overdueCustomers,
        todayUPI,
        todayCash,
        todayCredit,
        todayCollection: todayUPI + todayCash,
      };
    }),

  recentTransactions: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }: { input?: { limit?: number } }) => {
      const db = getDb();
      const limit = input?.limit || 5;
      const txs = await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date))
        .limit(limit);
      return txs;
    }),

  overdueCustomers: publicQuery.query(async () => {
    const db = getDb();
    const allCustomers = await db.select().from(customers);
    const overdue = allCustomers
      .filter((c) => parseFloat(c.balance) > 5000)
      .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    return overdue;
  }),

  weeklyData: publicQuery.query(async () => {
    const db = getDb();
    const allTxs = await db.select().from(transactions);
    const days: { name: string; collection: number; credit: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayTxs = allTxs.filter(
        (t) => new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd
      );

      const collection = dayTxs
        .filter((t) => t.type === "PAYMENT_RECEIVED" || t.type === "CASH_SALE")
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const credit = dayTxs
        .filter((t) => t.type === "CREDIT_GIVEN")
        .reduce((s, t) => s + parseFloat(t.amount), 0);

      days.push({ name: dayName, collection, credit });
    }

    return days;
  }),
});

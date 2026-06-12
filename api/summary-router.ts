import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, reconciliation } from "../db/schema";
import { eq } from "drizzle-orm";

export const summaryRouter = createRouter({
  daily: publicQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input }: { input?: { date?: string } }) => {
      const db = getDb();
      const targetDate = input?.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const allTxs = await db.select().from(transactions);
      const dayTxs = allTxs.filter(
        (t) => new Date(t.date) >= startOfDay && new Date(t.date) <= endOfDay
      );

      const upiTotal = dayTxs
        .filter((t) => t.paymentMode?.startsWith("UPI"))
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const cashTotal = dayTxs
        .filter((t) => t.paymentMode === "CASH" || t.type === "CASH_SALE")
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const creditGiven = dayTxs
        .filter((t) => t.type === "CREDIT_GIVEN")
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const paymentsReceived = dayTxs
        .filter((t) => t.type === "PAYMENT_RECEIVED")
        .reduce((s, t) => s + parseFloat(t.amount), 0);

      return {
        date: targetDate.toISOString().split("T")[0],
        upiTotal,
        cashTotal,
        totalCollection: upiTotal + cashTotal + paymentsReceived,
        creditGiven,
        netPosition: upiTotal + cashTotal + paymentsReceived - creditGiven,
        transactionCount: dayTxs.length,
      };
    }),

  reconciliationStatus: publicQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input }: { input?: { date?: string } }) => {
      const db = getDb();
      const dateStr = input?.date || new Date().toISOString().split("T")[0];

      const existing = await db
        .select()
        .from(reconciliation);

      const match = existing.find((r) => {
        const rDate = new Date(r.date).toISOString().split("T")[0];
        return rDate === dateStr;
      });

      if (match) return match;

      return {
        id: 0,
        date: new Date(dateStr),
        khattaChecked: false,
        paytmVerified: false,
        gpayVerified: false,
        phonepeVerified: false,
        isComplete: false,
        completedAt: null as Date | null,
      };
    }),

  markReconciled: publicQuery
    .input(
      z.object({
        date: z.string(),
        khattaChecked: z.boolean().optional(),
        paytmVerified: z.boolean().optional(),
        gpayVerified: z.boolean().optional(),
        phonepeVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }: { input: { date: string; khattaChecked?: boolean; paytmVerified?: boolean; gpayVerified?: boolean; phonepeVerified?: boolean } }) => {
      const db = getDb();
      const { date, ...checks } = input;

      const existing = await db.select().from(reconciliation);
      const match = existing.find((r) => {
        const rDate = new Date(r.date).toISOString().split("T")[0];
        return rDate === date;
      });

      if (match) {
        const allChecked =
          (checks.khattaChecked ?? match.khattaChecked) &&
          (checks.paytmVerified ?? match.paytmVerified) &&
          (checks.gpayVerified ?? match.gpayVerified) &&
          (checks.phonepeVerified ?? match.phonepeVerified);

        await db
          .update(reconciliation)
          .set({
            ...checks,
            isComplete: allChecked,
            completedAt: allChecked ? new Date() : match.completedAt,
          })
          .where(eq(reconciliation.id, match.id));
      } else {
        const allChecked =
          !!checks.khattaChecked && !!checks.paytmVerified && !!checks.gpayVerified && !!checks.phonepeVerified;
        await db.insert(reconciliation).values({
          date: new Date(date),
          khattaChecked: checks.khattaChecked ?? false,
          paytmVerified: checks.paytmVerified ?? false,
          gpayVerified: checks.gpayVerified ?? false,
          phonepeVerified: checks.phonepeVerified ?? false,
          isComplete: allChecked,
          completedAt: allChecked ? new Date() : null,
        });
      }

      return { success: true };
    }),
});

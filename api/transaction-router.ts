import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, customers } from "../db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const transactionRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        customerId: z.number().optional(),
        type: z.enum(["CREDIT_GIVEN", "PAYMENT_RECEIVED", "CASH_SALE"]).optional(),
        paymentMode: z.enum(["UPI_GPAY", "UPI_PHONEPE", "UPI_PAYTM", "CASH"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        page: z.number().optional().default(1),
      }).optional()
    )
    .query(async ({ input }: { input?: { customerId?: number; type?: string; paymentMode?: string; dateFrom?: string; dateTo?: string; page?: number } }) => {
      const db = getDb();
      const page = input?.page || 1;
      const pageSize = 20;

      const conditions = [];
      if (input?.customerId) {
        conditions.push(eq(transactions.customerId, input.customerId));
      }
      if (input?.type) {
        conditions.push(eq(transactions.type, input.type as "CREDIT_GIVEN" | "PAYMENT_RECEIVED" | "CASH_SALE"));
      }
      if (input?.paymentMode) {
        conditions.push(eq(transactions.paymentMode, input.paymentMode as "UPI_GPAY" | "UPI_PHONEPE" | "UPI_PAYTM" | "CASH"));
      }
      if (input?.dateFrom) {
        conditions.push(gte(transactions.date, new Date(input.dateFrom)));
      }
      if (input?.dateTo) {
        conditions.push(lte(transactions.date, new Date(input.dateTo)));
      }

      const query = conditions.length > 0
        ? db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date))
        : db.select().from(transactions).orderBy(desc(transactions.date));

      const allTxs = await query;
      const total = allTxs.length;
      const paginated = allTxs.slice((page - 1) * pageSize, page * pageSize);

      return { transactions: paginated, total, page, pageSize };
    }),

  getById: publicQuery
    .input(z.number())
    .query(async ({ input }: { input: number }) => {
      const db = getDb();
      const tx = await db.select().from(transactions).where(eq(transactions.id, input));
      if (!tx[0]) throw new Error("Transaction not found");
      return tx[0];
    }),

  create: publicQuery
    .input(
      z.object({
        customerId: z.number().optional(),
        type: z.enum(["CREDIT_GIVEN", "PAYMENT_RECEIVED", "CASH_SALE"]),
        amount: z.string(),
        paymentMode: z.enum(["UPI_GPAY", "UPI_PHONEPE", "UPI_PAYTM", "CASH"]).optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { customerId?: number; type: "CREDIT_GIVEN" | "PAYMENT_RECEIVED" | "CASH_SALE"; amount: string; paymentMode?: string; notes?: string; date?: string } }) => {
      const db = getDb();
      const txDate = input.date ? new Date(input.date) : new Date();

      const result = await db.insert(transactions).values({
        customerId: input.customerId || null,
        type: input.type,
        amount: input.amount,
        paymentMode: (input.paymentMode as any) || null,
        notes: input.notes || null,
        date: txDate,
      });

      if (input.customerId) {
        const customer = await db.select().from(customers).where(eq(customers.id, input.customerId));
        if (customer[0]) {
          const currentBalance = parseFloat(customer[0].balance);
          const amount = parseFloat(input.amount);
          let newBalance = currentBalance;

          if (input.type === "CREDIT_GIVEN") {
            newBalance = currentBalance + amount;
          } else if (input.type === "PAYMENT_RECEIVED") {
            newBalance = currentBalance - amount;
          }

          await db
            .update(customers)
            .set({ balance: newBalance.toFixed(2) })
            .where(eq(customers.id, input.customerId));
        }
      }

      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        customerId: z.number().optional(),
        type: z.enum(["CREDIT_GIVEN", "PAYMENT_RECEIVED", "CASH_SALE"]).optional(),
        amount: z.string().optional(),
        paymentMode: z.enum(["UPI_GPAY", "UPI_PHONEPE", "UPI_PAYTM", "CASH"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { id: number; customerId?: number; type?: string; amount?: string; paymentMode?: string; notes?: string } }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(transactions).set(data as any).where(eq(transactions.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.number())
    .mutation(async ({ input }: { input: number }) => {
      const db = getDb();
      await db.delete(transactions).where(eq(transactions.id, input));
      return { success: true };
    }),
});

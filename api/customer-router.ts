import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, transactions } from "../db/schema";
import { eq, like, or, desc } from "drizzle-orm";

export const customerRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.enum(["ALL", "OVERDUE", "ACTIVE", "SETTLED"]).optional().default("ALL"),
        page: z.number().optional().default(1),
      }).optional()
    )
    .query(async ({ input }: { input?: { search?: string; filter?: "ALL" | "OVERDUE" | "ACTIVE" | "SETTLED"; page?: number } }) => {
      const db = getDb();
      const search = input?.search || "";
      const filter = input?.filter || "ALL";
      const page = input?.page || 1;
      const pageSize = 20;

      let query = db.select().from(customers);

      if (search) {
        query = query.where(
          or(
            like(customers.name, `%${search}%`),
            like(customers.phone, `%${search}%`)
          )
        ) as typeof query;
      }

      const allCustomers = await query.orderBy(desc(customers.createdAt));

      let filtered = allCustomers;
      if (filter === "OVERDUE") {
        filtered = allCustomers.filter((c) => parseFloat(c.balance) > 5000);
      } else if (filter === "ACTIVE") {
        filtered = allCustomers.filter((c) => parseFloat(c.balance) > 0 && parseFloat(c.balance) <= 5000);
      } else if (filter === "SETTLED") {
        filtered = allCustomers.filter((c) => parseFloat(c.balance) === 0);
      }

      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      return { customers: paginated, total, page, pageSize };
    }),

  getById: publicQuery
    .input(z.number())
    .query(async ({ input }: { input: number }) => {
      const db = getDb();
      const customer = await db.select().from(customers).where(eq(customers.id, input));
      if (!customer[0]) throw new Error("Customer not found");

      const txs = await db
        .select()
        .from(transactions)
        .where(eq(transactions.customerId, input))
        .orderBy(desc(transactions.date))
        .limit(50);

      return { ...customer[0], transactions: txs };
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        phone: z.string().max(15).optional(),
        creditLimit: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { name: string; phone?: string; creditLimit?: string; notes?: string } }) => {
      const db = getDb();
      const result = await db.insert(customers).values({
        name: input.name,
        phone: input.phone || null,
        creditLimit: input.creditLimit || null,
        notes: input.notes || null,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        phone: z.string().max(15).optional(),
        creditLimit: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { id: number; name?: string; phone?: string; creditLimit?: string; notes?: string } }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(customers).set(data).where(eq(customers.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.number())
    .mutation(async ({ input }: { input: number }) => {
      const db = getDb();
      await db.delete(transactions).where(eq(transactions.customerId, input));
      await db.delete(customers).where(eq(customers.id, input));
      return { success: true };
    }),
});

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, staffPins } from "../db/schema";
import { eq, like } from "drizzle-orm";

export const staffRouter = createRouter({
  verifyPin: publicQuery
    .input(z.object({ pin: z.string().length(4) }))
    .mutation(async ({ input }: { input: { pin: string } }) => {
      const db = getDb();
      const pins = await db.select().from(staffPins).where(eq(staffPins.pin, input.pin));
      if (pins[0] && pins[0].isActive) {
        return { valid: true };
      }
      return { valid: false };
    }),

  getBalances: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }: { input?: { search?: string } }) => {
      const db = getDb();
      const search = input?.search || "";

      let query = db.select().from(customers);
      if (search) {
        query = query.where(like(customers.name, `%${search}%`)) as typeof query;
      }

      const allCustomers = await query;
      return allCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        balance: parseFloat(c.balance),
      }));
    }),
});

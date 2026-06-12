import { authRouter } from "./auth-router";
import { customerRouter } from "./customer-router";
import { transactionRouter } from "./transaction-router";
import { dashboardRouter } from "./dashboard-router";
import { summaryRouter } from "./summary-router";
import { staffRouter } from "./staff-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  customer: customerRouter,
  transaction: transactionRouter,
  dashboard: dashboardRouter,
  summary: summaryRouter,
  staff: staffRouter,
});

export type AppRouter = typeof appRouter;

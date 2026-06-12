import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  bigint,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  creditLimit: decimal("creditLimit", { precision: 10, scale: 2 }),
  notes: text("notes"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).references(() => customers.id),
  type: mysqlEnum("type", ["CREDIT_GIVEN", "PAYMENT_RECEIVED", "CASH_SALE"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMode: mysqlEnum("paymentMode", ["UPI_GPAY", "UPI_PHONEPE", "UPI_PAYTM", "CASH"]),
  notes: text("notes"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const reconciliation = mysqlTable("reconciliation", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  khattaChecked: boolean("khattaChecked").default(false).notNull(),
  paytmVerified: boolean("paytmVerified").default(false).notNull(),
  gpayVerified: boolean("gpayVerified").default(false).notNull(),
  phonepeVerified: boolean("phonepeVerified").default(false).notNull(),
  isComplete: boolean("isComplete").default(false).notNull(),
  completedAt: timestamp("completedAt"),
});

export type Reconciliation = typeof reconciliation.$inferSelect;
export type InsertReconciliation = typeof reconciliation.$inferInsert;

export const staffPins = mysqlTable("staffPins", {
  id: serial("id").primaryKey(),
  pin: varchar("pin", { length: 4 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type StaffPin = typeof staffPins.$inferSelect;
export type InsertStaffPin = typeof staffPins.$inferInsert;

import { getDb } from "../api/queries/connection";
import { customers, transactions, staffPins } from "./schema";

async function seed() {
  const db = getDb();

  // Seed demo customers
  const demoCustomers = [
    { name: "Ramesh Kumar", phone: "9876543210", balance: "2500.00", notes: "Regular customer, pays monthly" },
    { name: "Sunita Devi", phone: "9876543211", balance: "750.00", notes: "Neighborhood customer" },
    { name: "Amit Sharma", phone: "9876543212", balance: "8200.00", notes: "Bulk buyer, 15-day credit" },
    { name: "Priya Patel", phone: "9876543213", balance: "0.00", notes: "Pays immediately" },
    { name: "Vijay Singh", phone: "9876543214", balance: "4500.00", notes: "Monthly settlement" },
    { name: "Geeta Gupta", phone: "9876543215", balance: "1200.00", notes: "Regular, reliable" },
    { name: "Suresh Yadav", phone: "9876543216", balance: "6800.00", notes: "Delayed payments often" },
    { name: "Meena Rani", phone: "9876543217", balance: "0.00", notes: "New customer" },
    { name: "Deepak Verma", phone: "9876543218", balance: "3200.00", notes: "Weekly shopper" },
    { name: "Anita Kumari", phone: "9876543219", balance: "950.00", notes: "Pays on time" },
    { name: "Rajesh Tiwari", phone: "9876543220", balance: "11000.00", notes: "Business customer" },
    { name: "Kiran Devi", phone: "9876543221", balance: "0.00", notes: "Cash only" },
  ];

  for (const customer of demoCustomers) {
    await db.insert(customers).values(customer);
  }

  console.log("Seeded 12 customers");

  // Seed demo transactions
  const now = new Date();
  const demoTransactions = [
    { customerId: 1, type: "CREDIT_GIVEN" as const, amount: "500.00", paymentMode: null as any, notes: "Groceries", date: new Date(now.getTime() - 1000 * 60 * 60 * 2) },
    { customerId: 1, type: "PAYMENT_RECEIVED" as const, amount: "1000.00", paymentMode: "UPI_GPAY" as const, notes: "Partial payment", date: new Date(now.getTime() - 1000 * 60 * 60 * 24) },
    { customerId: 2, type: "CREDIT_GIVEN" as const, amount: "350.00", paymentMode: null as any, notes: "Daily needs", date: new Date(now.getTime() - 1000 * 60 * 60 * 4) },
    { customerId: 3, type: "CREDIT_GIVEN" as const, amount: "1200.00", paymentMode: null as any, notes: "Bulk purchase", date: new Date(now.getTime() - 1000 * 60 * 60 * 6) },
    { customerId: 3, type: "PAYMENT_RECEIVED" as const, amount: "2000.00", paymentMode: "UPI_PHONEPE" as const, notes: "Weekly settlement", date: new Date(now.getTime() - 1000 * 60 * 60 * 30) },
    { customerId: 4, type: "CASH_SALE" as const, amount: "450.00", paymentMode: "CASH" as const, notes: "Paid immediately", date: new Date(now.getTime() - 1000 * 60 * 60 * 1) },
    { customerId: 5, type: "CREDIT_GIVEN" as const, amount: "800.00", paymentMode: null as any, notes: "Monthly credit", date: new Date(now.getTime() - 1000 * 60 * 60 * 8) },
    { customerId: 6, type: "PAYMENT_RECEIVED" as const, amount: "500.00", paymentMode: "UPI_PAYTM" as const, notes: "Regular payment", date: new Date(now.getTime() - 1000 * 60 * 60 * 3) },
    { customerId: 7, type: "CREDIT_GIVEN" as const, amount: "1500.00", paymentMode: null as any, notes: "Festival shopping", date: new Date(now.getTime() - 1000 * 60 * 60 * 12) },
    { customerId: 9, type: "CREDIT_GIVEN" as const, amount: "600.00", paymentMode: null as any, notes: "Weekly groceries", date: new Date(now.getTime() - 1000 * 60 * 60 * 5) },
    { customerId: 10, type: "PAYMENT_RECEIVED" as const, amount: "400.00", paymentMode: "UPI_GPAY" as const, notes: "Quick payment", date: new Date(now.getTime() - 1000 * 60 * 45) },
    { customerId: 11, type: "CREDIT_GIVEN" as const, amount: "2500.00", paymentMode: null as any, notes: "Business supplies", date: new Date(now.getTime() - 1000 * 60 * 60 * 10) },
    { customerId: 1, type: "CREDIT_GIVEN" as const, amount: "300.00", paymentMode: null as any, notes: "Rice and dal", date: new Date(now.getTime() - 1000 * 60 * 60 * 48) },
    { customerId: 5, type: "PAYMENT_RECEIVED" as const, amount: "1500.00", paymentMode: "CASH" as const, notes: "Monthly settlement", date: new Date(now.getTime() - 1000 * 60 * 60 * 36) },
    { customerId: 2, type: "PAYMENT_RECEIVED" as const, amount: "200.00", paymentMode: "UPI_PHONEPE" as const, notes: "Small payment", date: new Date(now.getTime() - 1000 * 60 * 60 * 18) },
  ];

  for (const tx of demoTransactions) {
    await db.insert(transactions).values(tx);
  }

  console.log("Seeded 15 transactions");

  // Seed staff PIN
  await db.insert(staffPins).values({ pin: "1234", isActive: true });
  console.log("Seeded staff PIN: 1234");

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(console.error);

import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Bell, Settings, IndianRupee, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCountUp, formatIndianRupee } from "@/hooks/useCountUp";
import { Skeleton } from "@/components/ui/skeleton";
import { RupeeCoin3D } from "@/components/RupeeCoin3D";

interface Transaction {
  id: number;
  customerId: number | null;
  type: string;
  amount: string;
  paymentMode: string | null;
  notes: string | null;
  date: Date;
  createdAt: Date;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentTxs, isLoading: txsLoading } = trpc.dashboard.recentTransactions.useQuery({ limit: 5 });
  const { data: overdueCustomers } = trpc.dashboard.overdueCustomers.useQuery();

  const todayCollection = stats?.todayCollection || 0;
  const todayCredit = stats?.todayCredit || 0;
  const totalOutstanding = stats?.totalOutstanding || 0;

  const collectionDisplay = useCountUp(Math.round(todayCollection));
  const creditDisplay = useCountUp(Math.round(todayCredit));
  const outstandingDisplay = useCountUp(Math.round(totalOutstanding));

  const getTxColor = (type: string) => {
    switch (type) {
      case "CREDIT_GIVEN": return "text-[#BF360C] border-l-[#BF360C]";
      case "PAYMENT_RECEIVED": return "text-[#00897B] border-l-[#00897B]";
      case "CASH_SALE": return "text-[#1A1A2E] border-l-[#1A1A2E]";
      default: return "text-[#1A1A2E] border-l-[#8A8A9A]";
    }
  };

  const getTxLabel = (type: string) => {
    switch (type) {
      case "CREDIT_GIVEN": return "Credit";
      case "PAYMENT_RECEIVED": return "Payment";
      case "CASH_SALE": return "Cash";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1A1A2E]">Smriti General Store</h1>
          <p className="text-xs text-[#8A8A9A]">Patna, Bihar</p>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-[#E8E0D4] flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-[#4A4A5A]" strokeWidth={1.5} />
            {overdueCustomers && overdueCustomers.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F9A825] rounded-full" />
            )}
          </button>
          <button
            onClick={() => navigate("/staff")}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E0D4] flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-[#4A4A5A]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* 3D Hero Section */}
      <div className="px-4 mt-3">
        <div className="relative h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF3E0] via-[#FAF7F2] to-[#E0F2F1]">
          <RupeeCoin3D />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10 pointer-events-none">
            <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Today&apos;s Collection</p>
            <motion.p
              className="text-3xl font-bold text-[#1A1A2E] mt-1"
              key={collectionDisplay.displayValue}
            >
              {formatIndianRupee(collectionDisplay.displayValue)}
            </motion.p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-[#2E7D32]" />
              <span className="text-xs text-[#2E7D32] font-medium">+12% vs yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="px-4 mt-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4">
          <motion.div
            className="min-w-[140px] bg-white rounded-2xl p-4 border border-[#F0EBE3] snap-start"
            whileTap={{ scale: 0.97 }}
          >
            <p className="text-[10px] font-medium text-[#8A8A9A] uppercase tracking-wider">UPI Received</p>
            <p className="text-lg font-bold text-[#00897B] mt-1">
              {statsLoading ? "..." : formatIndianRupee(stats?.todayUPI || 0)}
            </p>
            <div className="flex gap-1 mt-2">
              <span className="text-[9px] px-1.5 py-0.5 bg-[#E8F0FE] text-[#1A73E8] rounded-full">GPay</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#F3E8FD] text-[#5F259F] rounded-full">PhPe</span>
            </div>
          </motion.div>

          <motion.div
            className="min-w-[140px] bg-white rounded-2xl p-4 border border-[#F0EBE3] snap-start"
            whileTap={{ scale: 0.97 }}
          >
            <p className="text-[10px] font-medium text-[#8A8A9A] uppercase tracking-wider">Cash</p>
            <p className="text-lg font-bold text-[#1A1A2E] mt-1">
              {statsLoading ? "..." : formatIndianRupee(stats?.todayCash || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <IndianRupee className="w-3 h-3 text-[#8A8A9A]" />
              <span className="text-[10px] text-[#8A8A9A]">Physical</span>
            </div>
          </motion.div>

          <motion.div
            className="min-w-[140px] bg-white rounded-2xl p-4 border border-[#F0EBE3] snap-start"
            whileTap={{ scale: 0.97 }}
          >
            <p className="text-[10px] font-medium text-[#8A8A9A] uppercase tracking-wider">Credit Given</p>
            <p className="text-lg font-bold text-[#BF360C] mt-1">
              {statsLoading ? "..." : formatIndianRupee(creditDisplay.displayValue)}
            </p>
            {todayCredit > 5000 && (
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="w-3 h-3 text-[#F9A825]" />
                <span className="text-[10px] text-[#F9A825]">High</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Urgent Actions */}
      {overdueCustomers && overdueCustomers.length > 0 && (
        <motion.div
          className="px-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-[#FFF3E0] border border-[#FF993340] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#BF360C]">{overdueCustomers.length} customers overdue</p>
              <p className="text-xs text-[#8A8A9A] mt-0.5">Send payment reminders now</p>
            </div>
            <motion.button
              className="px-4 py-2 bg-[#FF9933] text-white text-sm font-semibold rounded-xl"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/summary")}
            >
              Remind
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Outstanding Summary */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-[#E0F2F1] to-[#FAF7F2] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Total Outstanding</p>
              <p className="text-2xl font-bold text-[#1A1A2E] mt-1">
                {statsLoading ? "..." : formatIndianRupee(outstandingDisplay.displayValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-[#00897B]" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00897B]" />
              <span className="text-[10px] text-[#8A8A9A]">{stats?.totalCustomers || 0} customers</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#BF360C]" />
              <span className="text-[10px] text-[#8A8A9A]">{overdueCustomers?.length || 0} overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A1A2E]">Recent Transactions</h2>
          <button
            onClick={() => navigate("/transactions")}
            className="text-xs text-[#FF9933] font-medium"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {txsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          ) : recentTxs && recentTxs.length > 0 ? (
            recentTxs.map((tx: Transaction, index: number) => (
              <motion.div
                key={tx.id}
                className={`bg-white rounded-xl p-3 border border-[#F0EBE3] border-l-[3px] ${getTxColor(tx.type)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      tx.type === "CREDIT_GIVEN" ? "bg-[#BF360C]" :
                      tx.type === "PAYMENT_RECEIVED" ? "bg-[#00897B]" : "bg-[#1A1A2E]"
                    }`}>
                      {tx.type === "CREDIT_GIVEN" ? "C" : tx.type === "PAYMENT_RECEIVED" ? "P" : "S"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{getTxLabel(tx.type)}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A8A9A]" />
                        <span className="text-[10px] text-[#8A8A9A]">
                          {new Date(tx.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === "CREDIT_GIVEN" ? "text-[#BF360C]" : "text-[#00897B]"}`}>
                      {tx.type === "CREDIT_GIVEN" ? "+" : "-"}₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                    </p>
                    {tx.paymentMode && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#F0EBE3] text-[#8A8A9A] rounded-full">
                        {tx.paymentMode.replace("UPI_", "")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-[#8A8A9A] text-sm">No transactions today</div>
          )}
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

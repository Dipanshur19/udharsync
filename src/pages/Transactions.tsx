import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Receipt } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const filters = ["All", "Today", "This Week", "UPI", "Cash", "Credit"] as const;
type FilterType = (typeof filters)[number];

interface TxItem {
  id: number;
  customerId: number | null;
  type: string;
  amount: string;
  paymentMode: string | null;
  notes: string | null;
  date: Date;
}

const getTxColor = (type: string) => {
  switch (type) {
    case "CREDIT_GIVEN": return "border-l-[#BF360C]";
    case "PAYMENT_RECEIVED": return "border-l-[#00897B]";
    case "CASH_SALE": return "border-l-[#1A1A2E]";
    default: return "border-l-[#8A8A9A]";
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "CREDIT_GIVEN": return { bg: "bg-[#FBE9E7]", text: "text-[#BF360C]", label: "Credit" };
    case "PAYMENT_RECEIVED": return { bg: "bg-[#E0F2F1]", text: "text-[#00897B]", label: "Payment" };
    case "CASH_SALE": return { bg: "bg-[#F0F0F0]", text: "text-[#1A1A2E]", label: "Cash" };
    default: return { bg: "bg-gray-100", text: "text-gray-600", label: type };
  }
};

const getPaymentIcon = (mode: string | null) => {
  switch (mode) {
    case "UPI_GPAY": return "GPay";
    case "UPI_PHONEPE": return "PhPe";
    case "UPI_PAYTM": return "Paytm";
    case "CASH": return "Cash";
    default: return "";
  }
};

const getPaymentColor = (mode: string | null) => {
  switch (mode) {
    case "UPI_GPAY": return "bg-[#E8F0FE] text-[#1A73E8]";
    case "UPI_PHONEPE": return "bg-[#F3E8FD] text-[#5F259F]";
    case "UPI_PAYTM": return "bg-[#E0F7FA] text-[#012B72]";
    case "CASH": return "bg-[#F5F5F5] text-[#666]";
    default: return "";
  }
};

export function Transactions() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const { data, isLoading } = trpc.transaction.list.useQuery({});

  const filteredTransactions = data?.transactions.filter((tx: TxItem) => {
    if (activeFilter === "UPI") return tx.paymentMode?.startsWith("UPI");
    if (activeFilter === "Cash") return tx.paymentMode === "CASH" || tx.type === "CASH_SALE";
    if (activeFilter === "Credit") return tx.type === "CREDIT_GIVEN";
    if (activeFilter === "Today") {
      const txDate = new Date(tx.date);
      const today = new Date();
      return txDate.toDateString() === today.toDateString();
    }
    if (activeFilter === "This Week") {
      const txDate = new Date(tx.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate >= weekAgo;
    }
    return true;
  }) || [];

  const grouped: Record<string, TxItem[]> = {};
  filteredTransactions.forEach((tx: TxItem) => {
    const date = new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(tx);
  });

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-[#1A1A2E] mb-3">Transactions</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? "bg-[#FF9933] text-white"
                  : "bg-white text-[#8A8A9A] border border-[#E8E0D4]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
          <Input
            placeholder="Search transactions..."
            className="pl-10 h-11 bg-white border-[#E8E0D4] rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 mt-3 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-[#E8E0D4] mx-auto mb-3" />
            <p className="text-sm text-[#8A8A9A]">No transactions found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider mb-2">{date}</p>
              <div className="space-y-2">
                {txs.map((tx: TxItem, index: number) => {
                  const badge = getTypeBadge(tx.type);
                  return (
                    <motion.div
                      key={tx.id}
                      className={`bg-white rounded-xl p-3 border border-[#F0EBE3] border-l-[3px] ${getTxColor(tx.type)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
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
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                            <p className="text-[10px] text-[#8A8A9A] mt-1">
                              {new Date(tx.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {tx.paymentMode && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${getPaymentColor(tx.paymentMode)}`}>
                              {getPaymentIcon(tx.paymentMode)}
                            </span>
                          )}
                          <p className={`text-sm font-bold ${tx.type === "CREDIT_GIVEN" ? "text-[#BF360C]" : "text-[#00897B]"}`}>
                            {tx.type === "CREDIT_GIVEN" ? "+" : "-"}₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {tx.notes && (
                        <p className="text-[10px] text-[#8A8A9A] mt-1 ml-12">{tx.notes}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}

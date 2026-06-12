import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

type TransactionType = "CREDIT_GIVEN" | "PAYMENT_RECEIVED" | "CASH_SALE";

const types: { id: TransactionType; label: string; color: string; bg: string }[] = [
  { id: "CREDIT_GIVEN", label: "Credit Given", color: "text-white", bg: "bg-[#BF360C]" },
  { id: "PAYMENT_RECEIVED", label: "Payment Received", color: "text-white", bg: "bg-[#00897B]" },
  { id: "CASH_SALE", label: "Cash Sale", color: "text-white", bg: "bg-[#1A1A2E]" },
];

const paymentModes = [
  { value: "UPI_GPAY", label: "Google Pay", color: "bg-[#E8F0FE] text-[#1A73E8]" },
  { value: "UPI_PHONEPE", label: "PhonePe", color: "bg-[#F3E8FD] text-[#5F259F]" },
  { value: "UPI_PAYTM", label: "Paytm", color: "bg-[#E0F7FA] text-[#012B72]" },
  { value: "CASH", label: "Cash", color: "bg-[#F5F5F5] text-[#666]" },
];

const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

interface CustomerItem {
  id: number;
  name: string;
  balance: string;
}

export function AddTransaction() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data: customers } = trpc.customer.list.useQuery({});

  const [selectedType, setSelectedType] = useState<TransactionType>("CREDIT_GIVEN");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const createTransaction = trpc.transaction.create.useMutation({
    onSuccess: () => {
      utils.transaction.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.dashboard.recentTransactions.invalidate();
      utils.customer.list.invalidate();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/");
      }, 1500);
    },
    onError: () => toast.error("Failed to save transaction"),
  });

  const handleNumpadPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + key);
    } else {
      if (amount.length < 8) setAmount((prev) => prev + key);
    }
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createTransaction.mutate({
      customerId: selectedCustomer || undefined,
      type: selectedType,
      amount,
      paymentMode: (paymentMode as "UPI_GPAY" | "UPI_PHONEPE" | "UPI_PAYTM" | "CASH" | undefined) || undefined,
      notes: notes || undefined,
    });
  };

  const selectedCustomerData = customers?.customers.find((c: CustomerItem) => c.id === selectedCustomer);

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative">
      <div className="bg-gradient-to-r from-[#FF9933] to-[#FFB74D] px-4 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">New Transaction</h1>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 flex flex-col items-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="w-10 h-10 text-[#2E7D32]" strokeWidth={3} />
              </motion.div>
              <p className="text-lg font-bold text-[#1A1A2E] mt-4">Saved!</p>
              <p className="text-sm text-[#8A8A9A]">Transaction recorded</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 -mt-2">
        <div className="bg-white rounded-2xl p-1.5 border border-[#F0EBE3] flex gap-1">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === t.id ? `${t.bg} ${t.color} shadow-sm` : "text-[#8A8A9A] hover:bg-[#FAF7F2]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Customer</label>
          <button
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            className="w-full mt-1 h-12 bg-white border border-[#E8E0D4] rounded-xl px-4 flex items-center justify-between text-left"
          >
            <span className={selectedCustomerData ? "text-sm font-medium text-[#1A1A2E]" : "text-sm text-[#8A8A9A]"}>
              {selectedCustomerData ? selectedCustomerData.name : "Select customer (optional)"}
            </span>
            {selectedCustomer && (
              <X
                className="w-4 h-4 text-[#8A8A9A]"
                onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }}
              />
            )}
          </button>

          <AnimatePresence>
            {showCustomerDropdown && (
              <motion.div
                className="mt-1 bg-white border border-[#E8E0D4] rounded-xl max-h-48 overflow-y-auto shadow-lg z-10 relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {customers?.customers.map((c: CustomerItem) => (
                  <button
                    key={c.id}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-[#FAF7F2] border-b border-[#F0EBE3] last:border-0 flex items-center justify-between"
                    onClick={() => { setSelectedCustomer(c.id); setShowCustomerDropdown(false); }}
                  >
                    <span className="font-medium text-[#1A1A2E]">{c.name}</span>
                    <span className="text-xs text-[#8A8A9A]">₹{parseFloat(c.balance).toLocaleString("en-IN")}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-6 border border-[#F0EBE3] text-center">
          <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Amount</p>
          <p className="text-4xl font-bold text-[#1A1A2E] mt-2">
            ₹{amount || "0"}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {numpadKeys.map((key) => (
            <motion.button
              key={key}
              className="h-14 bg-white rounded-xl border border-[#E8E0D4] text-lg font-semibold text-[#1A1A2E] flex items-center justify-center active:bg-[#FAF7F2]"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumpadPress(key)}
            >
              {key === "backspace" ? (
                <X className="w-5 h-5 text-[#8A8A9A]" />
              ) : (
                key
              )}
            </motion.button>
          ))}
        </div>

        {selectedType !== "CREDIT_GIVEN" && (
          <div className="mt-4">
            <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {paymentModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setPaymentMode(mode.value)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                    paymentMode === mode.value ? `${mode.color} ring-2 ring-offset-1 ring-[#FF9933]` : "bg-white border border-[#E8E0D4] text-[#8A8A9A]"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Notes (optional)</label>
          <textarea
            placeholder="Add a note..."
            className="mt-1 w-full h-20 p-3 bg-white border border-[#E8E0D4] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF993340] focus:border-[#FF9933]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <motion.button
          className="w-full mt-4 mb-8 h-14 bg-[#FF9933] text-white font-semibold rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || createTransaction.isPending}
        >
          {createTransaction.isPending ? "Saving..." : "Save Transaction"}
        </motion.button>
      </div>
    </div>
  );
}

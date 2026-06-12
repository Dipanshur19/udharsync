import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, IndianRupee, Send, Bell } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatIndianRupee } from "@/hooks/useCountUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  balance: string;
}

export function Summary() {
  const [date, setDate] = useState(new Date());
  const dateStr = date.toISOString().split("T")[0];

  const { data: dailyData, isLoading: dailyLoading } = trpc.summary.daily.useQuery({ date: dateStr });
  const { data: weeklyData, isLoading: weeklyLoading } = trpc.dashboard.weeklyData.useQuery();
  const { data: reconciliation } = trpc.summary.reconciliationStatus.useQuery({ date: dateStr });
  const { data: overdueCustomers } = trpc.dashboard.overdueCustomers.useQuery();

  const utils = trpc.useUtils();
  const markReconciled = trpc.summary.markReconciled.useMutation({
    onSuccess: () => {
      utils.summary.reconciliationStatus.invalidate();
      toast.success("Reconciliation updated!");
    },
  });

  const navigateDate = (direction: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + direction);
    setDate(newDate);
  };

  const checks = reconciliation || {
    khattaChecked: false,
    paytmVerified: false,
    gpayVerified: false,
    phonepeVerified: false,
  };

  const checkedCount = [checks.khattaChecked, checks.paytmVerified, checks.gpayVerified, checks.phonepeVerified].filter(Boolean).length;
  const progress = (checkedCount / 4) * 100;

  const handleCheck = (field: string, value: boolean) => {
    markReconciled.mutate({
      date: dateStr,
      [field]: value,
    });
  };

  const handleSendReminder = (customerName: string) => {
    toast.success(`WhatsApp reminder sent to ${customerName}!`);
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-[#1A1A2E]">End of Day Summary</h1>
        <div className="flex items-center justify-between mt-3 bg-white rounded-xl p-3 border border-[#F0EBE3]">
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-[#4A4A5A]" />
          </button>
          <p className="text-sm font-semibold text-[#1A1A2E]">
            {date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-[#4A4A5A]" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <motion.div
          className="bg-white rounded-2xl p-4 border border-[#F0EBE3]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Total Collection</p>
              <p className="text-2xl font-bold text-[#1A1A2E] mt-1">
                {dailyLoading ? "..." : formatIndianRupee(dailyData?.totalCollection || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-[#00897B]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-[#E8F0FE] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[#1A73E8] font-medium">UPI</p>
              <p className="text-sm font-bold text-[#1A73E8]">{formatIndianRupee(dailyData?.upiTotal || 0)}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[#666] font-medium">Cash</p>
              <p className="text-sm font-bold text-[#1A1A2E]">{formatIndianRupee(dailyData?.cashTotal || 0)}</p>
            </div>
            <div className="bg-[#FBE9E7] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[#BF360C] font-medium">Credit</p>
              <p className="text-sm font-bold text-[#BF360C]">{formatIndianRupee(dailyData?.creditGiven || 0)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`rounded-2xl p-4 border ${
            (dailyData?.netPosition || 0) >= 0
              ? "bg-[#E8F5E9] border-[#C8E6C9]"
              : "bg-[#FBE9E7] border-[#FFCCBC]"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Net Position</p>
          <p className={`text-2xl font-bold mt-1 ${(dailyData?.netPosition || 0) >= 0 ? "text-[#2E7D32]" : "text-[#BF360C]"}`}>
            {dailyLoading ? "..." : `${(dailyData?.netPosition || 0) >= 0 ? "+" : ""}${formatIndianRupee(Math.abs(dailyData?.netPosition || 0))}`}
          </p>
          <p className="text-xs text-[#8A8A9A] mt-1">
            {dailyData?.transactionCount || 0} transactions today
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-[#1A1A2E] mb-3">Last 7 Days</h2>
        <div className="bg-white rounded-2xl p-4 border border-[#F0EBE3]">
          {weeklyLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData || []}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#8A8A9A" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Collection"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E8E0D4",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="collection" fill="#FF9933" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-[#1A1A2E] mb-3">Reconciliation Checklist</h2>
        <div className="bg-white rounded-2xl p-4 border border-[#F0EBE3]">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#8A8A9A]">{checkedCount} of 4 checked</span>
              <span className="text-xs font-medium text-[#FF9933]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FF9933] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: "khattaChecked", label: "Khatta entries checked" },
              { id: "paytmVerified", label: "Paytm verified" },
              { id: "gpayVerified", label: "GPay verified" },
              { id: "phonepeVerified", label: "PhonePe verified" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={checks[item.id as keyof typeof checks] || false}
                  onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                  className="w-5 h-5 border-2 border-[#E8E0D4] data-[state=checked]:bg-[#FF9933] data-[state=checked]:border-[#FF9933]"
                />
                <label htmlFor={item.id} className="text-sm text-[#1A1A2E] cursor-pointer flex-1">
                  {item.label}
                </label>
                {checks[item.id as keyof typeof checks] && (
                  <Check className="w-4 h-4 text-[#2E7D32]" />
                )}
              </div>
            ))}
          </div>

          {checkedCount === 4 && (
            <motion.div
              className="mt-4 p-3 bg-[#E8F5E9] rounded-xl text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Check className="w-6 h-6 text-[#2E7D32] mx-auto mb-1" />
              <p className="text-sm font-semibold text-[#2E7D32]">All reconciled!</p>
            </motion.div>
          )}
        </div>
      </div>

      {overdueCustomers && overdueCustomers.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Overdue Customers</h2>
            <button
              onClick={() => toast.success(`Reminders sent to all ${overdueCustomers.length} customers!`)}
              className="text-xs text-[#FF9933] font-medium flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Remind All
            </button>
          </div>
          <div className="space-y-2">
            {overdueCustomers.map((customer: Customer, index: number) => (
              <motion.div
                key={customer.id}
                className="bg-white rounded-xl p-3 border border-[#FBE9E7] border-l-[3px] border-l-[#BF360C]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#BF360C] flex items-center justify-center text-white text-xs font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{customer.name}</p>
                      <p className="text-[10px] text-[#8A8A9A]">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#BF360C]">
                      {formatIndianRupee(parseFloat(customer.balance))}
                    </p>
                    <button
                      onClick={() => handleSendReminder(customer.name)}
                      className="text-[10px] text-[#FF9933] font-medium flex items-center gap-0.5 mt-0.5"
                    >
                      <Bell className="w-3 h-3" />
                      Remind
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}

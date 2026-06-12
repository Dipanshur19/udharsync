import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Phone } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatIndianRupee } from "@/hooks/useCountUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const filters = ["ALL", "OVERDUE", "ACTIVE", "SETTLED"] as const;
type FilterType = (typeof filters)[number];

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  balance: string;
  creditLimit: string | null;
  notes: string | null;
}

const getBalanceColor = (balance: number) => {
  if (balance > 5000) return "text-[#BF360C] bg-[#FBE9E7]";
  if (balance > 0) return "text-[#BF360C] bg-[#FFF3E0]";
  if (balance < 0) return "text-[#00897B] bg-[#E0F2F1]";
  return "text-[#2E7D32] bg-[#E8F5E9]";
};

const getBalanceLabel = (balance: number) => {
  if (balance > 5000) return "Overdue";
  if (balance > 0) return "Active";
  if (balance === 0) return "Settled";
  return "Advance";
};

export function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", creditLimit: "", notes: "" });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.customer.list.useQuery({ search, filter: activeFilter });
  const { data: customerDetail } = trpc.customer.getById.useQuery(selectedCustomer || 0, {
    enabled: !!selectedCustomer,
  });

  const createCustomer = trpc.customer.create.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setShowAddSheet(false);
      setNewCustomer({ name: "", phone: "", creditLimit: "", notes: "" });
      toast.success("Customer added successfully!");
    },
    onError: () => toast.error("Failed to add customer"),
  });

  const deleteCustomer = trpc.customer.delete.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setSelectedCustomer(null);
      toast.success("Customer deleted");
    },
  });

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error("Name is required");
      return;
    }
    createCustomer.mutate(newCustomer);
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-[#1A1A2E]">My Customers</h1>
          {data && (
            <span className="text-xs px-2.5 py-1 bg-[#FFF3E0] text-[#FF9933] font-medium rounded-full">
              {data.total} total
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-10 h-11 bg-white border-[#E8E0D4] rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
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
              {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : data?.customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#8A8A9A]">No customers found</p>
          </div>
        ) : (
          <AnimatePresence>
            {data?.customers.map((customer: Customer, index: number) => {
              const balance = parseFloat(customer.balance);
              return (
                <motion.div
                  key={customer.id}
                  className="bg-white rounded-2xl p-4 border border-[#F0EBE3] cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCustomer(customer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        balance > 5000 ? "bg-[#BF360C]" :
                        balance > 0 ? "bg-[#FF9933]" :
                        balance === 0 ? "bg-[#2E7D32]" : "bg-[#00897B]"
                      }`}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A2E]">{customer.name}</p>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8A8A9A]" />
                            <span className="text-xs text-[#8A8A9A]">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold ${balance > 0 ? "text-[#BF360C]" : balance < 0 ? "text-[#00897B]" : "text-[#2E7D32]"}`}>
                        {formatIndianRupee(Math.abs(balance))}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getBalanceColor(balance)}`}>
                        {getBalanceLabel(balance)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <motion.button
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#FF9933] rounded-full flex items-center justify-center shadow-lg shadow-[#FF993340] z-40"
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddSheet(true)}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </motion.button>

      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="h-[85%] rounded-t-3xl bg-[#FAF7F2]">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-[#1A1A2E]">Add New Customer</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Name *</label>
              <Input
                placeholder="Enter customer name"
                className="mt-1 h-12 bg-white border-[#E8E0D4] rounded-xl"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Phone</label>
              <Input
                placeholder="Enter phone number"
                className="mt-1 h-12 bg-white border-[#E8E0D4] rounded-xl"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Credit Limit</label>
              <Input
                placeholder="Optional"
                className="mt-1 h-12 bg-white border-[#E8E0D4] rounded-xl"
                value={newCustomer.creditLimit}
                onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A8A9A] uppercase tracking-wider">Notes</label>
              <textarea
                placeholder="Any notes about this customer..."
                className="mt-1 w-full h-24 p-3 bg-white border border-[#E8E0D4] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF993340] focus:border-[#FF9933]"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-[#E8E0D4]"
                onClick={() => setShowAddSheet(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-[#FF9933] hover:bg-[#E88A2A] text-white font-semibold"
                onClick={handleAddCustomer}
                disabled={createCustomer.isPending}
              >
                {createCustomer.isPending ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent side="bottom" className="h-[85%] rounded-t-3xl bg-[#FAF7F2]">
          {customerDetail && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg font-bold text-[#1A1A2E]">{customerDetail.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <div className="bg-white rounded-2xl p-4 border border-[#F0EBE3] text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold ${
                    parseFloat(String(customerDetail.balance)) > 0 ? "bg-[#BF360C]" : "bg-[#2E7D32]"
                  }`}>
                    {customerDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A2E] mt-3">
                    {formatIndianRupee(Math.abs(parseFloat(String(customerDetail.balance))))}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${parseFloat(String(customerDetail.balance)) > 0 ? "text-[#BF360C]" : "text-[#2E7D32]"}`}>
                    {parseFloat(String(customerDetail.balance)) > 0 ? "Outstanding Balance" : "All Settled"}
                  </p>
                  {customerDetail.phone && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Phone className="w-3 h-3 text-[#8A8A9A]" />
                      <span className="text-xs text-[#8A8A9A]">{customerDetail.phone}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button onClick={() => { setSelectedCustomer(null); navigate("/add"); }} className="bg-[#00897B] text-white py-3 rounded-xl text-xs font-semibold">
                    Record Payment
                  </button>
                  <button onClick={() => { setSelectedCustomer(null); navigate("/add"); }} className="bg-[#BF360C] text-white py-3 rounded-xl text-xs font-semibold">
                    Give Credit
                  </button>
                  <button onClick={() => toast.success("Reminder sent via WhatsApp!")} className="bg-[#FF9933] text-white py-3 rounded-xl text-xs font-semibold">
                    Send Reminder
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A2E] mt-4 mb-2">Transaction History</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {customerDetail.transactions?.map((tx: { id: number; type: string; amount: string; date: Date; notes: string | null }) => (
                    <div key={tx.id} className="bg-white rounded-xl p-3 border border-[#F0EBE3] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{tx.type.replace("_", " ")}</p>
                        <p className="text-[10px] text-[#8A8A9A]">{new Date(tx.date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <p className={`text-sm font-bold ${tx.type === "CREDIT_GIVEN" ? "text-[#BF360C]" : "text-[#00897B]"}`}>
                        {tx.type === "CREDIT_GIVEN" ? "+" : "-"}₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                  {(!customerDetail.transactions || customerDetail.transactions.length === 0) && (
                    <p className="text-center text-xs text-[#8A8A9A] py-4">No transactions yet</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("Delete this customer?")) {
                      deleteCustomer.mutate(customerDetail.id);
                    }
                  }}
                >
                  Delete Customer
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <div className="h-20" />
    </div>
  );
}

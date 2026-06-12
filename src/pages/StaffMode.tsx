import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Search, Unlock, LogOut } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatIndianRupee } from "@/hooks/useCountUp";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BalanceCustomer {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
}

export function StaffMode() {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const verifyPin = trpc.staff.verifyPin.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        setIsAuthenticated(true);
        setError(false);
        toast.success("Staff mode activated!");
      } else {
        setError(true);
        setPin(["", "", "", ""]);
        setCurrentIndex(0);
        toast.error("Invalid PIN");
      }
    },
    onError: () => {
      setError(true);
      setPin(["", "", "", ""]);
      setCurrentIndex(0);
    },
  });

  const { data: balances } = trpc.staff.getBalances.useQuery(
    { search: searchQuery },
    { enabled: isAuthenticated }
  );

  const handleKeyPress = (digit: string) => {
    if (currentIndex < 4) {
      const newPin = [...pin];
      newPin[currentIndex] = digit;
      setPin(newPin);

      if (currentIndex === 3) {
        const fullPin = [...newPin].join("");
        verifyPin.mutate({ pin: fullPin });
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      const newPin = [...pin];
      newPin[currentIndex - 1] = "";
      setPin(newPin);
      setCurrentIndex(currentIndex - 1);
      setError(false);
    }
  };

  const numpad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "backspace"],
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E0D4] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#4A4A5A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A2E]">Staff Mode</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            className="w-20 h-20 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-6"
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Lock className="w-10 h-10 text-[#FF9933]" />
          </motion.div>

          <h2 className="text-xl font-bold text-[#1A1A2E]">Enter Staff PIN</h2>
          <p className="text-sm text-[#8A8A9A] mt-1">Ask the owner for the 4-digit PIN</p>

          <div className="flex gap-4 mt-8">
            {pin.map((digit, index) => (
              <motion.div
                key={index}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold ${
                  digit
                    ? "border-[#FF9933] bg-[#FFF3E0] text-[#FF9933]"
                    : error
                    ? "border-red-400 bg-red-50"
                    : "border-[#E8E0D4] bg-white"
                }`}
                animate={error && index === currentIndex ? { scale: [1, 1.1, 1] } : {}}
              >
                {digit ? "*" : ""}
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.p
              className="text-sm text-red-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Incorrect PIN. Try again.
            </motion.p>
          )}

          <div className="w-full max-w-[280px] mt-8">
            <div className="grid grid-cols-3 gap-3">
              {numpad.flat().map((key, index) => (
                <motion.button
                  key={index}
                  className={`h-16 rounded-2xl text-xl font-semibold flex items-center justify-center ${
                    key === ""
                      ? "pointer-events-none"
                      : key === "backspace"
                      ? "bg-white border border-[#E8E0D4] text-[#8A8A9A]"
                      : "bg-white border border-[#E8E0D4] text-[#1A1A2E] active:bg-[#FAF7F2]"
                  }`}
                  whileTap={key ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (key === "backspace") handleBackspace();
                    else if (key) handleKeyPress(key);
                  }}
                >
                  {key === "backspace" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" />
                      <line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  ) : (
                    key
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#E0F2F1] px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00897B] flex items-center justify-center">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A2E]">Staff Mode</h1>
              <p className="text-xs text-[#00897B] font-medium">Read-only access</p>
            </div>
          </div>
          <button
            onClick={() => { setIsAuthenticated(false); setPin(["", "", "", ""]); setCurrentIndex(0); navigate("/"); }}
            className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 text-[#4A4A5A]" />
          </button>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
          <Input
            placeholder="Search customer balance..."
            className="pl-10 h-11 bg-white border-[#E8E0D4] rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {balances?.map((customer: BalanceCustomer, index: number) => (
          <motion.div
            key={customer.id}
            className="bg-white rounded-2xl p-4 border border-[#F0EBE3]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  customer.balance > 0 ? "bg-[#BF360C]" : customer.balance < 0 ? "bg-[#00897B]" : "bg-[#2E7D32]"
                }`}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{customer.name}</p>
                  {customer.phone && <p className="text-xs text-[#8A8A9A]">{customer.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  customer.balance > 0 ? "text-[#BF360C]" : customer.balance < 0 ? "text-[#00897B]" : "text-[#2E7D32]"
                }`}>
                  {formatIndianRupee(Math.abs(customer.balance))}
                </p>
                <p className="text-[10px] text-[#8A8A9A]">
                  {customer.balance > 0 ? "Due" : customer.balance < 0 ? "Advance" : "Settled"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {balances?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8A8A9A]">No customers found</p>
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}

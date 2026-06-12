import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Customers } from "@/pages/Customers";
import { Transactions } from "@/pages/Transactions";
import { Summary } from "@/pages/Summary";
import { StaffMode } from "@/pages/StaffMode";
import { AddTransaction } from "@/pages/AddTransaction";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { TRPCProvider } from "@/providers/trpc";

function App() {
  return (
    <TRPCProvider>
      <div className="min-h-screen bg-neutral-100 flex justify-center">
        <div className="w-full max-w-[430px] bg-[#FAF7F2] min-h-screen shadow-2xl relative overflow-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/staff" element={<StaffMode />} />
              <Route path="/add" element={<AddTransaction />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </div>
      </div>
    </TRPCProvider>
  );
}

export default App;

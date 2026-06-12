import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Users, Plus, Receipt, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/add", label: "Add", icon: Plus, isCenter: true },
  { path: "/transactions", label: "Txns", icon: Receipt },
  { path: "/summary", label: "Summary", icon: BarChart3 },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-[#E8E0D4] z-50 safe-bottom">
        <div className="flex items-center justify-around h-full px-2 relative">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            const Icon = tab.icon;

            if (tab.isCenter) {
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#FF9933] flex items-center justify-center shadow-lg shadow-[#FF993340]"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-[#FF9933]" : "text-[#8A8A9A]"}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium ${isActive ? "text-[#FF9933]" : "text-[#8A8A9A]"}`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-1 w-8 h-0.5 bg-[#FF9933] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

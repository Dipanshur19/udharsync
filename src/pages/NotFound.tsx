import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 mx-auto bg-[#FFF3E0] rounded-3xl flex items-center justify-center">
          <span className="text-4xl font-bold text-[#FF9933]">404</span>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A2E] mt-6">Page Not Found</h1>
        <p className="text-sm text-[#8A8A9A] mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      </motion.div>

      <motion.div
        className="mt-8 flex gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          className="h-12 rounded-xl border-[#E8E0D4]"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button
          className="h-12 rounded-xl bg-[#FF9933] hover:bg-[#E88A2A] text-white"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </motion.div>
    </div>
  );
}

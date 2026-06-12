import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Store, ArrowRight } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3E0] via-[#FAF7F2] to-[#E0F2F1] flex flex-col items-center justify-center px-6">
      {/* Logo Section */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FF9933] to-[#FFB74D] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FF993340]">
          <Store className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mt-6">UdharSync</h1>
        <p className="text-sm text-[#8A8A9A] mt-2">Your Digital Bahi-Khata</p>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        className="mt-8 w-full max-w-[320px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <img
          src="/hero-kirana.jpg"
          alt="Kirana Store"
          className="w-full h-48 object-cover rounded-2xl shadow-lg"
        />
      </motion.div>

      {/* Features */}
      <motion.div
        className="mt-8 w-full max-w-[320px] space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#FF9933]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A2E]">Secure & Private</p>
            <p className="text-xs text-[#8A8A9A]">Your data is encrypted and safe</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center">
            <Store className="w-5 h-5 text-[#00897B]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A2E]">Built for Kirana</p>
            <p className="text-xs text-[#8A8A9A]">Designed for Indian shopkeepers</p>
          </div>
        </div>
      </motion.div>

      {/* Login Button */}
      <motion.div
        className="mt-8 w-full max-w-[320px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          className="w-full h-14 bg-[#FF9933] hover:bg-[#E88A2A] text-white font-semibold rounded-xl text-base shadow-lg shadow-[#FF993340]"
          onClick={() => {
            window.location.href = getOAuthUrl();
          }}
        >
          Sign in with Kimi
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-center text-xs text-[#8A8A9A] mt-4">
          By signing in, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}

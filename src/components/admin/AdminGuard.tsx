"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  userType?: "client" | "admin";
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  console.log({ user });

  useEffect(() => {
    checkUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserAuth = async () => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        router.push("/?login=true");
        return;
      }

      const parsedUser: User = JSON.parse(userData);

      const isAdmin =
        parsedUser.username === "admin" || parsedUser.userType === "admin";

      if (!isAdmin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/?login=true");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Verifying Access
          </h2>
          <p className="text-slate-400">Please wait...</p>
        </motion.div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30"
          >
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-slate-300 mb-6 leading-relaxed">
            You do not have permission to access the admin panel. This area is
            restricted to administrators only.
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-rose-500/25 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Site
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/?login=true");
              }}
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Login as Admin
            </motion.button>
          </div>

          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-slate-400 text-sm">
              <strong className="text-white">Precisa de acesso admin?</strong>
              <br />
              Contact the system administrator.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      const isAdmin =
        parsedUser.username === "admin" || parsedUser.userType === "admin";
      if (isAdmin) {
        setUser(parsedUser);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return { user, logout };
}

"use client";

import { motion } from "framer-motion";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminGuard from "@/components/admin/AdminGuard";
import { usePanelTexts } from "@/context/PanelTextsContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, setLanguage, panelTexts } = usePanelTexts();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "pl" ? "en" : "pl"));
  };

  const getFlagEmoji = (lang: "pl" | "en") => {
    return lang === "pl" ? "🇵🇱" : "🇺🇸";
  };

  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="lg:pl-80 min-h-screen flex-1 overflow-hidden">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-30"
          >
            <div className="flex items-center justify-between p-2 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>

              <div className="flex items-center gap-1 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="text-sm sm:text-lg">
                    {getFlagEmoji(language)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium hidden sm:block">
                    {language.toUpperCase()}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-white text-sm font-medium">
                      {panelTexts?.sidebar_admin_user || "Admin"}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {panelTexts?.sidebar_admin_role || "Administrator"}
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.header>
          <main className="p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}

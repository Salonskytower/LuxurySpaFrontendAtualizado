"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, X, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { usePanelTexts } from "@/context/PanelTextsContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  adminEmail?: string;
}

export default function AdminSidebar({
  isOpen,
  onToggle,
  adminEmail,
}: AdminSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { panelTexts } = usePanelTexts();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navigateToItem = (href: string) => {
    router.push(href);
    if (isMobile) {
      onToggle();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/?login=true");
  };

  const menuItems = [
    {
      title: panelTexts?.sidebar_dashboard || "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen && isMobile ? 0 : isMobile ? -288 : 0,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
        className="fixed left-0 top-0 h-screen w-72 sm:w-80 bg-gradient-to-b from-slate-900/98 to-slate-800/98 backdrop-blur-xl border-r border-white/10 z-50 shadow-2xl"
      >
        <div className="flex flex-col h-full">
          <div className="p-3 sm:p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/Logo LE PRIVE - white.png"
                  alt="Le Privê Logo"
                  width={160}
                  height={64}
                  className="h-10 sm:h-16 w-auto"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 sm:py-4 px-3">
            <div className="mb-3 sm:mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
              >
                <Home className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
                <span className="font-medium">
                  {panelTexts?.back_to_site || "Back to Site"}
                </span>
              </motion.button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isItemActive = isActive(item.href);

                return (
                  <div key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateToItem(item.href)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                          isItemActive
                            ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-300 shadow-lg"
                            : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 transition-colors ${
                            isItemActive
                              ? "text-rose-400"
                              : "group-hover:text-rose-400"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </motion.button>
                    </motion.div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-2 sm:p-4 border-t border-white/10 bg-gradient-to-t from-slate-900/50 to-transparent">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      A
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate text-sm sm:text-base">
                    {panelTexts?.sidebar_admin_user || "Admin User"}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm truncate">
                    {adminEmail || "admin@luxury.com"}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-2 sm:p-3 text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all group"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                <span className="text-xs sm:text-sm font-medium">
                  {panelTexts?.sidebar_logout || "Logout"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

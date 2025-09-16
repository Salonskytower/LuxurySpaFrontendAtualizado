"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Phone, User, X, LogOut } from "lucide-react";
import { contentApi } from "../lib/api";
import Image from "next/image";

interface NavItem {
  name: string;
  href: string;
}

interface HeaderProps {
  language: "pl" | "en";
  setLanguage: React.Dispatch<React.SetStateAction<"pl" | "en">>;
  onOpenAuth: () => void;
}

interface UserType {
  name?: string;
  username?: string;
  email?: string;
  userType?: string;
}

// TODO: Add a new state for the language

export default function Header({
  language,
  setLanguage,
  onOpenAuth,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [callNowText, setCallNowText] = useState("Call Now");
  const [loginText, setLoginText] = useState("Login");
  const [outText, setOutText] = useState("Logout");
  const [user, setUser] = useState<UserType | null>(null);

  const loadUserFromStorage = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("access_token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${tokenFromUrl}`,
        },
      })
        .then((res) => res.json())
        .then((userObj) => {
          localStorage.setItem("user", JSON.stringify(userObj));
          setUser(userObj);
        })
        .catch((error) =>
          console.error("Erro ao buscar usuário logado:", error)
        );

      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const getUserInitials = (user: UserType) => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const res = await contentApi.getHeaderContent(language);
        if (res) {
          setNavItems(res.navItems || []);
          setCallNowText(res.callNowButtonText || "Call Now");
          setLoginText(res.loginButtonText || "Login");
          setOutText(res.out || "Logout");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do header:", error);
      }
    }
    loadHeaderData();
  }, [language]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace("#", ""));
    if (element) {
      const y = element.offsetTop - 80;
      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  const handleNavClick = (href: string, itemName?: string) => {
    const cleanHref = href?.trim() || "";
    const cleanItemName = itemName?.trim() || "";

    setIsOpen(false);

    const isHomeItem =
      cleanHref === "#" ||
      cleanHref === "#hero" ||
      cleanHref === "/" ||
      cleanItemName.toLowerCase().includes("home") ||
      cleanItemName.toLowerCase().includes("início") ||
      cleanItemName.toLowerCase().includes("inicio") ||
      cleanItemName.toLowerCase().includes("strona główna") ||
      cleanItemName.toLowerCase().includes("strona glowna");

    if (isHomeItem) {
      setTimeout(() => scrollToTop(), 100);
      return;
    }

    setTimeout(() => scrollToSection(cleanHref), 100);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "pl" ? "en" : "pl"));
  };

  const getFlagEmoji = (lang: "pl" | "en") => {
    return lang === "pl" ? "🇵🇱" : "🇺🇸";
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick("#hero", "Home")}
          >
            <Image
              src="/Logo LE PRIVE - white.png"
              alt="Le Privê Logo"
              width={120}
              height={48}
              className="h-12 w-auto"
            />
          </motion.div>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item?.name || index}
                href={item?.href || "#"}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item?.href || "#", item?.name || "");
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="text-white/80 hover:text-white font-medium transition-all duration-300 relative group cursor-pointer"
              >
                {item?.name || "Menu Item"}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
            {(user as any)?.userType === "admin" && (
              <motion.a
                href="/admin"
                whileHover={{ y: -2 }}
                className="text-white/80 hover:text-white font-medium transition-all duration-300 relative group cursor-pointer"
                style={{ textDecoration: "none" }}
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300 group-hover:w-full" />
              </motion.a>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-lg">{getFlagEmoji(language)}</span>
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </motion.button>
            <motion.a
              href="tel:+48794583263"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{callNowText}</span>
            </motion.a>

            {user ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-bold text-sm">
                    {getUserInitials(user)}
                  </span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-sm text-red-400 rounded-full border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{outText}</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span>{loginText}</span>
              </motion.button>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-sm">{getFlagEmoji(language)}</span>
              <span className="text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-6 space-y-4 border-t border-white/10">
            {navItems.map((item, index) => (
              <motion.button
                key={item?.name || index}
                onClick={() => handleNavClick(item?.href || "#", item?.name || "")}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                transition={{
                  duration: 0.4,
                  delay: isOpen ? index * 0.1 : 0,
                  ease: "easeOut",
                }}
                className="block text-white/80 hover:text-white font-medium py-3 px-4 transition-colors cursor-pointer w-full text-left bg-white/5 rounded-lg hover:bg-white/10"
              >
                {item?.name || "Menu Item"}
              </motion.button>
            ))}

            <div className="flex flex-col gap-3 pt-4">
              <motion.a
                whileTap={{ scale: 0.95 }}
                href="tel:+48794583263"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20"
              >
                <Phone className="w-4 h-4" />
                <span>{callNowText}</span>
              </motion.a>

              {user ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {getUserInitials(user)}
                    </span>
                  </div>

                  {(user as any).userType === "admin" && (
                    <motion.a
                      href="/admin"
                      className="block text-white/80 hover:text-white font-medium py-3 px-4 transition-colors cursor-pointer w-full text-left bg-white/5 rounded-lg hover:bg-white/10"
                      style={{ textDecoration: "none" }}
                    >
                      Admin
                    </motion.a>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 backdrop-blur-sm text-red-400 rounded-full border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{outText}</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenAuth}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>{loginText}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Pause,
  Menu,
  Settings,
  BarChart3,
  UserCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePanelTexts } from "@/context/PanelTextsContext";

const BOOKINGS_PER_PAGE = 5;

// 👉 use sempre a env; em dev coloque NEXT_PUBLIC_API_URL=http://localhost:1337
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leprive.com.pl";

// Componente customizado para os botões de paginação com tradução
const CustomPaginationPrevious = ({ disabled, onClick, previousText }: { 
  disabled: boolean; 
  onClick: () => void; 
  previousText: string;
}) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-1 pl-2.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      disabled 
        ? "opacity-40 cursor-not-allowed bg-white/10 text-white/80 border border-white/20" 
        : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white"
    }`}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">{previousText}</span>
  </motion.button>
);

const CustomPaginationNext = ({ disabled, onClick, nextText }: { 
  disabled: boolean; 
  onClick: () => void; 
  nextText: string;
}) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-1 pr-2.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      disabled 
        ? "opacity-40 cursor-not-allowed bg-white/10 text-white/80 border border-white/20" 
        : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white"
    }`}
  >
    <span className="hidden sm:inline">{nextText}</span>
    <ChevronRight className="h-4 w-4" />
  </motion.button>
);

export default function AdminDashboard() {
  const { panelTexts, loading } = usePanelTexts();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
    type: "single" | "range";
  }>({
    startDate: "",
    endDate: "",
    type: "single",
  });

  const [todayBookings, setTodayBookings] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    // Filtro de texto
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.companionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de data
    let matchesDate = true;
    if (dateFilter.startDate) {
      const bookingDate = new Date(b.date);
      const startDate = new Date(dateFilter.startDate);

      if (dateFilter.type === "single") {
        matchesDate = bookingDate.toDateString() === startDate.toDateString();
      } else if (dateFilter.type === "range" && dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        matchesDate = bookingDate >= startDate && bookingDate <= endDate;
      } else {
        matchesDate = bookingDate >= startDate;
      }
    }

    return matchesSearch && matchesDate;
  });

  const pageCount =
    Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE) || 1;
  const bookingsToShow = filteredBookings.slice(
    (currentPage - 1) * BOOKINGS_PER_PAGE,
    currentPage * BOOKINGS_PER_PAGE
  );

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const uniqueCompanions = new Set(bookings.map((b) => b.companionName)).size;

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => {
      const price = b.amount.replace(/[R$\s.,]/g, "");
      return sum + (Number(price) || 0);
    }, 0);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      default:
        return "";
    }
  };

  // 👉 agora aceitamos tanto documentId (preferido) quanto id numérico (fallback)
  const updateBookingStatus = async (
    bookingIdentifier: string | number,
    newStatus: "pending" | "confirmed" | "cancelled"
  ) => {
    // se vier número, manda número; se vier string (documentId), manda string
    const payload =
      typeof bookingIdentifier === "number"
        ? { id: bookingIdentifier, status: newStatus }
        : { id: bookingIdentifier, status: newStatus };

    try {
      const res = await fetch(`${API_URL}/api/cal-webhook/update-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status!");

      // Em vez de atualização otimista, refazer o fetch para garantir sincronização
      await fetchBookings();

      const statusMessages = {
        confirmed: panelTexts?.status_confirmed_notification || "Booking confirmed successfully!",
        cancelled: panelTexts?.status_cancelled_notification || "Booking cancelled!",
        pending: panelTexts?.status_pending_notification || "Booking set to pending!",
      };

      setNotification({
        message: statusMessages[newStatus],
        type: newStatus === "cancelled" ? "error" : "success",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({
        message: "Erro ao atualizar status!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Função para refazer o fetch dos bookings
  const fetchBookings = async () => {
    const url = `${API_URL}/api/bookings?populate=companion`;
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const data = await res.json();
    if (data.data) {
      const processed = data.data.map((item: any) => {
        const companionData = item.companion;

        let clientName = "";
        if (item.customerPhone && item.customerPhone.trim() !== "") {
          clientName = item.customerPhone;
        } else if (item.customerName && item.customerName.trim() !== "") {
          clientName = item.customerName;
        } else if (item.customerEmail && item.customerEmail.trim() !== "") {
          clientName = item.customerEmail;
        } else {
          clientName = "Cliente";
        }

        const companionName = companionData?.name ?? "Companion";
        const startTime = item.startTime ?? "";
        const endTime = item.endTime ?? "";

        const [date, time] = startTime ? startTime.split("T") : ["", ""];
        const timeFmt = time ? time.slice(0, 5) : "";

        const duration =
          startTime && endTime
            ? (() => {
              const start = new Date(startTime);
              const end = new Date(endTime);
              const diff = Math.round(
                (end.getTime() - start.getTime()) / 60000
              );
              return diff > 0 ? `${diff}min` : "-";
            })()
            : "-";

        const amount = companionData?.price
          ? `R$ ${Number(companionData.price).toLocaleString("pt-BR")}`
          : "-";

        // === NORMALIZAÇÃO DE STATUS (preservando null do Strapi) ===
        let status = item.currentStatus;
        
        // Se não for null, normaliza o status
        if (status !== null) {
          status = status.toLowerCase();
          
          if (["accepted", "accept", "approved"].includes(status)) {
            status = "confirmed";
          } else if (["cancelled", "canceled"].includes(status)) {
            status = "cancelled";
          } else if (!["pending", "confirmed", "cancelled"].includes(status)) {
            status = "pending";
          }
        } else {
          // Se for null no Strapi, mantém como "pending" apenas para exibição
          status = "pending";
        }
        // ========================================================

        return {
          // guardamos ambos: o id numérico (v4/v5 legacy) e o documentId (v5)
          id: item.id, // numérico (fallback)
          documentId: item.documentId, // preferido no v5
          clientName,
          companionName,
          date: date ?? "-",
          time: timeFmt ?? "-",
          duration,
          amount,
          status,
          clientPhone: item.customerPhone ?? "-",
          customerEmail: item.customerEmail ?? "-",
          bookingId: item.bookingId ?? "-",
        };
      });

      // Calcular bookings de hoje
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
      const todayCount = processed.filter((booking: any) => {
        const bookingDate = booking.date; // já está no formato YYYY-MM-DD
        return bookingDate === todayStr;
      }).length;
      setTodayBookings(todayCount);

      setBookings(processed);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bookingsToShow]);

  const stats = [
    {
      title: panelTexts?.total_bookings_label || "Total Bookings",
      value: totalBookings.toString(),
      change: todayBookings > 0 ? `+${todayBookings}` : "",
      trend: "up",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: panelTexts?.active_companions_label || "Active Companions",
      value: uniqueCompanions.toString(),
      change: "",
      trend: "up",
      icon: Users,
      color: "from-rose-500 to-pink-500",
    },
    {
      title: panelTexts?.monthly_revenue_label || "Total Revenue",
      value: `R$${(totalRevenue / 1000).toFixed(1)}k`,
      change: "",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: panelTexts?.pending_bookings_label || "Pending",
      value: pendingBookings.toString(),
      change: "",
      trend: "up",
      icon: Clock,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">

      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            <div className="text-white text-lg font-medium">
              {panelTexts?.loading_label || "Loading..."}
            </div>
          </div>
        </div>
      )}
      
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${notification.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
            }`}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto p-2 sm:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {panelTexts?.dashboard_title || "Admin Dashboard"}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">
                {panelTexts?.dashboard_subtitle || "Manage bookings and operations"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all lg:hidden"
              >
                <Menu className="w-5 h-5 text-white" />
              </motion.button>

              <div className="hidden lg:flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  {panelTexts?.reportsLabel || "Reports"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  {panelTexts?.comapnionsLabels || "Companions"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
                >
                  <Settings className="w-4 h-4" />
                  {panelTexts?.settingLabel || "Settings"}
                </motion.button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            >
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  {panelTexts?.reportsLabel || "Reports"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  {panelTexts?.comapnionsLabels || "Companions"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white text-sm"
                >
                  <Settings className="w-4 h-4" />
                  {panelTexts?.settingLabel || "Settings"}
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 shadow-xl shadow-black/20"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-black/25`}
                    >
                      <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                    </div>
                    {stat.change && (
                      <span
                        className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
                          stat.trend === "up"
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-red-400 bg-red-500/10 border border-red-500/20"
                        }`}
                      >
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base font-medium">
                    {stat.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/25"
        >
          <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {panelTexts?.recent_bookings_label || "Recent Bookings"}
              </h2>

              <div className="hidden sm:flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={panelTexts?.search_bookings_placeholder || "Search bookings..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-sm placeholder-slate-400 transition-all duration-200"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${showDateFilter
                      ? "bg-rose-500/20 border-rose-500/30 text-rose-300 shadow-lg shadow-rose-500/10"
                      : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white hover:border-white/30"
                    }`}
                >
                  <CalendarDays className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <Filter className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="sm:hidden w-full space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={panelTexts?.search_bookings_placeholder || "Search..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-sm placeholder-slate-400 transition-all duration-200"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className={`flex-1 p-2 rounded-lg border transition-all ${showDateFilter
                        ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                        : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                      }`}
                  >
                    <CalendarDays className="w-4 h-4 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Filter className="w-4 h-4 text-white mx-auto" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {showDateFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <label className="text-white text-sm font-medium">
                    Filter Type:
                  </label>
                  <select
                    value={dateFilter.type}
                    onChange={(e) =>
                      setDateFilter({
                        ...dateFilter,
                        type: e.target.value as "single" | "range",
                      })
                    }
                    className="bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 px-4 py-2.5 text-sm focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-center transition-all duration-200"
                    style={{ WebkitAppearance: "none" }}
                  >
                    <option value="single">Specific Date</option>
                    <option value="range">Date Range</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <div className="flex flex-col gap-2 items-center">
                    <label className="text-slate-300 text-xs font-medium text-center">
                      {dateFilter.type === "single" ? "Date" : "Start Date"}
                    </label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) =>
                        setDateFilter({
                          ...dateFilter,
                          startDate: e.target.value,
                        })
                      }
                      className="bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 px-4 py-2.5 text-sm focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-center w-40 transition-all duration-200"
                      style={{
                        WebkitAppearance: "none",
                        colorScheme: "dark",
                      }}
                      onClick={(e) => {
                        if ("showPicker" in e.target) {
                          (e.target as any).showPicker();
                        }
                      }}
                    />
                  </div>

                  {dateFilter.type === "range" && (
                    <div className="flex flex-col gap-2 items-center">
                      <label className="text-slate-300 text-xs font-medium text-center">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) =>
                          setDateFilter({
                            ...dateFilter,
                            endDate: e.target.value,
                          })
                        }
                        className="bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 px-4 py-2.5 text-sm focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:outline-none text-center w-40 transition-all duration-200"
                        style={{
                          WebkitAppearance: "none",
                          colorScheme: "dark",
                        }}
                        onClick={(e) => {
                          // Force calendar to open on mobile
                          if ("showPicker" in e.target) {
                            (e.target as any).showPicker();
                          }
                        }}
                      />
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setDateFilter({
                        startDate: "",
                        endDate: "",
                        type: "single",
                      })
                    }
                    className="px-4 py-2.5 bg-slate-700/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200 text-sm font-medium mt-auto"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="relative">
            {showScrollHint && bookingsToShow.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="block sm:hidden absolute right-3 top-3 z-10 bg-gradient-to-r from-rose-500/90 to-pink-500/90 text-white text-xs px-3 py-1.5 rounded-full animate-pulse shadow-lg backdrop-blur-sm border border-white/20"
              >
                ← Arraste para rolar →
              </motion.div>
            )}

            <div
              className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-track-slate-800/30 scrollbar-thumb-rose-500/60 hover:scrollbar-thumb-rose-500/80"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(244, 63, 94, 0.6) rgba(15, 23, 42, 0.3)",
              }}
            >
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent">
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.client_label || "Client"}
                      </th>
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.companion_label || "Companion"}
                      </th>
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.date_time_label || "Date & Time"}
                      </th>
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.amount_label || "Amount"}
                      </th>
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.status_label || "Status"}
                      </th>
                      <th className="text-left p-4 sm:p-5 text-slate-300 font-semibold text-sm tracking-wide">
                        {panelTexts?.actions_label || "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsToShow.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-slate-400"
                        >
                          {panelTexts?.no_bookings_label || "No bookings found."}
                        </td>
                      </tr>
                    ) : (
                      bookingsToShow.map((booking) => (
                        <tr
                          key={booking.documentId ?? booking.id}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200 group"
                        >
                          <td className="p-4 sm:p-5">
                            <div>
                              <div className="font-semibold text-white text-sm group-hover:text-rose-100 transition-colors">
                                {booking.clientName}
                              </div>
                              {booking.clientName !== booking.clientPhone &&
                                booking.clientPhone !== "-" && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    {booking.clientPhone}
                                  </div>
                                )}
                              {booking.clientName !== booking.customerEmail &&
                                booking.customerEmail !== "-" && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    {booking.customerEmail}
                                  </div>
                                )}
                              <div className="text-xs text-slate-500 mt-1 font-mono">
                                ID: {booking.bookingId}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="font-medium text-white text-sm">
                              {booking.companionName}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div>
                              <div className="text-white text-sm">
                                {booking.date}
                              </div>
                              <div className="text-xs text-slate-400">
                                {booking.time} • {booking.duration}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="font-semibold text-green-400 text-sm">
                              {booking.amount}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status === "confirmed" 
                                ? (panelTexts?.confirmed_label || "confirmed")
                                : booking.status === "pending"
                                ? (panelTexts?.pending_label || "pending") 
                                : booking.status === "cancelled"
                                ? (panelTexts?.cancelled_label || "cancelled")
                                : booking.status}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.documentId ?? booking.id,
                                    "confirmed"
                                  )
                                }
                                className="p-1.5 sm:p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                                title="Accept"
                              >
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.documentId ?? booking.id,
                                    "cancelled"
                                  )
                                }
                                className="p-1.5 sm:p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                                title="Cancel"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.documentId ?? booking.id,
                                    "pending"
                                  )
                                }
                                className="p-1.5 sm:p-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all"
                                title="Set Pending"
                              >
                                <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-white/[0.02] to-transparent border-t border-white/10 gap-4">
            <div className="text-white/70 text-sm whitespace-nowrap font-medium">
              {filteredBookings.length} {panelTexts?.resultstotalLabel || "results total"}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <CustomPaginationPrevious
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    previousText={panelTexts?.anteriorLabel || "Previous"}
                  />
                </PaginationItem>

                {pageCount > 0 && (
                  <PaginationItem>
                    <PaginationLink
                      isActive={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {currentPage > 3 && pageCount > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((page) => {
                    if (pageCount <= 4) return page > 1 && page < pageCount;
                    if (currentPage <= 3)
                      return page > 1 && page <= 4 && page < pageCount;
                    if (currentPage >= pageCount - 2)
                      return (
                        page >= pageCount - 3 && page > 1 && page < pageCount
                      );
                    return page >= currentPage - 1 && page <= currentPage + 1;
                  })
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {currentPage < pageCount - 2 && pageCount > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pageCount > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      isActive={currentPage === pageCount}
                      onClick={() => setCurrentPage(pageCount)}
                    >
                      {pageCount}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <CustomPaginationNext
                    disabled={currentPage === pageCount || pageCount === 0}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(pageCount, page + 1))
                    }
                    nextText={panelTexts?.proximaLabel || "Next"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-white/80 text-sm whitespace-nowrap font-medium">
              {panelTexts?.pageOfLabel || "Page"} {currentPage} {panelTexts?.pageOfLabel ? panelTexts.pageOfLabel.split(' ')[1] || "of" : "of"} {pageCount}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

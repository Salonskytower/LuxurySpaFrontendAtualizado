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
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const BOOKINGS_PER_PAGE = 5;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leprive.fun";

export default function AdminDashboard() {
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
    async function fetchBookings() {
      const url = "https://api.leprive.fun/api/bookings?populate=companion";
      const res = await fetch(url);
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

          let status = (item.currentStatus ?? "").toLowerCase();

          if (["accepted", "accept", "confirmed"].includes(status)) {
            status = "pending"; // SEMPRE transforma bookings novos para pending
          } else if (["cancelled", "canceled"].includes(status)) {
            status = "cancelled";
          } else if (["pending"].includes(status)) {
            status = "pending";
          } else {
            status = "pending"; // qualquer outro, default pending
          }

          return {
            id: item.id,
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
    }
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

  const pageCount = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE) || 1;
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

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/cal-webhook/update-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookingId, status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Erro ao atualizar status!");

      // Opcional: atualizar local para feedback instantâneo
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      const statusMessages = {
        confirmed: "Booking confirmed successfully!",
        cancelled: "Booking cancelled!",
        pending: "Booking set to pending!",
      };

      setNotification({
        message: statusMessages[newStatus as keyof typeof statusMessages],
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
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: todayBookings > 0 ? `+${todayBookings}` : "",
      trend: "up",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Companions",
      value: uniqueCompanions.toString(),
      change: "",
      trend: "up",
      icon: Users,
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Total Revenue",
      value: `R$${(totalRevenue / 1000).toFixed(1)}k`,
      change: "",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending",
      value: pendingBookings.toString(),
      change: "",
      trend: "up",
      icon: Clock,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${
            notification.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto p-2 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">
                Manage bookings and operations
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
                  Reports
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Companions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
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
                  Reports
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Companions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div
                      className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {stat.change && (
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
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
          className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Recent Bookings
              </h2>

              <div className="hidden sm:flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-rose-500 focus:outline-none text-sm placeholder-slate-400"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`p-2 rounded-lg border transition-all ${
                    showDateFilter
                      ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                      : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Filter className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="sm:hidden w-full space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-rose-500 focus:outline-none text-sm placeholder-slate-400"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className={`flex-1 p-2 rounded-lg border transition-all ${
                      showDateFilter
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
              className="p-4 border-b border-white/10 bg-white/5"
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
                    className="bg-slate-800 text-white rounded-lg border border-slate-600 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none text-center"
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
                      className="bg-slate-800 text-white rounded-lg border border-slate-600 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none text-center w-40"
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
                        className="bg-slate-800 text-white rounded-lg border border-slate-600 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none text-center w-40"
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
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:bg-slate-600 transition-all text-sm font-medium mt-auto"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="relative">
            {showScrollHint && bookingsToShow.length > 0 && (
              <div className="block sm:hidden absolute right-2 top-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                ← Swipe →
              </div>
            )}

            <div
              className="overflow-x-auto"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.2) transparent",
              }}
            >
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Client
                      </th>
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Companion
                      </th>
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Date & Time
                      </th>
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Amount
                      </th>
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left p-3 sm:p-4 text-slate-300 font-medium text-sm">
                        Actions
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
                          No bookings found.
                        </td>
                      </tr>
                    ) : (
                      bookingsToShow.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-all"
                        >
                          <td className="p-3 sm:p-4">
                            <div>
                              <div className="font-medium text-white text-sm">
                                {booking.clientName}
                              </div>
                              {booking.clientName !== booking.clientPhone &&
                                booking.clientPhone !== "-" && (
                                  <div className="text-xs text-slate-400">
                                    {booking.clientPhone}
                                  </div>
                                )}
                              {booking.clientName !== booking.customerEmail &&
                                booking.customerEmail !== "-" && (
                                  <div className="text-xs text-slate-400">
                                    {booking.customerEmail}
                                  </div>
                                )}
                              <div className="text-xs text-slate-400">
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
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateBookingStatus(booking.id, "confirmed")
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
                                  updateBookingStatus(booking.id, "cancelled")
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
                                  updateBookingStatus(booking.id, "pending")
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

          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white/10 border-t border-white/10 gap-4">
            <div className="text-white/60 text-sm whitespace-nowrap">
              {filteredBookings.length} result
              {filteredBookings.length !== 1 ? "s" : ""} total
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
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
                  <PaginationNext
                    disabled={currentPage === pageCount || pageCount === 0}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(pageCount, page + 1))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-white/70 text-sm whitespace-nowrap">
              Page {currentPage} of {pageCount}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


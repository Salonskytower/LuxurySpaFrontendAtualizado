"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  Heart,
} from "lucide-react";
import { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: {
    id: number;
    name: string;
    price: string;
    image: string;
    location: string;
  };
}

export default function BookingModal({
  isOpen,
  onClose,
  companion,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    duration: "2",
    location: "",
    service: "dinner",
    specialRequests: "",
  });

  const [step, setStep] = useState(1);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    onClose();
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!companion) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex">
              <div className="w-1/3 bg-gradient-to-br from-rose-900/50 to-pink-900/50 p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 border border-rose-500/30">
                    <Heart className="w-10 h-10 text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Book {companion.name}
                  </h3>
                  <p className="text-slate-300 mb-4">{companion.location}</p>
                  <div className="text-3xl font-bold text-rose-400 mb-6">
                    {companion.price}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Secure & Confidential</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Instant Confirmation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Complete Your Booking
                    </h2>
                    <p className="text-slate-400">Step {step} of 3</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="mb-8">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                          num <= step
                            ? "bg-gradient-to-r from-rose-500 to-pink-600"
                            : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                              placeholder="Enter your name"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                              placeholder="+55 11 99999-9999"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Booking Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Preferred Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Preferred Time
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="time"
                              name="time"
                              value={formData.time}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Duration
                          </label>
                          <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                            required
                          >
                            <option value="2">2 Hours</option>
                            <option value="4">4 Hours</option>
                            <option value="8">8 Hours</option>
                            <option value="24">Full Day</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm mb-2">
                            Service Type
                          </label>
                          <select
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                            required
                          >
                            <option value="dinner">Dinner Companion</option>
                            <option value="event">Event Partner</option>
                            <option value="travel">Travel Companion</option>
                            <option value="business">Business Event</option>
                            <option value="custom">Custom Arrangement</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                            placeholder="Hotel, restaurant, or address"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-sm mb-2">
                          Special Requests
                        </label>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all resize-none"
                          placeholder="Any special preferences or requests..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Payment & Confirmation
                      </h3>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">
                          Booking Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Companion:</span>
                            <span className="text-white">{companion.name}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Date & Time:</span>
                            <span className="text-white">
                              {formData.date} at {formData.time}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Duration:</span>
                            <span className="text-white">
                              {formData.duration} hours
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Service:</span>
                            <span className="text-white">
                              {formData.service}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-2 mt-4">
                            <div className="flex justify-between text-lg font-semibold">
                              <span className="text-white">Total:</span>
                              <span className="text-rose-400">
                                {companion.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-green-300 font-medium">
                              Secure Payment
                            </p>
                            <p className="text-green-400/80 text-sm">
                              Your information is encrypted and protected
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-4 pt-6">
                    {step > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                      >
                        Previous
                      </motion.button>
                    )}

                    <motion.button
                      type={step === 3 ? "submit" : "button"}
                      onClick={step < 3 ? nextStep : undefined}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-rose-500/25 transition-all"
                    >
                      {step === 3 ? "Confirm Booking" : "Next"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export default function AgeVerificationModal({
  isOpen,
  onConfirm,
  onDecline,
}: AgeVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        style={{ margin: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-md mx-4 p-8 bg-gradient-to-br from-gray-900 to-black border border-rose-500/20 rounded-2xl shadow-2xl"
        >
          {/* Decoração de fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-2xl" />

          {/* Conteúdo */}
          <div className="relative z-10 text-center">
            {/* Ícone */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white mb-4">
              Weryfikacja Wieku
            </h2>

            {/* Descrição */}
            <p className="text-gray-300 mb-8 leading-relaxed">
              Ta strona zawiera treści dla dorosłych. Potwierdzasz, że masz co
              najmniej{" "}
              <span className="text-rose-400 font-semibold">18 lat</span>?
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
              >
                Tak, mam +18 lat
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDecline}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full transition-all duration-300"
              >
                Nie, jestem niepełnoletni
              </motion.button>
            </div>

            {/* Texto legal */}
            <p className="text-xs text-gray-500 mt-6">
              Kontynuując, potwierdzasz, że jesteś pełnoletni i zgadzasz się na
              wyświetlanie treści dla dorosłych.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

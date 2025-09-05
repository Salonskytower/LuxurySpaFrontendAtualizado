"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, textsApi } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onUserUpdate?: () => void;
  language: "en" | "pl";
}
type AuthMode = "login" | "forgot";

interface LoginContent {
  loginTitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberMeText?: string;
  forgotPasswordText?: string;
  signInButtonText?: string;
  orContinueText?: string;
  // Removidos campos do Google/registro
  noAccountText?: string;
  signUpText?: string;
}
interface ResetPasswordContent {
  formTitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  infoText?: string;
  buttonText?: string;
  rememberYourPassword?: string;
  backToLoginLinkText?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onUserUpdate,
  language,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const [loginContent, setLoginContent] = useState<LoginContent | null>(null);
  const [resetContent, setResetContent] = useState<ResetPasswordContent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch dynamic texts
  useEffect(() => {
    const fetchLoginContent = async () => {
      try {
        const data = await textsApi.getLoginContent(language);
        if (data) setLoginContent(data);
      } catch (error) {
        console.error("Erro ao buscar dados de login-content:", error);
      }
    };
    fetchLoginContent();
  }, [language]);

  useEffect(() => {
    const fetchResetContent = async () => {
      try {
        const data = await textsApi.getResetPasswordContent(language);
        if (data) setResetContent(data);
      } catch (error) {
        console.error("Erro ao buscar dados de reset-password-content:", error);
      }
    };
    fetchResetContent();
  }, [language]);

  // Input handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(formData.email, formData.password);

      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("jwt", res.jwt);

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess();
      }
      if (typeof onUserUpdate === "function") {
        onUserUpdate();
      }

      if (res.user.userType === "admin") {
        router.push("/admin");
      }

      onClose?.();
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.toLowerCase().includes("not confirmed")) {
        setError("Por favor, confirme seu e-mail antes de fazer login.");
      } else {
        setError(error.message || "Login failed");
      }
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(formData.email);
      alert("If this email exists, a reset link has been sent.");
      switchMode("login");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to send reset email");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === "login") return handleLogin(e);
    if (mode === "forgot") return handleForgot(e);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  const switchMode = (newMode: AuthMode) => {
    setError(null);
    setMode(newMode);
    resetForm();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md md:max-w-lg max-h-[90vh] bg-slate-900/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full p-6 md:p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  {mode === "forgot" && (
                    <motion.button
                      onClick={() => switchMode("login")}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {mode === "login" &&
                      (loginContent?.loginTitle || "Sign In")}
                    {mode === "forgot" &&
                      (resetContent?.formTitle || "Forgot Password")}
                  </h3>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>

              {/* Show error if exists */}
              {error && (
                <div className="bg-rose-900/60 text-rose-300 text-sm mb-4 px-4 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Login */}
                {mode === "login" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-slate-300 text-sm mb-2">
                        {loginContent?.emailLabel || "Email"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                          placeholder={
                            loginContent?.emailPlaceholder || "your@email.com"
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm mb-2">
                        {loginContent?.passwordLabel || "Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-12 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                          placeholder={
                            loginContent?.passwordPlaceholder ||
                            "Enter your password"
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-white/10"
                        />
                        <span className="text-sm">
                          {loginContent?.rememberMeText || "Remember me"}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-rose-400 hover:text-rose-300 text-sm transition-colors"
                      >
                        {loginContent?.forgotPasswordText || "Forgot password?"}
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-rose-500/25 transition-all"
                      disabled={loading}
                    >
                      {loading
                        ? "Signing In..."
                        : loginContent?.signInButtonText || "Sign In"}
                    </motion.button>
                  </motion.div>
                )}

                {/* Forgot */}
                {mode === "forgot" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-slate-300 text-sm mb-2">
                        {resetContent?.emailLabel || "Email Address"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-rose-500 focus:outline-none transition-all"
                          placeholder={
                            resetContent?.emailPlaceholder || "Enter your email"
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                      <p className="text-blue-300 text-sm">
                        {resetContent?.infoText ||
                          "We'll send you a secure link to reset your password. Check your email inbox and spam folder."}
                      </p>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-rose-500/25 transition-all"
                      disabled={loading}
                    >
                      {loading
                        ? "Sending..."
                        : resetContent?.buttonText || "Send Reset Link"}
                    </motion.button>
                    <div className="text-center">
                      <span className="text-slate-400">
                        {resetContent?.rememberYourPassword ||
                          "Remember your password?"}{" "}
                      </span>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                      >
                        {resetContent?.backToLoginLinkText || "Back to login"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

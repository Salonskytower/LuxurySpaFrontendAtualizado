"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await axios.post("http://localhost:1337/api/auth/reset-password", {
        code,
        password,
        passwordConfirmation,
      });
      setMsg("Password reset successfully! You can log in.");
    } catch (err: any) {
      setMsg(
        err?.response?.data?.error?.message || "Error resetting password."
      );
    }
    setLoading(false);
  }

  if (!code) return <p>Invalid code. Request a new reset link.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-slate-900 rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-white">Reset Password</h1>
        <input
          type="password"
          className="mb-4 w-full p-3 rounded border bg-gray-800 text-white"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="mb-4 w-full p-3 rounded border bg-gray-800 text-white"
          placeholder="Confirm new password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-rose-500 text-white rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {msg && (
          <p className="mt-4 text-center text-white bg-slate-800 py-2 rounded">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

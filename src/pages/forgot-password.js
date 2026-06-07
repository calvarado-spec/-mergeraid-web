import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-blue-700">MergerAid</span>
        </Link>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                If that address is registered, you&apos;ll receive a password reset link within a few minutes.
              </p>
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Forgot your password?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {submitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-gray-400">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

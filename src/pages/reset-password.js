import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-blue-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
          <span style={{ fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 500, color: '#1d4ed8', letterSpacing: '-0.3px' }}>MergerAid</span>
        </Link>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Password updated</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been reset. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Set a new password</h2>
              <p className="text-sm text-gray-500 mb-6">Must be at least 8 characters.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClass}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !token}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {submitting ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

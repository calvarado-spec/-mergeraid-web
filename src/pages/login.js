import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchTab(newTab) {
    setTab(newTab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  function redirectAfterAuth() {
    const dest = typeof router.query.redirect === "string" ? router.query.redirect : "/dashboard";
    router.push(dest);
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      redirectAfterAuth();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      redirectAfterAuth();
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
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
        <span className="text-2xl font-bold text-blue-700">MergerAid</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-blue-100">
          {["signin", "register"].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                  : "text-gray-400 hover:text-blue-600 bg-gray-50"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="p-8">
          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {submitting ? "Signing In…" : "Sign In"}
              </button>
              <p className="text-center text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
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
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Confirm Password
                </label>
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
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {submitting ? "Creating Account…" : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>

      </div>
      <Footer />
    </div>
  );
}

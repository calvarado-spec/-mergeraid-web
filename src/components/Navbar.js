import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center border-b fixed top-0 z-50">
      <div className="flex items-center space-x-2">
        <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
        <Link href="/">
          <span className="text-2xl font-bold text-blue-700 cursor-pointer">MergerAid</span>
        </Link>
      </div>
      <nav className="flex items-center space-x-6">
        <Link href="/about" className="hover:text-blue-600">About</Link>
        <Link href="/features" className="hover:text-blue-600">Features</Link>
        <Link href="/pricing" className="hover:text-blue-600">Pricing</Link>
        <Link href="/contact" className="hover:text-blue-600">Contact</Link>

        {/* Render nothing until the auth check resolves to avoid a flash of Sign In */}
        {!authChecked ? null : user !== null ? (
          <>
            <Link href="/dashboard" className="font-medium text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // Close menu whenever the route changes
  useEffect(() => { setMenuOpen(false); }, [router.pathname]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <>
      <header className="w-full bg-white shadow-sm px-4 sm:px-6 flex justify-between items-center border-b fixed top-0 z-50 h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
          <Link href="/">
            <span className="text-xl sm:text-2xl font-bold text-blue-700 cursor-pointer">MergerAid</span>
          </Link>
        </div>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-gray-700 hover:text-blue-600 transition-colors">
              {label}
            </Link>
          ))}
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

        {/* Hamburger — visible on mobile only */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-blue-100 shadow-lg z-40">
          <div className="flex flex-col px-5 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-blue-50 mt-2 pt-3">
              {!authChecked ? null : user !== null ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors mb-1"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

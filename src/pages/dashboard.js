import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
  });
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then(async (data) => {
        if (!data) return;
        setUser(data.user);
        const dealsRes = await fetch("/api/deals/list");
        const dealsData = await dealsRes.json();
        if (dealsData.deals) setDeals(dealsData.deals);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-blue-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-700">Dashboard</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">Welcome back, {user?.email}</p>
            </div>
            <Link href="/intake" className="flex-shrink-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base">
                + New Screening
              </button>
            </Link>
          </div>

          {/* Empty state */}
          {deals.length === 0 ? (
            <div className="text-center py-16 sm:py-20 border border-blue-100 rounded-2xl bg-blue-50 px-4">
              <p className="text-gray-500 text-base mb-5">
                No engagements yet. Start your first screening.
              </p>
              <Link href="/intake">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  Start Screening →
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* ── Mobile card list (hidden on md+) ── */}
              <div className="md:hidden space-y-3">
                {deals.map((deal) => (
                  <div key={deal.id} className="border border-blue-100 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-snug truncate">
                          {deal.deal_name || deal.target_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{deal.client_name}</p>
                      </div>
                      {deal.is_complete ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                          In Progress
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                      <span>{deal.deal_type === "asset" ? "Asset" : "Equity"}</span>
                      <span>·</span>
                      <span>{formatDate(deal.created_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/questionnaire?dealId=${deal.id}`}>
                        <button className="text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:border-blue-400 transition-colors">
                          Resume
                        </button>
                      </Link>
                      {deal.is_complete && (
                        <Link href={`/results?dealId=${deal.id}`}>
                          <button className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                            View Report
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop table (hidden on mobile) ── */}
              <div className="hidden md:block border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 text-left">Deal Name</th>
                      <th className="px-5 py-3.5 text-left">Client Firm</th>
                      <th className="px-5 py-3.5 text-left">Type</th>
                      <th className="px-5 py-3.5 text-left">Date Started</th>
                      <th className="px-5 py-3.5 text-left">Status</th>
                      <th className="px-5 py-3.5 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {deal.deal_name || deal.target_name}
                        </td>
                        <td className="px-5 py-4 text-gray-600">{deal.client_name}</td>
                        <td className="px-5 py-4 text-gray-600">
                          {deal.deal_type === "asset" ? "Asset" : "Equity"}
                        </td>
                        <td className="px-5 py-4 text-gray-500">{formatDate(deal.created_at)}</td>
                        <td className="px-5 py-4">
                          {deal.is_complete ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <Link href={`/questionnaire?dealId=${deal.id}`}>
                              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                                Resume
                              </button>
                            </Link>
                            {deal.is_complete && (
                              <Link href={`/results?dealId=${deal.id}`}>
                                <button className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                                  View Report
                                </button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

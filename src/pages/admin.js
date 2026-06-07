import { useState, useEffect } from "react";

const ADMIN_KEY = "MERGERAID_ADMIN_2025";

const TABS = [
  { key: "users",                label: "Users" },
  { key: "deals",                label: "Deals" },
  { key: "contact_submissions",  label: "Contact Submissions" },
];

function formatCell(col, val) {
  if (val === null || val === undefined) return "—";
  if (col === "password_hash") return "••••••••";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (col.endsWith("_at") || col.endsWith("_date")) {
    return new Date(val).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  const str = String(val);
  return str.length > 72 ? str.slice(0, 72) + "…" : str;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === ADMIN_KEY) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated || tableData[activeTab] !== undefined) return;
    fetchTable(activeTab);
  }, [authenticated, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchTable(table) {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`/api/admin/data?table=${table}`, {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error || "Failed to load data.");
        return;
      }
      setTableData((prev) => ({ ...prev, [table]: data.rows }));
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      sessionStorage.setItem("admin_auth", ADMIN_KEY);
      setAuthenticated(true);
    } else {
      setPasswordError("Incorrect password.");
      setPassword("");
    }
  }

  function handleSignOut() {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
    setTableData({});
  }

  // ── Password gate ────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">MergerAid internal dashboard</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
              placeholder="Enter admin password"
              autoFocus
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const rows = tableData[activeTab];
  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-700">MergerAid Admin</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setFetchError(""); }}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tableData[tab.key] !== undefined && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {tableData[tab.key].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {loading && (
          <p className="text-sm text-blue-500">Loading…</p>
        )}

        {!loading && fetchError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {fetchError}
          </p>
        )}

        {!loading && !fetchError && rows && rows.length === 0 && (
          <p className="text-sm text-gray-400">No records found.</p>
        )}

        {!loading && !fetchError && rows && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col}
                        title={col !== "password_hash" ? String(row[col] ?? "") : undefined}
                        className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs truncate"
                      >
                        {formatCell(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

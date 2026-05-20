import { useState } from "react";
import { useRouter } from "next/router";

export default function ComingSoon() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (password === "mergeraid2026") {
      const maxAge = 30 * 24 * 60 * 60;
      document.cookie = `site_access=granted; path=/; max-age=${maxAge}; SameSite=Lax`;
      router.push("/");
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          maxWidth: "400px",
          padding: "0 24px",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "#1d4ed8",
            borderRadius: "12px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "22px", fontFamily: "Georgia, serif" }}>M</span>
        </div>

        <h1
          style={{
            fontSize: "38px",
            fontWeight: "bold",
            color: "#60a5fa",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
            fontFamily: "Georgia, serif",
          }}
        >
          MergerAid
        </h1>

        <p
          style={{
            fontSize: "17px",
            color: "#94a3b8",
            marginBottom: "44px",
            lineHeight: "1.5",
          }}
        >
          Something powerful is coming.
        </p>

        {/* Password form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter access password"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "15px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              color: "#f1f5f9",
              outline: "none",
              letterSpacing: "0.05em",
            }}
          />

          {error && (
            <p style={{ color: "#f87171", fontSize: "13.5px", margin: "0" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1e40af")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          >
            Enter
          </button>
        </form>

        <p style={{ marginTop: "40px", fontSize: "11px", color: "#334155", letterSpacing: "0.05em" }}>
          © {new Date().getFullYear()} MergerAid. All rights reserved.
        </p>
      </div>
    </div>
  );
}

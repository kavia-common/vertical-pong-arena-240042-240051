import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";

// PUBLIC_INTERFACE
export function LeaderboardScreen() {
  /** Leaderboard view (local placeholder; can be replaced by backend fetch later). */
  const navigate = useNavigate();
  const { leaderboard } = useApp();

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h1 className="h1">Leaderboard</h1>
          <p className="p" style={{ marginTop: 6 }}>
            Demo data (hook up to backend later via env API base).
          </p>
        </div>
        <button className="btn" onClick={() => navigate(ROUTES.home)}>
          Back
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {leaderboard.map((p, idx) => (
          <div key={p.id} className="navPill" style={{ justifyContent: "space-between" }}>
            <span>
              <strong>#{idx + 1}</strong> {p.name}
            </span>
            <span style={{ color: "var(--ocean-muted)" }}>ELO {p.elo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

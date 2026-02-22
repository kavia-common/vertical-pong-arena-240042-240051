import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";

// PUBLIC_INTERFACE
export function ProfileScreen() {
  /** Profile and local match history. */
  const navigate = useNavigate();
  const { profile, local, actions } = useApp();
  const [name, setName] = useState(profile.displayName);

  const winRate = useMemo(() => {
    const m = profile.stats.matches || 0;
    if (!m) return 0;
    return Math.round((profile.stats.wins / m) * 100);
  }, [profile.stats]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    actions.updateProfile({ displayName: trimmed });
    actions.pushToast({ kind: "success", message: "Profile updated." });
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="cardHeader">
          <h1 className="h1">Profile</h1>
          <button className="btn" onClick={() => navigate(ROUTES.home)}>
            Back
          </button>
        </div>

        <div className="kpi">
          <div className="kpiItem">
            <div className="kpiValue">{profile.elo}</div>
            <div className="kpiLabel">ELO</div>
          </div>
          <div className="kpiItem">
            <div className="kpiValue">{profile.stats.matches}</div>
            <div className="kpiLabel">Matches</div>
          </div>
          <div className="kpiItem">
            <div className="kpiValue">{winRate}%</div>
            <div className="kpiLabel">Win rate</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="label">Display name</div>
          <div className="row">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn btnPrimary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </section>

      <aside className="card">
        <div className="h2">Recent matches</div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {(local?.recentMatches ?? []).length === 0 ? (
            <div className="p">No matches yet. Play a game to see history.</div>
          ) : (
            local.recentMatches.map((m) => (
              <div key={m.id} className="navPill" style={{ justifyContent: "space-between" }}>
                <span>
                  <strong>{m.result.toUpperCase()}</strong> • {m.mode}
                </span>
                <span style={{ color: "var(--ocean-muted)" }}>
                  {m.scoreFor}-{m.scoreAgainst}
                </span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

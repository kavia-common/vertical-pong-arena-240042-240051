import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";

// PUBLIC_INTERFACE
export function LobbyScreen() {
  /** Lobby: prepares a match and transitions to game. */
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, actions } = useApp();

  const mode = location.state?.mode ?? "ai";
  const [roomCode] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase());
  const [searching, setSearching] = useState(mode === "online");

  const subtitle = useMemo(() => {
    if (mode === "local") return "Local Multiplayer";
    if (mode === "online") return "Online Matchmaking (stub)";
    return "Player vs AI";
  }, [mode]);

  useEffect(() => {
    if (mode !== "online") return;
    // Stub "match found" after delay.
    const t = setTimeout(() => {
      setSearching(false);
      actions.pushToast({ kind: "success", message: "Match found (stub). Starting…" });
      navigate(ROUTES.game, { state: { mode, roomCode } });
    }, 1200);
    return () => clearTimeout(t);
  }, [mode, actions, navigate, roomCode]);

  return (
    <div className="grid2">
      <section className="card">
        <div className="cardHeader">
          <h1 className="h1">Lobby</h1>
          <button className="btn" onClick={() => navigate(ROUTES.modes)}>
            Back
          </button>
        </div>

        <div className="navPill" style={{ marginBottom: 12 }}>
          <strong>{subtitle}</strong>
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div className="h2">Players</div>
          <div className="p" style={{ marginTop: 8 }}>
            {mode === "local" ? "P1 + P2" : mode === "ai" ? `${profile.displayName} vs AI` : `${profile.displayName} vs ???`}
          </div>
          {mode === "online" ? (
            <div className="p" style={{ marginTop: 8 }}>
              Room code: <strong>{roomCode}</strong>
            </div>
          ) : null}
        </div>

        {mode === "online" ? (
          <div className="row">
            <button className="btn btnPrimary" disabled={searching} onClick={() => navigate(ROUTES.game, { state: { mode, roomCode } })}>
              {searching ? "Searching…" : "Start (stub)"}
            </button>
            <button className="btn" onClick={() => setSearching((v) => !v)}>
              {searching ? "Cancel" : "Search"}
            </button>
          </div>
        ) : (
          <div className="row">
            <button className="btn btnPrimary" onClick={() => navigate(ROUTES.game, { state: { mode } })}>
              Start
            </button>
          </div>
        )}
      </section>

      <aside className="card">
        <div className="h2">Tips</div>
        <p className="p" style={{ marginTop: 10 }}>
          Use smooth paddle movement and watch ball angle changes on edge hits.
        </p>
      </aside>
    </div>
  );
}

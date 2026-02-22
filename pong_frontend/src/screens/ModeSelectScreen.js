import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";

// PUBLIC_INTERFACE
export function ModeSelectScreen() {
  /** Mode selection for local, AI, and online. */
  const navigate = useNavigate();
  const { settings, connection, actions } = useApp();
  const [mode, setMode] = useState("ai"); // local | ai | online

  const canOnline = connection.status === "connected";

  const start = () => {
    if (mode === "online" && !canOnline) {
      actions.pushToast({ kind: "info", message: "Online requires backend. Try Local or AI." });
      return;
    }
    navigate(ROUTES.lobby, { state: { mode } });
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="cardHeader">
          <h1 className="h1">Select mode</h1>
          <button className="btn" onClick={() => navigate(ROUTES.home)}>
            Back
          </button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <button className={`btn ${mode === "local" ? "btnAmber" : ""}`} onClick={() => setMode("local")}>
            Local Multiplayer (2P)
          </button>
          <button className={`btn ${mode === "ai" ? "btnAmber" : ""}`} onClick={() => setMode("ai")}>
            Player vs AI ({settings.difficulty})
          </button>
          <button
            className={`btn ${mode === "online" ? "btnAmber" : ""}`}
            onClick={() => setMode("online")}
            disabled={!canOnline}
            title={!canOnline ? "Backend not connected" : "Online matchmaking stub"}
          >
            Online Multiplayer (stub)
          </button>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btnPrimary" onClick={start}>
            Continue
          </button>
          <span className="navPill">Connection: {connection.status}</span>
        </div>
      </section>

      <aside className="card">
        <div className="h2">Notes</div>
        <p className="p" style={{ marginTop: 10 }}>
          Online uses env-configured REST/WS endpoints. The UI is wired; backend match events are stubbed.
        </p>
      </aside>
    </div>
  );
}

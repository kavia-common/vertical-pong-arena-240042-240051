import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";

// PUBLIC_INTERFACE
export function MainMenuScreen() {
  /** Main menu screen. */
  const navigate = useNavigate();
  const { profile } = useApp();

  return (
    <div className="grid2">
      <section className="card">
        <h1 className="h1">Welcome, {profile.displayName}</h1>
        <p className="p" style={{ marginTop: 10 }}>
          Choose a mode, warm up against AI, or explore your stats and leaderboards.
        </p>

        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btnPrimary" onClick={() => navigate(ROUTES.modes)}>
            Play
          </button>
          <button className="btn" onClick={() => navigate(ROUTES.leaderboard)}>
            Leaderboard
          </button>
          <button className="btn" onClick={() => navigate(ROUTES.profile)}>
            Profile
          </button>
        </div>
      </section>

      <aside className="card">
        <div className="h2">Quick controls</div>
        <div className="p" style={{ marginTop: 10 }}>
          Player 1: W/S • Player 2: ↑/↓ • Pause: P • Restart: R
        </div>
        <div className="p" style={{ marginTop: 10 }}>
          Local and AI modes work offline. Online mode requires backend endpoints.
        </div>
      </aside>
    </div>
  );
}

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";

// PUBLIC_INTERFACE
export function SplashScreen() {
  /** Initial loading screen that routes to main menu quickly. */
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate(ROUTES.home, { replace: true }), 600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="grid2">
      <section className="card">
        <h1 className="h1">Vertical Pong Arena</h1>
        <p className="p" style={{ marginTop: 10 }}>
          Local multiplayer, AI practice, and online matchmaking (stubbed). Built with a clean
          Ocean Professional theme and a fast canvas engine.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btnPrimary" onClick={() => navigate(ROUTES.home, { replace: true })}>
            Enter Arena
          </button>
          <span className="navPill">Tip: Press P in-game to pause.</span>
        </div>
      </section>

      <aside className="card">
        <div className="h2">What’s inside</div>
        <div className="kpi" style={{ marginTop: 12 }}>
          <div className="kpiItem">
            <div className="kpiValue">Local</div>
            <div className="kpiLabel">2 players on one device</div>
          </div>
          <div className="kpiItem">
            <div className="kpiValue">AI</div>
            <div className="kpiLabel">Difficulty slider</div>
          </div>
          <div className="kpiItem">
            <div className="kpiValue">Online</div>
            <div className="kpiLabel">REST/WS stubs wired to env</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

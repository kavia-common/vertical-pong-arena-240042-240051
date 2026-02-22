import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";
import { useApp } from "../state/useApp";
import { createGameEngine } from "../game/engine";

// PUBLIC_INTERFACE
export function GameScreen() {
  /** Canvas game screen with HUD and pause. */
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, actions } = useApp();

  const mode = location.state?.mode ?? "ai"; // local | ai | online
  const roomCode = location.state?.roomCode ?? null;

  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({
    p1: 0,
    p2: 0,
    message: "First to 7",
    elapsed: 0
  });

  const skin = settings.skins?.selectedId ?? "classic";

  const theme = useMemo(() => {
    if (skin === "amber") return { accent: "#f59e0b", bg: "#060812" };
    if (skin === "ocean") return { accent: "#60a5fa", bg: "#050b1a" };
    return { accent: "#ffffff", bg: "#050b1a" };
  }, [skin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createGameEngine({
      canvas,
      mode,
      settings,
      theme,
      onHud: setHud,
      onPauseChange: setPaused,
      onMatchEnd: ({ p1, p2 }) => {
        const result = p1 > p2 ? "win" : p1 < p2 ? "loss" : "draw";
        actions.recordLocalMatch({
          mode,
          result,
          scoreFor: p1,
          scoreAgainst: p2
        });
        actions.pushToast({
          kind: "success",
          message: `Match ended: ${p1}-${p2} (${result})`
        });
      }
    });

    engineRef.current = engine;
    engine.start();

    return () => engine.stop();
  }, [mode, settings, theme, actions]);

  const togglePause = () => engineRef.current?.togglePause();

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="cardHeader">
        <div>
          <h1 className="h1">Game</h1>
          <p className="p" style={{ marginTop: 6 }}>
            Mode: <strong>{mode}</strong>
            {roomCode ? (
              <>
                {" "}
                • Room: <strong>{roomCode}</strong>
              </>
            ) : null}
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => navigate(ROUTES.home)}>
            Exit
          </button>
          <button className="btn btnAmber" onClick={togglePause}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button className="btn" onClick={() => engineRef.current?.restart()}>
            Restart
          </button>
        </div>
      </div>

      <div className="gameFrame" style={{ background: theme.bg }}>
        <div className="hudOverlay">
          <div className="hudPill">
            P1 <strong style={{ marginLeft: 6 }}>{hud.p1}</strong>
          </div>
          <div className="hudPill">
            <span>{hud.message}</span>
            <span style={{ marginLeft: 10, opacity: 0.85 }}>
              {Math.floor(hud.elapsed)}s
            </span>
          </div>
          <div className="hudPill">
            P2 <strong style={{ marginLeft: 6 }}>{hud.p2}</strong>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="gameCanvas"
          width={520}
          height={860}
          aria-label="Pong game canvas"
        />

        {paused ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.35)"
            }}
          >
            <div className="card" style={{ maxWidth: 520 }}>
              <div className="h2">Paused</div>
              <div className="p" style={{ marginTop: 8 }}>
                Press <strong>P</strong> to resume. Use <strong>R</strong> to restart.
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btnPrimary" onClick={togglePause}>
                  Resume
                </button>
                <button className="btn" onClick={() => engineRef.current?.restart()}>
                  Restart
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {mode === "online" ? (
        <div className="p" style={{ marginTop: 10 }}>
          Online netcode is stubbed: inputs/frames are local. Socket event wiring is ready in the
          connection manager.
        </div>
      ) : null}
    </div>
  );
}

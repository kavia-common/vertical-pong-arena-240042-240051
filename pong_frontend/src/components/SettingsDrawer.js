import React, { useMemo } from "react";

// PUBLIC_INTERFACE
export function SettingsDrawer({ open, onClose, settings, onUpdateSettings, onResetAll }) {
  /** Side drawer for audio/game settings. */
  const difficultyOptions = useMemo(
    () => [
      { value: "easy", label: "Easy" },
      { value: "normal", label: "Normal" },
      { value: "hard", label: "Hard" }
    ],
    []
  );

  return (
    <aside className={`drawer ${open ? "drawerOpen" : ""}`} aria-label="Settings drawer">
      <div className="drawerHeader">
        <strong>Settings</strong>
        <button className="btn btnSmall" onClick={onClose} aria-label="Close settings">
          Close
        </button>
      </div>

      <div className="drawerBody">
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="h2" style={{ marginBottom: 10 }}>
            Audio
          </div>
          <div className="row">
            <label className="navPill" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!settings.audioEnabled}
                onChange={(e) => onUpdateSettings?.({ audioEnabled: e.target.checked })}
              />
              <span>Music</span>
            </label>
            <label className="navPill" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!settings.sfxEnabled}
                onChange={(e) => onUpdateSettings?.({ sfxEnabled: e.target.checked })}
              />
              <span>SFX</span>
            </label>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div className="h2" style={{ marginBottom: 10 }}>
            Gameplay
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="label">AI difficulty</div>
            <select
              className="input"
              value={settings.difficulty}
              onChange={(e) => onUpdateSettings?.({ difficulty: e.target.value })}
            >
              {difficultyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="label">Game speed</div>
            <input
              className="input"
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={settings.gameSpeed ?? 1}
              onChange={(e) => onUpdateSettings?.({ gameSpeed: Number(e.target.value) })}
            />
            <div className="p" style={{ marginTop: 6 }}>
              {Number(settings.gameSpeed ?? 1).toFixed(2)}×
            </div>
          </div>
        </div>

        <div className="card">
          <div className="h2" style={{ marginBottom: 10 }}>
            Data
          </div>
          <button className="btn btnDanger" onClick={onResetAll}>
            Reset local data
          </button>
          <div className="p" style={{ marginTop: 8 }}>
            Clears local profile, settings, and match history.
          </div>
        </div>
      </div>
    </aside>
  );
}

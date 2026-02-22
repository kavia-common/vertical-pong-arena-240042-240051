import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styles from "./App.css";

import { useApp } from "./state/useApp";
import { ROUTES } from "./routes/routes";
import { SplashScreen } from "./screens/SplashScreen";
import { MainMenuScreen } from "./screens/MainMenuScreen";
import { ModeSelectScreen } from "./screens/ModeSelectScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GameScreen } from "./screens/GameScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { SkinShopDrawer } from "./components/SkinShopDrawer";
import { ToastStack } from "./components/ToastStack";

// PUBLIC_INTERFACE
function App() {
  /** Root application component: provides top nav, routing, and global drawers. */
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, settings, connection, toasts, actions } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [skinsOpen, setSkinsOpen] = useState(false);

  const currentPath = location.pathname;

  const title = useMemo(() => {
    if (currentPath.startsWith(ROUTES.game)) return "Match";
    if (currentPath.startsWith(ROUTES.lobby)) return "Lobby";
    if (currentPath.startsWith(ROUTES.leaderboard)) return "Leaderboard";
    if (currentPath.startsWith(ROUTES.profile)) return "Profile";
    return "Vertical Pong Arena";
  }, [currentPath]);

  return (
    <div className="appShell">
      <header className="topNav" aria-label="Top navigation">
        <div className="topNavInner">
          <button
            className="btn btnSmall"
            onClick={() => navigate(ROUTES.home)}
            aria-label="Go to main menu"
          >
            <span className="brand">
              <span className="brandMark" aria-hidden="true" />
              <span>Vertical Pong Arena</span>
            </span>
          </button>

          <span className="navPill" aria-label="Current screen">
            <strong>{title}</strong>
          </span>

          <div className="navSpacer" />

          <span className="navPill" title="Connection">
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: connection.status === "connected" ? "#22c55e" : "#f59e0b"
              }}
            />
            <span style={{ fontSize: 13, color: "var(--ocean-muted)" }}>
              {connection.status}
            </span>
          </span>

          <button className="btn btnSmall" onClick={() => setSkinsOpen(true)}>
            Skins
          </button>
          <button className="btn btnSmall" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>

          <span className="navPill" title="Active profile">
            <span style={{ fontWeight: 700 }}>{profile.displayName}</span>
            <span style={{ fontSize: 12, color: "var(--ocean-muted)" }}>
              ELO {profile.elo}
            </span>
          </span>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path={ROUTES.splash} element={<SplashScreen />} />
          <Route path={ROUTES.home} element={<MainMenuScreen />} />
          <Route path={ROUTES.modes} element={<ModeSelectScreen />} />
          <Route path={ROUTES.lobby} element={<LobbyScreen />} />
          <Route path={ROUTES.game} element={<GameScreen />} />
          <Route path={ROUTES.leaderboard} element={<LeaderboardScreen />} />
          <Route path={ROUTES.profile} element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
        </Routes>
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={actions.updateSettings}
        onResetAll={() => actions.resetAllData()}
      />

      <SkinShopDrawer
        open={skinsOpen}
        onClose={() => setSkinsOpen(false)}
        skinState={settings.skins}
        onSelectSkin={(skinId) => actions.selectSkin(skinId)}
      />

      <ToastStack toasts={toasts.items} onDismiss={actions.dismissToast} />
    </div>
  );
}

export default App;

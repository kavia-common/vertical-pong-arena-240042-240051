import { clamp } from "../utils/math";
import { makeId } from "../utils/ids";

const DEFAULT_SETTINGS = {
  audioEnabled: true,
  sfxEnabled: true,
  difficulty: "normal", // easy | normal | hard
  gameSpeed: 1,
  skins: {
    selectedId: "classic",
    owned: ["classic", "ocean", "amber"]
  }
};

const DEFAULT_PROFILE = {
  id: "local",
  displayName: "Player",
  elo: 1000,
  stats: {
    matches: 0,
    wins: 0,
    losses: 0
  }
};

const DEFAULT_LEADERBOARD = [
  { id: "l1", name: "AquaAce", elo: 1410 },
  { id: "l2", name: "TidalPro", elo: 1335 },
  { id: "l3", name: "AmberSpin", elo: 1260 }
];

// PUBLIC_INTERFACE
export function createAppStore({ persisted }) {
  /** Creates app store with state + actions + subscribe. */
  let state = {
    profile: persisted?.profile ?? DEFAULT_PROFILE,
    settings: persisted?.settings ?? DEFAULT_SETTINGS,
    local: {
      recentMatches: persisted?.local?.recentMatches ?? []
    },
    leaderboard: persisted?.leaderboard ?? DEFAULT_LEADERBOARD,
    connection: {
      status: "offline"
    },
    toasts: {
      items: []
    }
  };

  const listeners = new Set();

  const notify = () => {
    for (const fn of listeners) fn(state);
  };

  const setState = (updater) => {
    state = typeof updater === "function" ? updater(state) : updater;
    notify();
  };

  const actions = {
    // PUBLIC_INTERFACE
    updateSettings(patch) {
      /** Update settings (partial patch). */
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },

    // PUBLIC_INTERFACE
    selectSkin(skinId) {
      /** Select a skin that is owned. */
      setState((s) => {
        if (!s.settings.skins.owned.includes(skinId)) return s;
        return {
          ...s,
          settings: {
            ...s.settings,
            skins: { ...s.settings.skins, selectedId: skinId }
          }
        };
      });
    },

    // PUBLIC_INTERFACE
    updateProfile(patch) {
      /** Update local profile fields. */
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    },

    // PUBLIC_INTERFACE
    recordLocalMatch({ mode, result, scoreFor, scoreAgainst }) {
      /** Record match into local history and update simple stats. */
      setState((s) => {
        const match = {
          id: makeId("m_"),
          ts: Date.now(),
          mode,
          result,
          scoreFor,
          scoreAgainst
        };

        const stats = { ...s.profile.stats };
        stats.matches += 1;
        if (result === "win") stats.wins += 1;
        if (result === "loss") stats.losses += 1;

        const eloDelta = result === "win" ? 8 : result === "loss" ? -6 : 0;
        const elo = clamp((s.profile.elo ?? 1000) + eloDelta, 200, 3000);

        return {
          ...s,
          profile: { ...s.profile, elo, stats },
          local: {
            ...s.local,
            recentMatches: [match, ...s.local.recentMatches].slice(0, 20)
          }
        };
      });
    },

    // PUBLIC_INTERFACE
    setConnectionStatus(status) {
      /** Update network connection status string. */
      setState((s) => ({ ...s, connection: { ...s.connection, status } }));
    },

    // PUBLIC_INTERFACE
    pushToast({ message, kind = "info", id }) {
      /** Show a toast. */
      const toast = { id: id ?? makeId("t_"), message, kind };
      setState((s) => ({
        ...s,
        toasts: { items: [...s.toasts.items, toast].slice(-4) }
      }));
    },

    // PUBLIC_INTERFACE
    dismissToast(id) {
      /** Dismiss toast by id. */
      setState((s) => ({
        ...s,
        toasts: { items: s.toasts.items.filter((t) => t.id !== id) }
      }));
    },

    // PUBLIC_INTERFACE
    resetAllData() {
      /** Reset persisted state to defaults. */
      setState(() => ({
        profile: DEFAULT_PROFILE,
        settings: DEFAULT_SETTINGS,
        local: { recentMatches: [] },
        leaderboard: DEFAULT_LEADERBOARD,
        connection: { status: "offline" },
        toasts: { items: [] }
      }));
      try {
        localStorage.removeItem("vpa_state_v1");
      } catch {
        // ignore
      }
    }
  };

  return {
    // PUBLIC_INTERFACE
    getState() {
      /** Get current state snapshot. */
      return state;
    },
    // PUBLIC_INTERFACE
    subscribe(listener) {
      /** Subscribe to state updates. */
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actions,
    // Convenient slices (kept in sync via subscribe in useAppState hook usage pattern)
    get profile() {
      return state.profile;
    },
    get settings() {
      return state.settings;
    },
    get leaderboard() {
      return state.leaderboard;
    },
    get connectionState() {
      return state.connection;
    },
    get toasts() {
      return state.toasts;
    }
  };
}

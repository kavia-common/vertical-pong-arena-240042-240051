const KEY = "vpa_state_v1";

// PUBLIC_INTERFACE
export function loadPersistedState() {
  /** Load persisted app state from localStorage. */
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function persistState(state) {
  /** Persist selected state slices to localStorage (safe + minimal). */
  try {
    const toPersist = {
      profile: state.profile,
      settings: state.settings,
      local: state.local,
      leaderboard: state.leaderboard
    };
    localStorage.setItem(KEY, JSON.stringify(toPersist));
  } catch {
    // ignore
  }
}

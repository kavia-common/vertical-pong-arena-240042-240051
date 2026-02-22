import React, { useEffect, useMemo, useState } from "react";
import { AppContext } from "./context";
import { createAppStore } from "./store";
import { createConnectionManager } from "../net/connectionManager";
import { loadPersistedState, persistState } from "../storage/persistence";
import { getEnvConfig } from "../utils/env";

// PUBLIC_INTERFACE
export function AppProviders({ children }) {
  /** Provides global app state (profile, settings, leaderboards, connection, toasts). */
  const env = useMemo(() => getEnvConfig(), []);
  const [store] = useState(() => {
    const persisted = loadPersistedState();
    return createAppStore({ persisted });
  });

  const [connection] = useState(() =>
    createConnectionManager({
      env,
      onStatusChange: (status) => store.actions.setConnectionStatus(status),
      onToast: (t) => store.actions.pushToast(t)
    })
  );

  useEffect(() => {
    // Persist relevant slices to localStorage.
    const unsubscribe = store.subscribe((state) => {
      persistState(state);
    });
    return unsubscribe;
  }, [store]);

  useEffect(() => {
    // Connect in background; the UI works offline with local modes.
    connection.connect();
    return () => connection.disconnect();
  }, [connection]);

  const value = useMemo(() => ({ ...store, connection, env }), [store, connection, env]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

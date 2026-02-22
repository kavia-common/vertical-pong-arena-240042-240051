import { useContext } from "react";
import { AppContext } from "./context";

// PUBLIC_INTERFACE
export function useApp() {
  /** Read app state/actions from context. */
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within <AppProviders />");
  }
  return ctx;
}

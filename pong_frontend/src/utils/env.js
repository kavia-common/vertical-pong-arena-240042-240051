function safeStr(v) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function parseCSV(v) {
  const s = safeStr(v);
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

// PUBLIC_INTERFACE
export function getEnvConfig() {
  /** Read runtime build-time env vars (CRA: REACT_APP_*). */
  const apiBase = safeStr(process.env.REACT_APP_API_BASE) || safeStr(process.env.REACT_APP_BACKEND_URL);
  const wsUrl = safeStr(process.env.REACT_APP_WS_URL);
  const frontendUrl = safeStr(process.env.REACT_APP_FRONTEND_URL);

  return {
    apiBase,
    wsUrl,
    frontendUrl,
    nodeEnv: safeStr(process.env.REACT_APP_NODE_ENV) || "development",
    logLevel: safeStr(process.env.REACT_APP_LOG_LEVEL) || "info",
    healthcheckPath: safeStr(process.env.REACT_APP_HEALTHCHECK_PATH) || "/health",
    featureFlags: parseCSV(process.env.REACT_APP_FEATURE_FLAGS),
    experimentsEnabled: safeStr(process.env.REACT_APP_EXPERIMENTS_ENABLED) === "true"
  };
}

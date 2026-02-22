import { io } from "socket.io-client";

// PUBLIC_INTERFACE
export function createConnectionManager({ env, onStatusChange, onToast }) {
  /** Manages backend connectivity and a Socket.io connection (best-effort). */
  let socket = null;
  let connected = false;

  const setStatus = (status) => {
    onStatusChange?.(status);
  };

  const pingHealth = async () => {
    if (!env.apiBase) return false;
    try {
      const url = new URL(env.healthcheckPath || "/health", env.apiBase).toString();
      const res = await fetch(url, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  };

  const connectSocket = () => {
    if (!env.wsUrl) return;
    try {
      socket = io(env.wsUrl, {
        transports: ["websocket"],
        autoConnect: true
      });

      socket.on("connect", () => {
        connected = true;
        setStatus("connected");
      });
      socket.on("disconnect", () => {
        connected = false;
        setStatus("offline");
      });
      socket.on("connect_error", () => {
        connected = false;
        setStatus("offline");
      });

      // Stubs for future events:
      socket.on("match:update", () => {});
      socket.on("match:ended", () => {});
    } catch {
      // ignore
    }
  };

  return {
    // PUBLIC_INTERFACE
    async connect() {
      /** Connect: check REST health and attempt socket connection. */
      setStatus("connecting");

      const healthy = await pingHealth();
      if (healthy) {
        setStatus("connected");
      } else {
        setStatus("offline");
        onToast?.({
          kind: "info",
          message: "Backend not reachable. Local modes available."
        });
      }

      connectSocket();
    },

    // PUBLIC_INTERFACE
    disconnect() {
      /** Disconnect socket. */
      try {
        socket?.disconnect();
      } catch {
        // ignore
      }
      socket = null;
      connected = false;
      setStatus("offline");
    },

    // PUBLIC_INTERFACE
    getSocket() {
      /** Get socket instance (may be null). */
      return socket;
    },

    // PUBLIC_INTERFACE
    isConnected() {
      /** Whether socket is connected. */
      return connected;
    }
  };
}

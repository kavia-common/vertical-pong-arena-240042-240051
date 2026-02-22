import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export function ToastStack({ toasts, onDismiss }) {
  /** Small toast stack with auto-dismiss. */
  useEffect(() => {
    const timers = (toasts || []).map((t) =>
      setTimeout(() => onDismiss?.(t.id), 3500)
    );
    return () => timers.forEach((x) => clearTimeout(x));
  }, [toasts, onDismiss]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toastStack" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 600 }}>
              {t.kind === "error" ? "Error" : t.kind === "success" ? "Success" : "Info"}
            </div>
            <button
              className="btn btnSmall"
              style={{ pointerEvents: "auto" }}
              onClick={() => onDismiss?.(t.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
          <div style={{ marginTop: 6, opacity: 0.92 }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

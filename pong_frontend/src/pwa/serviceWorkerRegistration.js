/* Minimal SW registration (CRA-compatible).
   If no service-worker.js exists in build output, this does nothing harmful. */

// PUBLIC_INTERFACE
export function registerServiceWorker() {
  /** Register service worker in production to enable offline cache + update prompts. */
  if (process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        // Listen for updates: new SW installed and waiting
        reg.onupdatefound = () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.onstatechange = () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              // Basic UX: reload to update (no prompt for now)
              // eslint-disable-next-line no-console
              console.info("New content available; please refresh.");
            }
          };
        };
      })
      .catch(() => {
        // ignore
      });
  });
}

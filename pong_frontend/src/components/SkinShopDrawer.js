import React, { useMemo } from "react";

const SKINS = [
  { id: "classic", name: "Classic", desc: "High contrast arcade." },
  { id: "ocean", name: "Ocean", desc: "Blue gradients, calm glow." },
  { id: "amber", name: "Amber", desc: "Warm highlights, fast feel." }
];

// PUBLIC_INTERFACE
export function SkinShopDrawer({ open, onClose, skinState, onSelectSkin }) {
  /** Drawer to pick visual skin (local). */
  const items = useMemo(() => {
    const owned = skinState?.owned ?? ["classic"];
    return SKINS.map((s) => ({ ...s, owned: owned.includes(s.id) }));
  }, [skinState?.owned]);

  const selected = skinState?.selectedId ?? "classic";

  return (
    <aside className={`drawer ${open ? "drawerOpen" : ""}`} aria-label="Skin shop drawer">
      <div className="drawerHeader">
        <strong>Skins</strong>
        <button className="btn btnSmall" onClick={onClose} aria-label="Close skins">
          Close
        </button>
      </div>
      <div className="drawerBody">
        <div className="p" style={{ marginBottom: 12 }}>
          Choose a look for paddles/ball and UI accents. (Local for now.)
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {items.map((s) => (
            <div key={s.id} className="card">
              <div className="cardHeader">
                <div>
                  <div className="h2">{s.name}</div>
                  <div className="p">{s.desc}</div>
                </div>
                <div className="row">
                  {!s.owned ? (
                    <button className="btn btnSmall" disabled title="Shop coming soon">
                      Locked
                    </button>
                  ) : (
                    <button
                      className={`btn btnSmall ${selected === s.id ? "btnAmber" : ""}`}
                      onClick={() => onSelectSkin?.(s.id)}
                    >
                      {selected === s.id ? "Selected" : "Select"}
                    </button>
                  )}
                </div>
              </div>
              <div className="row">
                <span className="navPill">
                  Status: <strong style={{ marginLeft: 6 }}>{s.owned ? "Owned" : "Locked"}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

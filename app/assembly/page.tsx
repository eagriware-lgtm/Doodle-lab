"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  mode: string;
  title: string;
  data: string;
};

function readAll(): Item[] {
  try {
    const saved = localStorage.getItem("doodle-files");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readPieces(): Item[] {
  return readAll().filter((item) => item.mode !== "Assembly");
}

function Header() {
  return (
    <header className="nav">
      <a className="brand" href="/">
        <span className="brandMark">✦</span>
        <span>Doodle <i>Lab</i></span>
      </a>
      <nav className="links">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/modes">Modes</a>
        <a href="/settings">Settings</a>
      </nav>
      <a className="navCta" href="/assembly">Assembly</a>
    </header>
  );
}

function ItemCard({ item }: { item: Item }) {
  const isImage = item.data.startsWith("data:image/");

  return (
    <div className="card">
      <div className="icon">✦</div>
      <h2>{item.title}</h2>
      <p>{item.mode}</p>
      {isImage ? (
        <img
          src={item.data}
          alt={item.title}
          style={{
            width: "100%",
            height: 180,
            objectFit: "contain",
            background: "#fffdf9",
            borderRadius: 12,
          }}
        />
      ) : (
        <small>
          {item.data.length > 140 ? `${item.data.slice(0, 140)}…` : item.data}
        </small>
      )}
    </div>
  );
}

export default function Assembly() {
  const [items, setItems] = useState<Item[]>([]);
  const [saved, setSaved] = useState("");

  const refresh = () => setItems(readPieces());

  useEffect(() => {
    refresh();
  }, []);

  function clearAssembly() {
    const remaining = readAll().filter((item) => item.mode !== "Assembly");
    localStorage.setItem("doodle-files", JSON.stringify(remaining));
    refresh();
    setSaved("");
  }

  function saveAssembly() {
    if (!items.length) return;

    const all = readAll().filter((item) => item.mode !== "Assembly");
    const assembly: Item = {
      id: Date.now().toString(),
      mode: "Assembly",
      title: "Assembly Snapshot",
      data: JSON.stringify(items),
    };

    localStorage.setItem(
      "doodle-files",
      JSON.stringify([assembly, ...all].slice(0, 50)),
    );

    setSaved("Saved ✓");
    setTimeout(() => setSaved(""), 1400);
  }

  const hasItems = items.length > 0;

  return (
    <div className="shell">
      <Header />
      <main className="page">
        <span className="badge">🧩 Assembly</span>
        <h1>Put everything together.</h1>
        <p>Bring saved work from every Doodle Lab mode into one workspace.</p>

        <section className="panel" style={{ marginTop: 28 }}>
          {!hasItems ? (
            <div>
              <h2>Your assembly is empty.</h2>
              <p>
                Use Save to File in Drawing, Presentation, Teaching, or Machine
                Building to add work here.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2>Saved pieces</h2>
                  <p>
                    {items.length} item{items.length === 1 ? "" : "s"} ready to
                    assemble.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={saveAssembly}>
                    📁 {saved || "Save Assembly"}
                  </button>
                  <button type="button" onClick={clearAssembly}>
                    Clear assembly
                  </button>
                </div>
              </div>

              <div className="grid" style={{ marginTop: 20 }}>
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

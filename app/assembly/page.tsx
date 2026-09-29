"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  mode: string;
  title: string;
  data: string;
};

function readItems(): Item[] {
  try {
    const saved = localStorage.getItem("doodle-files");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Header() {
  return (
    <header className="nav">
      <a className="brand" href="/">
        <span className="brandMark">✦</span>
        <span>
          Doodle <i>Lab</i>
        </span>
      </a>

      <nav className="links">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/modes">Modes</a>
        <a href="/settings">Settings</a>
      </nav>

      <a className="navCta" href="/assembly">
        Assembly
      </a>
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
          {item.data.length > 140
            ? `${item.data.slice(0, 140)}…`
            : item.data}
        </small>
      )}
    </div>
  );
}

export default function Assembly() {
  const [items, setItems] = useState<Item[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setItems(readItems());
  }, []);

  function clearAssembly() {
    localStorage.removeItem("doodle-files");
    setItems([]);
    setSaved("");
  }

  function saveAssembly() {
    if (!items.length) return;

    const files = readItems();
    const assembly = {
      id: Date.now().toString(),
      mode: "Assembly",
      title: "Assembly",
      data: JSON.stringify(
        items.map(({ id, mode, title, data }) => ({ id, mode, title, data })),
      ),
    };

    localStorage.setItem(
      "doodle-files",
      JSON.stringify([assembly, ...files].slice(0, 50)),
    );
    setItems(readItems());
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
                    📁 {saved || "Save to File"}
                  </button>
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

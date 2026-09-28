"use client";

import { useState } from "react";

type Slide = { title: string; body: string };

export default function Presentation() {
  const [slides, setSlides] = useState<Slide[]>([
    { title: "Welcome to Doodle Lab", body: "Draw. Create. Learn." },
  ]);
  const [active, setActive] = useState(0);

  const add = () => {
    const next = [...slides, { title: "New slide", body: "Add your content here." }];
    setSlides(next);
    setActive(next.length - 1);
  };

  const update = (key: "title" | "body", value: string) =>
    setSlides((v) => v.map((s, i) => (i === active ? { ...s, [key]: value } : s)));

  const saveFile = () => {
    const files = JSON.parse(localStorage.getItem("doodle-files") || "[]");
    files.unshift({
      id: Date.now().toString(),
      mode: "Presentation",
      title: slides[active]?.title || "Presentation",
      data: JSON.stringify(slides),
    });
    localStorage.setItem("doodle-files", JSON.stringify(files.slice(0, 50)));
  };

  const exportPdf = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;

    const pages = slides
      .map(
        (slide, index) => `
          <section class="slide">
            <div class="number">0${index + 1}</div>
            <h1>${escapeHtml(slide.title)}</h1>
            <p>${escapeHtml(slide.body).replace(/\n/g, "<br />")}</p>
            <footer>Doodle Lab · Presentation</footer>
          </section>
        `,
      )
      .join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Doodle Lab Presentation</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: landscape; margin: 0; }
            body { margin: 0; background: #eeebe4; color: #20211f; font-family: Arial, sans-serif; }
            .slide {
              width: 100vw;
              height: 100vh;
              min-height: 100vh;
              padding: 8vw;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: #fffdf9;
              page-break-after: always;
            }
            .slide:last-child { page-break-after: auto; }
            .number { position: absolute; top: 6%; right: 8%; color: #999; font: 12px monospace; }
            h1 { margin: 0; max-width: 85%; font-size: clamp(42px, 7vw, 86px); line-height: 1.02; letter-spacing: -0.05em; }
            p { margin: 28px 0 0; max-width: 80%; color: #6f6d66; font-size: clamp(20px, 3vw, 34px); line-height: 1.5; }
            footer { position: absolute; bottom: 6%; left: 8%; color: #999; font: 10px monospace; text-transform: uppercase; letter-spacing: .12em; }
          </style>
        </head>
        <body>${pages}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onafterprint = () => printWindow.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const remove = () => {
    if (slides.length === 1) return;
    const next = slides.filter((_, i) => i !== active);
    setSlides(next);
    setActive(Math.max(0, Math.min(active, next.length - 1)));
  };

  return (
    <div className="presentationApp">
      <header className="presentationTop">
        <a className="brand" href="/">
          <span className="brandMark">✦</span>
          <span>
            Doodle <i>Lab</i>
          </span>
        </a>

        <div className="presentationActions">
          <button className="newSlide" onClick={add}>＋ New slide</button>
          <button className="topAction" onClick={saveFile}>📁 Save to File</button>
          <button className="topAction" onClick={exportPdf}>📄 Export PDF</button>
          <button className="topAction" onClick={remove}>Delete</button>
        </div>
      </header>

      <div className="presentationLayout">
        <aside className="slideRail">
          {slides.map((s, i) => (
            <button
              className={"slideThumb " + (i === active ? "selected" : "")}
              onClick={() => setActive(i)}
              key={i}
            >
              <span>{i + 1}</span>
              <div>
                <strong>{s.title || "Untitled"}</strong>
                <small>{s.body || "Empty slide"}</small>
              </div>
            </button>
          ))}
        </aside>

        <main className="presentationMain">
          <div className="presentationMeta">
            <div>
              <span className="badge">Presentation Mode</span>
              <p>Slide {active + 1} of {slides.length}</p>
            </div>
            <div className="metaHint">16:9 · Full page canvas</div>
          </div>

          <section className="fullSlide">
            <div className="slideNumber">0{active + 1}</div>
            <input
              className="slideTitle"
              value={slides[active].title}
              onChange={(e) => update("title", e.target.value)}
              aria-label="Slide title"
            />
            <textarea
              className="slideBody"
              value={slides[active].body}
              onChange={(e) => update("body", e.target.value)}
              aria-label="Slide content"
            />
            <div className="slideFooter">Doodle Lab · Presentation</div>
          </section>
        </main>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

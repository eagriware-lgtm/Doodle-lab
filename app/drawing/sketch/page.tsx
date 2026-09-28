"use client";

import { useRef, useState } from "react";

type Tool = "horizontal" | "vertical" | "rectangle" | "circle" | "arrow";

export default function Sketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("horizontal");
  const [color, setColor] = useState("#20211f");
  const [note, setNote] = useState("");

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();

    if (tool === "horizontal") {
      ctx.moveTo(x - 90, y);
      ctx.lineTo(x + 90, y);
    } else if (tool === "vertical") {
      ctx.moveTo(x, y - 90);
      ctx.lineTo(x, y + 90);
    } else if (tool === "rectangle") {
      ctx.rect(x - 70, y - 45, 140, 90);
    } else if (tool === "circle") {
      ctx.arc(x, y, 55, 0, Math.PI * 2);
    } else {
      ctx.moveTo(x - 80, y + 35);
      ctx.lineTo(x + 80, y - 35);
      ctx.moveTo(x + 80, y - 35);
      ctx.lineTo(x + 55, y - 40);
      ctx.moveTo(x + 80, y - 35);
      ctx.lineTo(x + 60, y - 5);
    }

    ctx.stroke();
  };

  const addNote = () => {
    if (!note.trim()) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.font = "700 28px sans-serif";
    ctx.fillText(note.trim(), 70, 90);
    setNote("");
  };

  return (
    <div className="shell">
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
      </header>

      <main className="workspace sketchPage">
        <span className="badge">✎ Sketch</span>
        <h1>Think on paper.</h1>
        <p>Draw diagrams, mechanisms, shapes, arrows, and notes.</p>

        <div className="sketchToolbar">
          <button className={tool === "horizontal" ? "active" : ""} onClick={() => setTool("horizontal")}>━ Horizontal</button>
          <button className={tool === "vertical" ? "active" : ""} onClick={() => setTool("vertical")}>┃ Standing</button>
          <button className={tool === "rectangle" ? "active" : ""} onClick={() => setTool("rectangle")}>□ Rectangle</button>
          <button className={tool === "circle" ? "active" : ""} onClick={() => setTool("circle")}>○ Circle</button>
          <button className={tool === "arrow" ? "active" : ""} onClick={() => setTool("arrow")}>↗ Arrow</button>
          <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder="Add a note" />
          <button onClick={addNote}>T Text</button>
          <input aria-label="Sketch color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <div className="sketchCanvas">
          <canvas
            ref={canvasRef}
            width={1400}
            height={760}
            onPointerDown={draw}
          />
        </div>
      </main>
    </div>
  );
}
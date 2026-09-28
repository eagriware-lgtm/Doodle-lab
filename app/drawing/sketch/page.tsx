"use client";

import { useEffect, useRef, useState } from "react";

type Tool = "horizontal" | "vertical" | "rectangle" | "circle" | "arrow" | "pen";

export default function Sketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("horizontal");
  const [color, setColor] = useState("#20211f");
  const [size, setSize] = useState(4);
  const [note, setNote] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const position = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const style = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const s = start.current;
    ctx.beginPath();

    if (tool === "horizontal") {
      ctx.moveTo(x - 110, y);
      ctx.lineTo(x + 110, y);
    } else if (tool === "vertical") {
      ctx.moveTo(x, y - 110);
      ctx.lineTo(x, y + 110);
    } else if (tool === "rectangle") {
      ctx.rect(x - 75, y - 50, 150, 100);
    } else if (tool === "circle") {
      ctx.arc(x, y, 58, 0, Math.PI * 2);
    } else if (tool === "arrow") {
      ctx.moveTo(x - 90, y + 45);
      ctx.lineTo(x + 90, y - 45);
      ctx.moveTo(x + 90, y - 45);
      ctx.lineTo(x + 58, y - 50);
      ctx.moveTo(x + 90, y - 45);
      ctx.lineTo(x + 65, y - 12);
    } else {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  };

  const pointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = position(e);
    start.current = p;
    drawing.current = true;

    if (tool !== "pen") {
      const ctx = canvasRef.current!.getContext("2d")!;
      style(ctx);
      drawShape(ctx, p.x, p.y);
      drawing.current = false;
    }
  };

  const pointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || tool !== "pen") return;
    const p = position(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    style(ctx);
    ctx.beginPath();
    ctx.moveTo(start.current.x, start.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    start.current = p;
  };

  const pointerUp = () => {
    drawing.current = false;
  };

  const addNote = () => {
    if (!note.trim()) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    style(ctx);
    ctx.font = "700 28px sans-serif";
    ctx.fillText(note.trim(), 70, 90);
    setNote("");
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#fffdf9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const tools: [Tool, string][] = [
    ["horizontal", "━ Horizontal"],
    ["vertical", "┃ Standing"],
    ["rectangle", "□ Rectangle"],
    ["circle", "○ Circle"],
    ["arrow", "↗ Arrow"],
    ["pen", "✎ Free draw"],
  ];

  return (
    <div className="shell">
      <header className="nav">
        <a className="brand" href="/"><span className="brandMark">✦</span><span>Doodle <i>Lab</i></span></a>
        <nav className="links">
          <a href="/">Home</a><a href="/projects">Projects</a><a href="/modes">Modes</a><a href="/settings">Settings</a>
        </nav>
      </header>

      <main className="workspace sketchPage">
        <span className="badge">✎ Sketch</span>
        <h1>Think on paper.</h1>
        <p>Pick a tool, then click or drag directly on the canvas.</p>

        <div className="sketchToolbar">
          {tools.map(([id, label]) => (
            <button key={id} className={tool === id ? "active" : ""} onClick={() => setTool(id)}>{label}</button>
          ))}
          <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder="Add a note" />
          <button onClick={addNote}>T Text</button>
          <label className="sketchColor">🎨 <input aria-label="Sketch color" type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
          <label className="sketchSize">Size <input type="range" min="1" max="16" value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
          <button onClick={clearCanvas}>Clear</button>
        </div>

        <div className="sketchCanvas">
          <canvas
            ref={canvasRef}
            width={1400}
            height={760}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
            onPointerLeave={pointerUp}
          />
        </div>
      </main>
    </div>
  );
}
# Doodle Lab 🎨🧪

> Draw. Create. Learn.

Doodle Lab is a creative workspace for drawing, presenting, teaching, machine building, and AI-assisted ideas.

## Modes

### 🎨 Drawing Mode
- Pencil
- Brush
- Fill bucket
- Eraser
- Text
- Color selection
- Brush size
- Photo import
- Video import
- AI assistance

### 🖥️ Presentation Mode
- Multiple slides
- Slide selection
- Editable titles and content
- New and delete slide controls
- 16:9 presentation canvas

### 👨‍🏫 Teaching Mode
A workspace for explaining ideas, lessons, diagrams, and learning concepts.

### ⌁ Machine Building
- Cube, cylinder, gear, sphere, and prism
- Rotating 3D preview
- Pause / auto rotation
- Full-screen view
- Sketch workspace

### 🤖 AI Mode
AI-assisted workspace for questions, ideas, and responses.

## ✎ Sketch

Route: /drawing/sketch

Tools:
- Horizontal line
- Standing/vertical line
- Rectangle
- Circle
- Arrow
- Free drawing
- Text notes
- Color picker
- Line size
- Clear canvas

The canvas supports mouse, touch, and pointer input.

## 🌗 Theme

Doodle Lab supports Light and Dark mode. The selected theme is stored locally in the browser.

## Routes

| Route | Page |
|---|---|
| / | Home |
| /projects | Projects |
| /modes | Modes |
| /settings | Settings |
| /drawing | Drawing Mode |
| /drawing/sketch | Sketch |
| /presentation | Presentation Mode |
| /teaching | Teaching Mode |
| /cad | Machine Building |
| /ai | AI Mode |

## Tech Stack

- Next.js
- React
- TypeScript
- CSS
- GitHub
- Vercel-ready deployment

## Run locally

Install dependencies:

    npm install

Start the development server:

    npm run dev

Open http://localhost:3000

Production build:

    npm run build
    npm start

## Backup / Recovery

This GitHub repository is the source-of-truth backup for Doodle Lab.

If the deployed website is deleted or broken:

1. Open this GitHub repository.
2. Check the main branch.
3. Use Git history to recover an earlier working version if needed.
4. Reconnect the repository to the deployment platform.
5. Deploy the main branch again.

Keep Git history intact so previous working versions remain recoverable.

## Project Structure

    Doodle-lab/
    ├── app/
    │   ├── ai/
    │   ├── api/
    │   ├── cad/
    │   ├── drawing/
    │   │   └── sketch/
    │   ├── presentation/
    │   ├── projects/
    │   ├── settings/
    │   ├── teaching/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── next.config.ts
    ├── next-env.d.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md

## Backup Rule

Before major changes, create a Git commit. That way the previous working version remains recoverable.

---

**Doodle Lab — Draw. Create. Learn.**

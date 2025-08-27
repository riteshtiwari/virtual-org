# Virtual Org — Multi‑Agent Design Critique (POC)

This is a minimal proof‑of‑concept for your “virtual software company” panel focused on **Design Critique of a Figma file**. It runs 3–5 role‑based AI agents (Senior Designer, Accessibility Specialist, Devil’s Advocate PM, optional SME/UX Researcher), orchestrates a short debate, and produces structured outputs:
- **Summary**
- **Top Findings** (with area, severity, recommendation)
- **Open Questions**
- **Actions** (owner + title)
- **Transcript** of the panel

## Quick Start

1) **Requirements**
- Node.js 18+
- An OpenAI API key

2) **Setup**
```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY
npm install
npm run dev
# Open http://localhost:5173
```

3) **How it works**
- The web form lets you paste a Figma link (optional), give context, select personas and sliders (harshness / innovation bias / time horizon).
- The server orchestrates 3 stages:
  1. **Individual reviews** per persona (structured JSON).
  2. **One debate round** (support/refute/clarify).
  3. **Synthesis** by a Scribe agent into the final output schema.
- The output JSON is shown on the page and downloadable.

## Environment

Set the following in `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini    # optional override
PORT=5173                   # optional
```

## Notes

- This POC is **text‑only** (asynchronous). Voice/Meet integration can be added later.
- Figma is **optional** in POC. In v2, add a Figma Plugin + REST integration for node‑level checks and auto‑commenting.
- Costs: Keep persona count to 3 for fast, low‑cost tests. Add SME/Researcher only when needed.
- The orchestrator enforces evidence‑or‑opinion tags to reduce hallucinations.

## Extending

- Add more personas in `src/personas.js` (e.g., Systems Architect, UX Researcher, SME).
- Strengthen evidence by ingesting your **Design System, WCAG AA** and **heuristics** into the prompt context or a RAG store.
- Post results to Jira/Linear; export to Markdown/PDF; later, add a Figma Plugin button “Summon Virtual Panel”.

---

© You. For demo use only.

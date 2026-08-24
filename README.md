# Document Summary Assistant

Upload a PDF or a scanned image and get back an AI-generated summary — short, medium, or long — plus a bulleted list of key points. Built with a **React (Vite)** frontend and a **Node.js/Express** backend.

**Live demo:** _add your deployed URL here_
**Repo:** _add your GitHub URL here_

---

## Approach (write-up, ~200 words)

The app is a two-service system: a stateless Express API and a Vite/React SPA. Documents never touch disk — Multer buffers the upload in memory, text is extracted, and the buffer is discarded.

For **text extraction**, PDFs are parsed with `unpdf` (a maintained `pdf.js` wrapper — more robust than older `pdf-parse` on real-world PDFs), and images go through **Tesseract.js** for OCR, entirely in Node with no external binary dependency.

For **summarization**, the backend calls **Google Gemini's free tier** (`gemini-2.0-flash`) when `GEMINI_API_KEY` is set, prompting it for a length-controlled summary plus key points in a fixed, parseable format. If no key is configured, or the API call fails for any reason, the app **transparently falls back to a local extractive summarizer** — a dependency-free TF-based sentence scorer — so the project runs end-to-end with zero paid services and zero setup.

Error handling is layered: Multer validates file type/size, a `Promise.race` timeout guards OCR against hung network calls, a global Express error handler normalizes all failures into JSON, and process-level guards keep the server alive even if a worker thread misbehaves. The frontend shows drag-and-drop upload, a length selector, and loading/error states throughout.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| PDF parsing | `unpdf` |
| OCR | `tesseract.js` |
| Summarization | Google Gemini (free tier) → local extractive fallback |
| File handling | Multer (in-memory, no disk writes) |

## Features (per assignment spec)

- ✅ Drag-and-drop **and** click-to-browse upload (PDF, PNG, JPEG, WebP)
- ✅ PDF text extraction
- ✅ OCR for scanned images
- ✅ Short / medium / long summary length options
- ✅ Key-points extraction, highlighted separately from the summary
- ✅ Loading states + inline error messages
- ✅ Mobile-responsive UI
- ✅ Works with **zero API keys** (local fallback) or with a free-tier Gemini key
- ✅ Basic error handling: bad file type, oversized file, empty/garbled OCR, network failure, API failure

---

## Project Structure

```
document-summary-assistant/
├── backend/
│   ├── server.js                     # Express app entry point
│   ├── src/
│   │   ├── routes/summarize.js       # POST /api/summarize
│   │   ├── services/extractText.js   # PDF + OCR extraction
│   │   ├── services/summarize.js     # Gemini call + fallback dispatch
│   │   ├── utils/extractiveSummarizer.js  # dependency-free summarizer
│   │   └── middleware/               # multer config, error handler
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/                # UploadZone, SummaryControls, SummaryResult, Loader
    │   └── api/client.js              # fetch wrapper for the API
    └── .env.example
```

---

## Running Locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # optionally add GEMINI_API_KEY — works without it too
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`, upload a PDF or image, pick a summary length, and click **Generate**.

### Getting a free Gemini API key (optional)

1. Go to https://aistudio.google.com/apikey
2. Create a key (free tier — no billing required)
3. Put it in `backend/.env` as `GEMINI_API_KEY=...`

Without a key, summaries are generated locally using the built-in extractive summarizer — the app still works fully, just with a simpler (non-generative) summary.

---

## Deployment

**Backend → Render (or Railway/Fly.io)**
1. Push this repo to GitHub.
2. Render → New Web Service → connect the repo → set root directory to `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add env vars: `GEMINI_API_KEY` (optional), `CLIENT_ORIGIN=<your-vercel-url>`.

**Frontend → Vercel (or Netlify)**
1. Vercel → New Project → import the repo → set root directory to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
3. Add env var: `VITE_API_BASE_URL=<your-render-backend-url>`.
4. Redeploy once the backend URL is live, and update `CLIENT_ORIGIN` on the backend to match your final Vercel URL.

---

## Notes & Trade-offs

- Files are processed in memory and never persisted — good for privacy and for stateless hosting, but means very large PDFs are limited by available RAM (capped at 15MB by default, configurable via `MAX_UPLOAD_MB`).
- OCR quality depends on image clarity; very low-res or skewed scans will produce noisier text (and noisier summaries).
- The extractive fallback is intentionally simple (word-frequency sentence scoring) so the project has **zero mandatory external dependencies** to demonstrate working end-to-end, per the assignment's "any free tier" / time-boxed constraint.

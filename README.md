<<<<<<< HEAD
**ADA-Compliance-Checker**
=======
ADA Compliance Checker
A lightweight full-stack app that checks pasted or uploaded HTML for common accessibility issues and highlights the exact offending elements in a live preview.

🚀 Demo flow (how it works)
1. Paste or upload HTML → click Submit
2. The app shows a list of violations (rule, message, element, selector, code snippet)
3. Click any violation → the element flashes inside the preview (via CSS selector)

🧰 Stack
- **Frontend:** JavaScript (**TypeScript**) — React (Vite). Built with Vite; the TypeScript is compiled to plain JavaScript for the browser.
- **Backend:** Python, FastAPI, BeautifulSoup (`lxml`)
- **API:** `POST /api/check` → returns `issues[]`
> Note: The UI code is written in TypeScript but compiled to JavaScript during build (`npm run build`).


🏗️ Project Structure
frontend/
  src/
    components/HtmlInput.tsx  components/HtmlPreview.tsx  components/ResultsList.tsx
    lib/highlight.ts  App.tsx  index.css  main.tsx
  index.html  (vite + tailwind configs)
backend/
  app.py
  rules/ (doc_rules.py, image_rules.py, link_rules.py, heading_rules.py, contrast.py)
  utils/dom.py
  requirements.txt
README.md

⚙️ Setup & Run
1) Backend (FastAPI)
**from repo root**
cd backend
python3 -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r requirements.txt

**start from the repo root so package imports resolve**
cd ..
uvicorn backend.app:app --reload --port 8000

2) Frontend (Vite + React + Tailwind)
cd frontend
npm install
**Tailwind v3 setup (recommended for this project)**
npm i -D tailwindcss@3.4.10 postcss@8 autoprefixer@10
npm run dev

🔌 API Contract
Request
POST /api/check
Content-Type: application/json
{ "html": "<!doctype html><html>...</html>" }
Response
{
  "issues": [
    {
      "ruleId": "COLOR_CONTRAST",
      "message": "Low contrast ratio: 1.98. Minimum expected is 3.0.",
      "element": "h1",
      "selector": "html > body > h1:nth-of-type(1)",
      "codeSnippet": "<h1 style=\"...\">Welcome</h1>"
    }
  ]
}

🔌 API Contract
1) General Document
DOC_LANG_MISSING — <html> must include a non-empty lang.
DOC_TITLE_MISSING — <title> must exist and contain text.
COLOR_CONTRAST — inline-style only; required ratios: ≥4.5:1 normal, ≥3.0:1 large (≥18px, or ≥14px bold).
2) Images
IMG_ALT_MISSING — flags when alt is missing or empty (alt="").
IMG_ALT_LENGTH — flags when alt length > 120 characters.
3) Links
LINK_GENERIC_TEXT — flags “click here”, “read more”, “here”, “more”, “learn more”, etc.
4) Headings
HEADING_ORDER — no skipping levels (e.g., h1 → h3).
HEADING_MULTIPLE_H1 — only one <h1> per page.
Notes/limits: Contrast is computed from inline style only (with simple ancestor background fallback). External CSS, images, gradients, and computed styles are out of scope by design for this assignment. Large text detection uses inline font-size and font-weight.

🧪 Sample HTML (triggers all rules)
<!doctype html>
<html>
  <head>
    <title></title> <!-- DOC_TITLE_MISSING -->
  </head>
  <!-- DOC_LANG_MISSING: no lang on <html> -->
  <body>
    <h1 style="color: lightgreen; background: green; font-size:22px;">
      Welcome to Our Site
    </h1> <!-- COLOR_CONTRAST (large text) -->

    <h3>Our Services</h3> <!-- HEADING_ORDER (skips h2) -->

    <img src="/images/hero.jpg" alt=""> <!-- IMG_ALT_MISSING (empty alt) -->
    <img src="/images/chart.png" alt="Quarterly earnings chart for our organization with multiple series across twelve months showing comparative performance between regions; decorative elements include subtle gradients and annotations that are not essential for understanding."> <!-- IMG_ALT_LENGTH -->

    <p>To learn more, <a href="/more">click here</a>.</p> <!-- LINK_GENERIC_TEXT -->

    <h1>Another Main Section</h1> <!-- HEADING_MULTIPLE_H1 -->
  </body>
</html>


🔍 How highlighting works
The backend builds a stable CSS selector using nth-of-type.
The frontend renders HTML into an iframe (srcdoc) and queries that selector to flash an outline on the target element.

✨ Innovative Features
Click-to-highlight with stable nth-of-type selectors.
Compact code snippets in each issue for context.
“Load Sample” button for instant demo.
Strict but focused rule set; inline contrast math for deterministic results.

👤 Author
Adriana Bazan — GitHub: @bazanadriana
>>>>>>> ddc6951 (feat: initial import)

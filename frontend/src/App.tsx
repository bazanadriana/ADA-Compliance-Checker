// frontend/src/App.tsx
import { useState } from "react";
import HtmlInput from "./components/HtmlInput";
import ResultsList from "./components/ResultsList";
import type { Issue } from "./components/ResultsList";
import HtmlPreview from "./components/HtmlPreview";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function App() {
  const [html, setHtml] = useState<string>("");            // source HTML
  const [issues, setIssues] = useState<Issue[]>([]);       // server results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);

  async function runCheck() {
    setLoading(true);
    setError(null);
    setSelectedSelector(null);
    setIssues([]);
    try {
      const res = await fetch(`${API_URL}/api/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">ADA Compliance Checker</h1>
          <a
            className="text-sm text-blue-600 hover:underline"
            href="https://www.w3.org/WAI/standards-guidelines/wcag/"
            target="_blank"
          >
            WCAG reference
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <HtmlInput
            value={html}
            onChange={setHtml}
            onSubmit={runCheck}
            loading={loading}
          />

          <div className="rounded-xl border bg-white">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">Identified Issues</h2>
              {loading ? (
                <span className="text-sm text-slate-500">Checking…</span>
              ) : (
                <span className="text-sm text-slate-500">
                  {issues.length} result{issues.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b">
                {error}
              </div>
            )}

            <ResultsList
              issues={issues}
              onSelect={(i) => setSelectedSelector(i.selector)}
            />
          </div>
        </section>

        <section className="rounded-xl border overflow-hidden bg-white">
          <div className="px-4 py-3 border-b">
            <h2 className="text-base font-semibold">Preview</h2>
            <p className="text-xs text-slate-500">
              Clicking an issue will highlight the matching element.
            </p>
          </div>
          <HtmlPreview html={html} highlightSelector={selectedSelector} />
        </section>
      </main>
    </div>
  );
}

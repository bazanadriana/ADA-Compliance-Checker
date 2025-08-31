// frontend/src/components/HtmlPreview.tsx
import React, { useEffect, useRef } from "react";
import { flashHighlight } from "../lib/highlight";  // ← keep this path

export default function HtmlPreview({
  html,
  highlightSelector,
}: {
  html: string;
  highlightSelector: string | null;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc =
      html ||
      "<!doctype html><html><body><p style='color:#666'>Preview will render here…</p></body></html>";
  }, [html]);

  useEffect(() => {
    if (!highlightSelector) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const el = doc.querySelector(highlightSelector) as HTMLElement | null;
    if (el) {
      flashHighlight(el);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightSelector]);

  return (
    <div className="h-[600px] bg-[rgb(var(--panel))]">
      <iframe
        ref={iframeRef}
        title="HTML preview"
        className="w-full h-full bg-white"
        sandbox="allow-same-origin allow-forms allow-scripts"
      />
    </div>
  );
}

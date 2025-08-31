import React, { useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

const SAMPLE = `<!doctype html>
<html>
<head>
  <title></title>
</head>
<body>
  <h1 style="color: lightgreen; background: green;">Welcome</h1>
  <h3>Our Services</h3>
  <img src="/logo.png">
  <p>To learn more, <a href="/more">click here</a>.</p>
</body>
</html>`;

export default function HtmlInput({ value, onChange, onSubmit, loading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    const text = await f.text();
    onChange(text);
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-base font-semibold">Input HTML Code</h2>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded border hover:bg-slate-50"
            onClick={() => onChange(SAMPLE)}
            type="button"
          >
            Load Sample
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".html,.htm,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <button
            className="text-xs px-3 py-1.5 rounded border hover:bg-slate-50"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            Upload File
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={onSubmit}
            disabled={loading}
            type="button"
          >
            {loading ? "Checking…" : "Submit"}
          </button>
        </div>
      </div>

      <textarea
  className="w-full h-[360px] p-3 font-mono text-sm outline-none rounded-b-xl
             bg-white text-slate-900 placeholder:text-slate-400 border-t"
  style={{ colorScheme: "light" }}           // <— keep form control light even in OS dark mode
  placeholder="Paste HTML here…"
  spellCheck={false}
  value={value}
  onChange={(e) => onChange(e.target.value)}
/>
    </div>
  );
}

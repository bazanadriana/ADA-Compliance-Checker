// frontend/src/components/ResultsList.tsx
import React from "react";

export type Issue = {
  ruleId: string;
  message: string;
  element: string;
  selector: string;
  codeSnippet: string;
};

const RULE_LABELS: Record<string, string> = {
  COLOR_CONTRAST: "Low Contrast",
  DOC_LANG_MISSING: "Language",
  DOC_TITLE_MISSING: "Title",
  IMG_ALT_MISSING: "Alt Missing",
  IMG_ALT_LENGTH: "Alt Too Long",
  LINK_GENERIC_TEXT: "Generic Link",
  HEADING_ORDER: "Heading Order",
  HEADING_MULTIPLE_H1: "Multiple H1",
};

export default function ResultsList({
  issues,
  onSelect,
}: {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
}) {
  if (!issues.length) {
    return (
      <div className="px-4 py-6 text-sm text-slate-500">
        No issues yet. Paste HTML and click <b>Submit</b>.
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {issues.map((it: Issue, idx: number) => (
        <li
          key={idx}
          className="p-4 hover:bg-slate-50 cursor-pointer"
          onClick={() => onSelect(it)}
          title="Click to highlight in preview"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {RULE_LABELS[it.ruleId] ?? it.ruleId}
            </span>
            <span className="text-xs text-slate-500">
              Element: &lt;{it.element}&gt;
            </span>
          </div>
          <p className="mt-1 text-sm">{it.message}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            Selector:{" "}
            <code className="bg-slate-100 rounded px-1">{it.selector}</code>
          </div>
          <pre className="mt-2 text-xs bg-slate-50 border rounded p-2 overflow-x-auto">
            {it.codeSnippet}
          </pre>
        </li>
      ))}
    </ul>
  );
}

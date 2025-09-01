// backend/src/utils/checker.ts
import { JSDOM } from "jsdom";

export type Issue = {
  rule: string;
  message: string;
  selector: string;
  snippet?: string;
};

const MAX_SNIPPET = 220;

/** Compact one-line HTML snippet for display */
function snippetOf(el: any): string {
  const html = el?.outerHTML ?? el?.textContent ?? "";
  const oneLine = String(html).replace(/\s+/g, " ").trim();
  return oneLine.length > MAX_SNIPPET ? oneLine.slice(0, MAX_SNIPPET) + "…" : oneLine;
}

/** Build a stable :nth-of-type selector for an element */
function stableSelector(el: any): string {
  const parts: string[] = [];
  let node: any = el;

  while (node && String(node.tagName).toLowerCase() !== "html") {
    const tag = String(node.tagName || "").toLowerCase();
    const parent = node.parentElement;
    if (!tag || !parent) break;

    // 1-based index among same-tag siblings
    let idx = 1;
    for (let sib = parent.firstElementChild; sib; sib = sib.nextElementSibling) {
      if (sib.tagName === node.tagName) {
        if (sib === node) break;
        idx++;
      }
    }
    parts.unshift(`${tag}:nth-of-type(${idx})`);
    node = parent;
  }
  return parts.join(" > ");
}

/** Escape a value for use inside a CSS attribute selector (label[for="..."]) */
function attrValueEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Push an issue with selector + snippet */
function push(issues: Issue[], rule: string, el: any, message: string) {
  issues.push({
    rule,
    message,
    selector: stableSelector(el),
    snippet: snippetOf(el),
  });
}

/** Main HTML checker */
export function checkHtml(html: string): { issues: Issue[] } {
  const dom = new JSDOM(html);
  const document: any = (dom.window as any).document;
  const issues: Issue[] = [];

  // --- Rule: Multiple <h1> (flag 2nd+) ---
  const h1s: any[] = Array.from(document.querySelectorAll("h1"));
  if (h1s.length > 1) {
    h1s.slice(1).forEach((h1: any) =>
      push(issues, "HEADING_MULTIPLE_H1", h1, "Page contains more than one <h1> heading."),
    );
  }

  // --- Rule: <img> missing/empty alt or overly long alt ---
  Array.from(document.querySelectorAll("img")).forEach((img: any) => {
    const role = img.getAttribute?.("role");
    const ariaHidden = img.getAttribute?.("aria-hidden") === "true";
    if (role === "presentation" || ariaHidden) return; // decorative

    const alt = img.getAttribute?.("alt");
    if (alt == null || String(alt).trim() === "") {
      push(issues, "IMG_ALT_MISSING", img, "Image is missing a meaningful alt attribute.");
    } else if (String(alt).length > 150) {
      push(issues, "IMG_ALT_LENGTH", img, "Alt text is very long; keep it concise and specific.");
    }
  });

  // --- Rule: Generic link text (poorly descriptive) ---
  const genericRe = /^(click here|learn more|read more|more|here)$/i;
  Array.from(document.querySelectorAll("a")).forEach((a: any) => {
    const text = String(a.textContent || "").trim();
    if (genericRe.test(text)) {
      push(
        issues,
        "LINK_GENERIC_TEXT",
        a,
        `Link text "${text}" is generic; use descriptive wording (e.g., "View pricing").`,
      );
    }
  });

  // --- Rule: Form controls without a programmatic label ---
  Array.from(document.querySelectorAll("input, select, textarea")).forEach((control: any) => {
    // ignore hidden inputs
    if (
      String(control.tagName).toLowerCase() === "input" &&
      String(control.type || "").toLowerCase() === "hidden"
    ) {
      return;
    }

    const hasAria =
      control.hasAttribute?.("aria-label") || control.hasAttribute?.("aria-labelledby");

    let hasLabel = false;

    // <label for="id">
    const id = control.getAttribute?.("id");
    if (id) {
      const labelFor = document.querySelector?.(
        `label[for="${attrValueEscape(String(id))}"]`,
      );
      if (labelFor) hasLabel = true;
    }

    // or <label> wrapping
    let p: any = control.parentElement;
    while (p) {
      if (String(p.tagName).toLowerCase() === "label") {
        hasLabel = true;
        break;
      }
      if (String(p.tagName).toLowerCase() === "form") break;
      p = p.parentElement;
    }

    if (!hasLabel && !hasAria) {
      push(
        issues,
        "FORM_CONTROL_NO_LABEL",
        control,
        "Form control lacks a programmatic label (use <label for>, aria-label, or aria-labelledby).",
      );
    }
  });

  // --- Rule: <iframe> missing title ---
  Array.from(document.querySelectorAll("iframe")).forEach((f: any) => {
    const title = f.getAttribute?.("title");
    if (!title || String(title).trim() === "") {
      push(issues, "IFRAME_TITLE_MISSING", f, "iFrame is missing a descriptive title attribute.");
    }
  });

  // --- Rule: Duplicate IDs ---
  const idMap = new Map<string, any[]>();
  Array.from(document.querySelectorAll("[id]")).forEach((el: any) => {
    const id = el.id as string;
    idMap.set(id, [...(idMap.get(id) || []), el]);
  });
  for (const [id, els] of idMap.entries()) {
    if (els.length > 1) {
      els.forEach((el) =>
        push(issues, "ID_DUPLICATE", el, `Duplicate id "${id}" found on multiple elements.`),
      );
    }
  }

  // --- Rule: Table without headers ---
  Array.from(document.querySelectorAll("table")).forEach((table: any) => {
    if (!table.querySelector?.("th")) {
      push(issues, "TABLE_NO_HEADERS", table, "Table has no header cells (<th>).");
    }
  });

  return { issues };
}

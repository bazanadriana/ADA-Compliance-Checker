// frontend/src/lib/highlight.ts
export function flashHighlight(el: HTMLElement) {
  // Save previous styles so we can restore
  const prevOutline = el.style.outline;
  const prevOffset = el.style.outlineOffset;

  el.style.outline = "3px solid #ef4444";
  el.style.outlineOffset = "2px";

  const anim = el.animate(
    [{ outlineColor: "#ef4444" }, { outlineColor: "transparent" }],
    { duration: 1600, easing: "ease-in-out" }
  );

  anim.onfinish = () => {
    el.style.outline = prevOutline;
    el.style.outlineOffset = prevOffset;
  };
}

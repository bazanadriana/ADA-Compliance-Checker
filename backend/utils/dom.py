# backend/utils/dom.py
from bs4 import Tag, NavigableString
import re

def build_css_selector(el: Tag) -> str:
    """
    Build a simple, stable CSS selector like: html > body > h1:nth-of-type(1)
    """
    parts = []
    node = el
    while isinstance(node, Tag):
        parent = node.parent
        if not isinstance(parent, Tag):
            parts.append(node.name)
            break

        # nth-of-type index
        same_type = [c for c in parent.find_all(node.name, recursive=False)]
        idx = same_type.index(node) + 1 if node in same_type else 1
        parts.append(f"{node.name}:nth-of-type({idx})")
        node = parent

    return " > ".join(reversed(parts)) or el.name

def extract_snippet(el: Tag, max_len: int = 160) -> str:
    """
    Return a shortened outerHTML-like snippet (no formatting guarantees).
    """
    raw = str(el)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw if len(raw) <= max_len else raw[: max_len - 3] + "..."

def parse_inline_style(style_str: str) -> dict:
    """
    Turn inline style string into a dict {'color': '#000', 'background-color': 'white', ...}
    """
    out = {}
    if not style_str:
        return out
    for decl in style_str.split(";"):
        if ":" in decl:
            prop, val = decl.split(":", 1)
            out[prop.strip().lower()] = val.strip()
    return out

# Very small set of named colors for the assignment
NAMED_COLORS = {
    "black": "#000000",
    "white": "#ffffff",
    "red": "#ff0000",
    "green": "#008000",
    "blue": "#0000ff",
    "gray": "#808080",
    "grey": "#808080",
    "lightgreen": "#90ee90",
}

def parse_css_color(val: str) -> tuple:
    """
    Parse #rgb, #rrggbb, rgb(r,g,b), or a few named colors. Return (r,g,b) in [0,255].
    Fall back to black if unknown.
    """
    if not val:
        return (0, 0, 0)
    s = val.strip().lower()

    if s in NAMED_COLORS:
        s = NAMED_COLORS[s]

    # #rgb or #rrggbb
    if s.startswith("#"):
        s = s.lstrip("#")
        if len(s) == 3:
            r, g, b = [int(ch * 2, 16) for ch in s]
            return (r, g, b)
        if len(s) == 6:
            r = int(s[0:2], 16)
            g = int(s[2:4], 16)
            b = int(s[4:6], 16)
            return (r, g, b)

    # rgb()
    m = re.match(r"rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)", s)
    if m:
        r, g, b = map(int, m.groups())
        r = max(0, min(r, 255))
        g = max(0, min(g, 255))
        b = max(0, min(b, 255))
        return (r, g, b)

    return (0, 0, 0)

def relative_luminance(rgb: tuple) -> float:
    def channel(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = map(channel, rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(rgb1: tuple, rgb2: tuple) -> float:
    L1 = relative_luminance(rgb1)
    L2 = relative_luminance(rgb2)
    light = max(L1, L2)
    dark = min(L1, L2)
    return (light + 0.05) / (dark + 0.05)

def is_large_text(style: dict) -> bool:
    """
    Best-effort: large if font-size >= 18px OR (>=14px and bold)
    """
    fs = style.get("font-size", "")
    fw = style.get("font-weight", "")
    try:
        px = float(fs.replace("px", "").strip())
    except Exception:
        px = 0.0
    bold = False
    if fw:
        bold = fw.isdigit() and int(fw) >= 700 or fw.lower() in {"bold", "bolder"}
    return px >= 18.0 or (px >= 14.0 and bold)

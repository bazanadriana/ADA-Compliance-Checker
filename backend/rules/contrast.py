# backend/rules/contrast.py
from typing import List, Dict
from bs4 import BeautifulSoup, Tag

# 👇 import all helpers from the utils module using a package-relative path
from ..utils.dom import (
    build_css_selector,
    extract_snippet,
    parse_inline_style,
    parse_css_color,
    contrast_ratio,
    is_large_text,
)

TEXT_TAGS = {"p", "span", "a", "li", "h1", "h2", "h3", "h4", "h5", "h6"}


def _colors_from_chain(el: Tag) -> tuple:
    """
    Best-effort: use element's own inline color/bg, otherwise walk up to find bg.
    Fallback fg=black, bg=white.
    """
    fg = None
    bg = None
    node = el
    while node and isinstance(node, Tag):
        style = parse_inline_style(node.get("style", ""))

        if fg is None and "color" in style:
            fg = parse_css_color(style.get("color"))

        if bg is None and ("background-color" in style or "background" in style):
            val = style.get("background-color") or style.get("background")
            bg = parse_css_color(val)

        if fg is not None and bg is not None:
            break

        node = node.parent

    if fg is None:
        fg = (0, 0, 0)
    if bg is None:
        bg = (255, 255, 255)
    return fg, bg


def check_contrast(soup: BeautifulSoup) -> List[Dict]:
    issues: List[Dict] = []
    for el in soup.find_all(TEXT_TAGS):
        text = (el.get_text() or "").strip()
        if not text:
            continue

        style = parse_inline_style(el.get("style", ""))

        fg, bg = _colors_from_chain(el)
        ratio = contrast_ratio(fg, bg)
        threshold = 3.0 if is_large_text(style) else 4.5

        if ratio < threshold:
            issues.append({
                "ruleId": "COLOR_CONTRAST",
                "message": f"Low contrast ratio: {ratio:.2f}. Minimum expected is {threshold:.1f}.",
                "element": el.name,
                "selector": build_css_selector(el),
                "codeSnippet": extract_snippet(el),
            })
    return issues

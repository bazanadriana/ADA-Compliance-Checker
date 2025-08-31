# backend/rules/link_rules.py
from typing import List, Dict
from bs4 import BeautifulSoup, Tag
from ..utils.dom import build_css_selector, extract_snippet

GENERIC_PHRASES = {
    "click here", "read more", "more", "here", "learn more", "details", "link"
}

def check_links(soup: BeautifulSoup) -> List[Dict]:
    issues: List[Dict] = []
    for a in soup.find_all("a"):
        text = (a.get_text() or "").strip().lower()
        if text in GENERIC_PHRASES:
            issues.append({
                "ruleId": "LINK_GENERIC_TEXT",
                "message": "Link text must be descriptive (avoid generic phrases like 'click here').",
                "element": "a",
                "selector": build_css_selector(a),
                "codeSnippet": extract_snippet(a)
            })
    return issues

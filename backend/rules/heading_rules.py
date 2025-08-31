# backend/rules/heading_rules.py
from typing import List, Dict
from bs4 import BeautifulSoup, Tag
from ..utils.dom import build_css_selector, extract_snippet

def check_headings(soup: BeautifulSoup) -> List[Dict]:
    issues: List[Dict] = []
    headings = soup.find_all(["h1","h2","h3","h4","h5","h6"])

    # Single H1
    h1s = [h for h in headings if h.name == "h1"]
    if len(h1s) > 1:
        for h in h1s[1:]:
            issues.append({
                "ruleId": "HEADING_MULTIPLE_H1",
                "message": "There must be only one <h1> per page.",
                "element": "h1",
                "selector": build_css_selector(h),
                "codeSnippet": extract_snippet(h)
            })

    # Hierarchical order (no skipping)
    last_level = 0
    for h in headings:
        level = int(h.name[1])
        if last_level and level > last_level + 1:
            issues.append({
                "ruleId": "HEADING_ORDER",
                "message": f"Heading level skipped: found <h{level}> after <h{last_level}>.",
                "element": h.name,
                "selector": build_css_selector(h),
                "codeSnippet": extract_snippet(h)
            })
        last_level = level

    return issues

from typing import List, Dict
from bs4 import BeautifulSoup
from ..utils.dom import build_css_selector, extract_snippet

def check_images(soup: BeautifulSoup) -> List[Dict]:
    issues: List[Dict] = []
    for img in soup.find_all("img"):
        alt = img.get("alt")
        selector = build_css_selector(img)
        snippet = extract_snippet(img)

        # Flag if alt is missing OR empty/whitespace
        if alt is None or (isinstance(alt, str) and not alt.strip()):
            issues.append({
                "ruleId": "IMG_ALT_MISSING",
                "message": "All <img> tags must have a descriptive alt attribute.",
                "element": "img",
                "selector": selector,
                "codeSnippet": snippet
            })
        else:
            if len(alt) > 120:
                issues.append({
                    "ruleId": "IMG_ALT_LENGTH",
                    "message": "Alt text should not exceed 120 characters.",
                    "element": "img",
                    "selector": selector,
                    "codeSnippet": snippet
                })
    return issues

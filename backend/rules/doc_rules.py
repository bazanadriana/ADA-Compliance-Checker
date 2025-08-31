# backend/rules/doc_rules.py
from typing import List, Dict
from bs4 import BeautifulSoup
from ..utils.dom import build_css_selector, extract_snippet

def check_doc_lang(soup: BeautifulSoup) -> List[Dict]:
    issues = []
    html_el = soup.find("html")
    if not html_el or not html_el.get("lang") or not html_el.get("lang").strip():
        el = html_el or soup
        issues.append({
            "ruleId": "DOC_LANG_MISSING",
            "message": "The <html> element must have a valid lang attribute.",
            "element": "html",
            "selector": "html",
            "codeSnippet": "<html ...>"
        })
    return issues

def check_doc_title(soup: BeautifulSoup) -> List[Dict]:
    issues = []
    title = soup.find("title")
    if not title or not (title.get_text() or "").strip():
        issues.append({
            "ruleId": "DOC_TITLE_MISSING",
            "message": "Every page must have a non-empty <title> tag.",
            "element": "title",
            "selector": "html > head > title:nth-of-type(1)",
            "codeSnippet": "<title></title>"
        })
    return issues

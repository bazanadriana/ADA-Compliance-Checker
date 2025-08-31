# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from bs4 import BeautifulSoup

# ✅ use relative imports within the package
from .rules.doc_rules import check_doc_lang, check_doc_title
from .rules.image_rules import check_images
from .rules.link_rules import check_links
from .rules.heading_rules import check_headings
from .rules.contrast import check_contrast

app = FastAPI(title="ADA Compliance Checker API", version="1.0.0")

# Adjust origins as needed (or use ["*"] for local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HtmlIn(BaseModel):
    html: str

class Issue(BaseModel):
    ruleId: str
    message: str
    element: str
    selector: str
    codeSnippet: str

class CheckResponse(BaseModel):
    issues: List[Issue]

@app.post("/api/check", response_model=CheckResponse)
def check(payload: HtmlIn):
    html = (payload.html or "").strip()
    if not html:
        raise HTTPException(status_code=400, detail="html must be a non-empty string")

    # Parse with lxml for better structure handling
    soup = BeautifulSoup(html, "lxml")

    issues: List[Dict[str, Any]] = []
    # General document
    issues += check_doc_lang(soup)
    issues += check_doc_title(soup)
    # Images
    issues += check_images(soup)
    # Links
    issues += check_links(soup)
    # Headings
    issues += check_headings(soup)
    # Contrast (inline styles only, best-effort)
    issues += check_contrast(soup)

    # Coerce to Pydantic Issue model
    return {"issues": [Issue(**i) for i in issues]}

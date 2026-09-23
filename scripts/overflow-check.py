"""Horizontal-overflow and basic accessibility smoke check for the built site.

Usage: python scripts/overflow-check.py [base-url]
Serves nothing itself — start a static server on dist/ first
(e.g. python -m http.server 4403 --directory dist).
"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4403"
WIDTHS = [390, 768, 1024, 1440]
PAGES = [
    "/", "/about/", "/catalog/", "/services/", "/shipping/", "/contacts/",
    "/cars/pontiac-gto-1965/", "/cars/chevrolet-bel-air-1957/",
    "/privacy/", "/terms/", "/cookies/", "/disclaimer/", "/accessibility/", "/do-not-sell/",
]

fail = 0
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    for width in WIDTHS:
        page = browser.new_page(viewport={"width": width, "height": 900})
        bad = []
        for path in PAGES:
            page.goto(BASE + path, wait_until="load")
            over = page.evaluate(
                "() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth"
            )
            if over > 1:
                widest = page.evaluate(
                    """() => {
                        let worst = null, max = 0;
                        for (const el of document.querySelectorAll('body *')) {
                            const r = el.getBoundingClientRect();
                            if (r.right > max) { max = r.right; worst = el.tagName + '.' + (el.className || '').toString().slice(0, 40); }
                        }
                        return worst + ' right=' + Math.round(max);
                    }"""
                )
                bad.append(f"{path} (+{over}px; {widest})")
            # no forms anywhere, tel/mailto only
            forms = page.evaluate("() => document.querySelectorAll('form').length")
            if forms:
                bad.append(f"{path} has {forms} <form>")
        print(f"  {width}px: " + ("OK" if not bad else f"{len(bad)} issues"))
        for b in bad:
            print("      " + b)
        fail += len(bad)
        page.close()

    # accessibility smoke: images have alt, links have names, one h1 per page
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    for path in PAGES:
        page.goto(BASE + path, wait_until="load")
        issues = page.evaluate(
            """() => {
                const out = [];
                for (const img of document.querySelectorAll('img'))
                    if (!img.hasAttribute('alt')) out.push('img without alt: ' + img.getAttribute('src'));
                const h1 = document.querySelectorAll('h1').length;
                if (h1 !== 1) out.push('h1 count = ' + h1);
                for (const a of document.querySelectorAll('a'))
                    if (!(a.textContent || '').trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]:not([alt=""])'))
                        out.push('link without name: ' + a.getAttribute('href'));
                for (const b of document.querySelectorAll('button'))
                    if (!(b.textContent || '').trim() && !b.getAttribute('aria-label')) out.push('button without name');
                return out;
            }"""
        )
        if issues:
            print(f"  a11y {path}: " + "; ".join(issues[:4]))
            fail += len(issues)
    page.close()
    browser.close()

print("TOTAL ISSUES:", fail)

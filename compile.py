import os
import re
import datetime
from io import open

# ------------------------------------------------------------
# This script generates the standalone index.html file.
# It inlines:
#   - <script src="..."></script>               → <script>...</script>
#   - <link rel="stylesheet" href="...">        → <style>...</style>
#   - <link rel="icon" href="...svg" ...>       → inline raw SVG + tiny JS to set favicon (no Base64, no URL-encoding)
#   - <template id="...svg..." href="path/to/icon.svg"> → inline raw SVG
# The output is fully self-contained and does not depend on files in "src/".
# ------------------------------------------------------------

# Read the base HTML file
with open('src/slip39.html', "r", encoding="utf-8") as f:
    page = f.read()

# ------------------------------------------------------------
# Inline <script src="..."></script>
# ------------------------------------------------------------
scriptsFinder = re.compile(r"""<script\s+src=["'](.*?)["']\s*></script>""", re.IGNORECASE)
scripts = scriptsFinder.findall(page)

for script in scripts:
    filename = os.path.join("src", script)
    with open(filename, "r", encoding="utf-8") as s:
        scriptContent = "<script>%s</script>" % s.read()
    scriptTag = f"""<script src="{script}"></script>"""
    page = page.replace(scriptTag, scriptContent)

# ------------------------------------------------------------
# Inline <link rel="stylesheet" href="...">
# ------------------------------------------------------------
stylesFinder = re.compile(r"""<link\s+rel=["']stylesheet["']\s+href=["'](.*?)["']\s*/?>""", re.IGNORECASE)
styles = stylesFinder.findall(page)

for style in styles:
    filename = os.path.join("src", style)
    with open(filename, "r", encoding="utf-8") as s:
        styleContent = "<style>%s</style>" % s.read()
    # Replace both with and without self-closing slash
    for styleTag in (
        f"""<link rel="stylesheet" href="{style}">""",
        f"""<link rel="stylesheet" href="{style}" />""",
    ):
        page = page.replace(styleTag, styleContent)

# ------------------------------------------------------------
# Inline favicon SVG (NO Base64, NO URL-encoding)
# Strategy:
#   1) Find <link rel="icon" ... href="*.svg" ...>
#   2) Read the SVG file contents as raw XML.
#   3) Inject the raw SVG into a <script type="image/svg+xml" id="inlined-favicon-svg">...</script> in <head>.
#   4) Inject a tiny JS snippet to create a Blob from the raw SVG and set/replace <link rel="icon"> at runtime.
#
# Rationale:
#   - rel="icon" requires an href (URL). Data URIs would need URL-encoding or Base64.
#   - By embedding raw SVG and using a Blob URL at runtime, we avoid URL-encoding and Base64 overhead entirely.
#   - Result remains a single, fully standalone HTML file.
# ------------------------------------------------------------
def _inline_favicon_replacer(match: re.Match) -> str:
    icon_path = match.group(1)
    filename = os.path.join("src", icon_path)

    # Read raw SVG
    with open(filename, "r", encoding="utf-8") as s:
        svg_text = s.read()

    # Trim potential BOM and XML declaration
    if svg_text.startswith("\ufeff"):
        svg_text = svg_text.lstrip("\ufeff")
    svg_text = re.sub(r'^\s*<\?xml[^>]*>\s*', '', svg_text)

    # Build inline blocks:
    #   - Raw SVG payload (not rendered) in a <script type="image/svg+xml">
    #   - Tiny JS to set favicon via a Blob URL
    inline_svg_block = (
        "<!-- inlined favicon SVG (raw, not encoded) -->\n"
        "<script type=\"image/svg+xml\" id=\"inlined-favicon-svg\">"
        f"{svg_text}"
        "</script>\n"
        "<script>(function(){"
        "try{"
        "var raw=document.getElementById('inlined-favicon-svg');"
        "if(!raw)return;"
        "var blob=new Blob([raw.textContent],{type:'image/svg+xml'});"
        "var url=URL.createObjectURL(blob);"
        "var link=document.querySelector('link[rel=\"icon\"]');"
        "if(!link){link=document.createElement('link');link.setAttribute('rel','icon');document.head.appendChild(link);}"
        "link.setAttribute('href',url);"
        "}catch(e){}"
        "})();</script>"
    )
    return inline_svg_block

# Match any <link ... rel="icon" ... href="*.svg" ...>
# Capture the href value as group(1).
icon_link_re = re.compile(
    r"""<link\s+(?=[^>]*\brel\s*=\s*["']icon["'])(?=[^>]*\bhref\s*=\s*["']([^"']+?\.svg)["'])[^>]*>""",
    re.IGNORECASE,
)

# Replace all favicon links with the inline SVG + JS approach
page = icon_link_re.sub(_inline_favicon_replacer, page)

# ------------------------------------------------------------
# Inline <template id="...svg..." href="path/to/icon.svg">…</template>
# - Keeps source HTML clean by pointing to files via href
# - Build output contains raw SVG text inside the template
# ------------------------------------------------------------
def _inline_svg_templates(page_html: str) -> str:
    # Matches: <template id="something" href="path/to/file.svg">...</template>
    tpl_re = re.compile(
        r"""<template\s+([^>]*?)\bhref=["']([^"']+?\.svg)["']([^>]*)>(.*?)</template>""",
        re.IGNORECASE | re.DOTALL,
    )

    def _read_svg(src_path: str) -> str:
        filename = os.path.join("src", src_path)
        with open(filename, "r", encoding="utf-8") as s:
            svg_text = s.read()
        # Trim potential BOM and XML declaration
        if svg_text.startswith("\ufeff"):
            svg_text = svg_text.lstrip("\ufeff")
        svg_text = re.sub(r'^\s*<\?xml[^>]*>\s*', '', svg_text)
        return svg_text

    def _repl(m: re.Match) -> str:
        pre_attrs, href, post_attrs, _inner = m.groups()
        try:
            raw = _read_svg(href)
        except FileNotFoundError:
            # If file missing, leave original tag unchanged
            return m.group(0)
        # Remove href=... from attributes in the output template
        cleaned_attrs = (pre_attrs + " " + post_attrs).strip()
        cleaned_attrs = re.sub(r'''\s*href=["'][^"']+?["']''', '', cleaned_attrs, flags=re.IGNORECASE)
        cleaned_attrs = re.sub(r'\s+', ' ', cleaned_attrs).strip()
        if cleaned_attrs:
            return f"<template {cleaned_attrs}>{raw}</template>"
        else:
            return f"<template>{raw}</template>"

    return tpl_re.sub(_repl, page_html)

page = _inline_svg_templates(page)

# ------------------------------------------------------------
# Write the standalone HTML output
# ------------------------------------------------------------
with open('index.html', 'w', encoding="utf-8") as f:
    f.write(page)

print("%s - DONE" % datetime.datetime.now())

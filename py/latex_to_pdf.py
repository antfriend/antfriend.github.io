#!/usr/bin/env python3
"""Render a LaTeX-like source file to PDF using js/latex-renderer.js."""

from __future__ import annotations

import argparse
import functools
import html
import os
import re
import subprocess
import sys
import threading
import uuid
from dataclasses import dataclass
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


@dataclass
class MathToken:
    display: bool
    tex: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a PDF from a .latex file by rendering math with js/latex-renderer.js.",
    )
    parser.add_argument(
        "input",
        nargs="?",
        default="Mathematical.latex",
        help="Input LaTeX source (default: Mathematical.latex).",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Output PDF path (default: <input_stem>.pdf).",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Bind host for local HTTP server (default: 127.0.0.1).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=0,
        help="Bind port for local HTTP server; 0 picks a free port (default: 0).",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=20,
        help="Render timeout in seconds (default: 20).",
    )
    parser.add_argument(
        "--paper",
        default="Letter",
        choices=["Letter", "A4"],
        help="PDF paper size for Playwright mode (default: Letter).",
    )
    parser.add_argument(
        "--keep-html",
        action="store_true",
        help="Keep the generated temporary HTML file for debugging.",
    )
    return parser.parse_args()


def extract_document_body(tex: str) -> str:
    match = re.search(r"\\begin\{document\}(.*?)\\end\{document\}", tex, flags=re.S)
    return match.group(1) if match else tex


def _stash_verbatim_blocks(text: str) -> tuple[str, dict[str, str]]:
    block_map: dict[str, str] = {}
    counter = 0

    def stash(env: str, content: str) -> str:
        nonlocal counter
        marker = f"@@BLOCK{counter}@@"
        counter += 1
        pre = (
            f'<pre class="verbatim {html.escape(env)}">'
            f"{html.escape(content.strip(chr(10)))}"
            "</pre>"
        )
        block_map[marker] = pre
        return marker

    envs = ["ttdb_mmpdb", "ttdb_cursor", "verbatim"]
    for env in envs:
        pattern = re.compile(rf"\\begin\{{{env}\}}(.*?)\\end\{{{env}\}}", flags=re.S)
        text = pattern.sub(lambda m, e=env: stash(e, m.group(1)), text)

    return text, block_map


def _stash_math(text: str) -> tuple[str, list[MathToken]]:
    tokens: list[MathToken] = []

    def stash_math(tex: str, display: bool) -> str:
        marker = f"@@MATH{len(tokens)}@@"
        tokens.append(MathToken(display=display, tex=tex.strip()))
        return marker

    def repl_env(match: re.Match[str]) -> str:
        return stash_math(match.group(2), display=True)

    env_pat = re.compile(
        r"\\begin\{(equation\*?|align\*?|gather\*?|multline\*?)\}(.*?)\\end\{\1\}",
        flags=re.S,
    )
    text = env_pat.sub(repl_env, text)

    display_patterns = [
        re.compile(r"\\\[(.*?)\\\]", flags=re.S),
        re.compile(r"\$\$(.*?)\$\$", flags=re.S),
    ]
    for pat in display_patterns:
        text = pat.sub(lambda m: stash_math(m.group(1), display=True), text)

    inline_pat = re.compile(r"(?<!\\)\$(.+?)(?<!\\)\$", flags=re.S)
    text = inline_pat.sub(lambda m: stash_math(m.group(1), display=False), text)

    return text, tokens


def render_inline_text(text: str) -> str:
    text = text.strip()
    if not text:
        return ""

    escaped = html.escape(text)

    def replace_simple_macro(src: str, macro: str, tag: str) -> str:
        pattern = re.compile(rf"\\{macro}\{{([^{{}}]+)\}}")
        while True:
            new_src = pattern.sub(lambda m: f"<{tag}>{m.group(1)}</{tag}>", src)
            if new_src == src:
                return src
            src = new_src

    escaped = replace_simple_macro(escaped, "texttt", "code")
    escaped = replace_simple_macro(escaped, "emph", "em")
    escaped = replace_simple_macro(escaped, "textbf", "strong")

    escaped = escaped.replace(r"\%", "%")
    escaped = escaped.replace(r"\_", "_")
    escaped = escaped.replace(r"\#", "#")
    escaped = escaped.replace(r"\{", "{")
    escaped = escaped.replace(r"\}", "}")
    escaped = escaped.replace(r"\&", "&amp;")
    escaped = escaped.replace(r"~", "&nbsp;")
    escaped = escaped.replace(r"\\", "<br/>")

    escaped = re.sub(r"\\(?:noindent|medskip|bigskip|smallskip)\b", "", escaped)
    escaped = re.sub(r"\s{2,}", " ", escaped).strip()
    return escaped


def latex_to_html_body(tex_source: str) -> str:
    source = tex_source.replace("\r\n", "\n")
    source = extract_document_body(source)
    source, block_map = _stash_verbatim_blocks(source)
    source, math_tokens = _stash_math(source)

    source = source.replace(r"\begin{ttdb_record}", "\n<div class=\"ttdb-record\">\n")
    source = source.replace(r"\end{ttdb_record}", "\n</div>\n")

    source = re.sub(
        r"\\section\*?\{([^{}]*)\}",
        lambda m: f"\n<h1>{render_inline_text(m.group(1))}</h1>\n",
        source,
    )
    source = re.sub(
        r"\\subsection\*?\{([^{}]*)\}",
        lambda m: f"\n<h2>{render_inline_text(m.group(1))}</h2>\n",
        source,
    )
    source = re.sub(
        r"\\subsubsection\*?\{([^{}]*)\}",
        lambda m: f"\n<h3>{render_inline_text(m.group(1))}</h3>\n",
        source,
    )
    source = re.sub(
        r"\\ttdbheader\{([^{}]*)\}",
        lambda m: f'\n<p class="ttdb-header"><code>{render_inline_text(m.group(1))}</code></p>\n',
        source,
    )

    # Remove common preamble/document commands if present in body fallback mode.
    source = re.sub(r"\\(?:documentclass|usepackage|newcommand|newenvironment)(?:\[[^\]]*\])?\{[^{}]*\}", "", source)
    source = source.replace(r"\begin{document}", "")
    source = source.replace(r"\end{document}", "")
    source = source.replace(r"\par", "\n\n")

    lines = source.splitlines()
    out_lines: list[str] = []
    paragraph_parts: list[str] = []

    def flush_paragraph() -> None:
        if paragraph_parts:
            out_lines.append(f"<p>{' '.join(paragraph_parts).strip()}</p>")
            paragraph_parts.clear()

    block_prefixes = (
        "<h1>",
        "<h2>",
        "<h3>",
        "<div class=\"ttdb-record\">",
        "</div>",
        "<p class=\"ttdb-header\">",
        "<pre ",
        "@@BLOCK",
    )

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            continue
        if line.startswith("%"):
            continue
        if line.startswith(block_prefixes):
            flush_paragraph()
            out_lines.append(line)
            continue
        paragraph_parts.append(render_inline_text(line))

    flush_paragraph()
    body = "\n".join(out_lines)

    for marker, pre_html in block_map.items():
        body = body.replace(marker, pre_html)

    for idx, token in enumerate(math_tokens):
        marker = f"@@MATH{idx}@@"
        tex_attr = html.escape(token.tex, quote=True)
        if token.display:
            host = f'<div class="math-host math-display" data-tex="{tex_attr}"></div>'
        else:
            host = f'<span class="math-host math-inline" data-tex="{tex_attr}"></span>'
        body = body.replace(marker, host)

    return body


def build_html_document(body_html: str, title: str) -> str:
    safe_title = html.escape(title)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <style>
    :root {{
      color-scheme: light;
    }}
    body {{
      margin: 0;
      padding: 0;
      background: #f8f9fb;
      color: #13161b;
      font-family: "Georgia", "Times New Roman", serif;
      line-height: 1.45;
    }}
    main {{
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.6in 0.65in 0.75in 0.65in;
      background: #fff;
    }}
    h1, h2, h3 {{
      line-height: 1.2;
      margin: 1rem 0 0.55rem;
      font-family: "Segoe UI", "Helvetica Neue", sans-serif;
    }}
    h1 {{
      font-size: 1.45rem;
      border-bottom: 2px solid #2d3340;
      padding-bottom: 0.3rem;
    }}
    h2 {{
      font-size: 1.12rem;
      margin-top: 1rem;
    }}
    h3 {{
      font-size: 1rem;
      margin-top: 0.9rem;
    }}
    p {{
      margin: 0.55rem 0;
      font-size: 0.98rem;
    }}
    .ttdb-record {{
      margin: 1.1rem 0;
      padding: 0.7rem 0.85rem 0.7rem;
      border: 1px solid #d7deea;
      border-radius: 9px;
      background: #fafcff;
      break-inside: avoid;
    }}
    .ttdb-header {{
      margin: 0 0 0.7rem;
      padding: 0.45rem 0.55rem;
      background: #edf2fb;
      border-radius: 6px;
      border: 1px solid #d5dfee;
      font-size: 0.84rem;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }}
    pre.verbatim {{
      margin: 0.75rem 0;
      padding: 0.65rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #d8d8d8;
      background: #f6f6f6;
      font-family: "Cascadia Code", "Consolas", monospace;
      font-size: 0.85rem;
      line-height: 1.35;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      break-inside: avoid;
    }}
    .math-display {{
      margin: 0.55rem 0;
      overflow-x: auto;
      overflow-y: hidden;
    }}
    .math-inline .katex {{
      font-size: 1.02em;
    }}
    @media print {{
      body {{
        background: #fff;
      }}
      main {{
        max-width: none;
        margin: 0;
        padding: 0;
      }}
      @page {{
        size: Letter;
        margin: 0.55in;
      }}
    }}
  </style>
</head>
<body>
  <main>
{body_html}
  </main>
  <script type="module">
    import {{ renderLatex }} from "./js/latex-renderer.js";

    function renderAllMath() {{
      const hosts = document.querySelectorAll(".math-host");
      for (const host of hosts) {{
        const tex = host.dataset.tex || "";
        const displayMode = host.classList.contains("math-display");
        renderLatex(host, tex, {{ displayMode }});
      }}
    }}

    async function done() {{
      try {{
        if (document.fonts && document.fonts.ready) {{
          await document.fonts.ready;
        }}
      }} catch (_err) {{
      }}
      window.__latex_render_done = true;
      document.documentElement.setAttribute("data-render-complete", "true");
    }}

    try {{
      renderAllMath();
    }} finally {{
      done();
    }}
  </script>
</body>
</html>
"""


def start_server(root: Path, host: str, port: int) -> tuple[ThreadingHTTPServer, threading.Thread]:
    handler_cls = functools.partial(SimpleHTTPRequestHandler, directory=str(root))
    server = ThreadingHTTPServer((host, port), handler_cls)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def _try_render_with_playwright(url: str, output_pdf: Path, timeout_ms: int, paper: str) -> bool:
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        return False

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=timeout_ms)
        page.wait_for_function("() => window.__latex_render_done === true", timeout=timeout_ms)
        page.pdf(
            path=str(output_pdf),
            format=paper,
            print_background=True,
            margin={"top": "0.55in", "right": "0.55in", "bottom": "0.55in", "left": "0.55in"},
            prefer_css_page_size=False,
        )
        browser.close()
    return True


def _browser_candidates() -> list[str]:
    candidates = [
        "chromium",
        "chromium-browser",
        "google-chrome",
        "google-chrome-stable",
        "microsoft-edge",
        "msedge",
        "msedge.exe",
    ]
    # Common direct paths on Windows hosts when run via WSL/Python.
    candidates += [
        r"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
        r"/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        r"/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe",
        r"/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    ]
    return candidates


def _resolve_browser_cmd() -> str | None:
    from shutil import which

    for candidate in _browser_candidates():
        if os.path.isabs(candidate):
            if Path(candidate).exists():
                return candidate
            continue
        path = which(candidate)
        if path:
            return path
    return None


def _run_headless_print(browser_cmd: str, url: str, output_pdf: Path, timeout_ms: int) -> bool:
    common = [
        browser_cmd,
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={str(output_pdf)}",
        f"--virtual-time-budget={timeout_ms}",
        url,
    ]
    attempts = [
        [browser_cmd, "--headless=new", *common[1:]],
        [browser_cmd, "--headless", *common[1:]],
    ]
    for cmd in attempts:
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return output_pdf.exists() and output_pdf.stat().st_size > 0
        except Exception:
            continue
    return False


def render_pdf(url: str, output_pdf: Path, timeout_seconds: int, paper: str) -> None:
    timeout_ms = max(timeout_seconds, 1) * 1000
    if _try_render_with_playwright(url, output_pdf, timeout_ms=timeout_ms, paper=paper):
        return

    browser_cmd = _resolve_browser_cmd()
    if browser_cmd and _run_headless_print(browser_cmd, url, output_pdf, timeout_ms=timeout_ms):
        return

    raise RuntimeError(
        "No PDF rendering engine found. Install Playwright (`pip install playwright` and "
        "`python -m playwright install chromium`) or ensure a Chromium/Edge browser is available."
    )


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent

    input_path = Path(args.input)
    if not input_path.is_absolute():
        input_path = (repo_root / input_path).resolve()
    if not input_path.exists():
        print(f"Error: input file not found: {input_path}", file=sys.stderr)
        return 2

    output_path = Path(args.output) if args.output else input_path.with_suffix(".pdf")
    if not output_path.is_absolute():
        output_path = (repo_root / output_path).resolve()

    tex_text = input_path.read_text(encoding="utf-8")
    body_html = latex_to_html_body(tex_text)
    html_doc = build_html_document(body_html, title=input_path.name)

    tmp_name = f".latex-render-{uuid.uuid4().hex}.html"
    tmp_html = repo_root / tmp_name
    tmp_html.write_text(html_doc, encoding="utf-8")

    server = None
    try:
        server, _thread = start_server(repo_root, host=args.host, port=args.port)
        actual_port = server.server_address[1]
        url = f"http://{args.host}:{actual_port}/{tmp_html.name}"
        render_pdf(url, output_path, timeout_seconds=args.timeout_seconds, paper=args.paper)
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
        if not args.keep_html and tmp_html.exists():
            tmp_html.unlink()

    print(f"PDF created: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

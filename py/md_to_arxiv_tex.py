#!/usr/bin/env python3
"""Convert locus_arxiv_draft.md → locus_arxiv.tex.

Usage:
    python py/md_to_arxiv_tex.py                     # default paths
    python py/md_to_arxiv_tex.py SRC.md [OUT.tex]    # explicit paths
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

# ── LaTeX preamble ─────────────────────────────────────────────────────────

PREAMBLE = r"""\documentclass[11pt]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage{microtype}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath}
\usepackage{booktabs}
\usepackage{enumitem}
\usepackage{listings}
\usepackage{xcolor}
\usepackage[colorlinks=true,linkcolor=teal,citecolor=teal,urlcolor=teal]{hyperref}

\definecolor{codebg}{gray}{0.96}
\lstset{
  basicstyle=\ttfamily\small,
  backgroundcolor=\color{codebg},
  frame=single,
  framerule=0.4pt,
  breaklines=true,
  captionpos=b
}"""


# ── helpers ────────────────────────────────────────────────────────────────

def _ascii_fold(s: str) -> str:
    """Strip diacritics and lowercase — used for bibitem key generation."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    ).lower()


def _bibkey(ref: str) -> str:
    """Generate a bibitem key from a reference line: firstauthorlastnameyear."""
    last = re.match(r'([A-Za-z\xC0-\xFF]+)', ref)
    year = re.search(r'\((\d{4})\)', ref)
    return _ascii_fold(last.group(1) if last else 'anon') + (year.group(1) if year else '')


# ── inline converter ────────────────────────────────────────────────────────

def _inline(text: str) -> str:
    """Convert inline Markdown to LaTeX. Safe to call on already-plain text."""
    # 1. Stash code spans (protect content from escaping)
    codes: list[str] = []
    def _stash_code(m: re.Match) -> str:
        codes.append(m.group(1))
        return f'\x00C{len(codes) - 1}\x00'
    text = re.sub(r'`([^`]+)`', _stash_code, text)

    # 2. Stash URLs (protect from escaping)
    urls: list[str] = []
    def _stash_url(m: re.Match) -> str:
        urls.append(m.group(0))
        return f'\x00U{len(urls) - 1}\x00'
    text = re.sub(r'https?://[^\s,;)\]]+', _stash_url, text)

    # 3. Escape LaTeX special characters (backslash must be first)
    for ch, rep in [
        ('\\',  r'\textbackslash{}'),
        ('&',   r'\&'),
        ('%',   r'\%'),
        ('#',   r'\#'),
        ('$',   r'\$'),
        ('{',   r'\{'),
        ('}',   r'\}'),
        ('_',   r'\_'),
        ('~',   r'\textasciitilde{}'),
        ('^',   r'\textasciicircum{}'),
    ]:
        text = text.replace(ch, rep)

    # 4. Unicode → LaTeX
    for ch, rep in [
        ('×', r'$\times$'),   # ×
        ('−', r'$-$'),        # − (math minus)
        ('→', r'$\to$'),      # →
        ('≈', r'$\approx$'),  # ≈
        ('…', r'\ldots{}'),   # …
        ('–', '--'),          # – en dash
        ('—', '---'),         # — em dash
        ('’', "'"),           # ' right single quote
        ('‘', '`'),           # ' left single quote
        ('“', '``'),          # " left double quote
        ('”', "''"),          # " right double quote
    ]:
        text = text.replace(ch, rep)

    # 5. Bold before italic
    text = re.sub(r'\*\*([^*\n]+?)\*\*', lambda m: r'\textbf{' + m.group(1) + '}', text)
    text = re.sub(r'\*([^*\n]+?)\*',     lambda m: r'\emph{'   + m.group(1) + '}', text)

    # 6. Restore URLs
    for i, u in enumerate(urls):
        text = text.replace(f'\x00U{i}\x00', r'\url{' + u + '}')

    # 7. Restore code spans (escape content for \texttt)
    for i, c in enumerate(codes):
        safe = (c
                .replace('\\', r'\textbackslash{}')
                .replace('{',  r'\{')
                .replace('}',  r'\}')
                .replace('_',  r'\_')
                .replace('^',  r'\^{}')
                .replace('$',  r'\$')
                .replace('#',  r'\#')
                .replace('%',  r'\%')
                .replace('&',  r'\&'))
        text = text.replace(f'\x00C{i}\x00', r'\texttt{' + safe + '}')

    return text


# ── block converter ─────────────────────────────────────────────────────────

_NUMBERED = re.compile(r'^\d+\.\s+')
_BULLET   = re.compile(r'^[-*]\s+')
# Bold header followed by colon or em/en dash: **Title:** body  |  **Title** — body
_BOLD_HDR = re.compile(r'^\*\*([^*]+)\*\*\s*[:—–]\s*(.*)')
# Numbered item with bold label + em/en dash: 1. **Title** — body
_NUM_BOLD = re.compile(r'^\*\*([^*]+)\*\*\s*[—–]\s*(.*)')


def _convert_block(md: str) -> str:
    """Convert a Markdown body section to LaTeX."""
    lines = md.split('\n')
    out: list[str] = []
    list_type: str | None = None
    para: list[str] = []

    def flush() -> None:
        if para:
            out.append(_inline(' '.join(para)) + '\n\n')
            para.clear()

    def close_list() -> None:
        nonlocal list_type
        if list_type == 'enumerate':
            out.append('\n\\end{enumerate}\n\n')
        elif list_type == 'itemize':
            out.append('\n\\end{itemize}\n\n')
        list_type = None

    for raw in lines:
        s = raw.strip()

        # Skip blockquote / editorial notes
        if s.startswith('> '):
            continue
        # Skip bare horizontal rules
        if re.match(r'^-{3,}$', s):
            continue

        # Blank line
        if not s:
            if not list_type:
                flush()
            continue

        is_num    = bool(_NUMBERED.match(s))
        is_bullet = bool(_BULLET.match(s))

        # Close list when type no longer matches the current line
        if list_type == 'enumerate' and not is_num:
            close_list()
        elif list_type == 'itemize' and not is_bullet:
            close_list()

        # Numbered list item
        if is_num:
            flush()
            if not list_type:
                out.append('\\begin{enumerate}[leftmargin=*, label=\\textbf{\\arabic*.}]\n\n')
                list_type = 'enumerate'
            content = _NUMBERED.sub('', s)
            # Detect  **Bold label** — body  pattern
            m = _NUM_BOLD.match(content)
            if m:
                item_tex = r'\textbf{' + _inline(m.group(1)) + '.}\n' + _inline(m.group(2))
            else:
                item_tex = _inline(content)
            out.append('\\item ' + item_tex + '\n')
            continue

        # Bullet list item
        if is_bullet:
            flush()
            content = _BULLET.sub('', s)
            # Bullet with bold paragraph header: **Title:** body → \paragraph
            m = re.match(r'^\*\*([^*]+)\*\*:\s*(.*)', content)
            if m:
                if list_type:
                    close_list()
                out.append('\\paragraph{' + _inline(m.group(1)) + '.}\n'
                           + _inline(m.group(2)) + '\n\n')
            else:
                if not list_type:
                    out.append('\\begin{itemize}\n')
                    list_type = 'itemize'
                out.append('\\item ' + _inline(content) + '\n')
            continue

        # Bold paragraph header in regular text: **Header:** body  |  **Header** — body
        m = _BOLD_HDR.match(s)
        if m:
            flush()
            hdr  = _inline(m.group(1))
            body = _inline(m.group(2))
            out.append(f'\\paragraph{{{hdr}.}}\n{body}\n\n')
            continue

        # Regular paragraph line
        para.append(s)

    flush()
    if list_type:
        close_list()
    return ''.join(out)


# ── section parsers ──────────────────────────────────────────────────────────

def _parse_sections(md: str) -> dict[str, str]:
    """Split Markdown into a dict of {section_heading: content}."""
    sections: dict[str, str] = {'__front__': ''}
    key = '__front__'
    buf: list[str] = []
    for line in md.split('\n'):
        if line.startswith('## '):
            sections[key] = '\n'.join(buf)
            key = line[3:].strip()
            buf = []
        else:
            buf.append(line)
    sections[key] = '\n'.join(buf)
    return sections


def _extract_title_author_date(secs: dict[str, str]) -> tuple[str, str, str]:
    t_md = secs.get('Title', '')
    bold = re.search(r'\*\*([^*]+)\*\*', t_md)
    ital = re.search(r'(?<!\*)\*([^*\n]+)\*(?!\*)', t_md)
    main = bold.group(1) if bold else 'Locus'
    sub  = ital.group(1) if ital else ''

    main_tex = _inline(main)
    if sub:
        sub_tex = _inline(sub)
        title = main_tex + r'\\[0.4em]' + '\n{\\normalsize\\itshape ' + sub_tex + '}'
    else:
        title = main_tex

    a_lines = [
        l.strip().rstrip()
        for l in secs.get('Authors', '').strip().split('\n')
        if l.strip()
    ]
    author = '\\\\\n'.join(_inline(l) for l in a_lines)

    dm = re.search(r'\*\*Date:\*\*\s*(\S+)', secs.get('__front__', ''))
    date = dm.group(1) if dm else '2026'

    return title, author, date


def _extract_abstract(md: str) -> str:
    lines = [l for l in md.split('\n') if not l.strip().startswith('>')]
    return _inline(' '.join(l.strip() for l in lines if l.strip()))


def _convert_references(refs_md: str) -> str:
    entries: list[str] = []
    for line in refs_md.split('\n'):
        s = line.strip()
        if not s.startswith('- '):
            continue
        ref = s[2:].strip()
        key = _bibkey(ref)
        entries.append(f'\\bibitem{{{key}}}\n{_inline(ref)}\n')
    if not entries:
        return ''
    body = '\n'.join(entries)
    return f'\\begin{{thebibliography}}{{9}}\n\n{body}\n\\end{{thebibliography}}\n'


# ── sections to skip in the PDF ──────────────────────────────────────────────

_SKIP = {'__front__', 'Title', 'Authors', 'Abstract', 'Submission Checklist', 'References'}


def _section_name(key: str) -> str:
    """Strip leading ordinal prefix  '1 — '  from section keys."""
    return re.sub(r'^\d+\s*[—–]\s*', '', key).strip()


# ── full document builder ────────────────────────────────────────────────────

def build_tex(md_text: str) -> str:
    secs = _parse_sections(md_text)
    title, author, date = _extract_title_author_date(secs)
    abstract_tex = _extract_abstract(secs.get('Abstract', ''))

    body_parts: list[str] = []
    for key, content in secs.items():
        if key in _SKIP:
            continue
        name = _section_name(key)
        body_parts.append(f'% ── {name} ────────────────────────────────────────────────────────\n')
        body_parts.append(f'\\section{{{name}}}\n\n')
        body_parts.append(_convert_block(content))

    refs_tex = _convert_references(secs.get('References', ''))

    lines = [
        PREAMBLE,
        '',
        f'\\title{{{title}}}',
        '',
        '\\author{',
        author,
        '}',
        '',
        f'\\date{{{date} \\quad (preprint)}}',
        '',
        '% ─────────────────────────────────────────────────────────────────────',
        '\\begin{document}',
        '\\maketitle',
        '',
        '\\begin{abstract}',
        abstract_tex,
        '\\end{abstract}',
        '',
        *body_parts,
        refs_tex,
        '',
        '\\end{document}',
    ]
    return '\n'.join(lines)


# ── entry point ──────────────────────────────────────────────────────────────

def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else repo_root / 'locus_arxiv_draft.md'
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else repo_root / 'locus_arxiv.tex'
    if not src.is_absolute():
        src = (repo_root / src).resolve()
    if not dst.is_absolute():
        dst = (repo_root / dst).resolve()
    if not src.exists():
        print(f'Error: {src} not found', file=sys.stderr)
        return 2
    tex = build_tex(src.read_text('utf-8'))
    dst.write_text(tex, 'utf-8')
    print(f'Written: {dst}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

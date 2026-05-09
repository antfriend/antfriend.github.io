#!/usr/bin/env python3
"""Build locus_arxiv.pdf from locus_arxiv_draft.md.

Pipeline:
  1. py/md_to_arxiv_tex.py  →  locus_arxiv.tex
  2. pdflatex (run twice for cross-references)  →  locus_arxiv.pdf

Usage:
    python build_arxiv.py              # default: draft.md → .tex → .pdf
    python build_arxiv.py --tex-only   # stop after generating .tex
    python build_arxiv.py --pdf-only   # skip .tex step, run pdflatex on existing .tex
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SRC_MD  = REPO_ROOT / 'locus_arxiv_draft.md'
DST_TEX = REPO_ROOT / 'locus_arxiv.tex'
DST_PDF = REPO_ROOT / 'locus_arxiv.pdf'
CONVERTER = REPO_ROOT / 'py' / 'md_to_arxiv_tex.py'


def step_md_to_tex() -> bool:
    """Convert Markdown draft to LaTeX. Returns True on success."""
    print('-- Step 1: Markdown -> LaTeX --------------------------------')
    if not SRC_MD.exists():
        print(f'  ERROR: source not found: {SRC_MD}', file=sys.stderr)
        return False
    result = subprocess.run(
        [sys.executable, str(CONVERTER), str(SRC_MD), str(DST_TEX)],
        capture_output=True, text=True,
    )
    if result.stdout:
        print(' ', result.stdout.strip())
    if result.returncode != 0:
        print(f'  ERROR (exit {result.returncode}):\n{result.stderr}', file=sys.stderr)
        return False
    return True


def find_pdflatex() -> str | None:
    return shutil.which('pdflatex')


def step_tex_to_pdf(pdf_cmd: str) -> bool:
    """Run pdflatex twice (resolves cross-references). Returns True on success."""
    print('-- Step 2: LaTeX -> PDF -------------------------------------')
    if not DST_TEX.exists():
        print(f'  ERROR: .tex not found: {DST_TEX}', file=sys.stderr)
        return False

    args = [
        pdf_cmd,
        '-interaction=nonstopmode',
        '-halt-on-error',
        DST_TEX.name,
    ]

    for run_n in (1, 2):
        print(f'  pdflatex pass {run_n}/2 ...')
        result = subprocess.run(
            args, cwd=str(REPO_ROOT),
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            # Show the last 30 lines of the log (most useful part on error)
            log_tail = '\n'.join(result.stdout.splitlines()[-30:])
            print(f'  ERROR (pass {run_n}):\n{log_tail}', file=sys.stderr)
            log_file = REPO_ROOT / 'locus_arxiv.log'
            if log_file.exists():
                print(f'  Full log: {log_file}', file=sys.stderr)
            return False

    if DST_PDF.exists():
        size_kb = DST_PDF.stat().st_size // 1024
        print(f'  OK -> {DST_PDF}  ({size_kb} KB)')
        return True

    print('  ERROR: pdflatex exited 0 but PDF not found.', file=sys.stderr)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tex-only', action='store_true',
                        help='Stop after generating locus_arxiv.tex')
    parser.add_argument('--pdf-only', action='store_true',
                        help='Skip md→tex step; run pdflatex on existing .tex')
    args = parser.parse_args()

    if not args.pdf_only:
        if not step_md_to_tex():
            return 1

    if args.tex_only:
        return 0

    pdf_cmd = find_pdflatex()
    if not pdf_cmd:
        print(
            'ERROR: pdflatex not found in PATH.\n'
            'Install MiKTeX or TeX Live, or run with --tex-only and compile manually.',
            file=sys.stderr,
        )
        return 1

    if not step_tex_to_pdf(pdf_cmd):
        return 1

    print('-- Done -----------------------------------------------------')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Download FAA d-TPP approach plates for KBOI (Boise) and build a TTDB.

Dependencies:
    pip install requests pymupdf

Output:
    boi_plates/
        pdfs/       raw FAA PDFs
        images/     PNG renders of each plate (one per PDF page)
    BOI_approach_plates.md   the TTDB file
"""

from __future__ import annotations

import time
import xml.etree.ElementTree as ET
from pathlib import Path
import sys

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("Missing: pip install pymupdf")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CYCLE = "2604"
BASE_URL = f"https://aeronav.faa.gov/d-tpp/{CYCLE}"
METAFILE_URL = f"{BASE_URL}/xml/d-TPP_Metafile.xml"

AIRPORT_ID = "KBOI"
OUT_DIR = Path("boi_plates")
PDF_DIR = OUT_DIR / "pdfs"
IMG_DIR = OUT_DIR / "images"
TTDB_PATH = Path("BOI_approach_plates.md")

DPI = 150  # render resolution; 150 dpi is readable, 200+ is crisp

# ---------------------------------------------------------------------------
# Geographic coordinate system
# ---------------------------------------------------------------------------
# coord_increment = 0.1 degrees.
# ID = @{round(lat/0.1)}x{round(lon/0.1)}
# 1 LAT step ≈ 11.1 km. 1 LON step ≈ 8.0 km at 43.5°N (cos(43.5°) ≈ 0.724).
#
# Approach plates are placed at their IAF position on the extended runway
# centerline, approximately 17 nm from the airport threshold.
# STAR fixes placed at confirmed or estimated real-world positions.
#
# KBOI runways 10/28 oriented ~102°/282°:
#   RWY 28 (landing west): aircraft approach from the EAST  → lon increases
#   RWY 10 (landing east): aircraft approach from the WEST  → lon decreases
# Parallel runways: 10L/28R = north (LAT+1), 10R/28L = south (LAT-1).

COORD_INCREMENT = 0.1

# Explicit geographic IDs keyed by pdf_name stem.
# lat/lon are decimal degrees; ID is computed automatically.
# "estimated": True means the position was inferred, not confirmed.
PLATE_GEO = {
    "00057AD":     {"lat": 43.5644, "lon": -116.2228, "estimated": False,
                    "note": "KBOI airport reference point"},
    "00057IL28R":  {"lat": 43.70,   "lon": -115.83,   "estimated": True,
                    "note": "IAF east of airport, RWY 28R (north parallel), ~17 nm"},
    "00057RY28L":  {"lat": 43.50,   "lon": -115.83,   "estimated": True,
                    "note": "IAF east of airport, RWY 28L (south parallel), ~17 nm"},
    "00057RY10L":  {"lat": 43.70,   "lon": -116.62,   "estimated": True,
                    "note": "IAF west of airport, RWY 10L (north parallel), ~17 nm"},
    "00057RY10R":  {"lat": 43.50,   "lon": -116.62,   "estimated": True,
                    "note": "IAF west of airport, RWY 10R (south parallel), ~17 nm"},
    "00057BEWTE":  {"lat": 44.008,  "lon": -116.431,  "estimated": False,
                    "note": "Confirmed via OpenNav. NNW of KBOI, ~26 nm N, ~9 nm W."},
    "00057SPUUD":  {"lat": 43.274,  "lon": -115.678,  "estimated": False,
                    "note": "Confirmed via OpenNav. SE of KBOI, ~17 nm S, ~23 nm E."},
    "00057KOURT":  {"lat": 44.20,   "lon": -115.90,   "estimated": True,
                    "note": "Estimated NNE of KBOI. Not in public fix databases."},
    "00057KYAAN":  {"lat": 43.830,  "lon": -116.645,  "estimated": False,
                    "note": "Confirmed via OpenNav. WNW of KBOI, ~16 nm N, ~18 nm W."},
    "00057SADYL":  {"lat": 42.80,   "lon": -116.60,   "estimated": True,
                    "note": "Estimated SSW of KBOI. Not in public fix databases."},
}

HUMAN_NAMES = {
    "STAR": "STAR",
    "IAP":  "Approach",
    "APD":  "Airport Diagram",
    "DP":   "Departure",
    "MIN":  "Alternate Minimums",
    "HOT":  "Hot Spots",
}

# Fallback plate list when metafile fetch fails (confirmed cycle 2604)
FALLBACK_PLATES = [
    {"chart_code": "APD",  "chart_name": "AIRPORT DIAGRAM",             "pdf_name": "00057AD.PDF",     "chart_seq": "10"},
    {"chart_code": "IAP",  "chart_name": "ILS OR LOC RWY 28R",          "pdf_name": "00057IL28R.PDF",  "chart_seq": "20"},
    {"chart_code": "IAP",  "chart_name": "RNAV (GPS) Y RWY 10L",        "pdf_name": "00057RY10L.PDF",  "chart_seq": "30"},
    {"chart_code": "IAP",  "chart_name": "RNAV (GPS) Y RWY 10R",        "pdf_name": "00057RY10R.PDF",  "chart_seq": "40"},
    {"chart_code": "IAP",  "chart_name": "RNAV (GPS) Y RWY 28L",        "pdf_name": "00057RY28L.PDF",  "chart_seq": "50"},
    {"chart_code": "STAR", "chart_name": "BEWTE FOUR",                  "pdf_name": "00057BEWTE.PDF",  "chart_seq": "60"},
    {"chart_code": "STAR", "chart_name": "SPUUD FOUR",                  "pdf_name": "00057SPUUD.PDF",  "chart_seq": "70"},
    {"chart_code": "STAR", "chart_name": "KOURT FOUR",                  "pdf_name": "00057KOURT.PDF",  "chart_seq": "80"},
    {"chart_code": "STAR", "chart_name": "KYAAN FOUR",                  "pdf_name": "00057KYAAN.PDF",  "chart_seq": "90"},
    {"chart_code": "STAR", "chart_name": "SADYL FOUR",                  "pdf_name": "00057SADYL.PDF",  "chart_seq": "100"},
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch_kboi_plates() -> list[dict]:
    """Try to pull KBOI plate list from the d-TPP XML metafile."""
    print(f"Fetching metafile: {METAFILE_URL}")
    try:
        r = requests.get(METAFILE_URL, timeout=30)
        r.raise_for_status()
    except Exception as exc:
        print(f"  Metafile unavailable ({exc}), using fallback list.")
        return FALLBACK_PLATES

    root = ET.fromstring(r.content)
    plates: list[dict] = []

    # Search every airport_name element for our airport ID
    for airport_el in root.iter("airport_name"):
        if airport_el.get("ID", "").upper() != AIRPORT_ID:
            continue
        for rec in airport_el.iter("record"):
            pdf = (rec.findtext("pdf_name") or "").strip()
            if not pdf:
                continue
            plates.append({
                "chart_code": (rec.findtext("chart_code") or "").strip(),
                "chart_name": (rec.findtext("chart_name") or "").strip(),
                "pdf_name":   pdf,
                "chart_seq":  (rec.findtext("chart_seq") or "0").strip(),
            })
        break

    if not plates:
        print("  No KBOI records found in metafile, using fallback list.")
        return FALLBACK_PLATES

    print(f"  Found {len(plates)} KBOI plates in metafile.")
    return plates


def download_pdf(pdf_name: str, dest: Path) -> bool:
    """Download a single PDF to dest. Returns True on success."""
    if dest.exists():
        print(f"  Already have {dest.name}")
        return True
    url = f"{BASE_URL}/{pdf_name}"
    try:
        r = requests.get(url, timeout=60, stream=True)
        r.raise_for_status()
        dest.write_bytes(r.content)
        print(f"  Downloaded {dest.name}")
        return True
    except Exception as exc:
        print(f"  FAILED {pdf_name}: {exc}")
        return False


def pdf_to_images(pdf_path: Path, img_dir: Path, stem: str) -> list[Path]:
    """Render each page of pdf_path to a PNG in img_dir."""
    doc = fitz.open(str(pdf_path))
    mat = fitz.Matrix(DPI / 72, DPI / 72)
    paths: list[Path] = []
    for i, page in enumerate(doc):
        suffix = f"_p{i+1}" if len(doc) > 1 else ""
        out = img_dir / f"{stem}{suffix}.png"
        if not out.exists():
            pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
            pix.save(str(out))
            print(f"    Rendered {out.name}")
        else:
            print(f"    Already have {out.name}")
        paths.append(out)
    doc.close()
    return paths


def geo_to_id(lat: float, lon: float) -> str:
    """Convert decimal lat/lon to TTDB ID using coord_increment=0.1."""
    lat_int = round(lat / COORD_INCREMENT)
    lon_int = round(lon / COORD_INCREMENT)
    return f"@{lat_int}x{lon_int}"


def make_ttdb(plates: list[dict], img_dir: Path) -> str:
    """Build the TTDB Markdown string from the plate list."""
    now = int(time.time())

    # ---- assign geographic IDs ----
    records: list[dict] = []

    for p in plates:
        stem = Path(p["pdf_name"]).stem
        geo = PLATE_GEO.get(stem)

        if geo:
            rec_id = geo_to_id(geo["lat"], geo["lon"])
            pos_note = geo["note"]
            pos_str = f"{abs(geo['lat']):.3f}°{'N' if geo['lat']>=0 else 'S'} {abs(geo['lon']):.3f}°{'E' if geo['lon']>=0 else 'W'}"
            if geo["estimated"]:
                pos_str += " (estimated)"
        else:
            # fallback: hash-derived position offset from airport
            import hashlib
            h = int(hashlib.md5(stem.encode()).hexdigest(), 16) % 100
            rec_id = geo_to_id(43.5644 + h * 0.01, -116.2228 + h * 0.01)
            pos_note = "Position not in PLATE_GEO — hash-derived fallback."
            pos_str = "unknown"

        imgs = sorted(img_dir.glob(f"{stem}*.png"))
        img_refs = [f"boi_plates/images/{im.name}" for im in imgs]

        records.append({
            **p,
            "id":       rec_id,
            "stem":     stem,
            "pos_str":  pos_str,
            "pos_note": pos_note,
            "img_refs": img_refs,
        })

    # ---- build edge lists ----
    # Group by category
    by_cat: dict[int, list[dict]] = {}
    for r in records:
        by_cat.setdefault(r["x"], []).append(r)

    # Find the airport diagram record (APD, x=2)
    apd_records = by_cat.get(CATEGORY_ORDER["APD"], [])
    apd_id = apd_records[0]["id"] if apd_records else None

    # Find approach records (IAP, x=1)
    iap_records = by_cat.get(CATEGORY_ORDER["IAP"], [])
    iap_ids = [r["id"] for r in iap_records]

    def edges_for(rec: dict) -> str:
        code = rec["chart_code"]
        rid  = rec["id"]
        parts: list[str] = []

        if code == "STAR":
            # STARs lead to approaches; alternates are other STARs
            for iid in iap_ids:
                parts.append(f"sequence>{iid}")
            others = [r["id"] for r in by_cat.get(CATEGORY_ORDER["STAR"], []) if r["id"] != rid]
            for oid in others:
                parts.append(f"alternate>{oid}")

        elif code == "IAP":
            # Approaches lead to airport diagram
            if apd_id:
                parts.append(f"sequence@{apd_id}")
            others = [i for i in iap_ids if i != rid]
            for oid in others:
                parts.append(f"alternate>{oid}")

        elif code == "APD":
            # Diagram links back to all approaches (departures/go-around)
            for iid in iap_ids:
                parts.append(f"references>{iid}")
            dp_records = by_cat.get(CATEGORY_ORDER.get("DP", 3), [])
            for dp in dp_records:
                parts.append(f"sequence>{dp['id']}")

        return ", ".join(parts)

    # ---- render TTDB text ----
    lines: list[str] = []

    # ---- header ----
    lines.append("# BOI Approach Plates — TTDB")
    lines.append("")
    lines.append("```mmpdb")
    lines.append(f"db_id: kboi_approach_plates_{CYCLE}")
    lines.append('db_name: "Boise Airport (KBOI) Approach Plates — FAA d-TPP Cycle ' + CYCLE + '"')
    lines.append(f"coord_increment: {COORD_INCREMENT}")
    lines.append("collision_policy: southeast_step")
    lines.append("timestamp_kind: unix")
    lines.append("umwelt:")
    lines.append("  umwelt_id: boi_nav")
    lines.append("  role: approach_navigator")
    lines.append("  perspective: pilot_inbound")
    lines.append("  scope: terminal_area_kboi")
    lines.append("  constraints: [FAA_public_domain, cycle_" + CYCLE + "]")
    lines.append("  globe:")
    lines.append("    frame: geographic_decimal")
    lines.append("    origin: kboi_airport_reference_point")
    lines.append("    mapping: real_lat_lon_at_0.1deg_steps")
    lines.append('    note: >')
    lines.append('      IDs encode real-world decimal degrees at 0.1° resolution.')
    lines.append('      @LATxLON where LAT=round(lat/0.1), LON=round(lon/0.1).')
    lines.append('      1 LAT step ≈ 11.1 km. 1 LON step ≈ 8.0 km at 43.5°N.')
    lines.append('      Approaches at IAF on extended centerline (~17 nm out).')
    lines.append('      STARs at confirmed or estimated entry fix positions.')
    lines.append("cursor_policy:")
    lines.append("  max_preview_chars: 300")
    lines.append("  max_nodes: 20")
    lines.append("typed_edges:")
    lines.append("  enabled: true")
    lines.append('  syntax: "<type>@<TARGET_ID>"')
    lines.append('  note: "sequence=next in flight flow; alternate=parallel option; references=back-link"')
    lines.append("librarian:")
    lines.append("  enabled: true")
    lines.append("  primitive_queries: [NEXT, PREV, ALT, LIST, SHOW]")
    lines.append("  max_reply_chars: 400")
    lines.append('  invocation_prefix: "LIB>"')
    lines.append("```")
    lines.append("")

    # ---- cursor ----
    if apd_id:
        selected_id = apd_id
    elif records:
        selected_id = records[0]["id"]
    else:
        selected_id = ""

    lines.append("```cursor")
    lines.append("selected:")
    lines.append(f"- {selected_id}")
    lines.append("preview: {}")
    lines.append('agent_note: "KBOI plate graph. Navigate: STAR → approach → airport diagram. Query with NEXT/ALT/LIST."')
    lines.append('dot: ""')
    lines.append('last_query: ""')
    lines.append('last_answer: ""')
    lines.append("answer_records: []")
    lines.append("```")
    lines.append("")

    # ---- records ----
    for rec in records:
        lines.append("---")
        lines.append("")
        edge_str = edges_for(rec)
        cat_label = HUMAN_NAMES.get(rec["chart_code"], rec["chart_code"])
        lines.append(
            f"{rec['id']} | created:{now} | updated:{now}"
            + (f" | relates: {edge_str}" if edge_str else "")
        )
        lines.append(f"## {cat_label}: {rec['chart_name'].title()}")
        lines.append("")
        lines.append(f"**Airport:** KBOI — Boise Airport / Gowen Field  ")
        lines.append(f"**Position:** {rec['pos_str']} — {rec['pos_note']}  ")
        lines.append(f"**Chart code:** {rec['chart_code']}  ")
        lines.append(f"**FAA PDF:** `{rec['pdf_name']}`  ")
        lines.append(f"**d-TPP cycle:** {CYCLE}  ")
        lines.append(f"**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/{CYCLE}/{rec['pdf_name']})  ")
        lines.append("")
        if rec["img_refs"]:
            for img in rec["img_refs"]:
                lines.append(f"![{rec['chart_name']}]({img})")
                lines.append("")
        else:
            lines.append("_Image not yet rendered — run script with PyMuPDF installed._")
            lines.append("")

    lines.append("---")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    IMG_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Get plate list
    plates = fetch_kboi_plates()
    print(f"\nPlates to process: {len(plates)}")

    # 2. Download PDFs
    print("\n--- Downloading PDFs ---")
    available: list[dict] = []
    for p in plates:
        dest = PDF_DIR / p["pdf_name"]
        if download_pdf(p["pdf_name"], dest):
            available.append(p)

    # 3. Convert to images
    print("\n--- Rendering PNGs ---")
    for p in available:
        pdf_path = PDF_DIR / p["pdf_name"]
        stem = Path(p["pdf_name"]).stem
        try:
            pdf_to_images(pdf_path, IMG_DIR, stem)
        except Exception as exc:
            print(f"  Render failed for {p['pdf_name']}: {exc}")

    # 4. Build TTDB
    print("\n--- Building TTDB ---")
    ttdb_text = make_ttdb(available, IMG_DIR)
    TTDB_PATH.write_text(ttdb_text, encoding="utf-8")
    print(f"Written: {TTDB_PATH}")

    print("\nDone.")
    print(f"  PDFs : {PDF_DIR}")
    print(f"  PNGs : {IMG_DIR}")
    print(f"  TTDB : {TTDB_PATH}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Download FAA d-TPP approach plates for KBOI and connected airports,
building a growing multi-airport TTDB.

Each run adds up to ADDS_PER_RUN new airports from AIRPORT_NETWORK.
State is tracked in boi_plates/state.json.

Dependencies:
    pip install requests pymupdf

Output:
    boi_plates/
        pdfs/       raw FAA PDFs
        images/     PNG renders of each plate (one per PDF page)
        state.json  which airports have been added so far
    BOI_approach_plates.md   the TTDB file
"""

from __future__ import annotations

import hashlib
import json
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

OUT_DIR = Path("boi_plates")
PDF_DIR = OUT_DIR / "pdfs"
IMG_DIR = OUT_DIR / "images"
TTDB_PATH = Path("BOI_approach_plates.md")
STATE_PATH = OUT_DIR / "state.json"

COORD_INCREMENT = 0.1
DPI = 150
ADDS_PER_RUN = 2  # new airports to add each run

# ---------------------------------------------------------------------------
# Airport network — ordered by proximity/connectivity from KBOI
# ---------------------------------------------------------------------------

AIRPORT_NETWORK = [
    {"id": "KBOI", "name": "Boise Airport / Gowen Field",           "lat": 43.5644, "lon": -116.2228},
    {"id": "KTWF", "name": "Magic Valley Regional",                  "lat": 42.4818, "lon": -114.4877},
    {"id": "KSUN", "name": "Friedman Memorial (Sun Valley/Hailey)",  "lat": 43.5044, "lon": -114.2963},
    {"id": "KMYL", "name": "McCall Municipal",                       "lat": 44.8897, "lon": -116.1012},
    {"id": "KPIH", "name": "Pocatello Regional",                     "lat": 42.9098, "lon": -112.5960},
    {"id": "KIDA", "name": "Idaho Falls Regional",                   "lat": 43.5146, "lon": -112.0702},
    {"id": "KSMN", "name": "Lemhi County",                           "lat": 45.1238, "lon": -113.8801},
    {"id": "KBKE", "name": "Baker City Municipal",                   "lat": 44.8373, "lon": -117.8086},
    {"id": "KLWS", "name": "Lewiston-Nez Perce County",              "lat": 46.3745, "lon": -117.0153},
    {"id": "KSLC", "name": "Salt Lake City International",           "lat": 40.7884, "lon": -111.9778},
]

# Index for quick lookup
AIRPORT_INDEX = {a["id"]: a for a in AIRPORT_NETWORK}

# ---------------------------------------------------------------------------
# KBOI-specific plate geographic positions (confirmed or carefully estimated)
# ---------------------------------------------------------------------------

PLATE_GEO_KBOI = {
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

# Fallback plate list for KBOI when the metafile is unavailable (cycle 2604)
FALLBACK_PLATES_KBOI = [
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
# State
# ---------------------------------------------------------------------------

def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"included_airports": ["KBOI"]}


def save_state(state: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def pick_new_airports(included: list[str], n: int) -> list[str]:
    """Return up to n airports from AIRPORT_NETWORK not yet in included."""
    added = []
    for airport in AIRPORT_NETWORK:
        if airport["id"] not in included:
            added.append(airport["id"])
            if len(added) >= n:
                break
    return added


# ---------------------------------------------------------------------------
# Metafile (fetched once, shared across airports)
# ---------------------------------------------------------------------------

def fetch_metafile() -> ET.Element | None:
    print(f"Fetching metafile: {METAFILE_URL}")
    try:
        r = requests.get(METAFILE_URL, timeout=30)
        r.raise_for_status()
        return ET.fromstring(r.content)
    except Exception as exc:
        print(f"  Metafile unavailable ({exc})")
        return None


def fetch_airport_plates(airport_id: str, root: ET.Element | None) -> list[dict]:
    """Return plate dicts for airport_id from metafile root, or fallback."""
    if root is None:
        if airport_id == "KBOI":
            print(f"  Using fallback list for {airport_id}.")
            return FALLBACK_PLATES_KBOI
        print(f"  No metafile and no fallback for {airport_id} — skipping.")
        return []

    plates: list[dict] = []
    for airport_el in root.iter("airport_name"):
        if airport_el.get("ID", "").upper() != airport_id:
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
        if airport_id == "KBOI":
            print(f"  No records for {airport_id} in metafile — using fallback.")
            return FALLBACK_PLATES_KBOI
        print(f"  No records found for {airport_id} in metafile — skipping.")
        return []

    print(f"  Found {len(plates)} plates for {airport_id}.")
    return plates


# ---------------------------------------------------------------------------
# Download / render
# ---------------------------------------------------------------------------

def download_pdf(pdf_name: str, dest: Path) -> bool:
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


# ---------------------------------------------------------------------------
# Geographic IDs
# ---------------------------------------------------------------------------

def geo_to_id(lat: float, lon: float) -> str:
    lat_int = round(lat / COORD_INCREMENT)
    lon_int = round(lon / COORD_INCREMENT)
    return f"@{lat_int}x{lon_int}"


def geo_for_plate(airport_id: str, stem: str, chart_code: str,
                  airport_info: dict) -> dict:
    """Return a geo dict {lat, lon, estimated, note} for a plate."""
    # KBOI has hand-curated positions
    if airport_id == "KBOI" and stem in PLATE_GEO_KBOI:
        return PLATE_GEO_KBOI[stem]

    base_lat = airport_info["lat"]
    base_lon = airport_info["lon"]

    # Airport Diagram sits at the airport reference point
    if chart_code == "APD":
        return {
            "lat": base_lat,
            "lon": base_lon,
            "estimated": False,
            "note": f"{airport_id} airport reference point",
        }

    # Other plates: small hash-derived offset so each gets a unique cell
    h = int(hashlib.md5(stem.encode()).hexdigest(), 16)
    dlat = ((h % 7) - 3) * COORD_INCREMENT
    dlon = (((h >> 8) % 7) - 3) * COORD_INCREMENT
    return {
        "lat": base_lat + dlat,
        "lon": base_lon + dlon,
        "estimated": True,
        "note": f"{airport_id} plate — position estimated from airport reference point",
    }


# ---------------------------------------------------------------------------
# TTDB builder
# ---------------------------------------------------------------------------

def make_ttdb(all_plates: dict[str, list[dict]], img_dir: Path,
              included_airports: list[str]) -> str:
    """
    Build the TTDB Markdown string.

    all_plates: {airport_id: [plate_dicts]} — only successfully downloaded plates.
    included_airports: ordered list of airport IDs to include.
    """
    now = int(time.time())

    # ---- build full record list ----
    records: list[dict] = []
    for airport_id in included_airports:
        airport_info = AIRPORT_INDEX.get(airport_id, {
            "id": airport_id, "name": airport_id,
            "lat": 0.0, "lon": 0.0,
        })
        for p in all_plates.get(airport_id, []):
            stem = Path(p["pdf_name"]).stem
            geo  = geo_for_plate(airport_id, stem, p["chart_code"],
                                 airport_info)
            rec_id  = geo_to_id(geo["lat"], geo["lon"])
            pos_str = (f"{abs(geo['lat']):.3f}°{'N' if geo['lat']>=0 else 'S'} "
                       f"{abs(geo['lon']):.3f}°{'E' if geo['lon']>=0 else 'W'}")
            if geo["estimated"]:
                pos_str += " (estimated)"

            imgs     = sorted(img_dir.glob(f"{stem}*.png"))
            img_refs = [f"boi_plates/images/{im.name}" for im in imgs]

            records.append({
                **p,
                "airport_id": airport_id,
                "airport_name": airport_info["name"],
                "id":        rec_id,
                "stem":      stem,
                "pos_str":   pos_str,
                "pos_note":  geo["note"],
                "img_refs":  img_refs,
            })

    # ---- index by airport and by chart code per airport ----
    by_airport: dict[str, list[dict]] = {}
    for r in records:
        by_airport.setdefault(r["airport_id"], []).append(r)

    # Airport diagram node IDs (one per airport)
    apd_id_for: dict[str, str] = {}
    for aid, recs in by_airport.items():
        apds = [r for r in recs if r["chart_code"] == "APD"]
        if apds:
            apd_id_for[aid] = apds[0]["id"]

    def edges_for(rec: dict) -> str:
        code = rec["chart_code"]
        rid  = rec["id"]
        aid  = rec["airport_id"]
        airport_recs = by_airport.get(aid, [])

        iap_ids  = [r["id"] for r in airport_recs if r["chart_code"] == "IAP"]
        star_ids = [r["id"] for r in airport_recs if r["chart_code"] == "STAR"]
        apd_id   = apd_id_for.get(aid)
        dp_ids   = [r["id"] for r in airport_recs if r["chart_code"] == "DP"]

        parts: list[str] = []

        if code == "STAR":
            for iid in iap_ids:
                parts.append(f"sequence>{iid}")
            for oid in star_ids:
                if oid != rid:
                    parts.append(f"alternate>{oid}")

        elif code == "IAP":
            if apd_id:
                parts.append(f"sequence>{apd_id}")
            for oid in iap_ids:
                if oid != rid:
                    parts.append(f"alternate>{oid}")

        elif code == "APD":
            for iid in iap_ids:
                parts.append(f"references>{iid}")
            for dp in dp_ids:
                parts.append(f"sequence>{dp}")
            # Cross-airport edges: link to neighbouring airports' diagrams
            for other_aid, other_apd in apd_id_for.items():
                if other_aid != aid:
                    parts.append(f"nearby>{other_apd}")

        return ", ".join(parts)

    # ---- header ----
    lines: list[str] = []
    lines.append("# BOI Network Approach Plates — TTDB")
    lines.append("")
    lines.append("```mmpdb")
    lines.append(f"db_id: boi_network_approach_plates_{CYCLE}")
    lines.append(f'db_name: "BOI Network Approach Plates — FAA d-TPP Cycle {CYCLE}"')
    lines.append(f"coord_increment: {COORD_INCREMENT}")
    lines.append("collision_policy: southeast_step")
    lines.append("timestamp_kind: unix")
    lines.append("umwelt:")
    lines.append("  umwelt_id: boi_network_nav")
    lines.append("  role: approach_navigator")
    lines.append("  perspective: pilot_inbound")
    lines.append("  scope: idaho_and_nearby_terminals")
    lines.append(f"  constraints: [FAA_public_domain, cycle_{CYCLE}]")
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
    lines.append('  note: "sequence=next in flight flow; alternate=parallel option; references=back-link; nearby=adjacent airport"')
    lines.append("librarian:")
    lines.append("  enabled: true")
    lines.append("  primitive_queries: [NEXT, PREV, ALT, LIST, SHOW]")
    lines.append("  max_reply_chars: 400")
    lines.append('  invocation_prefix: "LIB>"')
    lines.append(f"airports_included: [{', '.join(included_airports)}]")
    lines.append("```")
    lines.append("")

    # ---- cursor ----
    seed_apd = apd_id_for.get("KBOI") or (records[0]["id"] if records else "")
    lines.append("```cursor")
    lines.append("selected:")
    lines.append(f"- {seed_apd}")
    lines.append("preview: {}")
    lines.append(f'agent_note: "BOI network plate graph ({len(included_airports)} airports). Navigate: STAR → approach → airport diagram → nearby airports. Query with NEXT/ALT/LIST."')
    lines.append('dot: ""')
    lines.append('last_query: ""')
    lines.append('last_answer: ""')
    lines.append("answer_records: []")
    lines.append("```")
    lines.append("")

    # ---- per-airport sections ----
    for airport_id in included_airports:
        airport_recs = by_airport.get(airport_id, [])
        if not airport_recs:
            continue
        airport_name = AIRPORT_INDEX.get(airport_id, {}).get("name", airport_id)
        lines.append(f"# {airport_id} — {airport_name}")
        lines.append("")

        for rec in airport_recs:
            lines.append("---")
            lines.append("")
            edge_str  = edges_for(rec)
            cat_label = HUMAN_NAMES.get(rec["chart_code"], rec["chart_code"])
            lines.append(
                f"{rec['id']} | created:{now} | updated:{now}"
                + (f" | relates: {edge_str}" if edge_str else "")
            )
            lines.append(f"## {cat_label}: {rec['chart_name'].title()}")
            lines.append("")
            lines.append(f"**Airport:** {airport_id} — {airport_name}  ")
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

    # 1. Load state and decide which airports to add this run
    state = load_state()
    included = state.get("included_airports", ["KBOI"])

    new_airports = pick_new_airports(included, ADDS_PER_RUN)
    if new_airports:
        print(f"Adding new airports this run: {new_airports}")
        included = included + new_airports
        state["included_airports"] = included
    else:
        print("All airports in network already included — rebuilding TTDB.")

    print(f"Total airports in TTDB: {included}")

    # 2. Fetch metafile (once for all airports)
    metafile_root = fetch_metafile()

    # 3. For each included airport: fetch plate list, download PDFs, render images
    all_plates: dict[str, list[dict]] = {}

    for airport_id in included:
        print(f"\n=== {airport_id} ===")
        plates = fetch_airport_plates(airport_id, metafile_root)
        if not plates:
            continue

        available: list[dict] = []
        print(f"  Downloading {len(plates)} PDFs...")
        for p in plates:
            dest = PDF_DIR / p["pdf_name"]
            if download_pdf(p["pdf_name"], dest):
                available.append(p)

        print(f"  Rendering PNGs...")
        for p in available:
            pdf_path = PDF_DIR / p["pdf_name"]
            stem = Path(p["pdf_name"]).stem
            try:
                pdf_to_images(pdf_path, IMG_DIR, stem)
            except Exception as exc:
                print(f"    Render failed for {p['pdf_name']}: {exc}")

        all_plates[airport_id] = available

    # 4. Build TTDB from all included airports
    print("\n--- Building TTDB ---")
    ttdb_text = make_ttdb(all_plates, IMG_DIR, included)
    TTDB_PATH.write_text(ttdb_text, encoding="utf-8")
    print(f"Written: {TTDB_PATH}")

    # 5. Persist updated state
    save_state(state)
    print(f"State saved: {STATE_PATH}")

    print("\nDone.")
    print(f"  PDFs  : {PDF_DIR}")
    print(f"  PNGs  : {IMG_DIR}")
    print(f"  TTDB  : {TTDB_PATH}")
    print(f"  State : {STATE_PATH}")
    print(f"  Airports in TTDB: {', '.join(included)}")


if __name__ == "__main__":
    main()

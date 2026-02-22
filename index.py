#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import time
import webbrowser
from dataclasses import dataclass
from pathlib import Path
import tkinter as tk
from tkinter import font as tkfont
from tkinter import ttk

try:
    import winsound
except Exception:  # pragma: no cover - optional on non-Windows platforms
    winsound = None


DB_PATH = Path("TootTootTerminologyDB.md")
DISCOVERY_STATE_PATH = Path(".index_discovery.json")
PREFERENCES_PATH = Path(".index_prefs.json")

REFRESH_MS = 1500
SEARCH_DEBOUNCE_MS = 100
ANIMATION_MS = 16

TOUR_DELAY_MS = 12000
TOUR_SLOW_DELAY_MULTIPLIER = 1.7
TOUR_SLOW_TRANSITION_MULTIPLIER = 1.5

SPECIAL_RECORD_BLOCK_LANG = "ttdb-special"
SPECIAL_RECORD_SOUTH_POLE_LAT = -90.0
TOUR_AUDIO_SPECIAL_KIND = "tour_sound"

GLOBE_ZOOM_MIN = 0.7
GLOBE_ZOOM_MAX = 3.5
GLOBE_ZOOM_STEP = 1.12
GLOBE_DEFAULT_ZOOM = 1.2
GLOBE_BASE_RADIUS_SCALE = 1.18
Z_SCALE = 0.1
Z_MIN_SCALE = 0.5
Z_MAX_SCALE = 1.5

DRAG_SENSITIVITY = 0.005
DRAG_THRESHOLD = 6
DRAG_LAT_LIMIT = math.pi / 2 - 0.05

PALETTE = {
    "bg": "#0b1112",
    "panel": "#f4f8f2",
    "ink": "#0b1112",
    "muted": "#5f696d",
    "accent": "#0f8b8d",
    "accent_alt": "#e76f51",
    "line": "#b7c6bf",
    "graph_bg": "#08090c",
    "graph_outline": "#2a2f3a",
    "graph_inner": "#141824",
    "graph_grid": "#1a1f2a",
    "node_back": "#2b303b",
    "node_front": "#7cc7ff",
    "node_outline": "#0b0b10",
    "selected_fill": "#f7f9ff",
    "selected_iris": "#ff0000",
}


REFERENCE_LINE_RE = re.compile(r'^\s*\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]+)")?\s*$')
IMAGE_TOKEN_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)|!\[([^\]]*)\]\[([^\]]+)\]")
INLINE_TOKEN_RE = re.compile(
    r"!\[([^\]]*)\]\(([^)]+)\)"
    r"|!\[([^\]]*)\]\[([^\]]+)\]"
    r"|\[([^\]]+)\]\(([^)]+)\)"
    r"|\[([^\]]+)\]\[([^\]]+)\]"
    r"|(https?://[^\s<]+|www\.[^\s<]+)"
)


@dataclass
class Edge:
    type: str
    target: str


@dataclass
class Record:
    record_id: str
    header: str
    body: str
    title: str | None
    edges: list[Edge]


@dataclass
class LeadMedia:
    src: str
    alt: str = ""
    title: str = ""


class IndexApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Toot Toot Terminology")
        self.geometry("1240x900")
        self.minsize(940, 700)
        self.configure(background=PALETTE["bg"])
        self.protocol("WM_DELETE_WINDOW", self._on_close)

        self.db_path = DB_PATH
        self.discovery_path = DISCOVERY_STATE_PATH
        self.preferences_path = PREFERENCES_PATH

        self.records: dict[str, Record] = {}
        self.order: list[str] = []
        self.filtered_order: list[str] = []
        self.search_index: dict[str, str] = {}
        self.coords: dict[str, tuple[float, float, float]] = {}
        self.special_records: dict[str, dict[str, str]] = {}
        self.screen_points: dict[str, tuple[float, float]] = {}

        self.selected_id: str | None = None
        self.first_record_id: str | None = None
        self.discovered_ids: list[str] = []
        self._list_order: list[str] = []

        self.search_term = ""
        self._search_after_id: str | None = None
        self._poll_after_id: str | None = None
        self._tour_after_id: str | None = None

        self._file_mtime: float | None = None
        self._last_text = ""
        self._link_counter = 0
        self._pending_record_transition: dict[str, float | str] | None = None
        self._record_current_frame: tk.Frame | None = None
        self._record_current_id: str | None = None
        self._record_animation_after_id: str | None = None
        self._record_animation_token = 0

        self.tour_enabled = tk.BooleanVar(value=True)
        self.slow_tour_enabled = tk.BooleanVar(value=False)
        self.invert_drag_y = tk.BooleanVar(value=True)
        self.tour_paused = False

        self.status_var = tk.StringVar(value=f"Loading {self.db_path} ...")
        self.search_meta_var = tk.StringVar(value="Loading ...")
        self.tour_note_var = tk.StringVar(value="Default network tour will advance after a short pause.")
        self.selected_var = tk.StringVar(value="Selected: (none)")

        self.globe_rot_lat = 0.0
        self.globe_rot_lon = 0.0
        self.globe_target_lat = 0.0
        self.globe_target_lon = 0.0
        self.globe_animating = False
        self.globe_zoom = GLOBE_DEFAULT_ZOOM

        self._globe_drag_active = False
        self._globe_drag_moved = False
        self._globe_drag_start = (0, 0)
        self._globe_drag_last = (0, 0)
        self._globe_suppress_click_until = 0.0

        self._tour_audio_path: str | None = None
        self._tour_audio_playing = False

        self._init_fonts()
        self._build_ui()
        self._load_preferences()

        self.bind("<KeyPress-space>", self._on_space_press)

        self._load_db(force=True)
        self._start_polling()

    def _init_fonts(self) -> None:
        base = tkfont.nametofont("TkDefaultFont")
        self.font_body = base.copy()
        self.font_body.configure(size=11)
        self.font_h2 = base.copy()
        self.font_h2.configure(size=17, weight="bold")
        self.font_h3 = base.copy()
        self.font_h3.configure(size=14, weight="bold")
        self.font_h4 = base.copy()
        self.font_h4.configure(size=12, weight="bold")
        self.font_code = tkfont.Font(family="Courier New", size=10)

    def _build_ui(self) -> None:
        style = ttk.Style(self)
        style.configure("Card.TFrame", background=PALETTE["panel"])
        style.configure("Card.TLabel", background=PALETTE["panel"], foreground=PALETTE["ink"])
        style.configure("Muted.TLabel", background=PALETTE["panel"], foreground=PALETTE["muted"])

        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        page = ttk.Frame(self, padding=(10, 10, 10, 10), style="Card.TFrame")
        page.grid(row=0, column=0, sticky="nsew")
        page.columnconfigure(0, weight=1)
        page.rowconfigure(0, weight=5)
        page.rowconfigure(1, weight=3)
        page.rowconfigure(2, weight=0)
        page.rowconfigure(3, weight=0)

        header = ttk.Frame(page, style="Card.TFrame")
        header.grid(row=0, column=0, sticky="nsew", pady=(0, 10))
        header.columnconfigure(0, weight=5)
        header.columnconfigure(1, weight=6)
        header.rowconfigure(0, weight=1)

        graph_card = ttk.Frame(header, padding=(8, 8, 8, 8), style="Card.TFrame")
        graph_card.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        graph_card.columnconfigure(0, weight=1)
        graph_card.rowconfigure(0, weight=1)

        graph_wrap = tk.Frame(graph_card, bg=PALETTE["graph_bg"], highlightthickness=1, highlightbackground="#1f2a2d")
        graph_wrap.grid(row=0, column=0, sticky="nsew")
        graph_wrap.rowconfigure(0, weight=1)
        graph_wrap.columnconfigure(0, weight=1)

        self.graph_canvas = tk.Canvas(
            graph_wrap,
            background=PALETTE["graph_bg"],
            highlightthickness=0,
            bd=0,
            relief="flat",
            takefocus=1,
        )
        self.graph_canvas.grid(row=0, column=0, sticky="nsew")

        graph_controls = tk.Frame(graph_wrap, bg=PALETTE["graph_bg"])
        graph_controls.grid(row=0, column=1, sticky="ns", padx=(6, 8), pady=12)

        self.zoom_in_btn = tk.Button(
            graph_controls,
            text="+",
            width=4,
            font=("TkDefaultFont", 12, "bold"),
            command=lambda: self._on_zoom_button(1),
            bg="#070a12",
            fg="#e9f6ff",
            activebackground="#16263d",
            activeforeground="#e9f6ff",
            relief="solid",
            bd=1,
            highlightthickness=0,
        )
        self.zoom_in_btn.pack(pady=(0, 6))
        self.zoom_out_btn = tk.Button(
            graph_controls,
            text="-",
            width=4,
            font=("TkDefaultFont", 12, "bold"),
            command=lambda: self._on_zoom_button(-1),
            bg="#070a12",
            fg="#e9f6ff",
            activebackground="#16263d",
            activeforeground="#e9f6ff",
            relief="solid",
            bd=1,
            highlightthickness=0,
        )
        self.zoom_out_btn.pack(pady=(0, 6))
        self.zoom_reset_btn = tk.Button(
            graph_controls,
            text="100%",
            width=4,
            font=("TkDefaultFont", 9, "bold"),
            command=self._on_zoom_reset,
            bg="#070a12",
            fg="#e9f6ff",
            activebackground="#16263d",
            activeforeground="#e9f6ff",
            relief="solid",
            bd=1,
            highlightthickness=0,
        )
        self.zoom_reset_btn.pack()

        record_card = ttk.Frame(header, padding=(8, 8, 8, 8), style="Card.TFrame")
        record_card.grid(row=0, column=1, sticky="nsew")
        record_card.columnconfigure(0, weight=1)
        record_card.rowconfigure(1, weight=1)

        record_head = ttk.Frame(record_card, style="Card.TFrame")
        record_head.grid(row=0, column=0, sticky="ew", pady=(0, 8))
        record_head.columnconfigure(0, weight=1)
        ttk.Label(record_head, text="Record", style="Card.TLabel", font=("Trebuchet MS", 13, "bold")).grid(
            row=0, column=0, sticky="w"
        )
        ttk.Label(record_head, textvariable=self.selected_var, style="Muted.TLabel").grid(row=0, column=1, sticky="e")

        text_frame = ttk.Frame(record_card, style="Card.TFrame")
        text_frame.grid(row=1, column=0, sticky="nsew")
        text_frame.rowconfigure(0, weight=1)
        text_frame.columnconfigure(0, weight=1)

        self.record_view_host = tk.Frame(
            text_frame,
            bg="#0f0f12",
            highlightthickness=0,
            bd=0,
            relief="flat",
        )
        self.record_view_host.grid(row=0, column=0, sticky="nsew")

        records_panel = ttk.Frame(page, padding=(10, 10, 10, 10), style="Card.TFrame")
        records_panel.grid(row=1, column=0, sticky="nsew", pady=(0, 10))
        records_panel.columnconfigure(0, weight=1)
        records_panel.rowconfigure(3, weight=1)

        ttk.Label(records_panel, text="Records", style="Card.TLabel", font=("Trebuchet MS", 12, "bold")).grid(
            row=0, column=0, sticky="w"
        )

        self.search_entry = ttk.Entry(records_panel)
        self.search_entry.grid(row=1, column=0, sticky="ew", pady=(6, 4))
        self.search_entry.bind("<KeyRelease>", self._on_search_input)
        self.search_entry.bind("<FocusIn>", self._on_search_focus_in)
        self.search_entry.bind("<FocusOut>", self._on_search_focus_out)

        ttk.Label(records_panel, textvariable=self.search_meta_var, style="Muted.TLabel").grid(
            row=2, column=0, sticky="w", pady=(0, 6)
        )

        list_frame = ttk.Frame(records_panel, style="Card.TFrame")
        list_frame.grid(row=3, column=0, sticky="nsew")
        list_frame.rowconfigure(0, weight=1)
        list_frame.columnconfigure(0, weight=1)

        self.record_listbox = tk.Listbox(
            list_frame,
            background="#111318",
            foreground="#e9e9f0",
            selectbackground="#364156",
            selectforeground="#ffffff",
            relief="flat",
            activestyle="none",
            font=self.font_body,
        )
        self.record_listbox.grid(row=0, column=0, sticky="nsew")
        self.record_listbox.bind("<<ListboxSelect>>", self._on_record_list_select)
        list_scroll = ttk.Scrollbar(list_frame, orient="vertical", command=self.record_listbox.yview)
        list_scroll.grid(row=0, column=1, sticky="ns")
        self.record_listbox.configure(yscrollcommand=list_scroll.set)

        info_panel = ttk.Frame(page, padding=(10, 10, 10, 10), style="Card.TFrame")
        info_panel.grid(row=2, column=0, sticky="ew")
        info_panel.columnconfigure(0, weight=1)

        ttk.Label(
            info_panel,
            text="TTDB: Terminology",
            style="Card.TLabel",
            font=("Trebuchet MS", 12, "bold"),
        ).grid(row=0, column=0, sticky="w")

        ttk.Label(info_panel, textvariable=self.status_var, style="Muted.TLabel", wraplength=1100).grid(
            row=1, column=0, sticky="w", pady=(4, 8)
        )

        controls = ttk.Frame(info_panel, style="Card.TFrame")
        controls.grid(row=2, column=0, sticky="ew")

        ttk.Button(controls, text="Forget Discoveries", command=self._forget_discoveries).pack(side="left", padx=(0, 8))
        ttk.Button(controls, text="Refresh", command=self._refresh_now).pack(side="left", padx=(0, 8))
        ttk.Button(controls, text="Open DB", command=self._open_db_file).pack(side="left", padx=(0, 12))

        ttk.Checkbutton(
            controls,
            text="Guided tour",
            variable=self.tour_enabled,
            command=self._on_tour_toggle,
        ).pack(side="left", padx=(0, 8))
        ttk.Checkbutton(
            controls,
            text="Slow tour pace",
            variable=self.slow_tour_enabled,
            command=self._on_slow_tour_toggle,
        ).pack(side="left", padx=(0, 8))
        ttk.Checkbutton(
            controls,
            text="Invert drag Y",
            variable=self.invert_drag_y,
            command=self._on_invert_drag_toggle,
        ).pack(side="left")

        ttk.Label(info_panel, textvariable=self.tour_note_var, style="Muted.TLabel", wraplength=1100).grid(
            row=3, column=0, sticky="w", pady=(8, 0)
        )

        footer = ttk.Frame(page, style="Card.TFrame")
        footer.grid(row=3, column=0, sticky="ew", pady=(8, 0))
        ttk.Label(
            footer,
            text="(c) 2026 Toot Toot Engineering. All signals cleared.",
            style="Muted.TLabel",
        ).pack(side="right")

        self.graph_canvas.bind("<Configure>", self._on_graph_resize)
        self.graph_canvas.bind("<ButtonPress-1>", self._on_graph_press)
        self.graph_canvas.bind("<B1-Motion>", self._on_graph_drag)
        self.graph_canvas.bind("<ButtonRelease-1>", self._on_graph_release)
        self.graph_canvas.bind("<MouseWheel>", self._on_graph_zoom)
        self.graph_canvas.bind("<Button-4>", self._on_graph_zoom)
        self.graph_canvas.bind("<Button-5>", self._on_graph_zoom)

    def _apply_text_tags(self, text: tk.Text) -> None:
        text.tag_configure("h2", font=self.font_h2, foreground="#ffd166")
        text.tag_configure("h3", font=self.font_h3, foreground="#f4a261")
        text.tag_configure("h4", font=self.font_h4, foreground="#e9c46a")
        text.tag_configure("bullet", lmargin1=18, lmargin2=36)
        text.tag_configure("quote", foreground="#a7a7b3", lmargin1=18, lmargin2=36)
        text.tag_configure("code", font=self.font_code, foreground="#c4f1ff")
        text.tag_configure("fence", font=self.font_code, foreground="#6c7a89")
        text.tag_configure("rule", foreground="#39424e")
        text.tag_configure("muted", foreground="#a7a7b3")
        text.tag_configure("media", foreground="#bde0fe")

    def _on_close(self) -> None:
        self._clear_tour(stop_audio=True)
        self._stop_record_animation(normalize_current=False)
        if self._poll_after_id:
            self.after_cancel(self._poll_after_id)
            self._poll_after_id = None
        self.destroy()

    def _load_preferences(self) -> None:
        try:
            payload = json.loads(self.preferences_path.read_text(encoding="utf-8"))
        except Exception:
            return
        if not isinstance(payload, dict):
            return
        guided = payload.get("guided_tour")
        if isinstance(guided, bool):
            self.tour_enabled.set(guided)
        slow = payload.get("guided_tour_slow")
        if isinstance(slow, bool):
            self.slow_tour_enabled.set(slow)
        invert = payload.get("invert_drag_y")
        if isinstance(invert, bool):
            self.invert_drag_y.set(invert)

    def _save_preferences(self) -> None:
        payload = {
            "guided_tour": bool(self.tour_enabled.get()),
            "guided_tour_slow": bool(self.slow_tour_enabled.get()),
            "invert_drag_y": bool(self.invert_drag_y.get()),
        }
        try:
            self.preferences_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        except Exception:
            pass

    def _start_polling(self) -> None:
        if self._poll_after_id:
            return
        self._poll_after_id = self.after(REFRESH_MS, self._poll_db)

    def _poll_db(self) -> None:
        self._poll_after_id = None
        self._load_db(force=False)
        self._poll_after_id = self.after(REFRESH_MS, self._poll_db)

    def _refresh_now(self) -> None:
        self._load_db(force=True)
        self._note_interaction()

    def _load_db(self, force: bool = False) -> None:
        if not self.db_path.exists():
            self._set_status_message(f"File not found: {self.db_path}")
            self.records = {}
            self.order = []
            self.filtered_order = []
            self.search_index = {}
            self.coords = {}
            self.special_records = {}
            self.selected_id = None
            self.first_record_id = None
            self.discovered_ids = []
            self.screen_points = {}
            self._set_tour_audio_path(None)
            self._render_list()
            self._render_record()
            self._render_globe()
            self._update_search_meta()
            return

        try:
            stat = self.db_path.stat()
            mtime = stat.st_mtime
        except Exception as err:
            self._set_status_message(f"Unable to stat {self.db_path}: {err}")
            return

        if not force and self._file_mtime is not None and mtime == self._file_mtime:
            return

        try:
            text = self.db_path.read_text(encoding="utf-8")
        except Exception as err:
            self._set_status_message(f"Unable to read {self.db_path}: {err}")
            return

        if not force and text == self._last_text:
            self._file_mtime = mtime
            return

        self._file_mtime = mtime
        self._last_text = text

        records, order, selected, coords, special_records = self._parse_records(text)
        previous_selected = self.selected_id

        self.records = records
        self.order = order
        self.coords = coords
        self.special_records = special_records
        self._set_tour_audio_path(self._get_tour_audio_path(self.special_records))

        self._initialize_discovery()

        if previous_selected in self.records:
            self.selected_id = previous_selected
        elif selected in self.records:
            self.selected_id = selected
        elif order:
            self.selected_id = order[0]
        else:
            self.selected_id = None

        if self.selected_id:
            self._discover_record(self.selected_id)

        self._build_search_index()
        self._apply_search(prefer_visible_selection=True, schedule_tour=False)
        self._set_status_link()
        self._schedule_tour()

    def _set_status_message(self, message: str) -> None:
        self.status_var.set(message)

    def _set_status_link(self) -> None:
        discovered_count = len(self._get_discovered_order())
        total = len(self.order)
        self.status_var.set(f"DB: {self.db_path} · {discovered_count}/{total} discovered")

    def _parse_records(
        self, content: str
    ) -> tuple[dict[str, Record], list[str], str | None, dict[str, tuple[float, float, float]], dict[str, dict[str, str]]]:
        selected: str | None = None
        cursor_match = re.search(r"```cursor([\s\S]*?)```", content)
        if cursor_match:
            lines = cursor_match.group(1).splitlines()
            in_selected = False
            for line in lines:
                stripped = line.strip()
                if stripped.startswith("selected:"):
                    in_selected = True
                    continue
                if in_selected:
                    item_match = re.match(r"^-\s*(\S+)", stripped)
                    if item_match:
                        selected = item_match.group(1)
                        break
                    if stripped and not stripped.startswith("-"):
                        break

        records: dict[str, Record] = {}
        order: list[str] = []
        coords: dict[str, tuple[float, float, float]] = {}
        special_records: dict[str, dict[str, str]] = {}

        for block in re.split(r"^\s*---+\s*$", content, flags=re.M):
            lines = block.splitlines()
            header_index = -1
            for idx, line in enumerate(lines):
                if line.startswith("@"):
                    header_index = idx
                    break
            if header_index < 0:
                continue

            header_line = lines[header_index].strip()
            record_id = header_line.split()[0]
            body_lines = lines[header_index + 1 :]

            title: str | None = None
            title_removed = False
            filtered_body: list[str] = []
            for line in body_lines:
                match = re.match(r"^##\s+(.*)$", line)
                if match and not title_removed:
                    title = match.group(1).strip()
                    title_removed = True
                    continue
                filtered_body.append(line)
            body = "\n".join(filtered_body).strip()

            record_coords = self._parse_coords(record_id, header_line)
            special = self._parse_special_record(record_coords, body)
            if special:
                kind = special.get("kind")
                config = special.get("config", {})
                if kind:
                    special_records[kind] = config
                continue

            edges: list[Edge] = []
            relates_match = re.search(r"relates:([^|]+)", header_line)
            if relates_match:
                for token_raw in relates_match.group(1).split(","):
                    token = token_raw.strip()
                    if not token:
                        continue
                    edge_type = "relates"
                    target = token
                    if ">" in token:
                        left, right = token.split(">", 1)
                        edge_type = left.strip() or "relates"
                        target = right.strip()
                    edges.append(Edge(type=edge_type, target=target))

            if record_coords:
                coords[record_id] = record_coords

            records[record_id] = Record(
                record_id=record_id,
                header=header_line,
                body=body,
                title=title,
                edges=edges,
            )
            order.append(record_id)

        return records, order, selected, coords, special_records

    def _parse_coords(self, record_id: str, header_line: str) -> tuple[float, float, float] | None:
        match = re.match(r"^@LAT(-?\d+(?:\.\d+)?)LON(-?\d+(?:\.\d+)?)$", record_id)
        if not match:
            return None
        lat = float(match.group(1))
        lon = float(match.group(2))
        z_match = re.search(r"\bz:\s*(-?\d+(?:\.\d+)?)", header_line)
        depth = float(z_match.group(1)) if z_match else 0.0
        return lat, lon, depth

    def _parse_special_record(self, coords: tuple[float, float, float] | None, body: str) -> dict[str, dict] | None:
        if coords is None:
            return None
        if abs(coords[0] - SPECIAL_RECORD_SOUTH_POLE_LAT) > 1e-6:
            return None
        block_re = re.compile(rf"```{re.escape(SPECIAL_RECORD_BLOCK_LANG)}([\s\S]*?)```", re.I)
        match = block_re.search(body)
        if not match:
            return None

        config: dict[str, str] = {}
        for line in match.group(1).splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            entry_match = re.match(r"^([A-Za-z0-9._-]+)\s*:\s*(.+)$", stripped)
            if not entry_match:
                continue
            key = entry_match.group(1).lower()
            value = entry_match.group(2).strip()
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            config[key] = value

        kind = config.get("kind", "").strip().lower()
        if not kind:
            return None
        return {"kind": kind, "config": config}

    def _get_tour_audio_path(self, special_records: dict[str, dict[str, str]]) -> str | None:
        config = special_records.get(TOUR_AUDIO_SPECIAL_KIND)
        if not config:
            return None
        audio_path = config.get("audio_path", "").strip()
        return audio_path or None

    def _set_tour_audio_path(self, path: str | None) -> None:
        next_path = path.strip() if isinstance(path, str) else None
        if next_path == self._tour_audio_path:
            return
        self._set_tour_audio_playing(False)
        self._tour_audio_path = next_path

    def _set_tour_audio_playing(self, should_play: bool) -> None:
        if winsound is None:
            self._tour_audio_playing = False
            return
        if not self._tour_audio_path:
            self._tour_audio_playing = False
            return

        resolved = self._resolve_asset_path(self._tour_audio_path)
        if resolved is None or resolved.suffix.lower() != ".wav":
            self._tour_audio_playing = False
            return

        if should_play and not self._tour_audio_playing:
            try:
                winsound.PlaySound(
                    str(resolved),
                    winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP,
                )
                self._tour_audio_playing = True
            except Exception:
                self._tour_audio_playing = False
            return

        if not should_play and self._tour_audio_playing:
            try:
                winsound.PlaySound(None, winsound.SND_ASYNC)
            except Exception:
                pass
            self._tour_audio_playing = False

    def _read_discovery_store(self) -> list[str]:
        try:
            payload = json.loads(self.discovery_path.read_text(encoding="utf-8"))
        except Exception:
            return []
        if not isinstance(payload, list):
            return []
        return [value for value in payload if isinstance(value, str)]

    def _persist_discovery(self) -> None:
        try:
            self.discovery_path.write_text(json.dumps(self.discovered_ids, indent=2), encoding="utf-8")
        except Exception:
            pass

    def _initialize_discovery(self) -> None:
        self.first_record_id = self.order[0] if self.order else None
        stored_ids = self._read_discovery_store()
        discovered_set = {record_id for record_id in stored_ids if record_id in self.records}
        if self.first_record_id and self.first_record_id in self.records:
            discovered_set.add(self.first_record_id)
        self.discovered_ids = [record_id for record_id in self.order if record_id in discovered_set]
        self._persist_discovery()

    def _discover_record(self, record_id: str | None) -> bool:
        if not record_id or record_id not in self.records:
            return False
        discovered_set = set(self.discovered_ids)
        changed = False
        if self.first_record_id and self.first_record_id in self.records and self.first_record_id not in discovered_set:
            discovered_set.add(self.first_record_id)
            changed = True
        if record_id not in discovered_set:
            discovered_set.add(record_id)
            changed = True
        if not changed:
            return False
        self.discovered_ids = [value for value in self.order if value in discovered_set]
        self._persist_discovery()
        return True

    def _get_discovered_order(self) -> list[str]:
        if not self.order or not self.discovered_ids:
            return []
        discovered_set = set(self.discovered_ids)
        return [record_id for record_id in self.order if record_id in discovered_set]

    def _get_visible_order_for_graph(self) -> list[str]:
        if self.search_term:
            return list(self.filtered_order)
        return self._get_discovered_order()

    def _build_search_index(self) -> None:
        self.search_index = {}
        for record_id in self.order:
            record = self.records.get(record_id)
            if not record:
                continue
            blob = "\n".join(part for part in (record.title or "", record.header, record.body) if part)
            self.search_index[record_id] = blob.lower()

    def _on_search_input(self, _event: tk.Event) -> None:
        if self._search_after_id:
            self.after_cancel(self._search_after_id)
        self._search_after_id = self.after(SEARCH_DEBOUNCE_MS, self._apply_search_from_entry)

    def _on_search_focus_in(self, _event: tk.Event) -> None:
        self._clear_tour(stop_audio=True)

    def _on_search_focus_out(self, _event: tk.Event) -> None:
        if self.tour_enabled.get():
            self._schedule_tour()

    def _apply_search_from_entry(self) -> None:
        self._search_after_id = None
        self.search_term = self.search_entry.get().strip().lower()
        self._apply_search(prefer_visible_selection=True, schedule_tour=False)
        self._note_interaction()

    def _apply_search(self, prefer_visible_selection: bool = True, schedule_tour: bool = False) -> None:
        term = self.search_term
        discovered_order = self._get_discovered_order()
        if not term:
            self.filtered_order = list(discovered_order)
        else:
            self.filtered_order = [
                record_id for record_id in discovered_order if term in self.search_index.get(record_id, "")
            ]

        if prefer_visible_selection and self.filtered_order and self.selected_id not in self.filtered_order:
            previous_id = self.selected_id
            self.selected_id = self.filtered_order[0]
            self._queue_record_transition(previous_id, self.selected_id, from_tour=False)
            self._discover_record(self.selected_id)

        self._render_list()
        self._render_record()
        self._center_on_selected()
        self._render_globe()
        self._update_search_meta()
        self._set_status_link()
        if schedule_tour:
            self._schedule_tour()

    def _update_search_meta(self) -> None:
        if not self.order:
            self.search_meta_var.set("No records.")
            return
        discovered_count = len(self._get_discovered_order())
        if not self.search_term:
            self.search_meta_var.set(f"{discovered_count} discovered of {len(self.order)} terms.")
            return
        self.search_meta_var.set(
            f'{len(self.filtered_order)} matches within {discovered_count} discovered terms for "{self.search_term}".'
        )

    def _render_list(self) -> None:
        self.record_listbox.delete(0, "end")
        self._list_order = []
        source = self.filtered_order
        if not source:
            placeholder = "No matching discovered records." if self.search_term else "No discovered records yet."
            self.record_listbox.insert("end", placeholder)
            return
        for record_id in source:
            record = self.records.get(record_id)
            title = record.title if record else None
            label = f"{record_id} - {title}" if title else record_id
            self.record_listbox.insert("end", label)
            self._list_order.append(record_id)

        if self.selected_id in self._list_order:
            idx = self._list_order.index(self.selected_id)
            self.record_listbox.selection_clear(0, "end")
            self.record_listbox.selection_set(idx)
            self.record_listbox.activate(idx)
            self.record_listbox.see(idx)

    def _on_record_list_select(self, _event: tk.Event) -> None:
        selection = self.record_listbox.curselection()
        if not selection:
            return
        idx = selection[0]
        if idx < 0 or idx >= len(self._list_order):
            return
        record_id = self._list_order[idx]
        self._select_record(record_id, from_tour=False, from_list=True)
        self._note_interaction()

    def _select_record(self, record_id: str, from_tour: bool = False, from_list: bool = False) -> None:
        if record_id not in self.records:
            return
        previous_id = self.selected_id
        self._discover_record(record_id)
        self._queue_record_transition(previous_id, record_id, from_tour=from_tour)
        self.selected_id = record_id
        self._apply_search(prefer_visible_selection=False, schedule_tour=False)
        if not from_tour:
            self._schedule_tour()
        if not from_list and self.selected_id in self._list_order:
            idx = self._list_order.index(self.selected_id)
            self.record_listbox.selection_clear(0, "end")
            self.record_listbox.selection_set(idx)
            self.record_listbox.activate(idx)
            self.record_listbox.see(idx)

    def _render_record(self) -> None:
        selected_id = self.selected_id if self.selected_id in self.records else None
        if selected_id:
            self.selected_var.set(f"Selected: {selected_id}")
        else:
            self.selected_var.set("Selected: (none)")

        transition = self._pending_record_transition
        self._pending_record_transition = None

        self._stop_record_animation(normalize_current=True)

        incoming_frame, _incoming_text = self._build_record_frame(selected_id)
        current_frame = self._record_current_frame
        current_id = self._record_current_id

        should_animate = (
            current_frame is not None
            and transition is not None
            and selected_id is not None
            and transition.get("from_id") == current_id
            and transition.get("to_id") == selected_id
        )

        if not should_animate:
            self._set_record_frame(incoming_frame, selected_id)
            return

        duration_ms = max(120, int(transition.get("duration_ms", 240)))
        travel_px = max(24, int(transition.get("travel_px", 80)))
        dir_x = float(transition.get("dir_x", 1.0))
        dir_y = float(transition.get("dir_y", 0.0))
        enter_x = int(round(dir_x * travel_px))
        enter_y = int(round(dir_y * travel_px))
        exit_x = -enter_x
        exit_y = -enter_y

        current_frame.place(x=0, y=0, relwidth=1, relheight=1)
        incoming_frame.place(x=enter_x, y=enter_y, relwidth=1, relheight=1)
        self._record_current_frame = incoming_frame
        self._record_current_id = selected_id

        self._record_animation_token += 1
        token = self._record_animation_token
        started_at = time.perf_counter()

        def tick() -> None:
            if token != self._record_animation_token:
                return
            elapsed_ms = (time.perf_counter() - started_at) * 1000.0
            progress = 1.0 if duration_ms <= 0 else min(1.0, elapsed_ms / duration_ms)
            ease = 1.0 - pow(1.0 - progress, 3)
            out_x = int(round(exit_x * ease))
            out_y = int(round(exit_y * ease))
            in_x = int(round(enter_x * (1.0 - ease)))
            in_y = int(round(enter_y * (1.0 - ease)))

            try:
                current_frame.place_configure(x=out_x, y=out_y)
                incoming_frame.place_configure(x=in_x, y=in_y)
            except tk.TclError:
                self._record_animation_after_id = None
                return

            if progress >= 1.0:
                try:
                    current_frame.destroy()
                except tk.TclError:
                    pass
                try:
                    incoming_frame.place_configure(x=0, y=0, relwidth=1, relheight=1)
                except tk.TclError:
                    self._record_animation_after_id = None
                    return
                for child in self.record_view_host.winfo_children():
                    if child is not incoming_frame:
                        child.destroy()
                self._record_animation_after_id = None
                return

            self._record_animation_after_id = self.after(ANIMATION_MS, tick)

        self._record_animation_after_id = self.after(ANIMATION_MS, tick)

    def _build_record_frame(self, record_id: str | None) -> tuple[tk.Frame, tk.Text]:
        frame = tk.Frame(
            self.record_view_host,
            bg="#0f0f12",
            highlightthickness=0,
            bd=0,
            relief="flat",
        )
        frame.rowconfigure(0, weight=1)
        frame.columnconfigure(0, weight=1)

        text = tk.Text(
            frame,
            wrap="word",
            font=self.font_body,
            background="#0f0f12",
            foreground="#e9e9f0",
            insertbackground="#e9e9f0",
            relief="flat",
            bd=0,
            padx=12,
            pady=12,
        )
        text.grid(row=0, column=0, sticky="nsew")
        text_scroll = ttk.Scrollbar(frame, orient="vertical", command=text.yview)
        text_scroll.grid(row=0, column=1, sticky="ns")
        text.configure(yscrollcommand=text_scroll.set)
        self._apply_text_tags(text)
        self._populate_record_widget(text, record_id)
        return frame, text

    def _populate_record_widget(self, widget: tk.Text, record_id: str | None) -> None:
        widget.configure(state="normal")
        widget.delete("1.0", "end")

        if not record_id or record_id not in self.records:
            widget.insert("end", "No record selected.\n", ("muted",))
            widget.configure(state="disabled")
            return

        record = self.records[record_id]
        body, lead_media = self._extract_lead_media(record.body)

        if lead_media:
            widget.insert("end", "Lead media: ", ("muted",))
            self._insert_link(widget, lead_media.alt or lead_media.src, lead_media.src, ("media",))
            if lead_media.title:
                widget.insert("end", f" ({lead_media.title})", ("muted",))
            widget.insert("end", "\n\n")

        if record.title:
            widget.insert("end", record.title + "\n", ("h2",))
            widget.insert("end", "\n")

        if body:
            self._insert_markdown(widget, body)

        if record.edges:
            widget.insert("end", "\nRelated records\n", ("h3",))
            for edge in record.edges:
                widget.insert("end", f"- {edge.type} -> ", ("bullet",))
                if edge.target in self.records:
                    label = self.records[edge.target].title or edge.target
                    self._insert_link(widget, label, edge.target)
                else:
                    widget.insert("end", edge.target, ("muted",))
                widget.insert("end", "\n")

        widget.configure(state="disabled")
        widget.see("1.0")

    def _set_record_frame(self, frame: tk.Frame, record_id: str | None) -> None:
        for child in self.record_view_host.winfo_children():
            if child is not frame:
                child.destroy()
        frame.place(x=0, y=0, relwidth=1, relheight=1)
        self._record_current_frame = frame
        self._record_current_id = record_id

    def _stop_record_animation(self, normalize_current: bool = False) -> None:
        if self._record_animation_after_id:
            try:
                self.after_cancel(self._record_animation_after_id)
            except tk.TclError:
                pass
            self._record_animation_after_id = None
        self._record_animation_token += 1
        if normalize_current and self._record_current_frame is not None:
            try:
                self._record_current_frame.place(x=0, y=0, relwidth=1, relheight=1)
            except tk.TclError:
                self._record_current_frame = None
                self._record_current_id = None
        for child in self.record_view_host.winfo_children():
            if child is not self._record_current_frame:
                child.destroy()

    def _queue_record_transition(self, from_id: str | None, to_id: str | None, from_tour: bool = False) -> None:
        if not from_id or not to_id or from_id == to_id:
            self._pending_record_transition = None
            return
        self._pending_record_transition = self._describe_record_transition(from_id, to_id, from_tour=from_tour)

    def _describe_record_transition(self, from_id: str, to_id: str, from_tour: bool = False) -> dict[str, float | str]:
        dir_x = 1.0
        dir_y = 0.0
        distance_fraction = 0.03

        from_coords = self._coords_for_transition(from_id)
        to_coords = self._coords_for_transition(to_id)

        if from_coords and to_coords:
            lat_delta = to_coords[0] - from_coords[0]
            lon_delta = self._delta_degrees(to_coords[1], from_coords[1])
            dir_x = lon_delta
            dir_y = -lat_delta
            distance_fraction = self._great_circle_distance_fraction(from_coords, to_coords)
        else:
            from_idx = self.order.index(from_id) if from_id in self.order else -1
            to_idx = self.order.index(to_id) if to_id in self.order else -1
            if from_idx >= 0 and to_idx >= 0:
                idx_delta = to_idx - from_idx
                dir_x = 1.0 if idx_delta == 0 else float(math.copysign(1.0, idx_delta))
                dir_y = 0.0
                max_delta = max(1, len(self.order) - 1)
                distance_fraction = min(1.0, abs(idx_delta) / max_delta)

        magnitude = math.hypot(dir_x, dir_y)
        if magnitude < 0.0001:
            dir_x, dir_y = 1.0, 0.0
        else:
            dir_x /= magnitude
            dir_y /= magnitude

        scaled_distance = max(0.03, min(1.0, distance_fraction))
        base_duration = round(160 + pow(scaled_distance, 0.55) * 1400)
        duration_scale = TOUR_SLOW_TRANSITION_MULTIPLIER if (from_tour and self.slow_tour_enabled.get()) else 1.0
        duration_ms = round(base_duration * duration_scale)
        travel_px = round(72 + pow(scaled_distance, 0.75) * 300)
        return {
            "from_id": from_id,
            "to_id": to_id,
            "dir_x": dir_x,
            "dir_y": dir_y,
            "duration_ms": float(duration_ms),
            "travel_px": float(travel_px),
        }

    def _coords_for_transition(self, record_id: str) -> tuple[float, float] | None:
        record_coords = self.coords.get(record_id)
        if record_coords:
            return record_coords[0], record_coords[1]
        match = re.match(r"^@LAT(-?\d+(?:\.\d+)?)LON(-?\d+(?:\.\d+)?)$", record_id)
        if not match:
            return None
        return float(match.group(1)), float(match.group(2))

    def _delta_degrees(self, target: float, current: float) -> float:
        delta = target - current
        while delta > 180:
            delta -= 360
        while delta < -180:
            delta += 360
        return delta

    def _great_circle_distance_fraction(
        self,
        from_coords: tuple[float, float],
        to_coords: tuple[float, float],
    ) -> float:
        lat1 = math.radians(from_coords[0])
        lat2 = math.radians(to_coords[0])
        d_lat = lat2 - lat1
        d_lon = math.radians(self._delta_degrees(to_coords[1], from_coords[1]))
        sin_lat = math.sin(d_lat / 2.0)
        sin_lon = math.sin(d_lon / 2.0)
        a = sin_lat * sin_lat + math.cos(lat1) * math.cos(lat2) * sin_lon * sin_lon
        clamped = min(1.0, max(0.0, a))
        arc = 2.0 * math.atan2(math.sqrt(clamped), math.sqrt(max(0.0, 1.0 - clamped)))
        return arc / math.pi

    def _extract_lead_media(self, text: str) -> tuple[str, LeadMedia | None]:
        if not text:
            return text, None
        lines = text.splitlines()
        references = self._collect_markdown_references(lines)

        output: list[str] = []
        lead_media: LeadMedia | None = None
        in_code = False

        for raw_line in lines:
            stripped = raw_line.strip()
            if stripped.startswith("```"):
                in_code = not in_code
                output.append(raw_line)
                continue

            if in_code or lead_media:
                output.append(raw_line)
                continue

            match = IMAGE_TOKEN_RE.search(raw_line)
            if not match:
                output.append(raw_line)
                continue

            candidate: LeadMedia | None = None
            if match.group(1) is not None:
                alt = match.group(1)
                src = match.group(2).strip()
                candidate = LeadMedia(src=src, alt=alt)
            elif match.group(3) is not None:
                alt = match.group(3)
                ref_key = match.group(4).strip().lower()
                ref = references.get(ref_key)
                if ref:
                    candidate = LeadMedia(src=ref["href"], alt=alt, title=ref.get("title", ""))

            if candidate and not self._is_javascript_uri(candidate.src):
                lead_media = candidate
                rebuilt = raw_line[: match.start()] + raw_line[match.end() :]
                output.append(rebuilt)
            else:
                output.append(raw_line)

        return "\n".join(output), lead_media

    def _collect_markdown_references(self, lines: list[str]) -> dict[str, dict[str, str]]:
        references: dict[str, dict[str, str]] = {}
        in_code = False
        for raw_line in lines:
            stripped = raw_line.strip()
            if stripped.startswith("```"):
                in_code = not in_code
                continue
            if in_code:
                continue
            match = REFERENCE_LINE_RE.match(raw_line)
            if not match:
                continue
            key = match.group(1).strip().lower()
            references[key] = {
                "href": match.group(2).strip(),
                "title": (match.group(3) or "").strip(),
            }
        return references

    def _insert_markdown(self, widget: tk.Text, text: str) -> None:
        lines = text.splitlines()
        references = self._collect_markdown_references(lines)

        content_lines: list[str] = []
        in_ref_code = False
        for raw_line in lines:
            stripped = raw_line.strip()
            if stripped.startswith("```"):
                in_ref_code = not in_ref_code
                content_lines.append(raw_line)
                continue
            if in_ref_code:
                content_lines.append(raw_line)
                continue
            if REFERENCE_LINE_RE.match(raw_line):
                continue
            content_lines.append(raw_line)

        in_code = False
        for raw_line in content_lines:
            line = raw_line.rstrip()
            if line.startswith("```"):
                in_code = not in_code
                widget.insert("end", line + "\n", ("fence",))
                continue
            if in_code:
                widget.insert("end", line + "\n", ("code",))
                continue

            image_line_match = re.match(
                r"^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$|^\s*!\[([^\]]*)\]\[([^\]]+)\]\s*$",
                line,
            )
            if image_line_match:
                media: LeadMedia | None = None
                if image_line_match.group(1) is not None:
                    media = LeadMedia(src=image_line_match.group(2).strip(), alt=image_line_match.group(1))
                elif image_line_match.group(3) is not None:
                    ref_key = image_line_match.group(4).strip().lower()
                    ref = references.get(ref_key)
                    if ref:
                        media = LeadMedia(src=ref["href"], alt=image_line_match.group(3), title=ref.get("title", ""))
                if media and not self._is_javascript_uri(media.src):
                    widget.insert("end", "Media: ", ("muted",))
                    self._insert_link(widget, media.alt or media.src, media.src, ("media",))
                    widget.insert("end", "\n")
                else:
                    widget.insert("end", line + "\n")
                continue

            heading_match = re.match(r"^(#{1,4})\s+(.*)$", line)
            if heading_match:
                level = min(4, len(heading_match.group(1)))
                tag = "h2" if level == 1 else "h3" if level == 2 else "h4"
                self._insert_inline_markdown(widget, heading_match.group(2), references, (tag,))
                widget.insert("end", "\n")
                continue

            if re.match(r"^\s*(-|\*|\d+\.)\s+", line):
                widget.insert("end", "- ", ("bullet",))
                cleaned = re.sub(r"^\s*(-|\*|\d+\.)\s+", "", line)
                self._insert_inline_markdown(widget, cleaned, references, ("bullet",))
                widget.insert("end", "\n")
                continue

            if re.match(r"^\s*>\s+", line):
                cleaned = re.sub(r"^\s*>\s+", "", line)
                self._insert_inline_markdown(widget, cleaned, references, ("quote",))
                widget.insert("end", "\n")
                continue

            if re.match(r"^\s*---+\s*$", line):
                widget.insert("end", "----------------------------------------\n", ("rule",))
                continue

            if not line.strip():
                widget.insert("end", "\n")
                continue

            self._insert_inline_markdown(widget, line, references)
            widget.insert("end", "\n")

    def _insert_inline_markdown(
        self,
        widget: tk.Text,
        text: str,
        references: dict[str, dict[str, str]],
        extra_tags: tuple[str, ...] = (),
    ) -> None:
        cursor = 0
        for match in INLINE_TOKEN_RE.finditer(text):
            start, end = match.span()
            if start > cursor:
                widget.insert("end", text[cursor:start], extra_tags)

            token_text = match.group(0)
            if match.group(1) is not None:
                alt = match.group(1)
                src = match.group(2).strip()
                if self._is_javascript_uri(src):
                    widget.insert("end", token_text, extra_tags)
                else:
                    self._insert_link(widget, f"[media] {alt or src}", src, ("media", *extra_tags))
            elif match.group(3) is not None:
                alt = match.group(3)
                ref_key = match.group(4).strip().lower()
                ref = references.get(ref_key)
                if ref and not self._is_javascript_uri(ref["href"]):
                    self._insert_link(widget, f"[media] {alt or ref['href']}", ref["href"], ("media", *extra_tags))
                else:
                    widget.insert("end", token_text, extra_tags)
            elif match.group(5) is not None:
                label = match.group(5)
                href = match.group(6).strip()
                if self._is_javascript_uri(href):
                    widget.insert("end", token_text, extra_tags)
                else:
                    self._insert_link(widget, label, href, extra_tags)
            elif match.group(7) is not None:
                label = match.group(7)
                ref_key = match.group(8).strip().lower()
                ref = references.get(ref_key)
                if ref and not self._is_javascript_uri(ref["href"]):
                    self._insert_link(widget, label, ref["href"], extra_tags)
                else:
                    widget.insert("end", token_text, extra_tags)
            elif match.group(9) is not None:
                raw = match.group(9)
                href = f"https://{raw}" if raw.startswith("www.") else raw
                self._insert_link(widget, raw, href, extra_tags)
            cursor = end

        if cursor < len(text):
            widget.insert("end", text[cursor:], extra_tags)

    def _insert_link(
        self,
        widget: tk.Text,
        label: str,
        target: str,
        extra_tags: tuple[str, ...] = (),
    ) -> None:
        tag = f"link_{self._link_counter}"
        self._link_counter += 1
        widget.tag_configure(tag, foreground="#7cc7ff", underline=True)

        internal_target = self._resolve_internal_target(target)
        if internal_target:
            widget.tag_bind(tag, "<Button-1>", lambda _event, rid=internal_target: self._select_record(rid))
        else:
            widget.tag_bind(tag, "<Button-1>", lambda _event, uri=target: self._open_target(uri))

        widget.tag_bind(tag, "<Enter>", lambda _event: widget.configure(cursor="hand2"))
        widget.tag_bind(tag, "<Leave>", lambda _event: widget.configure(cursor=""))
        widget.insert("end", label, (tag, *extra_tags))

    def _resolve_internal_target(self, target: str) -> str | None:
        cleaned = target.strip()
        if cleaned.startswith("<") and cleaned.endswith(">"):
            cleaned = cleaned[1:-1].strip()
        if "#" in cleaned:
            cleaned = cleaned.rsplit("#", 1)[-1].strip()
        if cleaned.startswith("ttdb://"):
            cleaned = cleaned[7:].strip()
        elif cleaned.startswith("ttdb:"):
            cleaned = cleaned[5:].strip()
        if cleaned.startswith("/"):
            cleaned = cleaned.lstrip("/").strip()
        if not cleaned:
            return None
        if cleaned in self.records:
            return cleaned
        return None

    def _is_javascript_uri(self, target: str) -> bool:
        return target.strip().lower().startswith("javascript:")

    def _resolve_asset_path(self, value: str) -> Path | None:
        cleaned = value.strip()
        if not cleaned:
            return None
        if re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", cleaned):
            return None
        candidate = Path(cleaned)
        if candidate.is_absolute() and candidate.exists():
            return candidate.resolve()
        db_dir = self.db_path.resolve().parent if self.db_path.exists() else Path.cwd()
        nested = (db_dir / candidate).resolve()
        if nested.exists():
            return nested
        if candidate.exists():
            return candidate.resolve()
        return None

    def _open_target(self, target: str) -> None:
        cleaned = target.strip()
        if cleaned.startswith("<") and cleaned.endswith(">"):
            cleaned = cleaned[1:-1].strip()
        if not cleaned or self._is_javascript_uri(cleaned):
            return
        if cleaned.startswith("www."):
            cleaned = f"https://{cleaned}"
        if re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", cleaned):
            webbrowser.open(cleaned)
            return
        local = self._resolve_asset_path(cleaned)
        if local is not None:
            webbrowser.open(local.as_uri())
            return
        webbrowser.open(cleaned)

    def _open_db_file(self) -> None:
        if self.db_path.exists():
            try:
                webbrowser.open(self.db_path.resolve().as_uri())
            except Exception:
                webbrowser.open(str(self.db_path))

    def _forget_discoveries(self) -> None:
        try:
            if self.discovery_path.exists():
                self.discovery_path.unlink()
        except Exception:
            pass
        self._initialize_discovery()
        self._apply_search(prefer_visible_selection=True, schedule_tour=False)
        self._set_status_link()
        self._note_interaction()

    def _on_tour_toggle(self) -> None:
        self._save_preferences()
        if self.tour_enabled.get():
            self.tour_paused = False
            self._schedule_tour()
        else:
            self._clear_tour(stop_audio=True)
            self.tour_note_var.set("Guided tour is off.")

    def _on_slow_tour_toggle(self) -> None:
        self._save_preferences()
        if self.tour_enabled.get():
            self._schedule_tour()

    def _on_invert_drag_toggle(self) -> None:
        self._save_preferences()

    def _on_space_press(self, _event: tk.Event) -> str:
        if self.focus_get() == self.search_entry:
            return "break"
        if not self.tour_enabled.get():
            return "break"
        self.tour_paused = not self.tour_paused
        if self.tour_paused:
            self._clear_tour(stop_audio=True)
            self.tour_note_var.set("Guided tour paused. Press Space to resume.")
        else:
            self._schedule_tour()
        return "break"

    def _get_tour_delay_ms(self) -> int:
        if not self.slow_tour_enabled.get():
            return TOUR_DELAY_MS
        return round(TOUR_DELAY_MS * TOUR_SLOW_DELAY_MULTIPLIER)

    def _clear_tour(self, stop_audio: bool = False) -> None:
        if self._tour_after_id:
            self.after_cancel(self._tour_after_id)
            self._tour_after_id = None
        if stop_audio:
            self._set_tour_audio_playing(False)

    def _schedule_tour(self) -> None:
        self._clear_tour(stop_audio=False)
        discovered_order = self._get_discovered_order()
        should_play_audio = self.tour_enabled.get() and (not self.tour_paused) and len(discovered_order) >= 2
        self._set_tour_audio_playing(should_play_audio)

        if not self.tour_enabled.get():
            self.tour_note_var.set("Guided tour is off.")
            return
        if self.tour_paused:
            self.tour_note_var.set("Guided tour paused. Press Space to resume.")
            return
        if len(discovered_order) < 2:
            self.tour_note_var.set("Discover another record to expand the guided tour.")
            return

        if self.slow_tour_enabled.get():
            self.tour_note_var.set("Slow tour pace is on: pauses are longer.")
        else:
            self.tour_note_var.set("Default network tour will advance after a short pause.")
        self._tour_after_id = self.after(self._get_tour_delay_ms(), self._advance_tour)

    def _advance_tour(self) -> None:
        self._tour_after_id = None
        order = self._get_discovered_order()
        if not self.tour_enabled.get() or not order:
            return
        try:
            idx = order.index(self.selected_id) if self.selected_id else 0
        except ValueError:
            idx = 0
        next_id = order[(idx + 1) % len(order)]
        self._select_record(next_id, from_tour=True)
        self._schedule_tour()

    def _note_interaction(self) -> None:
        if self.tour_enabled.get():
            self.tour_paused = False
            self._schedule_tour()

    def _on_graph_resize(self, _event: tk.Event) -> None:
        self._render_globe()

    def _on_zoom_button(self, direction: int) -> None:
        changed = self._zoom_globe_step(direction)
        if changed:
            self._note_interaction()

    def _on_zoom_reset(self) -> None:
        changed = self._set_globe_zoom(1.0)
        if changed:
            self._note_interaction()

    def _on_graph_press(self, event: tk.Event) -> None:
        self.graph_canvas.focus_set()
        self._globe_drag_active = False
        self._globe_drag_moved = False
        self._globe_drag_start = (event.x, event.y)
        self._globe_drag_last = (event.x, event.y)

    def _on_graph_drag(self, event: tk.Event) -> None:
        sx, sy = self._globe_drag_start
        dx_total = event.x - sx
        dy_total = event.y - sy

        if not self._globe_drag_active:
            if math.hypot(dx_total, dy_total) < DRAG_THRESHOLD:
                return
            self._globe_drag_active = True

        lx, ly = self._globe_drag_last
        dx = event.x - lx
        dy = event.y - ly
        self._globe_drag_last = (event.x, event.y)
        if dx == 0 and dy == 0:
            return

        self._globe_drag_moved = True
        invert = 1 if self.invert_drag_y.get() else -1
        self.globe_rot_lon += dx * DRAG_SENSITIVITY
        self.globe_rot_lat = self._clamp_lat(self.globe_rot_lat + dy * DRAG_SENSITIVITY * invert)
        self.globe_target_lat = self.globe_rot_lat
        self.globe_target_lon = self.globe_rot_lon
        self.globe_animating = False
        self._render_globe()

    def _on_graph_release(self, event: tk.Event) -> None:
        if self._globe_drag_active and self._globe_drag_moved:
            self._globe_suppress_click_until = time.time() + 0.2
            self._globe_drag_active = False
            self._globe_drag_moved = False
            target = self._find_nearest_record_to_center()
            if target:
                self._select_record(target)
                self._note_interaction()
            return

        self._globe_drag_active = False
        self._globe_drag_moved = False
        if time.time() < self._globe_suppress_click_until:
            return
        if self._select_record_near_point(event.x, event.y):
            self._note_interaction()

    def _on_graph_zoom(self, event: tk.Event) -> None:
        if getattr(event, "delta", 0):
            direction = 1 if event.delta > 0 else -1
        else:
            direction = 1 if getattr(event, "num", None) == 4 else -1
        changed = self._zoom_globe_step(direction)
        if changed:
            self._note_interaction()

    def _set_globe_zoom(self, value: float) -> bool:
        clamped = min(GLOBE_ZOOM_MAX, max(GLOBE_ZOOM_MIN, value))
        if abs(clamped - self.globe_zoom) < 0.0001:
            return False
        self.globe_zoom = clamped
        self._render_globe()
        return True

    def _zoom_globe_step(self, direction: int) -> bool:
        if direction > 0:
            return self._set_globe_zoom(self.globe_zoom * GLOBE_ZOOM_STEP)
        return self._set_globe_zoom(self.globe_zoom / GLOBE_ZOOM_STEP)

    def _find_nearest_record_to_center(self) -> str | None:
        width = self.graph_canvas.winfo_width()
        height = self.graph_canvas.winfo_height()
        if width <= 1 or height <= 1:
            return None
        radius = max(10.0, self._get_globe_base_radius(width, height) * self.globe_zoom)
        cx = width / 2.0
        cy = height / 2.0
        closest: str | None = None
        closest_dist = float("inf")
        visible = set(self._get_visible_order_for_graph())
        for record_id, coord in self.coords.items():
            if record_id not in visible:
                continue
            lat, lon, depth = coord
            x, y, z = self._project_point(lat, lon, depth)
            if z <= 0:
                continue
            px = cx + x * radius
            py = cy - y * radius
            dist = math.hypot(px - cx, py - cy)
            if dist < closest_dist:
                closest_dist = dist
                closest = record_id
        return closest

    def _select_record_near_point(self, x: float, y: float, threshold: float = 16.0) -> bool:
        closest: str | None = None
        closest_dist = float("inf")
        for record_id, (px, py) in self.screen_points.items():
            dist = math.hypot(px - x, py - y)
            if dist < closest_dist:
                closest_dist = dist
                closest = record_id
        if closest and closest_dist <= threshold:
            self._select_record(closest)
            return True
        return False

    def _center_on_selected(self) -> None:
        if not self.selected_id:
            return
        coord = self.coords.get(self.selected_id)
        if not coord:
            return
        lat, lon, _depth = coord
        lat_r = math.radians(lat)
        lon_r = math.radians(lon)
        x = math.cos(lat_r) * math.sin(lon_r)
        y = math.sin(lat_r)
        z = math.cos(lat_r) * math.cos(lon_r)
        rot_lon = -math.atan2(x, z)
        z1 = math.hypot(x, z)
        rot_lat = math.atan2(y, z1)
        self.globe_target_lat = rot_lat
        self.globe_target_lon = rot_lon
        if not self.globe_animating:
            self.globe_animating = True
            self.after(ANIMATION_MS, self._animate_globe)

    def _animate_globe(self) -> None:
        if not self.globe_animating:
            return
        delta_lat = self._angle_delta(self.globe_target_lat, self.globe_rot_lat)
        delta_lon = self._angle_delta(self.globe_target_lon, self.globe_rot_lon)
        if abs(delta_lat) < 0.002 and abs(delta_lon) < 0.002:
            self.globe_rot_lat = self.globe_target_lat
            self.globe_rot_lon = self.globe_target_lon
            self.globe_animating = False
            self._render_globe()
            return
        self.globe_rot_lat += delta_lat * 0.15
        self.globe_rot_lon += delta_lon * 0.15
        self._render_globe()
        self.after(ANIMATION_MS, self._animate_globe)

    def _angle_delta(self, target: float, current: float) -> float:
        delta = target - current
        while delta > math.pi:
            delta -= 2 * math.pi
        while delta < -math.pi:
            delta += 2 * math.pi
        return delta

    def _clamp_lat(self, value: float) -> float:
        return max(-DRAG_LAT_LIMIT, min(DRAG_LAT_LIMIT, value))

    def _get_globe_base_radius(self, width: int, height: int) -> float:
        padding = 6.0
        base = min(width, height) / 2.0 - padding
        return max(10.0, base * GLOBE_BASE_RADIUS_SCALE)

    def _clamp_z_scale(self, scale: float) -> float:
        return max(Z_MIN_SCALE, min(Z_MAX_SCALE, scale))

    def _project_point(self, lat: float, lon: float, depth: float) -> tuple[float, float, float]:
        lat_r = math.radians(lat)
        lon_r = math.radians(lon)
        x = math.cos(lat_r) * math.sin(lon_r)
        y = math.sin(lat_r)
        z = math.cos(lat_r) * math.cos(lon_r)
        scale = self._clamp_z_scale(1.0 + depth * Z_SCALE)
        x *= scale
        y *= scale
        z *= scale

        cos_y = math.cos(self.globe_rot_lon)
        sin_y = math.sin(self.globe_rot_lon)
        x1 = x * cos_y + z * sin_y
        z1 = -x * sin_y + z * cos_y

        cos_x = math.cos(self.globe_rot_lat)
        sin_x = math.sin(self.globe_rot_lat)
        y1 = y * cos_x - z1 * sin_x
        z2 = y * sin_x + z1 * cos_x
        return x1, y1, z2

    def _render_globe(self) -> None:
        canvas = self.graph_canvas
        canvas.delete("all")
        self.screen_points = {}

        width = max(canvas.winfo_width(), 200)
        height = max(canvas.winfo_height(), 200)
        radius = max(10.0, self._get_globe_base_radius(width, height) * self.globe_zoom)
        if radius <= 10:
            return

        cx = width / 2.0
        cy = height / 2.0

        canvas.create_oval(
            cx - radius,
            cy - radius,
            cx + radius,
            cy + radius,
            fill="#0e1117",
            outline=PALETTE["graph_outline"],
            width=2,
        )
        canvas.create_oval(
            cx - radius * 0.92,
            cy - radius * 0.92,
            cx + radius * 0.92,
            cy + radius * 0.92,
            outline=PALETTE["graph_inner"],
            width=1,
        )

        self._draw_graticule(cx, cy, radius)

        visible_order = self._get_visible_order_for_graph()
        visible_set = set(visible_order)
        coords_entries = [(record_id, self.coords[record_id]) for record_id in visible_order if record_id in self.coords]
        if not coords_entries:
            return

        projections: dict[str, tuple[float, float, float]] = {}
        nodes_front: list[tuple[str, float, float, float]] = []
        nodes_back: list[tuple[str, float, float, float]] = []
        selected_point: tuple[str, float, float, float] | None = None
        for record_id, (lat, lon, depth) in coords_entries:
            x, y, z = self._project_point(lat, lon, depth)
            projections[record_id] = (x, y, z)
            if record_id == self.selected_id:
                selected_point = (record_id, x, y, z)
            elif z > 0:
                nodes_front.append((record_id, x, y, z))
            else:
                nodes_back.append((record_id, x, y, z))

        for _record_id, x, y, _z in nodes_back:
            px = cx + x * radius
            py = cy - y * radius
            canvas.create_oval(px - 3, py - 3, px + 3, py + 3, fill=PALETTE["node_back"], outline="")

        self._draw_discovery_halos(cx, cy, radius, projections)

        for source_id, record in self.records.items():
            if source_id not in visible_set:
                continue
            source_proj = projections.get(source_id)
            if not source_proj:
                continue
            sx, sy, sz = source_proj
            if sz <= 0:
                continue
            sxp = cx + sx * radius
            syp = cy - sy * radius
            for edge in record.edges:
                target_id = edge.target
                if target_id not in visible_set:
                    continue
                target_proj = projections.get(target_id)
                if not target_proj:
                    continue
                tx, ty, tz = target_proj
                if tz <= 0:
                    continue
                txp = cx + tx * radius
                typ = cy - ty * radius
                is_selected_edge = source_id == self.selected_id or target_id == self.selected_id
                color = "#7cc7ff" if is_selected_edge else "#2a3a4d"
                width_line = 2 if is_selected_edge else 1
                canvas.create_line(sxp, syp, txp, typ, fill=color, width=width_line)

        for record_id, x, y, _z in nodes_front:
            px = cx + x * radius
            py = cy - y * radius
            canvas.create_oval(
                px - 5,
                py - 5,
                px + 5,
                py + 5,
                fill=PALETTE["node_front"],
                outline=PALETTE["node_outline"],
                width=2,
                tags=("node", record_id),
            )
            self.screen_points[record_id] = (px, py)
            title = self.records.get(record_id).title if self.records.get(record_id) else None
            if title:
                label_size = max(9, min(14, int(10 * self.globe_zoom)))
                canvas.create_text(
                    px + label_size * 0.6,
                    py - label_size * 0.4,
                    text=title,
                    anchor="nw",
                    fill="#dfe7f2",
                    font=("Trebuchet MS", label_size, "bold"),
                )

        if selected_point:
            record_id, x, y, _z = selected_point
            px = cx + x * radius
            py = cy - y * radius
            eye_radius = max(8.0, min(15.0, 8.0 + 2.6 * math.sqrt(max(0.1, self.globe_zoom))))
            to_center_x = cx - px
            to_center_y = cy - py
            mag = math.hypot(to_center_x, to_center_y) or 1.0
            look_scale = eye_radius * 0.22
            iris_cx = px + (to_center_x / mag) * look_scale
            iris_cy = py + (to_center_y / mag) * look_scale

            canvas.create_oval(
                px - eye_radius,
                py - eye_radius,
                px + eye_radius,
                py + eye_radius,
                fill=PALETTE["selected_fill"],
                outline=PALETTE["node_outline"],
                width=2,
                tags=("node", record_id),
            )
            canvas.create_oval(
                iris_cx - eye_radius * 0.54,
                iris_cy - eye_radius * 0.54,
                iris_cx + eye_radius * 0.54,
                iris_cy + eye_radius * 0.54,
                fill=PALETTE["selected_iris"],
                outline=PALETTE["node_outline"],
                width=1,
                tags=("node", record_id),
            )
            canvas.create_oval(
                iris_cx - eye_radius * 0.28,
                iris_cy - eye_radius * 0.28,
                iris_cx + eye_radius * 0.28,
                iris_cy + eye_radius * 0.28,
                fill="#07090c",
                outline="",
                tags=("node", record_id),
            )
            canvas.create_oval(
                iris_cx - eye_radius * 0.21 - eye_radius * 0.16,
                iris_cy - eye_radius * 0.25 - eye_radius * 0.16,
                iris_cx - eye_radius * 0.21 + eye_radius * 0.16,
                iris_cy - eye_radius * 0.25 + eye_radius * 0.16,
                fill="#ffffff",
                outline="",
                tags=("node", record_id),
            )
            self.screen_points[record_id] = (px, py)

            title = self.records.get(record_id).title if self.records.get(record_id) else None
            if title:
                label_size = max(10, min(16, int(11 * self.globe_zoom)))
                canvas.create_text(
                    px + label_size * 0.7,
                    py - label_size * 0.6,
                    text=title,
                    anchor="nw",
                    fill="#e9e9f0",
                    font=("Trebuchet MS", label_size, "bold"),
                )

    def _draw_discovery_halos(
        self, cx: float, cy: float, radius: float, projections: dict[str, tuple[float, float, float]]
    ) -> None:
        discovered = self._get_discovered_order()
        if not discovered:
            return
        for record_id in discovered:
            projected = projections.get(record_id)
            if not projected:
                continue
            x, y, z = projected
            if z <= 0:
                continue
            px = cx + x * radius
            py = cy - y * radius
            is_first = record_id == self.first_record_id
            is_selected = record_id == self.selected_id
            halo_radius = max(16, min(64, 34 * math.sqrt(max(0.1, self.globe_zoom))))
            if is_selected:
                color = "#ff4a4a"
                width = 2
            elif is_first:
                color = "#0f8b8d"
                width = 2
            else:
                color = "#7cc7ff"
                width = 1
            canvas = self.graph_canvas
            canvas.create_oval(
                px - halo_radius,
                py - halo_radius,
                px + halo_radius,
                py + halo_radius,
                outline=color,
                width=width,
            )

    def _draw_graticule(self, cx: float, cy: float, radius: float) -> None:
        for lon in range(-150, 180, 30):
            points: list[tuple[float, float, bool]] = []
            for lat in range(-90, 91, 6):
                x, y, z = self._project_point(lat, lon, 0.0)
                if z > 0:
                    points.append((cx + x * radius, cy - y * radius, True))
                else:
                    points.append((0.0, 0.0, False))
            self._draw_visible_line(points)

        for lat in range(-60, 90, 30):
            points = []
            for lon in range(-180, 181, 6):
                x, y, z = self._project_point(lat, lon, 0.0)
                if z > 0:
                    points.append((cx + x * radius, cy - y * radius, True))
                else:
                    points.append((0.0, 0.0, False))
            self._draw_visible_line(points)

    def _draw_visible_line(self, points: list[tuple[float, float, bool]]) -> None:
        segment: list[tuple[float, float]] = []
        for px, py, visible in points:
            if visible:
                segment.append((px, py))
                continue
            if len(segment) >= 2:
                self.graph_canvas.create_line(*self._flatten(segment), fill=PALETTE["graph_grid"], width=1)
            segment = []
        if len(segment) >= 2:
            self.graph_canvas.create_line(*self._flatten(segment), fill=PALETTE["graph_grid"], width=1)

    def _flatten(self, points: list[tuple[float, float]]) -> list[float]:
        flat: list[float] = []
        for x, y in points:
            flat.extend([x, y])
        return flat


def main() -> None:
    app = IndexApp()
    app.mainloop()


if __name__ == "__main__":
    main()

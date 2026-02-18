#!/usr/bin/env python3
import math
import os
import re
import time
from pathlib import Path
from io import BytesIO
import tkinter as tk
from tkinter import ttk
from tkinter import font as tkfont
import webbrowser
from PIL import Image, ImageTk
import cairosvg

DB_PATH = Path("MyMentalPalaceDB.md")

REFRESH_MS = 1500
ANIMATION_MS = 16
DRAG_SENSITIVITY = 0.005
DRAG_THRESHOLD = 6
DRAG_LAT_LIMIT = math.pi / 2 - 0.08
SVG_MAX_WIDTH = 800
SVG_MAX_HEIGHT = 600
TTDB_EXTENSIONS = {".md", ".tex", ".ttdb"}
Z_SCALE = 0.1
Z_MIN_SCALE = 0.5
Z_MAX_SCALE = 1.5


class NavigatorApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("TTDB Navigator")
        self.geometry("900x700")
        self.minsize(700, 700)

        self._file_mtimes = {}
        self._auto_refresh = tk.BooleanVar(value=True)
        self._db_path: Path | None = None
        self._db_records: dict[str, dict] = {}
        self._db_order: list[str] = []
        self._db_selected_id: str | None = None
        self._db_coords: dict[str, tuple[float, float, float]] = {}
        self._db_view_image: tk.PhotoImage | None = None
        self._svg_cache: dict[str, bytes] = {}
        self._image_original: Image.Image | None = None
        self._image_canvas_id: int | None = None
        self._image_text_mode = False
        self._link_counter = 0

        self._globe_rot_lat = 0.0
        self._globe_rot_lon = 0.0
        self._globe_target_lat = 0.0
        self._globe_target_lon = 0.0
        self._globe_animating = False
        self._globe_zoom = 1.0
        self._globe_items: dict[int, str] = {}
        self._globe_drag_active = False
        self._globe_drag_start = (0, 0)
        self._globe_drag_last = (0, 0)
        self._globe_suppress_click_until = 0.0

        self._init_fonts()
        self._build_launcher_ui()
        self._build_main_ui()
        self._show_launcher()
        self._polling_active = False

    def _init_fonts(self) -> None:
        base = tkfont.nametofont("TkDefaultFont")
        self.font_body = base.copy()
        self.font_body.configure(size=11)

        self.font_h1 = base.copy()
        self.font_h1.configure(size=18, weight="bold")
        self.font_h2 = base.copy()
        self.font_h2.configure(size=16, weight="bold")
        self.font_h3 = base.copy()
        self.font_h3.configure(size=14, weight="bold")
        self.font_h4 = base.copy()
        self.font_h4.configure(size=13, weight="bold")

        self.font_code = tkfont.Font(
            family="Courier New",
            size=10,
        )

    def _build_main_ui(self) -> None:
        self.main_frame = ttk.Frame(self)
        top = ttk.Frame(self.main_frame, padding=10)
        top.pack(fill="x")

        self.current_selection_var = tk.StringVar(value="Selected: (loading)")
        current_selection = ttk.Label(
            top,
            textvariable=self.current_selection_var,
            font=("TkDefaultFont", 12, "bold"),
        )
        current_selection.pack(side="left")

        refresh_btn = ttk.Button(top, text="Refresh", command=self._refresh_all)
        refresh_btn.pack(side="right")

        auto_refresh = ttk.Checkbutton(
            top,
            text="Auto refresh",
            variable=self._auto_refresh,
            onvalue=True,
            offvalue=False,
        )
        auto_refresh.pack(side="right", padx=(0, 12))

        pane = ttk.Panedwindow(self.main_frame, orient="horizontal")
        pane.pack(fill="both", expand=True)

        left = ttk.Frame(pane, padding=(8, 8, 4, 8))
        right = ttk.Frame(pane, padding=(4, 8, 8, 8))
        pane.add(left, weight=1)
        pane.add(right, weight=3)

        list_label = ttk.Label(left, text="Records")
        list_label.pack(anchor="w")

        self.db_listbox = tk.Listbox(
            left,
            font=self.font_body,
            background="#111318",
            foreground="#e9e9f0",
            selectbackground="#364156",
            selectforeground="#ffffff",
            relief="flat",
            activestyle="none",
        )
        self.db_listbox.pack(side="left", fill="both", expand=True)
        list_scroll = ttk.Scrollbar(left, orient="vertical", command=self.db_listbox.yview)
        list_scroll.pack(side="right", fill="y")
        self.db_listbox.configure(yscrollcommand=list_scroll.set)
        self.db_listbox.bind("<<ListboxSelect>>", self._on_db_list_select)

        self.right_pane = ttk.Panedwindow(right, orient="vertical")
        self.right_pane.pack(fill="both", expand=True)

        text_frame = ttk.Frame(self.right_pane)
        globe_frame = ttk.Frame(self.right_pane)
        self.right_pane.add(text_frame, weight=1)
        self.right_pane.add(globe_frame, weight=1)

        self.text_container = ttk.Frame(text_frame)
        self.text_container.pack(side="top", fill="both", expand=True)

        self.db_view = tk.Text(
            self.text_container,
            wrap="word",
            font=self.font_body,
            padx=12,
            pady=12,
            background="#0f0f12",
            foreground="#e9e9f0",
            insertbackground="#e9e9f0",
            relief="flat",
        )
        self._db_view_padx = 12
        self._db_view_pady = 12
        self.db_view.pack(side="left", fill="both", expand=True)
        text_scroll = ttk.Scrollbar(self.text_container, orient="vertical", command=self.db_view.yview)
        text_scroll.pack(side="right", fill="y")
        self.db_view.configure(yscrollcommand=text_scroll.set)
        self._apply_text_tags(self.db_view)
        self.db_view.configure(state="disabled")
        self._text_scroll = text_scroll

        self.image_view = tk.Canvas(
            text_frame,
            background="#0f0f12",
            highlightthickness=0,
        )
        self.image_view.bind("<Configure>", self._on_image_view_resize)
        self._image_view_visible = False

        self.globe = tk.Canvas(
            globe_frame,
            background="#08090c",
            highlightthickness=0,
        )
        self.globe.pack(fill="both", expand=True)
        self.globe.bind("<Configure>", self._on_globe_resize)
        self.globe.bind("<ButtonPress-1>", self._on_globe_press)
        self.globe.bind("<B1-Motion>", self._on_globe_drag)
        self.globe.bind("<ButtonRelease-1>", self._on_globe_release)
        self.globe.bind("<MouseWheel>", self._on_globe_zoom)
        self.globe.bind("<Button-4>", self._on_globe_zoom)
        self.globe.bind("<Button-5>", self._on_globe_zoom)

        self.after(0, self._set_right_pane_split)

    def _build_launcher_ui(self) -> None:
        self.launcher_frame = ttk.Frame(self)
        self.launcher_header = ttk.Label(
            self.launcher_frame,
            text="TTDB Globe Selector",
            font=("TkDefaultFont", 14, "bold"),
        )
        self.launcher_header.pack(anchor="center", pady=(12, 6))
        self.launcher_grid = ttk.Frame(self.launcher_frame)
        self.launcher_grid.pack(fill="both", expand=True, padx=12, pady=12)
        self.launcher_hint = ttk.Label(
            self.launcher_frame,
            text="Click a globe to open its TTDB navigator.",
            foreground="#a7a7b3",
        )
        self.launcher_hint.pack(anchor="center", pady=(0, 12))
        self._launcher_canvases: list[tk.Canvas] = []
        self._launcher_data: list[dict] = []

    def _show_launcher(self) -> None:
        self.main_frame.pack_forget()
        self.launcher_frame.pack(fill="both", expand=True)
        self._enter_launcher_fullscreen()
        self._load_launcher_globes()

    def _enter_launcher_fullscreen(self) -> None:
        try:
            self.state("zoomed")
        except tk.TclError:
            try:
                self.attributes("-fullscreen", True)
            except tk.TclError:
                pass

    def _show_main(self) -> None:
        self.launcher_frame.pack_forget()
        self.main_frame.pack(fill="both", expand=True)
        try:
            self.attributes("-fullscreen", False)
        except tk.TclError:
            pass

    def _load_launcher_globes(self) -> None:
        for canvas in self._launcher_canvases:
            canvas.destroy()
        self._launcher_canvases = []
        self._launcher_data = []

        ttdb_files = self._find_ttdb_files()
        if not ttdb_files and DB_PATH.exists():
            ttdb_files = [DB_PATH]

        for path in ttdb_files:
            data = self._load_launcher_data(path)
            self._launcher_data.append(data)

        if not self._launcher_data:
            self.launcher_hint.configure(text="No TTDB files found in this directory.")
            return

        self.launcher_hint.configure(text="Click a globe to open its TTDB navigator.")
        count = len(self._launcher_data)
        cols = 1 if count == 1 else (2 if count <= 4 else 3)
        for c in range(cols):
            self.launcher_grid.columnconfigure(c, weight=1, uniform="globe")
        rows = (count + cols - 1) // cols
        for r in range(rows):
            self.launcher_grid.rowconfigure(r, weight=1, uniform="globe")

        for idx, data in enumerate(self._launcher_data):
            row = idx // cols
            col = idx % cols
            canvas = tk.Canvas(
                self.launcher_grid,
                background="#08090c",
                highlightthickness=0,
            )
            canvas.grid(row=row, column=col, sticky="nsew", padx=8, pady=8)
            canvas.bind(
                "<Button-1>",
                lambda _event, target=data["path"]: self._open_ttdb(target),
            )
            canvas.bind(
                "<Configure>",
                lambda _event, cvs=canvas, payload=data: self._render_launcher_globe(cvs, payload),
            )
            self._launcher_canvases.append(canvas)

    def _find_ttdb_files(self) -> list[Path]:
        candidates = []
        for path in Path.cwd().iterdir():
            if not path.is_file():
                continue
            if path.suffix.lower() not in TTDB_EXTENSIONS:
                continue
            if self._looks_like_ttdb(path):
                candidates.append(path)
        return sorted(candidates)

    def _looks_like_ttdb(self, path: Path) -> bool:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return False
        if not re.search(r"^#\s+.+", content, flags=re.M):
            return False
        if "```mmpdb" not in content:
            return False
        if "```cursor" not in content:
            return False
        if not re.search(r"^@LAT-?\d+(?:\.\d+)?LON-?\d+(?:\.\d+)?", content, flags=re.M):
            return False
        return True

    def _load_launcher_data(self, path: Path) -> dict:
        try:
            content = path.read_text(encoding="utf-8")
        except Exception:
            content = ""
        db_name = self._extract_db_name(content) or path.stem
        records, order, selected, coords = self._parse_db_records(content)
        return {
            "path": path,
            "name": db_name,
            "coords": coords,
            "selected": selected if selected in coords else (order[0] if order else None),
        }

    def _extract_db_name(self, content: str) -> str | None:
        match = re.search(r"```mmpdb(.*?)```", content, flags=re.S)
        if not match:
            return None
        for line in match.group(1).splitlines():
            name_match = re.match(r"\s*db_name:\s*(.+)", line)
            if name_match:
                return name_match.group(1).strip().strip('"').strip("'")
        return None

    def _render_launcher_globe(self, canvas: tk.Canvas, data: dict) -> None:
        canvas.delete("all")
        width = max(canvas.winfo_width(), 200)
        height = max(canvas.winfo_height(), 200)
        padding = 14
        radius = min(width, height) / 2 - padding
        if radius <= 10:
            return
        cx = width / 2
        cy = height / 2

        canvas.create_oval(
            cx - radius,
            cy - radius,
            cx + radius,
            cy + radius,
            fill="#0e1117",
            outline="#2a2f3a",
            width=2,
        )
        canvas.create_oval(
            cx - radius * 0.92,
            cy - radius * 0.92,
            cx + radius * 0.92,
            cy + radius * 0.92,
            outline="#141824",
            width=1,
        )

        self._draw_graticule_static(canvas, cx, cy, radius)

        coords: dict[str, tuple[float, float, float]] = data.get("coords", {})
        selected = data.get("selected")
        if coords:
            nodes_front = []
            nodes_back = []
            selected_point = None
            for record_id, (lat, lon, depth) in coords.items():
                x, y, z = self._project_point_static(lat, lon, depth, 0.0, 0.0)
                if record_id == selected:
                    selected_point = (record_id, x, y, z)
                elif z > 0:
                    nodes_front.append((record_id, x, y, z))
                else:
                    nodes_back.append((record_id, x, y, z))

            for _record_id, x, y, _z in nodes_back:
                px = cx + x * radius
                py = cy - y * radius
                size = 3
                canvas.create_oval(
                    px - size,
                    py - size,
                    px + size,
                    py + size,
                    fill="#2b303b",
                    outline="",
                )

            for _record_id, x, y, _z in nodes_front:
                px = cx + x * radius
                py = cy - y * radius
                size = 5
                canvas.create_oval(
                    px - size,
                    py - size,
                    px + size,
                    py + size,
                    fill="#7cc7ff",
                    outline="#0b0b10",
                    width=2,
                )

            if selected_point:
                _record_id, x, y, _z = selected_point
                px = cx + x * radius
                py = cy - y * radius
                size = 7
                canvas.create_oval(
                    px - size,
                    py - size,
                    px + size,
                    py + size,
                    fill="#ffd166",
                    outline="#f4a261",
                    width=2,
                )
        else:
            canvas.create_text(
                cx,
                cy,
                text="No TTDB coords",
                fill="#6c7a89",
                font=("TkDefaultFont", 10, "bold"),
            )

        canvas.create_text(
            cx,
            height - 16,
            text=data.get("name") or "TTDB",
            fill="#e9e9f0",
            font=("TkDefaultFont", 10, "bold"),
        )

    def _project_point_static(
        self, lat: float, lon: float, depth: float, rot_lat: float, rot_lon: float
    ) -> tuple[float, float, float]:
        lat_r = math.radians(lat)
        lon_r = math.radians(lon)

        x = math.cos(lat_r) * math.sin(lon_r)
        y = math.sin(lat_r)
        z = math.cos(lat_r) * math.cos(lon_r)
        scale = self._clamp_z_scale(1.0 + depth * Z_SCALE)
        x *= scale
        y *= scale
        z *= scale

        cos_y = math.cos(rot_lon)
        sin_y = math.sin(rot_lon)
        x1 = x * cos_y + z * sin_y
        z1 = -x * sin_y + z * cos_y

        cos_x = math.cos(rot_lat)
        sin_x = math.sin(rot_lat)
        y1 = y * cos_x - z1 * sin_x
        z2 = y * sin_x + z1 * cos_x

        return x1, y1, z2

    def _draw_graticule_static(self, canvas: tk.Canvas, cx: float, cy: float, radius: float) -> None:
        for lon in range(-150, 180, 30):
            points = []
            for lat in range(-90, 91, 6):
                x, y, z = self._project_point_static(lat, lon, 0.0, 0.0, 0.0)
                visible = z > 0
                if visible:
                    px = cx + x * radius
                    py = cy - y * radius
                    points.append((px, py, visible))
                else:
                    points.append((0, 0, visible))
            self._draw_visible_line_static(canvas, points)

        for lat in range(-60, 90, 30):
            points = []
            for lon in range(-180, 181, 6):
                x, y, z = self._project_point_static(lat, lon, 0.0, 0.0, 0.0)
                visible = z > 0
                if visible:
                    px = cx + x * radius
                    py = cy - y * radius
                    points.append((px, py, visible))
                else:
                    points.append((0, 0, visible))
            self._draw_visible_line_static(canvas, points)

    def _draw_visible_line_static(
        self, canvas: tk.Canvas, points: list[tuple[float, float, bool]]
    ) -> None:
        line = []
        for px, py, visible in points:
            if visible:
                line.append((px, py))
            elif line:
                if len(line) >= 2:
                    canvas.create_line(
                        *self._flatten(line),
                        fill="#1a1f2a",
                        width=1,
                    )
                line = []
        if len(line) >= 2:
            canvas.create_line(
                *self._flatten(line),
                fill="#1a1f2a",
                width=1,
            )

    def _apply_text_tags(self, text: tk.Text) -> None:
        text.tag_configure("h1", font=self.font_h1, foreground="#ffd166")
        text.tag_configure("h2", font=self.font_h2, foreground="#f4a261")
        text.tag_configure("h3", font=self.font_h3, foreground="#e76f51")
        text.tag_configure("h4", font=self.font_h4, foreground="#e9c46a")
        text.tag_configure("bullet", lmargin1=18, lmargin2=36)
        text.tag_configure("quote", foreground="#a7a7b3", lmargin1=18, lmargin2=36)
        text.tag_configure("code", font=self.font_code, foreground="#c4f1ff")
        text.tag_configure("fence", font=self.font_code, foreground="#6c7a89")
        text.tag_configure("rule", foreground="#39424e")
        text.tag_configure("muted", foreground="#a7a7b3")
        text.tag_configure("link", foreground="#7cc7ff", underline=True)

    def _poll_files(self) -> None:
        if not self._db_path:
            self._polling_active = False
            return
        if self._auto_refresh.get():
            self._refresh_all()
        self.after(REFRESH_MS, self._poll_files)

    def _refresh_all(self, force: bool = False) -> None:
        if not self._db_path:
            return
        db_text = self._read_if_changed(self._db_path, force=force)
        if db_text is not None:
            self._update_db_data(db_text)

    def _read_if_changed(self, path: Path, force: bool = False) -> str | None:
        try:
            stat = path.stat()
        except FileNotFoundError:
            return f"File not found: {path}"

        last = self._file_mtimes.get(path)
        if not force and last == stat.st_mtime:
            return None

        self._file_mtimes[path] = stat.st_mtime
        return path.read_text(encoding="utf-8")

    def _start_polling(self) -> None:
        if self._polling_active:
            return
        self._polling_active = True
        self.after(REFRESH_MS, self._poll_files)

    def _open_ttdb(self, path: Path) -> None:
        self._db_path = path
        self._show_main()
        self._refresh_all(force=True)
        self._start_polling()

    def _render_markdown(self, widget: tk.Text, content: str) -> None:
        self._show_text_view()
        widget.configure(state="normal")
        widget.delete("1.0", "end")
        self._insert_markdown(widget, content)
        widget.configure(state="disabled")

    def _insert_markdown(self, widget: tk.Text, content: str) -> None:
        in_code = False
        for raw_line in content.splitlines():
            line = raw_line.rstrip("\n")

            if line.startswith("```"):
                in_code = not in_code
                widget.insert("end", line + "\n", ("fence",))
                continue

            if in_code:
                widget.insert("end", line + "\n", ("code",))
                continue

            heading_match = re.match(r"^(#{1,6})\s+(.*)$", line)
            if heading_match:
                level = len(heading_match.group(1))
                tag = f"h{min(level, 4)}"
                widget.insert("end", heading_match.group(2) + "\n", (tag,))
                continue

            if re.match(r"^\s*(-|\*|\d+\.)\s+", line):
                self._insert_markdown_line(widget, line, ("bullet",))
                widget.insert("end", "\n")
                continue

            if re.match(r"^\s*>\s+", line):
                self._insert_markdown_line(widget, line, ("quote",))
                widget.insert("end", "\n")
                continue

            if re.match(r"^\s*---+\s*$", line):
                widget.insert("end", line + "\n", ("rule",))
                continue

            self._insert_markdown_line(widget, line)
            widget.insert("end", "\n")

    def _insert_markdown_line(
        self, widget: tk.Text, line: str, extra_tags: tuple[str, ...] = ()
    ) -> None:
        cursor = 0
        for match in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", line):
            start, end = match.span()
            if start > cursor:
                widget.insert("end", line[cursor:start], extra_tags)
            label = match.group(1)
            url = match.group(2).strip()
            if url:
                tag = f"link_{self._link_counter}"
                self._link_counter += 1
                widget.tag_configure(tag, foreground="#7cc7ff", underline=True)
                internal_target = self._resolve_internal_target(url)
                if internal_target:
                    widget.tag_bind(
                        tag,
                        "<Button-1>",
                        lambda _event, rid=internal_target: self._select_db_record(rid),
                    )
                else:
                    widget.tag_bind(
                        tag,
                        "<Button-1>",
                        lambda _event, target=url: webbrowser.open(target),
                    )
                widget.tag_bind(
                    tag,
                    "<Enter>",
                    lambda _event: widget.configure(cursor="hand2"),
                )
                widget.tag_bind(
                    tag,
                    "<Leave>",
                    lambda _event: widget.configure(cursor=""),
                )
                widget.insert("end", label, (tag, *extra_tags))
            else:
                widget.insert("end", label, extra_tags)
            cursor = end
        if cursor < len(line):
            widget.insert("end", line[cursor:], extra_tags)

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
        if cleaned in self._db_records:
            return cleaned
        return None

    def _update_db_data(self, content: str) -> None:
        if content.startswith("File not found:"):
            self._db_records = {}
            self._db_order = []
            self._db_selected_id = None
            self._db_coords = {}
            self._populate_db_list()
            self._render_markdown(self.db_view, content)
            self._render_globe()
            self._update_header()
            return

        records, order, selected, coords = self._parse_db_records(content)
        self._db_records = records
        self._db_order = order
        self._db_coords = coords

        if self._db_selected_id not in self._db_records:
            self._db_selected_id = selected or (order[0] if order else None)

        self._populate_db_list()
        self._render_db_record(self._db_selected_id)
        self._update_header()
        self._center_on_selected()
        self._render_globe()

    def _parse_db_records(
        self, content: str
    ) -> tuple[dict, list[str], str | None, dict[str, tuple[float, float, float]]]:
        selected = None
        cursor_match = re.search(r"```cursor(.*?)```", content, re.S)
        if cursor_match:
            in_selected = False
            for line in cursor_match.group(1).splitlines():
                stripped = line.strip()
                if stripped.startswith("selected:"):
                    in_selected = True
                    continue
                if in_selected:
                    item_match = re.match(r"-\s*(\S+)", stripped)
                    if item_match:
                        selected = item_match.group(1)
                        break
                    if stripped and not stripped.startswith("-"):
                        break

        records: dict[str, dict] = {}
        order: list[str] = []
        coords: dict[str, tuple[float, float, float]] = {}
        for block in re.split(r"^\s*---+\s*$", content, flags=re.M):
            lines = [line.rstrip("\n") for line in block.splitlines()]
            header_index = None
            for idx, line in enumerate(lines):
                if line.startswith("@"):
                    header_index = idx
                    break
            if header_index is None:
                continue
            header_line = lines[header_index].strip()
            record_id = header_line.split()[0]
            body = "\n".join(lines[header_index + 1 :]).strip("\n")
            title = None
            for line in body.splitlines():
                title_match = re.match(r"^##\s+(.*)$", line)
                if title_match:
                    title = title_match.group(1).strip()
                    break

            edges = []
            relates_match = re.search(r"relates:([^|]+)", header_line)
            if relates_match:
                for token in relates_match.group(1).split(","):
                    token = token.strip()
                    if not token:
                        continue
                    if ">" in token:
                        edge_type, target = token.split(">", 1)
                    else:
                        edge_type, target = "relates", token
                    edges.append(
                        {
                            "type": edge_type.strip(),
                            "target": target.strip(),
                        }
                    )

            record_coords = self._parse_coords(record_id, header_line)
            if record_coords:
                coords[record_id] = record_coords

            records[record_id] = {
                "header": header_line,
                "body": body,
                "title": title,
                "edges": edges,
            }
            order.append(record_id)

        return records, order, selected, coords

    def _parse_coords(self, record_id: str, header_line: str) -> tuple[float, float, float] | None:
        match = re.match(r"@LAT(-?\d+(?:\.\d+)?)LON(-?\d+(?:\.\d+)?)", record_id)
        if not match:
            return None
        lat = float(match.group(1))
        lon = float(match.group(2))
        z_match = re.search(r"\bz:\s*(-?\d+(?:\.\d+)?)", header_line)
        z = float(z_match.group(1)) if z_match else 0.0
        return lat, lon, z

    def _populate_db_list(self) -> None:
        self.db_listbox.delete(0, "end")
        for record_id in self._db_order:
            title = self._db_records.get(record_id, {}).get("title")
            label = title if title else record_id
            self.db_listbox.insert("end", label)

        if self._db_selected_id in self._db_order:
            idx = self._db_order.index(self._db_selected_id)
            self.db_listbox.selection_set(idx)
            self.db_listbox.activate(idx)
            self.db_listbox.see(idx)

    def _on_db_list_select(self, event: tk.Event) -> None:
        selection = self.db_listbox.curselection()
        if not selection:
            return
        record_id = self._db_order[selection[0]]
        self._select_db_record(record_id, from_list=True)

    def _select_db_record(self, record_id: str | None, from_list: bool = False) -> None:
        if not record_id or record_id not in self._db_records:
            self._render_markdown(self.db_view, "No records available.")
            return
        self._db_selected_id = record_id
        if not from_list and record_id in self._db_order:
            idx = self._db_order.index(record_id)
            self.db_listbox.selection_clear(0, "end")
            self.db_listbox.selection_set(idx)
            self.db_listbox.activate(idx)
            self.db_listbox.see(idx)
        self._render_db_record(record_id)
        self._update_header()
        self._center_on_selected()
        self._render_globe()

    def _render_db_record(self, record_id: str | None) -> None:
        if not record_id or record_id not in self._db_records:
            self._render_markdown(self.db_view, "No record selected.")
            return
        record = self._db_records[record_id]
        widget = self.db_view
        widget.configure(state="normal")
        widget.delete("1.0", "end")

        body = record.get("body", "")
        image_path = self._extract_markdown_image(body)
        image_rendered = bool(image_path and self._render_image_with_text(image_path))
        if image_rendered:
            body = self._strip_markdown_images(body)
        else:
            self._show_text_view()
        widget.configure(padx=self._db_view_padx, pady=self._db_view_pady)

        if body:
            widget.insert("end", "\n")
            self._insert_markdown(widget, body)

        widget.configure(state="disabled")

    def _strip_markdown_images(self, content: str) -> str:
        if not content:
            return content
        cleaned_lines = []
        for line in content.splitlines():
            cleaned_lines.append(re.sub(r"!\[[^\]]*\]\([^)]+\)", "", line))
        cleaned = "\n".join(cleaned_lines).strip()
        return cleaned

    def _extract_markdown_image(self, content: str) -> str | None:
        for match in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", content):
            raw = match.group(1).strip()
            if not raw:
                continue
            if raw.startswith("<") and raw.endswith(">"):
                raw = raw[1:-1].strip()
            if " " in raw:
                raw = raw.split()[0]
            if raw:
                return raw
        return None

    def _render_image_with_text(self, image_path: str) -> bool:
        if image_path.startswith(("http://", "https://")):
            return False
        if os.name == "posix":
            win_drive = re.match(r"^([A-Za-z]):[\\/](.*)$", image_path)
            if win_drive:
                drive = win_drive.group(1).lower()
                rest = win_drive.group(2).replace("\\", "/")
                image_path = f"/mnt/{drive}/{rest}"
        base_dir = (self._db_path or DB_PATH).resolve().parent
        candidates: list[Path] = []
        raw_path = Path(image_path)
        candidates.append(raw_path)
        if image_path.startswith(("/", "\\")):
            candidates.append(base_dir / image_path.lstrip("/\\"))
            if base_dir.drive:
                candidates.append(Path(f"{base_dir.drive}{image_path}"))
        candidates.append(base_dir / raw_path)
        path = next((p for p in candidates if p.exists()), None)
        if path is None:
            return False
        image = None
        if path.suffix.lower() == ".svg":
            image = self._rasterize_svg(path)
        else:
            try:
                image = Image.open(path)
            except Exception:
                return False
        if image is None:
            return False
        self._image_original = image
        self._show_image_with_text()
        self._update_image_view()
        return True

    def _rasterize_svg(self, path: Path) -> Image.Image | None:
        cache_key = str(path.resolve())
        png_bytes = self._svg_cache.get(cache_key)
        if png_bytes is None:
            try:
                png_bytes = cairosvg.svg2png(
                    url=str(path),
                    output_width=SVG_MAX_WIDTH,
                    output_height=SVG_MAX_HEIGHT,
                )
            except Exception:
                return None
            self._svg_cache[cache_key] = png_bytes
        try:
            image = Image.open(BytesIO(png_bytes))
        except Exception:
            return None
        return image

    def _show_image_with_text(self) -> None:
        if self._image_view_visible and self._image_text_mode:
            return
        self.image_view.pack_forget()
        self.text_container.pack_forget()
        self.image_view.pack(side="top", fill="x")
        self.text_container.pack(side="top", fill="both", expand=True)
        self._image_view_visible = True
        self._image_text_mode = True

    def _show_text_view(self) -> None:
        if not self._image_view_visible:
            return
        self.image_view.pack_forget()
        self.text_container.pack(side="top", fill="both", expand=True)
        self._image_view_visible = False
        self._image_text_mode = False

    def _on_image_view_resize(self, _event: tk.Event) -> None:
        self._update_image_view()

    def _update_image_view(self) -> None:
        if not self._image_original:
            return
        canvas_w = max(self.image_view.winfo_width(), 1)
        if canvas_w <= 1:
            return
        img_w, img_h = self._image_original.size
        if img_w <= 0 or img_h <= 0:
            return
        scale = canvas_w / img_w
        new_w = max(1, int(img_w * scale))
        new_h = max(1, int(img_h * scale))
        resized = self._image_original.resize((new_w, new_h), Image.LANCZOS)
        photo = ImageTk.PhotoImage(resized)
        self._db_view_image = photo
        self.image_view.delete("all")
        self.image_view.create_image(0, 0, image=photo, anchor="nw")
        self.image_view.configure(height=new_h)

    def _update_header(self) -> None:
        if self._db_selected_id:
            self.current_selection_var.set(f"Selected: {self._db_selected_id}")
        else:
            self.current_selection_var.set("Selected: (none)")

    def _center_on_selected(self) -> None:
        record_id = self._db_selected_id
        if not record_id:
            return
        coords = self._db_coords.get(record_id)
        if not coords:
            return
        lat, lon, _depth = coords
        # Rotate so the selected point is centered on the front of the globe.
        lat_r = math.radians(lat)
        lon_r = math.radians(lon)
        x = math.cos(lat_r) * math.sin(lon_r)
        y = math.sin(lat_r)
        z = math.cos(lat_r) * math.cos(lon_r)
        rot_lon = -math.atan2(x, z)
        z1 = math.hypot(x, z)
        rot_lat = math.atan2(y, z1)
        self._globe_target_lat = rot_lat
        self._globe_target_lon = rot_lon
        if not self._globe_animating:
            self._globe_animating = True
            self.after(ANIMATION_MS, self._animate_globe)

    def _animate_globe(self) -> None:
        if not self._globe_animating:
            return

        delta_lat = self._angle_delta(self._globe_target_lat, self._globe_rot_lat)
        delta_lon = self._angle_delta(self._globe_target_lon, self._globe_rot_lon)

        if abs(delta_lat) < 0.002 and abs(delta_lon) < 0.002:
            self._globe_rot_lat = self._globe_target_lat
            self._globe_rot_lon = self._globe_target_lon
            self._globe_animating = False
            self._render_globe()
            return

        self._globe_rot_lat += delta_lat * 0.15
        self._globe_rot_lon += delta_lon * 0.15
        self._render_globe()
        self.after(ANIMATION_MS, self._animate_globe)

    def _angle_delta(self, target: float, current: float) -> float:
        delta = target - current
        while delta > math.pi:
            delta -= 2 * math.pi
        while delta < -math.pi:
            delta += 2 * math.pi
        return delta

    def _on_globe_resize(self, event: tk.Event) -> None:
        self._render_globe()

    def _set_right_pane_split(self) -> None:
        height = self.right_pane.winfo_height()
        if height <= 1:
            self.after(50, self._set_right_pane_split)
            return
        self.right_pane.sashpos(0, (height * 2) // 3)

    def _on_globe_press(self, event: tk.Event) -> None:
        self._globe_drag_active = False
        self._globe_drag_start = (event.x, event.y)
        self._globe_drag_last = (event.x, event.y)

    def _on_globe_drag(self, event: tk.Event) -> None:
        start_x, start_y = self._globe_drag_start
        dx_total = event.x - start_x
        dy_total = event.y - start_y
        if not self._globe_drag_active:
            if math.hypot(dx_total, dy_total) < DRAG_THRESHOLD:
                return
            self._globe_drag_active = True

        last_x, last_y = self._globe_drag_last
        dx = event.x - last_x
        dy = event.y - last_y
        self._globe_drag_last = (event.x, event.y)

        self._globe_rot_lon += dx * DRAG_SENSITIVITY
        self._globe_rot_lat = self._clamp_lat(self._globe_rot_lat + dy * DRAG_SENSITIVITY)
        self._globe_target_lat = self._globe_rot_lat
        self._globe_target_lon = self._globe_rot_lon
        self._globe_animating = False
        self._render_globe()

    def _on_globe_release(self, event: tk.Event) -> None:
        if self._globe_drag_active:
            self._globe_suppress_click_until = time.time() + 0.25
            self._globe_drag_active = False
            return
        self._on_globe_click(event)

    def _on_globe_click(self, event: tk.Event) -> None:
        if time.time() < self._globe_suppress_click_until:
            return
        item = self.globe.find_withtag("current")
        if not item:
            return
        record_id = self._globe_items.get(item[0])
        if record_id:
            self._select_db_record(record_id)

    def _on_globe_zoom(self, event: tk.Event) -> None:
        if getattr(event, "delta", 0):
            direction = 1 if event.delta > 0 else -1
        else:
            direction = 1 if event.num == 4 else -1
        if direction > 0:
            self._globe_zoom = min(self._globe_zoom * 1.1, 2.5)
        else:
            self._globe_zoom = max(self._globe_zoom / 1.1, 0.6)
        self._render_globe()

    def _clamp_lat(self, lat: float) -> float:
        return max(-DRAG_LAT_LIMIT, min(DRAG_LAT_LIMIT, lat))

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

        rot_y = self._globe_rot_lon
        cos_y = math.cos(rot_y)
        sin_y = math.sin(rot_y)
        x1 = x * cos_y + z * sin_y
        z1 = -x * sin_y + z * cos_y

        rot_x = self._globe_rot_lat
        cos_x = math.cos(rot_x)
        sin_x = math.sin(rot_x)
        y1 = y * cos_x - z1 * sin_x
        z2 = y * sin_x + z1 * cos_x

        return x1, y1, z2

    def _render_globe(self) -> None:
        globe = self.globe
        globe.delete("all")
        self._globe_items = {}

        width = max(globe.winfo_width(), 200)
        height = max(globe.winfo_height(), 200)
        padding = 6
        radius = (width / 2 - padding) * self._globe_zoom
        if radius <= 10:
            return

        cx = width / 2
        cy = height / 2

        globe.create_oval(
            cx - radius,
            cy - radius,
            cx + radius,
            cy + radius,
            fill="#0e1117",
            outline="#2a2f3a",
            width=2,
        )
        globe.create_oval(
            cx - radius * 0.92,
            cy - radius * 0.92,
            cx + radius * 0.92,
            cy + radius * 0.92,
            outline="#141824",
            width=1,
        )

        self._draw_graticule(cx, cy, radius)

        if not self._db_coords:
            return

        selected = self._db_selected_id
        nodes_front = []
        nodes_back = []
        selected_point = None
        projections: dict[str, tuple[float, float, float]] = {}
        for record_id, (lat, lon, depth) in self._db_coords.items():
            x, y, z = self._project_point(lat, lon, depth)
            projections[record_id] = (x, y, z)
            if record_id == selected:
                selected_point = (record_id, x, y, z)
            elif z > 0:
                nodes_front.append((record_id, x, y, z))
            else:
                nodes_back.append((record_id, x, y, z))

        for record_id, x, y, z in nodes_back:
            px = cx + x * radius
            py = cy - y * radius
            size = 3
            globe.create_oval(
                px - size,
                py - size,
                px + size,
                py + size,
                fill="#2b303b",
                outline="",
            )

        # Draw typed edges for visible nodes.
        for source_id, record in self._db_records.items():
            edges = record.get("edges", [])
            if not edges:
                continue
            source_proj = projections.get(source_id)
            if not source_proj:
                continue
            sx, sy, sz = source_proj
            if sz <= 0:
                continue
            sxp = cx + sx * radius
            syp = cy - sy * radius
            for edge in edges:
                target_id = edge.get("target")
                if not target_id:
                    continue
                target_proj = projections.get(target_id)
                if not target_proj:
                    continue
                tx, ty, tz = target_proj
                if tz <= 0:
                    continue
                txp = cx + tx * radius
                typ = cy - ty * radius
                is_selected_edge = source_id == selected or target_id == selected
                color = "#2a3a4d" if not is_selected_edge else "#7cc7ff"
                width = 1 if not is_selected_edge else 2
                globe.create_line(sxp, syp, txp, typ, fill=color, width=width)

        for record_id, x, y, z in nodes_front:
            px = cx + x * radius
            py = cy - y * radius
            size = 5
            fill = "#7cc7ff"
            outline = "#0b0b10"
            item = globe.create_oval(
                px - size,
                py - size,
                px + size,
                py + size,
                fill=fill,
                outline=outline,
                width=2,
                tags=("node",),
            )
            self._globe_items[item] = record_id

        if selected_point:
            record_id, x, y, z = selected_point
            px = cx + x * radius
            py = cy - y * radius
            size = 7
            item = globe.create_oval(
                px - size,
                py - size,
                px + size,
                py + size,
                fill="#ffd166",
                outline="#f4a261",
                width=2,
                tags=("node",),
            )
            self._globe_items[item] = record_id
            title = self._db_records.get(record_id, {}).get("title") or record_id
            globe.create_text(
                px,
                py - 14,
                text=title,
                fill="#e9e9f0",
                font=("TkDefaultFont", 9, "bold"),
            )

    def _draw_graticule(self, cx: float, cy: float, radius: float) -> None:
        for lon in range(-150, 180, 30):
            points = []
            for lat in range(-90, 91, 6):
                x, y, z = self._project_point(lat, lon, 0.0)
                visible = z > 0
                if visible:
                    px = cx + x * radius
                    py = cy - y * radius
                    points.append((px, py, visible))
                else:
                    points.append((0, 0, visible))
            self._draw_visible_line(points)

        for lat in range(-60, 90, 30):
            points = []
            for lon in range(-180, 181, 6):
                x, y, z = self._project_point(lat, lon, 0.0)
                visible = z > 0
                if visible:
                    px = cx + x * radius
                    py = cy - y * radius
                    points.append((px, py, visible))
                else:
                    points.append((0, 0, visible))
            self._draw_visible_line(points)

    def _draw_visible_line(self, points: list[tuple[float, float, bool]]) -> None:
        line = []
        for px, py, visible in points:
            if visible:
                line.append((px, py))
            elif line:
                if len(line) >= 2:
                    self.globe.create_line(
                        *self._flatten(line),
                        fill="#1a1f2a",
                        width=1,
                    )
                line = []
        if len(line) >= 2:
            self.globe.create_line(
                *self._flatten(line),
                fill="#1a1f2a",
                width=1,
            )

    def _flatten(self, points: list[tuple[float, float]]) -> list[float]:
        flat: list[float] = []
        for x, y in points:
            flat.extend([x, y])
        return flat

    def _clamp_z_scale(self, scale: float) -> float:
        return max(Z_MIN_SCALE, min(Z_MAX_SCALE, scale))


def main() -> None:
    app = NavigatorApp()
    app.mainloop()


if __name__ == "__main__":
    main()

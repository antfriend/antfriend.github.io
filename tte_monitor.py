#!/usr/bin/env python3
import math
import random
import re
import time
from pathlib import Path
import tkinter as tk
from tkinter import ttk
from tkinter import font as tkfont

PLAN_PATH = Path("PLAN.md")
LOG_PATH = Path("LOG.md")
DB_PATH = Path("MyMentalPalaceDB.md")

REFRESH_MS = 1500
LOG_LINE_LIMIT = 200


class MonitorApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("TTE Monitor")
        self.geometry("1200x800")
        self.minsize(900, 600)

        self._file_mtimes = {}
        self._auto_refresh = tk.BooleanVar(value=True)
        self._db_records = {}
        self._db_order = []
        self._db_selected_id = None
        self._db_positions = {}
        self._current_step_text = "Current step: (loading)"

        self._init_fonts()
        self._build_ui()
        self._refresh_all(force=True)
        self.after(REFRESH_MS, self._poll_files)

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

    def _build_ui(self) -> None:
        top = ttk.Frame(self, padding=10)
        top.pack(fill="x")

        self.current_step_var = tk.StringVar(value="Current step: (loading)")
        current_step = ttk.Label(
            top,
            textvariable=self.current_step_var,
            font=("TkDefaultFont", 12, "bold"),
        )
        current_step.pack(side="left")

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

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True)
        self.notebook.bind("<<NotebookTabChanged>>", self._on_tab_changed)

        self.plan_view = self._add_tab("Plan")
        self.log_view = self._add_tab("Log")
        (
            self.db_tab_frame,
            self.db_listbox,
            self.db_view,
            self.db_graph,
        ) = self._add_db_tab("DB")
        self.notebook.select(self.db_tab_frame)
        self._sync_header()

    def _add_tab(self, title: str) -> tk.Text:
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text=title)

        text = tk.Text(
            frame,
            wrap="word",
            font=self.font_body,
            padx=12,
            pady=12,
            background="#0f0f12",
            foreground="#e9e9f0",
            insertbackground="#e9e9f0",
            relief="flat",
        )
        text.pack(side="left", fill="both", expand=True)

        scroll = ttk.Scrollbar(frame, orient="vertical", command=text.yview)
        scroll.pack(side="right", fill="y")
        text.configure(yscrollcommand=scroll.set)

        self._apply_text_tags(text)
        text.configure(state="disabled")
        return text

    def _add_db_tab(self, title: str) -> tuple[ttk.Frame, tk.Listbox, tk.Text, tk.Canvas]:
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text=title)

        pane = ttk.Panedwindow(frame, orient="horizontal")
        pane.pack(fill="both", expand=True)

        left = ttk.Frame(pane, padding=(8, 8, 4, 8))
        right = ttk.Frame(pane, padding=(4, 8, 8, 8))
        pane.add(left, weight=1)
        pane.add(right, weight=3)

        list_label = ttk.Label(left, text="Records")
        list_label.pack(anchor="w")

        listbox = tk.Listbox(
            left,
            font=self.font_body,
            background="#111318",
            foreground="#e9e9f0",
            selectbackground="#364156",
            selectforeground="#ffffff",
            relief="flat",
            activestyle="none",
        )
        listbox.pack(side="left", fill="both", expand=True)
        list_scroll = ttk.Scrollbar(left, orient="vertical", command=listbox.yview)
        list_scroll.pack(side="right", fill="y")
        listbox.configure(yscrollcommand=list_scroll.set)
        listbox.bind("<<ListboxSelect>>", self._on_db_list_select)

        right_pane = ttk.Panedwindow(right, orient="vertical")
        right_pane.pack(fill="both", expand=True)

        text_frame = ttk.Frame(right_pane)
        graph_frame = ttk.Frame(right_pane)
        right_pane.add(text_frame, weight=3)
        right_pane.add(graph_frame, weight=1)

        text = tk.Text(
            text_frame,
            wrap="word",
            font=self.font_body,
            padx=12,
            pady=12,
            background="#0f0f12",
            foreground="#e9e9f0",
            insertbackground="#e9e9f0",
            relief="flat",
        )
        text.pack(side="left", fill="both", expand=True)
        text_scroll = ttk.Scrollbar(text_frame, orient="vertical", command=text.yview)
        text_scroll.pack(side="right", fill="y")
        text.configure(yscrollcommand=text_scroll.set)
        self._apply_text_tags(text)
        text.configure(state="disabled")

        graph = tk.Canvas(
            graph_frame,
            background="#0b0b10",
            highlightthickness=0,
        )
        graph.pack(fill="both", expand=True)
        graph.bind("<Configure>", self._on_graph_resize)

        return frame, listbox, text, graph

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
        if self._auto_refresh.get():
            self._refresh_all()
        self.after(REFRESH_MS, self._poll_files)

    def _refresh_all(self, force: bool = False) -> None:
        plan_text = self._read_if_changed(PLAN_PATH, force=force)
        if plan_text is not None:
            self._render_markdown(self.plan_view, plan_text)
            self._update_current_step(plan_text)

        log_text = self._read_if_changed(LOG_PATH, force=force)
        if log_text is not None:
            log_text = self._limit_lines(log_text, LOG_LINE_LIMIT)
            self._render_markdown(self.log_view, log_text)

        db_text = self._read_if_changed(DB_PATH, force=force)
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

    def _render_markdown(self, widget: tk.Text, content: str) -> None:
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
                widget.insert("end", line + "\n", ("bullet",))
                continue

            if re.match(r"^\s*>\s+", line):
                widget.insert("end", line + "\n", ("quote",))
                continue

            if re.match(r"^\s*---+\s*$", line):
                widget.insert("end", line + "\n", ("rule",))
                continue

            widget.insert("end", line + "\n")

    def _update_current_step(self, content: str) -> None:
        step = "Current step: (not found)"
        in_section = False
        for line in content.splitlines():
            if line.strip().lower().startswith("## current step"):
                in_section = True
                continue
            if in_section and line.strip().startswith("##"):
                break
            if in_section:
                match = re.search(r"\[[ xX]\]\s+(.*)", line)
                if match:
                    step = f"Current step: {match.group(1).strip()}"
                    break
        self._current_step_text = step
        self._sync_header()

    def _limit_lines(self, text: str, max_lines: int) -> str:
        if max_lines <= 0:
            return text
        lines = text.splitlines()
        if len(lines) <= max_lines:
            return text
        return "\n".join(lines[-max_lines:]) + "\n"

    def _on_graph_resize(self, event: tk.Event) -> None:
        self._render_db_graph()

    def _update_db_data(self, content: str) -> None:
        if content.startswith("File not found:"):
            self._db_records = {}
            self._db_order = []
            self._db_selected_id = None
            self._populate_db_list()
            self._render_markdown(self.db_view, content)
            self._render_db_graph()
            return

        records, order, selected = self._parse_db_records(content)
        self._db_records = records
        self._db_order = order

        if self._db_selected_id not in self._db_records:
            self._db_selected_id = selected or (order[0] if order else None)

        self._populate_db_list()
        self._render_db_record(self._db_selected_id)
        self._render_db_graph()

    def _parse_db_records(self, content: str) -> tuple[dict, list[str], str | None]:
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

            records[record_id] = {
                "header": header_line,
                "body": body,
                "title": title,
                "edges": edges,
            }
            order.append(record_id)

        return records, order, selected

    def _populate_db_list(self) -> None:
        self.db_listbox.delete(0, "end")
        for record_id in self._db_order:
            title = self._db_records.get(record_id, {}).get("title")
            label = f"{record_id} - {title}" if title else record_id
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
        self._render_db_graph()

    def _render_db_record(self, record_id: str | None) -> None:
        if not record_id or record_id not in self._db_records:
            self._render_markdown(self.db_view, "No record selected.")
            return
        record = self._db_records[record_id]
        widget = self.db_view
        widget.configure(state="normal")
        widget.delete("1.0", "end")

        widget.insert("end", f"{record_id}\n", ("h2",))
        widget.insert("end", record["header"] + "\n", ("muted",))

        edges = record.get("edges", [])
        if edges:
            widget.insert("end", "\nRelated records\n", ("h3",))
            for idx, edge in enumerate(edges):
                edge_type = edge.get("type") or "relates"
                target = edge.get("target") or ""
                tag = f"link_{record_id}_{idx}"
                widget.tag_configure(tag, foreground="#7cc7ff", underline=True)
                widget.tag_bind(
                    tag,
                    "<Button-1>",
                    lambda _event, rid=target: self._select_db_record(rid),
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
                widget.insert("end", f"- {edge_type} -> ", ("bullet",))
                if target in self._db_records:
                    widget.insert("end", target + "\n", ("bullet", tag))
                else:
                    widget.insert("end", target + "\n", ("bullet", "muted"))

        body = record.get("body", "")
        if body:
            widget.insert("end", "\n")
            self._insert_markdown(widget, body)

        widget.configure(state="disabled")

    def _on_tab_changed(self, event: tk.Event) -> None:
        self._sync_header()

    def _sync_header(self) -> None:
        current = self.notebook.select()
        if current == str(self.db_tab_frame):
            self.current_step_var.set(f"DB: {DB_PATH.name}")
        else:
            self.current_step_var.set(self._current_step_text)

    def _render_db_graph(self) -> None:
        graph = self.db_graph
        graph.delete("all")

        if not self._db_records:
            return

        width = max(graph.winfo_width(), 200)
        height = max(graph.winfo_height(), 120)
        padding = 20

        nodes = list(self._db_order)
        if not nodes:
            return

        edges = []
        for source_id in nodes:
            for edge in self._db_records.get(source_id, {}).get("edges", []):
                target = edge.get("target")
                if target in self._db_records:
                    edges.append((source_id, target))

        positions = self._compute_force_layout(
            nodes,
            edges,
            width,
            height,
            padding,
        )
        self._db_positions = positions

        selected = self._db_selected_id
        selected_neighbors = set()
        if selected in self._db_records:
            for edge in self._db_records[selected].get("edges", []):
                target = edge.get("target")
                if target:
                    selected_neighbors.add(target)

        for source_id, target_id in edges:
            x1, y1 = positions[source_id]
            x2, y2 = positions[target_id]
            color = "#39424e"
            width_line = 1
            if source_id == selected or target_id == selected:
                color = "#7cc7ff"
                width_line = 2
            graph.create_line(x1, y1, x2, y2, fill=color, width=width_line)

        for node_id in nodes:
            x, y = positions[node_id]
            is_selected = node_id == selected
            is_neighbor = node_id in selected_neighbors
            radius = 8 if is_selected else 6
            fill = "#ffd166" if is_selected else "#6c7a89"
            outline = "#7cc7ff" if is_neighbor else "#0b0b10"
            graph.create_oval(
                x - radius,
                y - radius,
                x + radius,
                y + radius,
                fill=fill,
                outline=outline,
                width=2 if is_neighbor else 1,
            )
            label = node_id
            if is_selected or is_neighbor:
                graph.create_text(
                    x,
                    y - 14,
                    text=label,
                    fill="#e9e9f0",
                    font=("TkDefaultFont", 9, "bold"),
                )

    def _compute_force_layout(
        self,
        nodes: list[str],
        edges: list[tuple[str, str]],
        width: int,
        height: int,
        padding: int,
    ) -> dict[str, tuple[float, float]]:
        rng = random.Random(42)
        positions: dict[str, list[float]] = {}
        for node_id in nodes:
            if node_id in self._db_positions:
                positions[node_id] = list(self._db_positions[node_id])
            else:
                positions[node_id] = [
                    rng.uniform(padding, width - padding),
                    rng.uniform(padding, height - padding),
                ]

        area = max((width - 2 * padding) * (height - 2 * padding), 1)
        k = math.sqrt(area / max(len(nodes), 1))
        iterations = 60
        temperature = min(width, height) / 4

        for _ in range(iterations):
            disp = {node_id: [0.0, 0.0] for node_id in nodes}

            for i, v in enumerate(nodes):
                for u in nodes[i + 1 :]:
                    dx = positions[v][0] - positions[u][0]
                    dy = positions[v][1] - positions[u][1]
                    dist = math.hypot(dx, dy) or 0.001
                    force = (k * k) / dist
                    rx = (dx / dist) * force
                    ry = (dy / dist) * force
                    disp[v][0] += rx
                    disp[v][1] += ry
                    disp[u][0] -= rx
                    disp[u][1] -= ry

            for v, u in edges:
                dx = positions[v][0] - positions[u][0]
                dy = positions[v][1] - positions[u][1]
                dist = math.hypot(dx, dy) or 0.001
                force = (dist * dist) / k
                ax = (dx / dist) * force
                ay = (dy / dist) * force
                disp[v][0] -= ax
                disp[v][1] -= ay
                disp[u][0] += ax
                disp[u][1] += ay

            for node_id in nodes:
                dx, dy = disp[node_id]
                dist = math.hypot(dx, dy) or 0.001
                limited = min(dist, temperature)
                positions[node_id][0] += (dx / dist) * limited
                positions[node_id][1] += (dy / dist) * limited
                positions[node_id][0] = min(
                    width - padding, max(padding, positions[node_id][0])
                )
                positions[node_id][1] = min(
                    height - padding, max(padding, positions[node_id][1])
                )

            temperature *= 0.92

        return {node_id: (pos[0], pos[1]) for node_id, pos in positions.items()}

def main() -> None:
    app = MonitorApp()
    app.mainloop()


if __name__ == "__main__":
    main()

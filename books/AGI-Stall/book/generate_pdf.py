#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "reportlab>=4.0",
# ]
# ///
"""Generate a professional PDF of the AGI book from markdown chapters.

Usage:
    uv run generate_pdf.py

Output: ../AGI-Complete-Guide.pdf
"""

from __future__ import annotations

import glob
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (  # type: ignore[import-untyped]
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.flowables import HRFlowable, Flowable

# ── Paths ────────────────────────────────────────────────────────────────────
BOOK_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BOOK_DIR.parent
OUTPUT_PDF = OUTPUT_DIR / "AGI-Complete-Guide.pdf"

# ── Book metadata ────────────────────────────────────────────────────────────
BOOK_TITLE = "AGI: The Complete Guide to Artificial General Intelligence"
BOOK_AUTHOR = "Manjunath Kalburgi"
BOOK_DATE = date.today().strftime("%B %d, %Y")

# ── Chapter files in order ──────────────────────────────────────────────────
CHAPTER_FILES = sorted(glob.glob(str(BOOK_DIR / "chapter-*.md")))


def _init_styles() -> None:
    """Initialize the global STYLES dict."""
    global STYLES  # noqa: PLW0603
    STYLES = _build_styles()

# ── Color palette (indigo theme) ────────────────────────────────────────────
PRIMARY = colors.HexColor("#6366f1")
PRIMARY_DARK = colors.HexColor("#4f46e5")
PRIMARY_LIGHT = colors.HexColor("#818cf8")
PRIMARY_PALE = colors.HexColor("#eef2ff")
ACCENT = colors.HexColor("#f59e0b")
TEXT_DARK = colors.HexColor("#1e1b4b")
TEXT_MED = colors.HexColor("#475569")
BG_LIGHT = colors.HexColor("#f8fafc")
BORDER_COLOR = colors.HexColor("#e2e8f0")
WHITE = colors.white
CODE_BG = colors.HexColor("#1e1b4b")
CODE_FG = colors.HexColor("#e2e8f0")

PAGE_W, PAGE_H = A4


# ── Styles ───────────────────────────────────────────────────────────────────
def _build_styles() -> dict[str, ParagraphStyle]:
    """Create all paragraph styles used in the document."""
    base = getSampleStyleSheet()
    s: dict[str, ParagraphStyle] = {}

    s["body"] = ParagraphStyle(
        "Body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=TEXT_DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        spaceBefore=0,
    )
    s["body_code"] = ParagraphStyle(
        "BodyCode",
        parent=s["body"],
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=CODE_FG,
        backColor=CODE_BG,
        leftIndent=8,
        rightIndent=8,
        spaceBefore=4,
        spaceAfter=4,
        borderWidth=0,
    )
    s["h1"] = ParagraphStyle(
        "H1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=28,
        textColor=PRIMARY_DARK,
        spaceBefore=0,
        spaceAfter=12,
        alignment=TA_LEFT,
    )
    s["h2"] = ParagraphStyle(
        "H2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=18,
        spaceAfter=8,
        alignment=TA_LEFT,
    )
    s["h3"] = ParagraphStyle(
        "H3",
        parent=base["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=TEXT_DARK,
        spaceBefore=14,
        spaceAfter=6,
        alignment=TA_LEFT,
    )
    s["h4"] = ParagraphStyle(
        "H4",
        parent=base["Heading4"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=TEXT_MED,
        spaceBefore=10,
        spaceAfter=4,
        alignment=TA_LEFT,
    )
    s["blockquote"] = ParagraphStyle(
        "Blockquote",
        parent=s["body"],
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        leading=14,
        textColor=TEXT_MED,
        leftIndent=20,
        rightIndent=10,
        spaceBefore=8,
        spaceAfter=8,
        borderPadding=(6, 8, 6, 8),
        borderColor=PRIMARY,
        borderWidth=0,
        backColor=PRIMARY_PALE,
    )
    s["toc_part"] = ParagraphStyle(
        "TOCPart",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=PRIMARY_DARK,
        spaceBefore=14,
        spaceAfter=4,
    )
    s["toc_chapter"] = ParagraphStyle(
        "TOCChapter",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=TEXT_DARK,
        leftIndent=14,
        spaceBefore=2,
        spaceAfter=2,
    )
    s["toc_title"] = ParagraphStyle(
        "TOCTitle",
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=26,
        textColor=PRIMARY,
        spaceBefore=0,
        spaceAfter=16,
    )
    s["title_main"] = ParagraphStyle(
        "TitleMain",
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=40,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    s["title_subtitle"] = ParagraphStyle(
        "TitleSubtitle",
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#c7d2fe"),
        alignment=TA_CENTER,
        spaceBefore=8,
    )
    s["title_author"] = ParagraphStyle(
        "TitleAuthor",
        fontName="Helvetica",
        fontSize=15,
        leading=20,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceBefore=24,
    )
    s["title_date"] = ParagraphStyle(
        "TitleDate",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#a5b4fc"),
        alignment=TA_CENTER,
        spaceBefore=8,
    )
    s["li"] = ParagraphStyle(
        "ListItem",
        parent=s["body"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        leftIndent=18,
        spaceBefore=1,
        spaceAfter=1,
    )
    s["footer"] = ParagraphStyle(
        "Footer",
        fontName="Helvetica",
        fontSize=8,
        textColor=TEXT_MED,
        alignment=TA_CENTER,
    )
    s["chapter_num"] = ParagraphStyle(
        "ChapterNum",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=PRIMARY_LIGHT,
        spaceBefore=0,
        spaceAfter=2,
    )
    return s


STYLES: dict[str, ParagraphStyle] = {}


# ── Sanitize text for ReportLab XML ─────────────────────────────────────────
def _esc(text: str) -> str:
    """Escape XML special characters for ReportLab Paragraph."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


def _inline_md(text: str) -> str:
    """Convert markdown inline formatting to ReportLab XML tags."""
    # Bold: **text** or __text__
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"__(.+?)__", r"<b>\1</b>", text)
    # Italic: *text* or _text_
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<i>\1</i>", text)
    # Inline code: `text`
    text = re.sub(
        r"`(.+?)`",
        r'<font face="Courier" size="8" color="#4f46e5"><b>\1</b></font>',
        text,
    )
    # Links: [text](url) → just text
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    return text


# ── Markdown parsing into flowables ─────────────────────────────────────────
def _is_table_line(line: str) -> bool:
    return line.strip().startswith("|") and line.strip().endswith("|")


def _parse_table(lines: list[str]) -> list[list[str]]:
    """Parse markdown table lines into a list of rows (list of cells)."""
    rows: list[list[str]] = []
    for line in lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        # Skip separator rows (---, ---, ---)
        if all(re.match(r"^[-:]+$", c) for c in cells):
            continue
        rows.append(cells)
    return rows


def _make_table_flowable(rows: list[list[str]]) -> Table:
    """Create a styled Table flowable from parsed rows."""
    if not rows:
        return Table([[""]])

    # Convert cells to Paragraphs for word-wrap
    cell_style = ParagraphStyle(
        "TableCell",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=TEXT_DARK,
    )
    header_style = ParagraphStyle(
        "TableHeader",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=WHITE,
    )

    table_data: list[list[Paragraph]] = []
    for i, row in enumerate(rows):
        styled_row: list[Paragraph] = []
        for cell in row:
            style = header_style if i == 0 else cell_style
            styled_row.append(Paragraph(_inline_md(_esc(cell)), style))
        table_data.append(styled_row)

    num_cols = max(len(r) for r in table_data)
    col_width = (PAGE_W - 4 * cm) / num_cols

    t = Table(table_data, colWidths=[col_width] * num_cols, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    # Alternate row colors
    for row_idx in range(1, len(table_data)):
        if row_idx % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, row_idx), (-1, row_idx), BG_LIGHT))
    t.setStyle(TableStyle(style_cmds))
    return t


def _md_to_flowables(md_text: str) -> list[Any]:
    """Parse markdown text and return a list of ReportLab flowables."""
    flowables: list[Any] = []
    lines = md_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Empty line
        if not stripped:
            i += 1
            continue

        # Horizontal rule
        if re.match(r"^(-{3,}|\*{3,}|_{3,})$", stripped):
            flowables.append(Spacer(1, 4))
            flowables.append(
                HRFlowable(
                    width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=8, spaceBefore=4
                )
            )
            i += 1
            continue

        # Code block (fenced)
        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            code_lines: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing ```

            # Render code block; split long blocks into page-sized chunks
            CODE_CHUNK_LINES = 45  # max lines per chunk before splitting
            code_text = "\n".join(code_lines) if code_lines else ""
            chunks: list[str] = []
            if len(code_lines) <= CODE_CHUNK_LINES:
                chunks = [code_text]
            else:
                for ci in range(0, len(code_lines), CODE_CHUNK_LINES):
                    chunk = "\n".join(code_lines[ci : ci + CODE_CHUNK_LINES])
                    chunks.append(chunk)

            flowables.append(Spacer(1, 4))
            code_style = ParagraphStyle(
                "CodeBlock",
                fontName="Courier",
                fontSize=7.5,
                leading=10.5,
                textColor=CODE_FG,
                spaceBefore=0,
                spaceAfter=0,
            )
            for ci, chunk in enumerate(chunks):
                chunk_html = _esc(chunk).replace("\n", "<br/>")
                code_para = Paragraph(chunk_html, code_style)
                code_table = Table([[code_para]], colWidths=[PAGE_W - 4 * cm])
                code_table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
                            ("TOPPADDING", (0, 0), (-1, -1), 8),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                            ("LEFTPADDING", (0, 0), (-1, -1), 10),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                        ]
                    )
                )
                flowables.append(code_table)
            flowables.append(Spacer(1, 6))
            continue

        # Table
        if _is_table_line(stripped):
            table_lines: list[str] = []
            while i < len(lines) and _is_table_line(lines[i].strip()):
                table_lines.append(lines[i].strip())
                i += 1
            rows = _parse_table(table_lines)
            if rows:
                flowables.append(Spacer(1, 4))
                flowables.append(_make_table_flowable(rows))
                flowables.append(Spacer(1, 6))
            continue

        # Headings
        h_match = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if h_match:
            level = len(h_match.group(1))
            heading_text = h_match.group(2).strip()
            heading_text = _inline_md(_esc(heading_text))
            if level == 1:
                # Extract chapter number for styling
                ch_match = re.match(r"Chapter\s+(\d+):", heading_text)
                if ch_match:
                    flowables.append(
                        Paragraph(
                            f"Chapter {ch_match.group(1)}", STYLES["chapter_num"]
                        )
                    )
                    heading_text = re.sub(r"Chapter\s+\d+:\s*", "", heading_text)
                flowables.append(Paragraph(heading_text, STYLES["h1"]))
                flowables.append(
                    HRFlowable(
                        width="100%", thickness=2, color=PRIMARY, spaceAfter=10
                    )
                )
            elif level == 2:
                flowables.append(Paragraph(heading_text, STYLES["h2"]))
            elif level == 3:
                flowables.append(Paragraph(heading_text, STYLES["h3"]))
            else:
                flowables.append(Paragraph(heading_text, STYLES["h4"]))
            i += 1
            continue

        # Blockquote
        if stripped.startswith(">"):
            quote_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(
                    lines[i].strip().lstrip(">").strip()
                )
                i += 1
            quote_text = " ".join(quote_lines)
            quote_text = _inline_md(_esc(quote_text))
            flowables.append(Paragraph(quote_text, STYLES["blockquote"]))
            flowables.append(Spacer(1, 6))
            continue

        # Unordered list
        li_match = re.match(r"^(\s*)[-*+]\s+(.*)", stripped)
        if li_match:
            # Gather all contiguous list items
            list_items: list[str] = []
            while i < len(lines):
                li_m = re.match(r"^(\s*)[-*+]\s+(.*)", lines[i])
                if li_m:
                    indent = len(li_m.group(1))
                    text = li_m.group(2).strip()
                    bullet = "•" if indent < 4 else "◦" if indent < 8 else "▪"
                    prefix = "&nbsp;&nbsp;" * (indent // 2)
                    text = _inline_md(_esc(text))
                    list_items.append(f"{prefix}{bullet}&nbsp;&nbsp;{text}")
                    i += 1
                elif lines[i].strip() == "":
                    # Empty line might end the list; peek ahead
                    if i + 1 < len(lines) and re.match(
                        r"^\s*[-*+]\s+", lines[i + 1]
                    ):
                        i += 1
                        continue
                    break
                else:
                    break
            for item in list_items:
                flowables.append(Paragraph(item, STYLES["li"]))
            flowables.append(Spacer(1, 3))
            continue

        # Ordered list
        ol_match = re.match(r"^(\s*)\d+[.)]\s+(.*)", stripped)
        if ol_match:
            counter = 0
            while i < len(lines):
                ol_m = re.match(r"^(\s*)\d+[.)]\s+(.*)", lines[i])
                if ol_m:
                    counter += 1
                    text = _inline_md(_esc(ol_m.group(2).strip()))
                    flowables.append(
                        Paragraph(
                            f"{counter}.&nbsp;&nbsp;{text}", STYLES["li"]
                        )
                    )
                    i += 1
                elif lines[i].strip() == "":
                    if i + 1 < len(lines) and re.match(
                        r"^\s*\d+[.)]\s+", lines[i + 1]
                    ):
                        i += 1
                        continue
                    break
                else:
                    break
            flowables.append(Spacer(1, 3))
            continue

        # Regular paragraph
        para_lines: list[str] = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if not nxt:
                break
            if nxt.startswith("#") or nxt.startswith("```") or nxt.startswith(">"):
                break
            if _is_table_line(nxt):
                break
            if re.match(r"^[-*+]\s+", nxt) or re.match(r"^\d+[.)]\s+", nxt):
                break
            if re.match(r"^(-{3,}|\*{3,}|_{3,})$", nxt):
                break
            para_lines.append(nxt)
            i += 1

        para_text = " ".join(para_lines)
        para_text = _inline_md(_esc(para_text))
        flowables.append(Paragraph(para_text, STYLES["body"]))

    return flowables


# ── Title page ──────────────────────────────────────────────────────────────
class TitlePage(Flowable):
    """Custom flowable that draws a full-page colored title page."""

    def __init__(self) -> None:
        super().__init__()
        self.width = PAGE_W
        self.height = PAGE_H

    def wrap(self, availWidth: float, availHeight: float) -> tuple[float, float]:
        return (0, 0)

    def draw(self) -> None:
        canvas = self.canv
        canvas.saveState()
        # Full-page gradient background (approximated with solid)
        canvas.setFillColor(PRIMARY_DARK)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        # Decorative accent bar
        canvas.setFillColor(PRIMARY)
        canvas.rect(0, PAGE_H * 0.55, PAGE_W, 4, fill=1, stroke=0)

        # Title
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica-Bold", 34)
        title_lines = ["AGI:", "The Complete Guide to", "Artificial General Intelligence"]
        y_pos = PAGE_H * 0.7
        for line in title_lines:
            tw = canvas.stringWidth(line, "Helvetica-Bold", 34)
            canvas.drawString((PAGE_W - tw) / 2, y_pos, line)
            y_pos -= 44

        # Accent line
        canvas.setFillColor(ACCENT)
        canvas.rect((PAGE_W - 60) / 2, y_pos + 20, 60, 3, fill=1, stroke=0)

        # Subtitle
        canvas.setFillColor(colors.HexColor("#c7d2fe"))
        canvas.setFont("Helvetica", 14)
        sub = "A COMPREHENSIVE REFERENCE"
        sw = canvas.stringWidth(sub, "Helvetica", 14)
        canvas.drawString((PAGE_W - sw) / 2, y_pos - 10, sub)

        # Author
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica", 16)
        aw = canvas.stringWidth(BOOK_AUTHOR, "Helvetica", 16)
        canvas.drawString((PAGE_W - aw) / 2, y_pos - 60, BOOK_AUTHOR)

        # Date
        canvas.setFillColor(colors.HexColor("#a5b4fc"))
        canvas.setFont("Helvetica", 10)
        dw = canvas.stringWidth(BOOK_DATE, "Helvetica", 10)
        canvas.drawString((PAGE_W - dw) / 2, y_pos - 80, BOOK_DATE)

        canvas.restoreState()


# ── Page templates ───────────────────────────────────────────────────────────
def _header_footer(canvas: Any, doc: Any) -> None:
    """Draw header and footer on content pages."""
    canvas.saveState()
    # Header
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(TEXT_MED)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 1.2 * cm, BOOK_TITLE)
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, PAGE_H - 1.4 * cm, PAGE_W - 2 * cm, PAGE_H - 1.4 * cm)

    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(TEXT_MED)
    canvas.drawCentredString(PAGE_W / 2, 1.2 * cm, f"— {doc.page} —")
    canvas.restoreState()


def _build_doc() -> BaseDocTemplate:
    """Create the PDF document with page templates."""
    doc = BaseDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title=BOOK_TITLE,
        author=BOOK_AUTHOR,
        subject="Artificial General Intelligence — A Comprehensive Guide",
        creator="AGI Book Generator",
    )

    content_frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="content",
    )
    title_frame = Frame(0, 0, PAGE_W, PAGE_H, id="title")

    doc.addPageTemplates(
        [
            PageTemplate(
                id="title",
                frames=[title_frame],
                onPage=lambda c, d: None,
            ),
            PageTemplate(
                id="content",
                frames=[content_frame],
                onPage=_header_footer,
            ),
        ]
    )
    return doc


# ── Collect chapter metadata ────────────────────────────────────────────────
def _chapter_metadata(filepath: str) -> tuple[int, str]:
    """Extract chapter number and title from the first heading."""
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            if line.startswith("# "):
                heading = line.lstrip("# ").strip()
                if ":" in heading:
                    parts = heading.split(":", 1)
                    num_str = parts[0].replace("Chapter", "").strip()
                    try:
                        num = int(num_str)
                    except ValueError:
                        num = 0
                    title = parts[1].strip()
                else:
                    num = 0
                    title = heading
                return num, title
    return 0, Path(filepath).stem


# ── Build full document ─────────────────────────────────────────────────────
def _build_pdf(chapter_files: list[str]) -> None:
    """Parse all chapters and produce the final PDF."""
    _init_styles()

    # Filter out files that aren't proper chapters (no "Chapter N:" heading)
    valid_files = [fp for fp in chapter_files if _chapter_metadata(fp)[0] > 0]

    # Collect metadata
    chapters: list[tuple[int, str]] = []
    for fp in valid_files:
        meta = _chapter_metadata(fp)
        chapters.append(meta)

    doc = _build_doc()
    story: list[Any] = []

    # ── Title page ────────────────────────────────────────────────────────
    story.append(TitlePage())
    story.append(NextPageTemplate("content"))
    story.append(PageBreak())

    # ── Table of contents ─────────────────────────────────────────────────
    story.append(Paragraph("Table of Contents", STYLES["toc_title"]))
    story.append(Spacer(1, 6))

    parts = [
        ("Part I — Foundations", [1, 2, 3]),
        ("Part II — Market, Development & Career", [4, 5, 6, 7, 8, 9]),
    ]
    for part_label, chapter_nums in parts:
        story.append(Paragraph(part_label, STYLES["toc_part"]))
        for ch_num, ch_title in chapters:
            if ch_num in chapter_nums:
                entry = (
                    f'<font color="#6366f1"><b>Chapter {ch_num}</b></font>'
                    f'&nbsp;&nbsp;&nbsp;{ch_title}'
                )
                story.append(Paragraph(entry, STYLES["toc_chapter"]))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ── Chapters ──────────────────────────────────────────────────────────
    for idx, filepath in enumerate(valid_files):
        with open(filepath, encoding="utf-8") as f:
            md_text = f.read()

        chapter_flowables = _md_to_flowables(md_text)
        story.extend(chapter_flowables)

        # Page break between chapters (except after the last)
        if idx < len(valid_files) - 1:
            story.append(PageBreak())

    # ── Build ─────────────────────────────────────────────────────────────
    doc.build(story)


# ── Main ────────────────────────────────────────────────────────────────────
def main() -> None:
    if not CHAPTER_FILES:
        print(f"Error: No chapter files found in {BOOK_DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(CHAPTER_FILES)} chapters:")
    for fp in CHAPTER_FILES:
        meta = _chapter_metadata(fp)
        print(f"  Chapter {meta[0]}: {meta[1]}")

    print(f"\nGenerating PDF → {OUTPUT_PDF}")
    _build_pdf(CHAPTER_FILES)

    file_size = OUTPUT_PDF.stat().st_size
    size_mb = file_size / (1024 * 1024)
    print(f"  ✓ PDF generated successfully: {OUTPUT_PDF} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()

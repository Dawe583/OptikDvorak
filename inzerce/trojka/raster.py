"""Ořízne PDF na přesný čistý formát (Chromium zaokrouhluje stránku na celé body)
a vyrenderuje z něj PNG na přesně 300 DPI."""
import pathlib
import re
import pymupdf

DPI = 300
MM = 72 / 25.4  # mm → PDF body

out = pathlib.Path(__file__).parent / "export"
for pdf in sorted(out.glob("*.pdf")):
    w_mm, h_mm = (float(v) for v in re.search(r"(\d+)x(\d+)\.pdf$", pdf.name).groups())
    doc = pymupdf.open(pdf)
    page = doc[0]
    page.set_cropbox(pymupdf.Rect(0, 0, w_mm * MM, h_mm * MM))
    doc.save(pdf, incremental=True, encryption=pymupdf.PDF_ENCRYPT_KEEP)

    doc = pymupdf.open(pdf)
    pix = doc[0].get_pixmap(dpi=DPI)
    pix.save(pdf.with_suffix(".png"))
    print(f"{pdf.stem}: PDF {w_mm:.0f}×{h_mm:.0f} mm · PNG {pix.width}×{pix.height} px @ {DPI} DPI")

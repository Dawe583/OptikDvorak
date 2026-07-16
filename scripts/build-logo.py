#!/usr/bin/env python3
"""Generátor logo systému Optik Dvořák.
Wordmark (Bricolage Grotesque 800) i tagline (JetBrains Mono) se převádějí do
křivek — výsledné SVG jsou nezávislé na fontu a ostré v jakékoli velikosti.
Spuštění: python3 scripts/build-logo.py
"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "img", "brand")
os.makedirs(OUT, exist_ok=True)

BRICOLAGE = os.path.join(ROOT, "promo-video", "public", "fonts", "bricolage-800.ttf")
MONO = os.path.join(ROOT, "promo-video", "public", "fonts", "jbmono-400.ttf")

# --- brandová paleta (z src/css/tokens.css) ---
INK = "#141414"
INK900 = "#0C0C0C"
CREAM = "#F4F1EA"
PAPER = "#F7F5EF"
YELLOW = "#FFE45C"
GOLD = "#F5C518"      # --yellow-deep
AMBER = "#6E5200"     # čitelný text na žluté


def outline(ttf_path, text, tracking=0):
    """Vrátí (inner_svg, (minx,miny,maxx,maxy), advance) v jednotkách fontu (y nahoru)."""
    font = TTFont(ttf_path)
    upm = font["head"].unitsPerEm
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    x = 0.0
    segs = []
    minx = miny = 1e9
    maxx = maxy = -1e9
    for ch in text:
        g = cmap.get(ord(ch))
        if not g:
            x += upm * 0.32
            continue
        pen = SVGPathPen(gs)
        gs[g].draw(pen)
        d = pen.getCommands()
        if d.strip():
            segs.append(f'<path transform="translate({x:.1f},0)" d="{d}"/>')
        bp = BoundsPen(gs)
        gs[g].draw(TransformPen(bp, (1, 0, 0, 1, x, 0)))
        if bp.bounds:
            a, b, c, e = bp.bounds
            minx = min(minx, a); miny = min(miny, b)
            maxx = max(maxx, c); maxy = max(maxy, e)
        x += hmtx[g][0] + tracking
    return "\n".join(segs), (minx, miny, maxx, maxy), x, upm


# Předpočítej obrysy
WM, WMB, _, WM_UPM = outline(BRICOLAGE, "Optik Dvořák")
TAG, TAGB, TAG_ADV, TAG_UPM = outline(MONO, "OČNÍ OPTIKA · PLZEŇ · OD 1991", tracking=90)

WM_CAP = 660.0            # cap height Bricolage
WM_W = WMB[2] - WMB[0]
WM_ASC = WMB[3]           # baseline -> nejvyšší bod (s diakritikou)
WM_DESC = WMB[1]          # baseline -> nejnižší (podtah p)
TAG_W = TAGB[2] - TAGB[0]
TAG_CAP = 720.0           # cap height JetBrains Mono


def wordmark_g(x, y_baseline, cap_px, color):
    """Wordmark umístěný tak, že levý okraj inku je na x a baseline na y_baseline."""
    s = cap_px / WM_CAP
    tx = x - WMB[0] * s
    ty = y_baseline
    return (f'<g transform="translate({tx:.2f},{ty:.2f}) scale({s:.5f},{-s:.5f})" '
            f'fill="{color}">{WM}</g>')


def tagline_g(x, y_baseline, cap_px, color):
    s = cap_px / TAG_CAP
    tx = x - TAGB[0] * s
    return (f'<g transform="translate({tx:.2f},{y_baseline:.2f}) scale({s:.5f},{-s:.5f})" '
            f'fill="{color}">{TAG}</g>')


def mark(cx, cy, R, ink, gold, sw=None, glint=True, rivets=True):
    """Refinovaný pár kulatých brýlí. Vrací (svg, x_left, x_right)."""
    sw = sw or R * 0.216
    gap = R * 0.30
    lx = cx - R - gap
    rx = cx + R + gap
    inner_l = lx + R
    inner_r = rx - R
    bridge_dip = R * 0.26
    by = cy - R * 0.06
    # brow-bridge (zlatý oblouk)
    bridge = (f'<path d="M{inner_l+sw*0.4:.1f},{by:.1f} '
              f'C{inner_l+ (inner_r-inner_l)*0.30:.1f},{by-bridge_dip:.1f} '
              f'{inner_r-(inner_r-inner_l)*0.30:.1f},{by-bridge_dip:.1f} '
              f'{inner_r-sw*0.4:.1f},{by:.1f}" '
              f'fill="none" stroke="{gold}" stroke-width="{sw:.2f}" stroke-linecap="round"/>')
    # stranice
    arm_out = R * 0.42
    arm_up = R * 0.16
    arms = (f'<path d="M{lx-R+sw*0.3:.1f},{cy-arm_up*0.4:.1f} l{-arm_out:.1f},{-arm_up:.1f}" '
            f'fill="none" stroke="{ink}" stroke-width="{sw:.2f}" stroke-linecap="round"/>'
            f'<path d="M{rx+R-sw*0.3:.1f},{cy-arm_up*0.4:.1f} l{arm_out:.1f},{-arm_up:.1f}" '
            f'fill="none" stroke="{ink}" stroke-width="{sw:.2f}" stroke-linecap="round"/>')
    lenses = (f'<circle cx="{lx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="none" '
              f'stroke="{ink}" stroke-width="{sw:.2f}"/>'
              f'<circle cx="{rx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="none" '
              f'stroke="{ink}" stroke-width="{sw:.2f}"/>')
    extra = ""
    if rivets:
        rr = sw * 0.46
        extra += (f'<circle cx="{lx-R+sw*0.2:.1f}" cy="{cy-arm_up*0.4:.1f}" r="{rr:.2f}" fill="{gold}"/>'
                  f'<circle cx="{rx+R-sw*0.2:.1f}" cy="{cy-arm_up*0.4:.1f}" r="{rr:.2f}" fill="{gold}"/>')
    if glint:
        gr = R * 0.62
        extra += (f'<path d="M{lx-gr*0.7:.1f},{cy-gr*0.35:.1f} '
                  f'Q{lx-gr*0.5:.1f},{cy-gr:.1f} {lx+gr*0.2:.1f},{cy-gr*0.92:.1f}" '
                  f'fill="none" stroke="{gold}" stroke-width="{sw*0.5:.2f}" '
                  f'stroke-linecap="round" opacity="0.9"/>')
    svg = arms + lenses + bridge + extra
    # skutečné hranice včetně straniček a nýtů
    x_min = (lx - R + sw * 0.3) - arm_out - sw / 2
    x_max = (rx + R - sw * 0.3) + arm_out + sw / 2
    y_min = cy - R - sw / 2
    y_max = cy + R + sw / 2
    return svg, x_min, x_max, y_min, y_max


def write(name, w, h, body, bg=None):
    bgrect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" '
           f'width="{w:.0f}" height="{h:.0f}" fill="none" role="img" '
           f'aria-label="Optik Dvořák — oční optika Plzeň">'
           f'<title>Optik Dvořák</title>{bgrect}{body}</svg>')
    path = os.path.join(OUT, name)
    open(path, "w").write(svg)
    print(f"  {name}  ({w:.0f}×{h:.0f})")


# ============================================================
# 1) MARK — samotná značka
# ============================================================
def mark_file(filename, ink, gold, glint=True, rivets=True, bg=None, padf=0.16):
    R = 30.0
    m_svg, x0, x1, y0, y1 = mark(100.0, 50.0, R, ink, gold, glint=glint, rivets=rivets)
    w = x1 - x0
    h = y1 - y0
    pad = h * padf
    W = w + 2 * pad
    H = h + 2 * pad
    body = f'<g transform="translate({pad - x0:.2f},{pad - y0:.2f})">{m_svg}</g>'
    write(filename, W, H, body, bg=bg)

mark_file("logo-mark.svg", INK, GOLD)
mark_file("logo-mark-mono.svg", INK, INK, glint=False, rivets=False)
mark_file("logo-mark-dark.svg", CREAM, GOLD, bg=INK900)

# ============================================================
# 2) PRIMARY — horizontální lockup (mark | wordmark + tagline)
# ============================================================
def horizontal(ink, gold, cream_wm, tag_color, filename, bg=None):
    cy = 50.0
    R = 33.0
    mm, x0, x1, y0, y1 = mark(0.0, cy, R, ink, gold)
    markW = x1 - x0
    PADX = 40.0
    GAP = 40.0
    mx = PADX - x0           # posun marku k levému okraji s paddingem
    wm_x = PADX + markW + GAP
    cap = 58.0
    s = cap / WM_CAP
    # blok wordmark+tagline opticky vycentrovat na střed marku (cy)
    tcap = 14.5
    ts = tcap / TAG_CAP
    gap_wt = 24.0
    block_top = -cap                       # cap top vůči baseline wordmarku
    block_bot = gap_wt + tcap              # tagline pod baseline wordmarku
    block_h = block_bot - block_top
    wm_baseline = cy - (block_top + block_bot) / 2
    tag_baseline = wm_baseline + gap_wt + tcap
    wmw = WM_W * s
    tagw = TAG_W * ts
    right = wm_x + max(wmw, tagw) + PADX
    H = 100.0
    body = (f'<g transform="translate({mx:.2f},0)">{mm}</g>'
            + wordmark_g(wm_x, wm_baseline, cap, cream_wm)
            + tagline_g(wm_x + 1, tag_baseline, tcap, tag_color))
    write(filename, right, H, body, bg=bg)

horizontal(INK, GOLD, INK, AMBER, "logo-primary.svg")
horizontal(CREAM, GOLD, CREAM, GOLD, "logo-primary-dark.svg", bg=INK900)

# ============================================================
# 3) STACKED — vertikální lockup (mark nad wordmarkem)
# ============================================================
def stacked(ink, gold, wm_color, tag_color, filename, bg=None):
    R = 40.0
    cap = 66.0
    s = cap / WM_CAP
    wmw = WM_W * s
    tcap = 15.0
    ts = tcap / TAG_CAP
    tagw = TAG_W * ts
    SIDE = 46.0
    # plátno se přizpůsobí nejširšímu prvku (wordmark)
    W = max(wmw, tagw, (mark(0, 0, R, ink, gold)[2] - mark(0, 0, R, ink, gold)[1])) + 2 * SIDE
    cx = W / 2
    mtop = 34.0
    mm, x0, x1, y0, y1 = mark(cx, mtop + R, R, ink, gold)
    wm_baseline = mtop + 2 * R + 60.0
    wm_x = cx - wmw / 2
    tag_baseline = wm_baseline + 32.0
    tag_x = cx - tagw / 2
    H = tag_baseline + 30.0
    body = (mm
            + wordmark_g(wm_x, wm_baseline, cap, wm_color)
            + tagline_g(tag_x, tag_baseline, tcap, tag_color))
    write(filename, W, H, body, bg=bg)

stacked(INK, GOLD, INK, AMBER, "logo-stacked.svg")
stacked(CREAM, GOLD, CREAM, GOLD, "logo-stacked-dark.svg", bg=INK900)

# ============================================================
# 4) BADGE — mark ve zlatém zaobleném čtverci (app icon / avatar)
# ============================================================
def badge(filename, bg_fill, ink, gold, ring=False):
    S = 100.0
    rx = 24.0
    R = 24.0
    # vykresli mark u počátku, změř skutečné hranice a vycentruj do čtverce
    mm, x0, x1, y0, y1 = mark(0.0, 0.0, R, ink, gold, glint=True, rivets=True)
    mw = x1 - x0
    mh = y1 - y0
    target = S * 0.64                      # cílová šířka marku uvnitř badge
    sc = target / mw
    tx = S / 2 - (x0 + mw / 2) * sc
    ty = S / 2 - (y0 + mh / 2) * sc
    ringel = (f'<rect x="4" y="4" width="{S-8}" height="{S-8}" rx="{rx-3}" '
              f'fill="none" stroke="{ink}" stroke-width="1.4" opacity="0.16"/>') if ring else ''
    body = (f'<rect width="{S}" height="{S}" rx="{rx}" fill="{bg_fill}"/>{ringel}'
            f'<g transform="translate({tx:.2f},{ty:.2f}) scale({sc:.4f})">{mm}</g>')
    write(filename, S, S, body)

badge("logo-badge.svg", YELLOW, INK, INK, ring=True)      # žluté pozadí, ink brýle
badge("logo-badge-dark.svg", INK900, CREAM, GOLD)         # tmavé pozadí

print("Hotovo — public/img/brand/")

import base64, sys, math
SC = sys.argv[1]
fp = "/home/user/OptikDvorak/promo-video/public/fonts"
def b64(p): return base64.b64encode(open(p, "rb").read()).decode()
BRIC = b64(f"{fp}/bricolage-800.ttf")
MONO = b64(f"{fp}/jbmono-400.ttf")

# --- brand paleta ---
INK="#141414"; INK900="#0C0C0C"; CREAM="#F4F1EA"; PAPER="#F7F5EF"; YELLOW="#FFE45C"; GOLD="#F5C518"; AMBER="#6E5200"

def mark(cx, cy, R, ink, gold, sw_ratio=0.2):
    sw = R*sw_ratio
    gap = R*0.30
    lx, rx = cx-R-gap, cx+R+gap
    il, ir = lx+R, rx-R
    bridge=(f'<path d="M{il+sw*0.4:.1f},{cy-R*0.06:.1f} C{il+(ir-il)*0.3:.1f},{cy-R*0.32:.1f} '
            f'{ir-(ir-il)*0.3:.1f},{cy-R*0.32:.1f} {ir-sw*0.4:.1f},{cy-R*0.06:.1f}" '
            f'fill="none" stroke="{gold}" stroke-width="{sw:.1f}" stroke-linecap="round"/>')
    ao=R*0.42; au=R*0.16
    arms=(f'<path d="M{lx-R+sw*0.3:.1f},{cy-au*0.4:.1f} l{-ao:.1f},{-au:.1f}" fill="none" stroke="{ink}" stroke-width="{sw:.1f}" stroke-linecap="round"/>'
          f'<path d="M{rx+R-sw*0.3:.1f},{cy-au*0.4:.1f} l{ao:.1f},{-au:.1f}" fill="none" stroke="{ink}" stroke-width="{sw:.1f}" stroke-linecap="round"/>')
    lenses=(f'<circle cx="{lx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="none" stroke="{ink}" stroke-width="{sw:.1f}"/>'
            f'<circle cx="{rx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="none" stroke="{ink}" stroke-width="{sw:.1f}"/>')
    rr=sw*0.46
    rivets=(f'<circle cx="{lx-R+sw*0.2:.1f}" cy="{cy-au*0.4:.1f}" r="{rr:.1f}" fill="{gold}"/>'
            f'<circle cx="{rx+R-sw*0.2:.1f}" cy="{cy-au*0.4:.1f}" r="{rr:.1f}" fill="{gold}"/>')
    gr=R*0.62
    glint=(f'<path d="M{lx-gr*0.7:.1f},{cy-gr*0.35:.1f} Q{lx-gr*0.5:.1f},{cy-gr:.1f} {lx+gr*0.2:.1f},{cy-gr*0.92:.1f}" '
           f'fill="none" stroke="{gold}" stroke-width="{sw*0.5:.1f}" stroke-linecap="round" opacity="0.9"/>')
    return arms+lenses+bridge+rivets+glint

def emblem(name, bg, ink, gold, ring, wm_col, tag_col):
    S=1000.0; c=S/2
    rOuter=472; rInner=454; rTop=360; rBot=366
    # kruhové dráhy pro text (sweep 0 = přes vršek; sweep 1 = přes spodek)
    topPath=f'M {c-rTop},{c} A {rTop},{rTop} 0 0 1 {c+rTop},{c}'   # horní oblouk (čte se L→R nahoře)
    botPath=f'M {c-rBot},{c} A {rBot},{rBot} 0 0 0 {c+rBot},{c}'   # spodní oblouk (čte se L→R dole)
    # ozdobné kosočtverce po stranách (3 a 9 hodin)
    def diamond(x,y,r):
        return f'<path d="M{x},{y-r} L{x+r},{y} L{x},{y+r} L{x-r},{y} Z" fill="{gold}"/>'
    star_l=diamond(c-rTop+2, c, 9)
    star_r=diamond(c+rTop-2, c, 9)
    m=mark(c, c+2, 128, ink, gold)
    est=(f'<text x="{c}" y="{c+220}" text-anchor="middle" font-family="M" '
         f'font-size="30" letter-spacing="6" fill="{tag_col}">EST. 1991</text>')
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S:.0f} {S:.0f}" width="{S:.0f}" height="{S:.0f}">
<defs>
<style>
@font-face{{font-family:'B';src:url(data:font/ttf;base64,{BRIC}) format('truetype');font-weight:800}}
@font-face{{font-family:'M';src:url(data:font/ttf;base64,{MONO}) format('truetype');font-weight:400}}
text{{dominant-baseline:middle}}
</style>
</defs>
<rect width="{S:.0f}" height="{S:.0f}" fill="{bg}"/>
<g transform="translate({c},{c}) scale(0.86) translate({-c},{-c})">
<circle cx="{c}" cy="{c}" r="{rOuter}" fill="none" stroke="{ring}" stroke-width="7"/>
<circle cx="{c}" cy="{c}" r="{rInner}" fill="none" stroke="{gold}" stroke-width="2.5"/>
<path id="tp" d="{topPath}" fill="none"/>
<path id="bp" d="{botPath}" fill="none"/>
<text font-family="B" font-size="99" letter-spacing="2" fill="{wm_col}">
  <textPath href="#tp" startOffset="50%" text-anchor="middle">OPTIK DVOŘÁK</textPath></text>
<text font-family="M" font-size="35" letter-spacing="11" fill="{tag_col}">
  <textPath href="#bp" startOffset="50%" text-anchor="middle">OČNÍ OPTIKA · PLZEŇ</textPath></text>
{star_l}{star_r}
{m}
{est}
</g>
</svg>'''
    open(f"{SC}/{name}","w").write(svg)
    print("wrote",name)

emblem("emblem-light.svg", PAPER, INK, GOLD, INK, INK, AMBER)
emblem("emblem-cream.svg", CREAM, INK, GOLD, INK, INK, AMBER)
emblem("emblem-dark.svg", INK900, CREAM, GOLD, GOLD, CREAM, GOLD)

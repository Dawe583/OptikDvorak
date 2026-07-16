import sys
SC = sys.argv[1]

def scene(name, mode):
    # mode: "dark" (zlato na uhlově černé) nebo "cream" (zlato na teplém krému)
    if mode == "dark":
        bg = '''
        <radialGradient id="bg" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stop-color="#2A2A28"/>
          <stop offset="42%" stop-color="#161615"/>
          <stop offset="100%" stop-color="#070706"/>
        </radialGradient>'''
        glow = 'rgba(255,214,90,0.16)'
        lens_stops = ('rgba(226,236,255,0.22)', 'rgba(150,160,180,0.06)', 'rgba(10,12,16,0.5)')
        rim = '#0A0A08'
    else:
        bg = '''
        <radialGradient id="bg" cx="50%" cy="36%" r="78%">
          <stop offset="0%" stop-color="#FBF7EC"/>
          <stop offset="55%" stop-color="#F2ECDD"/>
          <stop offset="100%" stop-color="#E4DAC4"/>
        </radialGradient>'''
        glow = 'rgba(255,206,60,0.22)'
        lens_stops = ('rgba(255,255,255,0.55)', 'rgba(245,222,150,0.14)', 'rgba(120,95,20,0.10)')
        rim = 'rgba(120,90,15,0.35)'

    S = 1080.0
    cy = 546.0
    R = 152.0
    lx, rx = 366.0, 714.0   # širší rozestup → viditelný most
    sw = 30.0            # tloušťka obruby
    inner_l, inner_r = lx + R, rx - R

    defs = f'''
    <defs>
      {bg}
      <linearGradient id="gold" x1="0%" y1="0%" x2="35%" y2="100%">
        <stop offset="0%" stop-color="#FFF3C6"/>
        <stop offset="26%" stop-color="#FBDB72"/>
        <stop offset="52%" stop-color="#F5C518"/>
        <stop offset="78%" stop-color="#C9960C"/>
        <stop offset="100%" stop-color="#8A6608"/>
      </linearGradient>
      <linearGradient id="goldHi" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFBEB" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#FFF3C6" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#FFF3C6" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="lensL" cx="38%" cy="32%" r="80%">
        <stop offset="0%" stop-color="{lens_stops[0]}"/>
        <stop offset="55%" stop-color="{lens_stops[1]}"/>
        <stop offset="100%" stop-color="{lens_stops[2]}"/>
      </radialGradient>
      <radialGradient id="lensR" cx="62%" cy="32%" r="80%">
        <stop offset="0%" stop-color="{lens_stops[0]}"/>
        <stop offset="55%" stop-color="{lens_stops[1]}"/>
        <stop offset="100%" stop-color="{lens_stops[2]}"/>
      </radialGradient>
      <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000" flood-opacity="0.42"/>
      </filter>
      <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="blur6"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>'''

    # kontaktní stín pod brýlemi (3D uzemnění)
    contact = (f'<ellipse cx="{S/2:.0f}" cy="{cy+R+66:.0f}" rx="300" ry="42" '
               f'fill="#000" opacity="0.28" filter="url(#blur18)"/>')

    # jemná záře za značkou
    halo = (f'<circle cx="{S/2:.0f}" cy="{cy:.0f}" r="300" fill="{glow}" filter="url(#blur18)"/>')

    def lens(cx, grad):
        # rim shadow (spodní tmavý okraj) + hlavní zlatý prstenec + skleněná výplň + horní highlight
        return (
            f'<circle cx="{cx:.0f}" cy="{cy+3:.0f}" r="{R:.0f}" fill="none" '
            f'stroke="{rim}" stroke-width="{sw:.0f}"/>'
            f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{R-2:.0f}" fill="url(#{grad})"/>'
            f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{R:.0f}" fill="none" '
            f'stroke="url(#gold)" stroke-width="{sw:.0f}"/>'
            # horní světelný bevel na obrubě
            f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{R:.0f}" fill="none" '
            f'stroke="url(#goldHi)" stroke-width="{sw*0.4:.0f}" '
            f'stroke-dasharray="{2*3.14159*R*0.42:.0f} {2*3.14159*R:.0f}" '
            f'stroke-dashoffset="{-2*3.14159*R*0.17:.0f}" stroke-linecap="round" opacity="0.9"/>'
        )

    # skleněný odlesk (diagonální pruh) uvnitř levé čočky
    glint = (f'<path d="M{lx-R*0.55:.0f},{cy-R*0.15:.0f} '
             f'Q{lx-R*0.35:.0f},{cy-R*0.72:.0f} {lx+R*0.25:.0f},{cy-R*0.66:.0f}" '
             f'fill="none" stroke="#FFFBEB" stroke-width="10" stroke-linecap="round" '
             f'opacity="0.85" filter="url(#blur6)"/>')

    # most (zvednutý, zlatý, s vlastním stínem)
    bridge = (f'<path d="M{inner_l+sw*0.3:.0f},{cy-6:.0f} '
              f'C{inner_l+40:.0f},{cy-52:.0f} {inner_r-40:.0f},{cy-52:.0f} {inner_r-sw*0.3:.0f},{cy-6:.0f}" '
              f'fill="none" stroke="url(#gold)" stroke-width="{sw:.0f}" stroke-linecap="round"/>')

    # stranice
    arm_len = 78.0
    arms = (f'<path d="M{lx-R+sw*0.2:.0f},{cy-14:.0f} l{-arm_len:.0f},{-20:.0f}" '
            f'fill="none" stroke="url(#gold)" stroke-width="{sw*0.86:.0f}" stroke-linecap="round"/>'
            f'<path d="M{rx+R-sw*0.2:.0f},{cy-14:.0f} l{arm_len:.0f},{-20:.0f}" '
            f'fill="none" stroke="url(#gold)" stroke-width="{sw*0.86:.0f}" stroke-linecap="round"/>')

    # nýtky (kovové) u kloubů
    rivet = (f'<circle cx="{lx-R+sw*0.2:.0f}" cy="{cy-14:.0f}" r="8" fill="#FFF3C6"/>'
             f'<circle cx="{rx+R-sw*0.2:.0f}" cy="{cy-14:.0f}" r="8" fill="#FFF3C6"/>')

    glasses = (f'<g filter="url(#soft)">{arms}{bridge}{lens(lx,"lensL")}{lens(rx,"lensR")}'
               f'{glint}{rivet}</g>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S:.0f} {S:.0f}" '
           f'width="{S:.0f}" height="{S:.0f}">{defs}'
           f'<rect width="{S:.0f}" height="{S:.0f}" fill="url(#bg)"/>'
           f'{halo}{contact}{glasses}</svg>')
    open(f"{SC}/{name}", "w").write(svg)
    print("wrote", name)

scene("ig-premium-dark.svg", "dark")
scene("ig-premium-cream.svg", "cream")

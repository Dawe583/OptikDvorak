import pickle
ctx=pickle.load(open("/tmp/artifont/ctx.pkl","rb"))
logos=ctx["logos"]; fonts=ctx["fonts"]; SC=ctx["SC"]

face=f"""
@font-face{{font-family:'Bricolage';font-weight:800;font-display:block;src:url(data:font/ttf;base64,{fonts['bricolage']}) format('truetype')}}
@font-face{{font-family:'InterB';font-weight:500;font-display:block;src:url(data:font/ttf;base64,{fonts['inter']}) format('truetype')}}
@font-face{{font-family:'MonoB';font-weight:400;font-display:block;src:url(data:font/ttf;base64,{fonts['mono']}) format('truetype')}}
"""
def chip(hex,name,token):
    return f'''<div class="chip"><div class="sw" style="background:{hex}"></div>
    <div class="chmeta"><b>{name}</b><span class="mono">{hex}</span><span class="mono tok">{token}</span></div></div>'''
palette="".join([
    chip("#141414","Ink","--ink"),chip("#0C0C0C","Ink 900","--ink-900"),
    chip("#F5C518","Zlatá","--yellow-deep"),chip("#FFE45C","Žlutá","--yellow"),
    chip("#F4F1EA","Krémová","--cream"),chip("#6E5200","Amber ink","--amber-ink")])

CSS = """
:root{--paper:#F7F5EF;--cream:#F4F1EA;--cream2:#EEEAE0;--ink:#141414;--ink900:#0C0C0C;
 --yellow:#FFE45C;--gold:#F5C518;--amber:#6E5200;--line:rgba(20,20,20,.12);
 --bg:var(--paper);--fg:var(--ink);--muted:#7C7A71;--card:#fff;--edge:var(--line)}
@media (prefers-color-scheme:dark){:root{--bg:#0E0E0D;--fg:var(--cream);--muted:#9a978d;--card:#151513;--edge:rgba(244,241,234,.14)}}
:root[data-theme=dark]{--bg:#0E0E0D;--fg:var(--cream);--muted:#9a978d;--card:#151513;--edge:rgba(244,241,234,.14)}
:root[data-theme=light]{--bg:#F7F5EF;--fg:#141414;--muted:#7C7A71;--card:#fff;--edge:rgba(20,20,20,.12)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:'InterB',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.55}
.wrap{max-width:1080px;margin:0 auto;padding:clamp(28px,6vw,72px) clamp(20px,5vw,56px)}
.eyebrow{font-family:'MonoB',monospace;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
h1{font-family:'Bricolage';font-weight:800;letter-spacing:-.03em;line-height:.98;font-size:clamp(46px,9vw,104px);margin:.18em 0 .1em;text-wrap:balance}
h1 .d{color:var(--gold)}
.lede{max-width:60ch;color:var(--muted);font-size:clamp(15px,2vw,18px)}
.sec{margin-top:clamp(44px,7vw,84px)}
.sec-h{display:flex;align-items:baseline;gap:14px;margin-bottom:22px;border-top:1px solid var(--edge);padding-top:16px}
.sec-h .n{font-family:'MonoB',monospace;font-size:12px;color:var(--muted)}
.sec-h h2{font-family:'Bricolage';font-weight:800;letter-spacing:-.02em;font-size:clamp(20px,3vw,27px);margin:0}
.plate{border:1px solid var(--edge);border-radius:16px;overflow:hidden;background:var(--card)}
.stage{display:flex;align-items:center;justify-content:center;padding:clamp(30px,6vw,64px) 24px}
.stage.lite{background:var(--paper)}
.stage.cream{background:var(--cream2)}
.stage.dark{background:var(--ink900)}
.stage svg{display:block;max-width:100%;height:auto}
.cap{display:flex;justify-content:space-between;gap:12px;padding:12px 18px;border-top:1px solid var(--edge);font-family:'MonoB',monospace;font-size:11.5px;color:var(--muted);letter-spacing:.04em}
.cap b{color:var(--fg);font-weight:400}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:720px){.grid2,.grid3{grid-template-columns:1fr}}
.pal{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media(max-width:720px){.pal{grid-template-columns:1fr 1fr}}
.chip{border:1px solid var(--edge);border-radius:12px;overflow:hidden;background:var(--card)}
.sw{height:74px}
.chmeta{padding:10px 12px;display:flex;flex-direction:column;gap:2px}
.chmeta b{font-family:'Bricolage';font-weight:800;font-size:14px}
.mono{font-family:'MonoB',monospace;font-size:11.5px;color:var(--muted)}
.tok{color:var(--gold)}
.type-spec{border:1px solid var(--edge);border-radius:16px;background:var(--card);padding:clamp(22px,4vw,34px)}
.type-spec .big{font-family:'Bricolage';font-weight:800;letter-spacing:-.03em;font-size:clamp(40px,8vw,78px);line-height:1;margin:0}
.type-row{display:flex;flex-wrap:wrap;gap:10px 26px;margin-top:14px;align-items:baseline}
.type-row .lab{font-family:'MonoB',monospace;font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
.body-spec{font-family:'InterB';font-size:16px;max-width:62ch;color:var(--fg)}
.mono-spec{font-family:'MonoB',monospace;font-size:14px;color:var(--fg)}
.notes{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:720px){.notes{grid-template-columns:1fr}}
.note{border:1px solid var(--edge);border-radius:14px;padding:18px 20px;background:var(--card)}
.note h3{font-family:'MonoB',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 10px}
.note.do h3{color:#3C7A4E} .note.dont h3{color:#A6301F}
.note ul{margin:0;padding-left:18px} .note li{margin:6px 0;font-size:14.5px}
.badges{display:flex;gap:22px;align-items:center;flex-wrap:wrap;justify-content:center}
.badges .b1 svg{width:112px;height:112px;border-radius:24px}
.badges .b2 svg{width:64px;height:64px;border-radius:14px}
.badges .b3 svg{width:40px;height:40px;border-radius:9px}
.foot{margin-top:clamp(44px,7vw,80px);border-top:1px solid var(--edge);padding-top:22px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'MonoB',monospace;font-size:12px;color:var(--muted)}
"""

html=f'''<style>{face}{CSS}</style>
<div class="wrap">
  <div class="eyebrow">Identita značky · Brand guide</div>
  <h1>Optik <span class="d">Dvořák</span></h1>
  <p class="lede">Logo systém rodinné oční optiky v Plzni. Značka staví na kulatých brýlových
  obrubách se zlatým akcentem mostu a na wordmarku v řezu Bricolage Grotesque. Všechny
  varianty jsou vektorové (text převeden do křivek) a ostré v jakékoli velikosti.</p>

  <section class="sec">
    <div class="sec-h"><span class="n">01</span><h2>Primární logo</h2></div>
    <div class="plate"><div class="stage lite">{logos['primary']}</div>
      <div class="cap"><b>logo-primary.svg</b><span>horizontální lockup · světlý podklad</span></div></div>
    <div style="height:20px"></div>
    <div class="plate"><div class="stage dark">{logos['primary-dark']}</div>
      <div class="cap"><b>logo-primary-dark.svg</b><span>inverzní · tmavý podklad</span></div></div>
  </section>

  <section class="sec">
    <div class="sec-h"><span class="n">02</span><h2>Vertikální lockup &amp; značka</h2></div>
    <div class="grid2">
      <div class="plate"><div class="stage cream" style="padding:40px 24px">{logos['stacked']}</div>
        <div class="cap"><b>logo-stacked.svg</b><span>na střed</span></div></div>
      <div class="plate"><div class="stage dark" style="padding:40px 24px">{logos['stacked-dark']}</div>
        <div class="cap"><b>logo-stacked-dark.svg</b><span>na střed · inverzní</span></div></div>
    </div>
    <div style="height:20px"></div>
    <div class="grid3">
      <div class="plate"><div class="stage lite">{logos['mark']}</div>
        <div class="cap"><b>logo-mark.svg</b><span>značka</span></div></div>
      <div class="plate"><div class="stage cream">{logos['mark-mono']}</div>
        <div class="cap"><b>logo-mark-mono.svg</b><span>jednobarevná</span></div></div>
      <div class="plate"><div class="stage dark">{logos['mark-dark']}</div>
        <div class="cap"><b>logo-mark-dark.svg</b><span>inverzní</span></div></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h"><span class="n">03</span><h2>App ikona &amp; favicon</h2></div>
    <div class="plate">
      <div class="stage lite badges">
        <div class="b1">{logos['badge']}</div><div class="b2">{logos['badge']}</div>
        <div class="b3">{logos['badge']}</div><div class="b1">{logos['badge-dark']}</div>
      </div>
      <div class="cap"><b>logo-badge.svg / logo-badge-dark.svg</b><span>112 · 64 · 40 px — čitelná i v malém</span></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h"><span class="n">04</span><h2>Barevná paleta</h2></div>
    <div class="pal">{palette}</div>
  </section>

  <section class="sec">
    <div class="sec-h"><span class="n">05</span><h2>Typografie</h2></div>
    <div class="type-spec">
      <p class="big">Aa Bb Čč · Optik Dvořák</p>
      <div class="type-row"><span class="lab">Display</span><span>Bricolage Grotesque · ExtraBold 800</span></div>
      <hr style="border:none;border-top:1px solid var(--edge);margin:22px 0">
      <p class="body-spec">Tělo textu sází Inter — čistá, neutrální groteska pro dlouhé
      pasáže, popisky a web. Příjemně čitelná od malých velikostí až po nadpisy.</p>
      <div class="type-row"><span class="lab">Text</span><span class="mono">Inter · Medium 500</span></div>
      <hr style="border:none;border-top:1px solid var(--edge);margin:22px 0">
      <p class="mono-spec">// OČNÍ OPTIKA · PLZEŇ · OD 1991</p>
      <div class="type-row"><span class="lab">Utility</span><span class="mono">JetBrains Mono · Regular 400 — štítky, taglines, data</span></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h"><span class="n">06</span><h2>Zásady použití</h2></div>
    <div class="notes">
      <div class="note do"><h3>✓ Ano</h3><ul>
        <li>Nechte kolem loga volný prostor min. ve výšce jedné čočky.</li>
        <li>Na fotky umístěte inverzní variantu na ztmavený podklad.</li>
        <li>Zlatou <b>#F5C518</b> držte jako jediný akcent — most, detaily.</li>
        <li>Značku (bez textu) používejte pro avatar, ikonu a razítko.</li>
      </ul></div>
      <div class="note dont"><h3>✕ Ne</h3><ul>
        <li>Neroztahujte logo nesymetricky ani nenaklánějte.</li>
        <li>Neměňte barvy obrub ani nepřebarvujte wordmark.</li>
        <li>Nepokládejte světlou variantu na světlé/nekontrastní pozadí.</li>
        <li>Nepřidávejte stíny, obrysy ani přechody.</li>
      </ul></div>
    </div>
  </section>

  <div class="foot">
    <span>Optik Dvořák · Americká 325/23, Plzeň</span>
    <span>optikdvorak.cz · od 1991</span>
  </div>
</div>'''

# převeď non-ASCII v textu na numerické entity (fonty/SVG jsou čistě ASCII)
html="".join(ch if ord(ch)<128 else f"&#{ord(ch)};" for ch in html)
out=f"{SC}/brand-optik-dvorak.html"
open(out,"w",encoding="utf-8").write(html)
print("wrote",out,len(html)//1024,"KB")

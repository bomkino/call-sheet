// Cover poster for the why carousel. Calls cover('why', {...}).
// A 35mm reel on a dark desk, its film running off the right edge. The first frame is the film
// itself, and fine. The frames after it are the reasons the carousel goes on to give:
// 99 websites, the rule on page 9, someone else's 02:00, and a fee nobody mentioned.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-why-reel { position: absolute; z-index: 2; }
    .cv-why-reel .body { position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 .4cqi .8cqi rgb(0 0 0 / .5), 0 3cqi 5cqi -1cqi rgb(0 0 0 / .55), 0 12cqi 20cqi -6cqi rgb(0 0 0 / .8); }
    .cv-why-reel svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .cv-why-strip { position: absolute; z-index: 1; transform-origin: 0 50%; background: #26221e; display: grid; grid-template-rows: 3.4cqi 1fr 3.4cqi; padding: 0 0 0 2cqi;
      box-shadow: 0 1px 1px rgb(0 0 0 / .5), 0 2cqi 3cqi -1cqi rgb(0 0 0 / .7); }
    .cv-why-holes { display: flex; gap: 2.1cqi; align-items: center; padding-left: .6cqi; overflow: hidden; }
    .cv-why-holes i { flex: none; width: 2.1cqi; height: 1.6cqi; border-radius: .4cqi; background: #e9e3d6; }
    .cv-why-frames { display: flex; gap: 2.4cqi; align-items: stretch; padding: .6cqi 0 .6cqi 22cqi; overflow: hidden; }
    .cv-why-frame { position: relative; flex: none; width: auto; aspect-ratio: 4 / 3; border-radius: .5cqi; background: #efe9dc; overflow: hidden; }
    .cv-why-frame svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .cv-why-frame .no { position: absolute; left: .8cqi; bottom: -2.9cqi; color: #a39c90; --pd-type-ink: #a39c90; }
    .cv-why-head { font-size: 13.2cqi; line-height: .88; }
    .cv-why-tape { display: inline-block; background: #ece2c6; color: var(--ink); --pd-type-ink: var(--ink); padding: 1.1cqi 2.4cqi 1cqi; margin-left: -2cqi; transform: rotate(-2.5deg);
      box-shadow: 0 1px 1px rgb(0 0 0 / .3), 0 .6cqi 1cqi -.5cqi rgb(0 0 0 / .5);
      clip-path: polygon(0 8%, 2% 0, 97% 4%, 100% 22%, 98.6% 50%, 100% 80%, 97.6% 100%, 2.4% 95%, 0 74%, 1.4% 46%); }
    .cv-why-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-why-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-why-arrow path { fill: none; stroke: var(--marker); stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
  </style>`)

  const P = (r, deg) => { const t = deg * Math.PI / 180; return `${(Math.sin(t) * r).toFixed(2)} ${(-Math.cos(t) * r).toFixed(2)}` }
  // A split reel: an aluminium flange with five windows onto the wound film behind it.
  const windows = Array.from({ length: 5 }, (_, k) => { const a0 = k * 72 + 14, a1 = a0 + 50
    return `M ${P(31, a0 + 7)} L ${P(86, a0)} A 86 86 0 0 1 ${P(86, a1)} L ${P(31, a1 - 7)} A 31 31 0 0 0 ${P(31, a0 + 7)} Z` }).join(' ')
  const reelSvg = `<svg viewBox="-100 -100 200 200" aria-hidden="true">
    <circle r="78" fill="#3a332c"/>${[70, 62, 54, 46, 38].map(r => `<circle r="${r}" fill="none" stroke="rgb(255 255 255 / .05)" stroke-width=".8"/>`).join('')}
    <path fill-rule="evenodd" d="M 0 -99 A 99 99 0 1 1 0 99 A 99 99 0 1 1 0 -99 Z ${windows}" fill="#cdc7bc"/>
    <circle r="97" fill="none" stroke="#a39c90" stroke-width="2.2"/><circle r="91" fill="none" stroke="rgb(21 19 15 / .14)" stroke-width="1"/>
    <path d="M -84 -40 A 93 93 0 0 1 -36 -86" fill="none" stroke="#fbf9f3" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <circle r="19" fill="#a39c90"/><circle r="14" fill="#d9d3c8"/><rect x="-4.5" y="-4.5" width="9" height="9" fill="#15130f"/>
    ${[0, 90, 180, 270].map(a => `<circle cx="${P(24, a + 45).split(' ')[0]}" cy="${P(24, a + 45).split(' ')[1]}" r="2" fill="#8f897f"/>`).join('')}
  </svg>`

  // The frames, drawn small. Each one is a slide still to come.
  const pict = {
    film: `<svg viewBox="0 0 100 70" preserveAspectRatio="none"><rect width="100" height="70" fill="#f3d9a3"/><circle cx="70" cy="30" r="9" fill="#e6b640"/><path d="M0 52 L22 34 L38 46 L56 28 L82 50 L100 40 V70 H0 Z" fill="#6b7f5e"/><path d="M0 60 L30 50 L60 58 L100 52 V70 H0 Z" fill="#4d5c44"/></svg>`,
    sites: `<svg viewBox="0 0 100 70" preserveAspectRatio="none">${Array.from({ length: 24 }, (_, k) => `<rect x="${8 + (k % 6) * 14.4}" y="${8 + Math.floor(k / 6) * 14}" width="11" height="10" rx="1" fill="#fbf9f3" stroke="rgb(21 19 15 / .25)" stroke-width=".6"/><rect x="${9.6 + (k % 6) * 14.4}" y="${9.6 + Math.floor(k / 6) * 14}" width="2.6" height="2.6" fill="${['#e3472d', '#4c7bd9', '#2f2f2f', '#e6b640', '#7fb069', '#b04fbf'][(k * 5) % 6]}"/>`).join('')}</svg>`,
    page9: `<svg viewBox="0 0 100 70" preserveAspectRatio="none"><rect x="22" y="6" width="56" height="64" fill="#fbf9f3" stroke="rgb(21 19 15 / .2)" stroke-width=".6"/>${[14, 20, 26, 32].map(y => `<rect x="28" y="${y}" width="${y === 26 ? 30 : 42}" height="2.4" rx="1" fill="rgb(21 19 15 / .22)"/>`).join('')}<rect x="26" y="38" width="48" height="6" rx="1" fill="#f4df77"/><rect x="28" y="40" width="40" height="2.2" rx="1" fill="rgb(21 19 15 / .55)"/>${[50, 56].map(y => `<rect x="28" y="${y}" width="40" height="2.4" rx="1" fill="rgb(21 19 15 / .22)"/>`).join('')}<text x="72" y="64" font-size="5" text-anchor="end" fill="#15130f" opacity=".6">9</text></svg>`,
    clock: `<svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet"><circle cx="50" cy="35" r="27" fill="#fbf9f3" stroke="#15130f" stroke-width="2.6"/>${Array.from({ length: 12 }, (_, k) => { const a = k * 30 * Math.PI / 180; return `<line x1="${50 + Math.sin(a) * 21}" y1="${35 - Math.cos(a) * 21}" x2="${50 + Math.sin(a) * 25}" y2="${35 - Math.cos(a) * 25}" stroke="#15130f" stroke-width="${k % 3 ? .8 : 1.8}"/>` }).join('')}<line x1="50" y1="35" x2="${50 + Math.sin(Math.PI / 3) * 13}" y2="${35 - Math.cos(Math.PI / 3) * 13}" stroke="#15130f" stroke-width="2.6" stroke-linecap="round"/><line x1="50" y1="35" x2="50" y2="14" stroke="#15130f" stroke-width="1.8" stroke-linecap="round"/><circle cx="50" cy="35" r="2" fill="#15130f"/></svg>`,
    fee: `<svg viewBox="0 0 100 70" preserveAspectRatio="none"><rect x="14" y="10" width="72" height="50" fill="#fbf9f3" stroke="rgb(21 19 15 / .2)" stroke-width=".6"/>${[20, 27, 34].map(y => `<rect x="22" y="${y}" width="${y === 34 ? 30 : 54}" height="2.4" rx="1" fill="rgb(21 19 15 / .22)"/>`).join('')}<g transform="translate(26 40) rotate(-8)"><rect width="50" height="15" rx="2" fill="none" stroke="#e3472d" stroke-width="2"/><rect x="5" y="5" width="40" height="2.2" fill="#e3472d"/><rect x="9" y="9.4" width="32" height="2.2" fill="#e3472d"/></g></svg>`,
  }
  const strip = (style, keys) => {
    const holes = `<div class="cv-why-holes">${'<i></i>'.repeat(40)}</div>`
    return `<div class="cv-why-strip" style="${style}">${holes}<div class="cv-why-frames">${keys.map(k => `<div class="cv-why-frame">${pict[k]}</div>`).join('')}</div>${holes}</div>`
  }

  const art = (c) => {
    const sqr = c === 'square'
    const reel = sqr ? { cx: 5, cy: 101, d: 62 } : { cx: 9, cy: 117, d: 84 }
    return `${strip(`left:${sqr ? 2 : 1}cqi;top:${sqr ? 57.5 : 67}cqi;width:${sqr ? 110 : 112}cqi;height:${sqr ? 18 : 22}cqi;transform:rotate(-7deg)`, ['film', 'sites', 'page9', 'clock', 'fee'])}
      <div class="cv-why-reel" style="left:${reel.cx - reel.d / 2}cqi;top:${reel.cy - reel.d / 2}cqi;width:${reel.d}cqi;height:${reel.d}cqi;transform:rotate(12deg)"><div class="body"></div>${reelSvg}</div>`
  }
  const arrow = `<svg class="cv-why-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`

  cover('why', { g: 'var(--ink)', dark: true, art,
    html: (c, i, n) => `${ctop('Call Sheet', i, n)}${S('display', `Why good films ${circ('miss', 'wide', { l: '-10%', t: '-8%', w: '120%', h: '122%' })} good funds`, 'class="mt-m cv-why-head" style="max-inline-size:6.4em"')}${S('subhead', 'It’s rarely the film.', 'class="mt-s soft"')}<div class="grow"></div><div class="foot"><span class="cv-why-tape">${sp('credit', 'Call Sheet, by pitch.dog')}</span><span class="cv-why-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>` })
}

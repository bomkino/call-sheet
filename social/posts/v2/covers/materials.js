// Cover poster for the materials carousel. Calls cover('materials', {...}).
// Three grants, three different piles of paper, and you juggling them: the pages fly round a red marker orbit.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-materials-doc { position: absolute; z-index: 1; }
    .cv-materials-air { box-shadow: 0 1px 1px rgb(21 19 15 / .08), 0 5cqi 6cqi -2cqi rgb(21 19 15 / .28), 0 12cqi 14cqi -6cqi rgb(21 19 15 / .22); }
    .cv-materials-page { background: var(--sheet); aspect-ratio: 8.5 / 11; padding: 4.2cqi 4cqi; display: grid; gap: 1.2cqi; align-content: start; position: relative; }
    .cv-materials-page i { display: block; height: 1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
    .cv-materials-page .pno { position: absolute; right: 4cqi; bottom: 3.2cqi; }
    .cv-materials-row { display: flex; justify-content: space-between; align-items: baseline; }
    .cv-materials-cover { background: #e9d5ae; aspect-ratio: 8.5 / 11; position: relative; display: grid; justify-items: center; align-content: center; gap: 2cqi; text-align: center; }
    .cv-materials-cover b { display: block; height: 2cqi; background: rgb(21 19 15 / .78); }
    .cv-materials-brad { position: absolute; left: 2.4cqi; width: 2.6cqi; height: 2.6cqi; border-radius: 50%; background: #c9a24a; box-shadow: inset -.4cqi -.5cqi 0 #9c7a2c, inset .3cqi .3cqi 0 #ecd28a, 0 .3cqi .4cqi rgb(21 19 15 / .35); }
    .cv-materials-hole { position: absolute; left: 2.6cqi; width: 2.2cqi; height: 2.2cqi; border-radius: 50%; background: rgb(21 19 15 / .28); box-shadow: inset 0 .3cqi .3cqi rgb(21 19 15 / .3); }
    .cv-materials-ink { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
    .cv-materials-ink > svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .cv-materials-head [data-pd-social="display"] { font-size: 11.6cqi; line-height: .88; }
    .cv-materials-cue { display: inline-flex; align-items: center; gap: 1.4cqi; }
    .cv-materials-cue svg { width: 9cqi; height: auto; overflow: visible; }
  </style>`)

  // ---- a marker stroke: a smooth line through the points, tapered at both ends
  const crs = (pts, n = 16) => { const out = []
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)]
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))) } }
    out.push(pts[pts.length - 1]); return out }
  const ink = (pts, w = 1.2, seed = 1) => { const s = crs(pts); const acc = [0]
    for (let i = 1; i < s.length; i++) acc.push(acc[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]))
    const T = acc[acc.length - 1], L = [], R = []
    s.forEach((p, i) => { const a = s[Math.max(i - 1, 0)], b = s[Math.min(i + 1, s.length - 1)]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, f = acc[i] / T
      const hw = w / 2 * Math.pow(Math.min(1, f / .06 + .25, (1 - f) / .12 + .2), .6) * (.88 + .12 * Math.sin(f * 11 + seed))
      L.push([p[0] + nx * hw, p[1] + ny * hw]); R.push([p[0] - nx * hw, p[1] - ny * hw]) })
    const f = (q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`
    return `<path d="M${L.map(f).join(' L')} L${R.reverse().map(f).join(' L')} Z"/>` }
  const head = (e, ang, w, len = 3.6, seed = 1) => [.55, -.5].map((da, k) => ink([[e[0] - Math.cos(ang + da) * len, e[1] - Math.sin(ang + da) * len], e], w * .9, seed + k)).join('')
  const arrow = (pts, w, len = 4, seed = 1) => { const n = pts.length, e = pts[n - 1], p = pts[n - 2]; return ink(pts, w, seed) + head(e, Math.atan2(e[1] - p[1], e[0] - p[0]), w, len, seed + 2) }

  // ---- the three piles, each a full page; only their tops show above the bottom edge
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const para = (...w) => `<div style="display:grid;gap:1.1cqi;margin-top:1.6cqi">${bars(...w)}</div>`
  const treatment = (w) => `<div class="cv-materials-page" style="width:${w}cqi">
    <div class="cv-materials-row">${sp('metadata', 'Treatment')}${sp('metadata', 'Page 1 of 4', 'class="soft"')}</div>
    <b style="display:block;height:2.6cqi;width:58%;background:rgb(21 19 15 / .82);margin:3cqi 0 .6cqi"></b><b style="display:block;height:1.2cqi;width:34%;background:rgb(21 19 15 / .3)"></b>
    ${para(100, 96, 98, 91, 64)}${para(97, 100, 93, 99, 78)}${para(100, 92, 96, 46)}${para(98, 95, 88)}</div>`
  const script = (w) => `<div class="cv-materials-cover" style="width:${w}cqi">
    <i class="cv-materials-brad" style="top:9%"></i><i class="cv-materials-hole" style="top:calc(50% - 1.1cqi)"></i><i class="cv-materials-brad" style="bottom:9%"></i>
    <div style="position:absolute;left:0;right:0;top:15%;display:grid;justify-items:center;gap:2.4cqi">${sp('metadata', 'Script', 'class="soft"')}<b style="width:56%;height:2.6cqi"></b>${sp('metadata', 'Written by', 'class="soft"')}<b style="width:34%;height:1.4cqi;background:rgb(21 19 15 / .45)"></b></div>
    <span style="position:absolute;right:4cqi;bottom:4cqi">${sp('metadata', 'Third draft', 'class="soft"')}</span></div>`
  const budget = (w) => `<div class="cv-materials-page" style="width:${w}cqi;gap:0">
    <div class="cv-materials-row">${sp('metadata', 'Budget')}${sp('metadata', 'In euros', 'class="soft"')}</div>
    <div class="sheet" style="box-shadow:none;margin-top:2.4cqi;grid-template-columns:2fr 1.2fr">${[['Line', 'EUR', 'h'], ['Development', '14,500'], ['Shoot, 18 days', '162,000'], ['Post', '38,250'], ['Music', '9,000'], ['Contingency', '21,475'], ['Total', '€245,225', 't']]
      .map(([a, b, cls]) => [a, b].map(x => `<span class="${cls || ''}" style="padding:1.4cqi 1.8cqi">${sp(cls === 'h' ? 'metadata' : 'label', x)}</span>`).join('')).join('')}</div></div>`
  // the marker counts them: 1, 2, 3, drawn by hand in the corner of each page
  const numeral = (n, x, y, s = 1, seed = 1) => { const P = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s])
    if (n === 1) return ink(P([[-1.2, -2.6], [.4, -4.4], [.6, 0], [.4, 4.4]]), 1 * s, seed)
    if (n === 2) return ink(P([[-2.6, -2.4], [-.6, -4.6], [2.2, -3.6], [1.6, -.6], [-1.6, 2.6], [-2.8, 4.4], [.4, 3.8], [3, 4.2]]), 1 * s, seed)
    return ink(P([[-2.6, -3.4], [0, -4.8], [2.6, -3], [.6, -.6], [-.8, -.2], [1.4, .2], [2.8, 2.4], [.8, 4.6], [-2.6, 3.6]]), 1 * s, seed) }

  const swipeArrow = `<svg viewBox="0 0 40 14" aria-hidden="true"><g fill="var(--marker)">${arrow([[1, 9], [12, 6.4], [24, 6.8], [36, 5.6]], 1.7, 6, 3)}</g></svg>`

  cover('materials', { g: 'var(--blue)', dark: false,
    art: (c) => {
      const sqr = c === 'square', Hh = sqr ? 100 : 125
      // the orbit: up from the bottom left, over the top, down and out of the right edge
      // a hand of three pages, fanned up from below the bottom edge: treatment, script, budget
      const sw = sqr ? 46 : 52
      // [page, rotation, centre x, top y]: drawn back to front
      const fan = sqr ? [['treatment', -11, 24, 66], ['budget', 12, 80, 67], ['script', 3, 52, 63]] : [['treatment', -11, 24, 72], ['budget', 12, 80, 74], ['script', 3, 52, 69]]
      const pages = fan.map(([k, r, cx, y]) => `<div class="cv-materials-doc" style="left:${cx - sw / 2}cqi;top:${y}cqi;transform:rotate(${r}deg)"><div class="paper" style="box-shadow:var(--lift)">${({ treatment, script, budget })[k](sw)}</div></div>`).join('')
      const nums = sqr ? [[1, 6.5, 74], [2, 34, 70], [3, 63, 72]] : [[1, 6.5, 80], [2, 34, 76], [3, 63, 79]]
      return `${pages}<div class="cv-materials-ink"><svg viewBox="0 0 100 ${Hh}" preserveAspectRatio="none" aria-hidden="true"><g fill="var(--marker)">${nums.map(([n, x, y], j) => numeral(n, x, y, 1.15, j * 3)).join('')}</g></svg></div>`
    },
    html: (c, i, n) => `${ctop('What to send', i, n)}
      <div class="mt-m" style="display:grid;gap:.4cqi">${S('subhead', 'One film grant wants a treatment.')}${S('subhead', 'Another wants a script.')}${S('subhead', 'Another wants a budget in euros.')}</div>
      <div class="cv-materials-head mt-m">${S('display', `And you’re trying to keep track of ${circ('all three.', 'long', { l: '-6%', t: '-14%', w: '112%', h: '130%' })}`, 'style="max-inline-size:14ch"')}</div>
      <div class="grow"></div>
      <div class="foot mt-m">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-materials-cue">${swipeArrow}${swipe}</span></div>`,
  })
}

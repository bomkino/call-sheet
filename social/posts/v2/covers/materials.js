// Cover poster for the materials carousel. Calls cover('materials', {...}).
// Three grants, three piles of paper, held like a hand of cards. The marker numbers them 1, 2, 3,
// in the margin of the copy and on the corner of each page, so you can see you're keeping count.
{
  // Until v2/materials.js adds the carousel, register its first slide so the cover can be previewed.
  if (!POSTS['materials-01']) P('materials-01', { name: 'materials 1/6', g: 'var(--goldenrod)', sizes: ['1080x1350', '1080x1080'],
    alt: 'One film grant wants a treatment. Another wants a script. Another wants a budget in euros. And you’re trying to keep track of all three.', render: () => ({ frame: '', art: '' }) })

  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-materials-doc { position: absolute; z-index: 1; }
    .cv-materials-page { background: var(--sheet); aspect-ratio: 8.5 / 11; padding: 4.4cqi 4.4cqi; display: grid; gap: 1.1cqi; align-content: start; position: relative; box-shadow: var(--lift); }
    .cv-materials-page i { display: block; height: 1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
    .cv-materials-row { display: flex; gap: 2cqi; align-items: baseline; }
    .cv-materials-cover { background: var(--blue); aspect-ratio: 8.5 / 11; position: relative; box-shadow: var(--lift); }
    .cv-materials-cover b { display: block; height: 2cqi; background: rgb(21 19 15 / .78); }
    .cv-materials-brad { position: absolute; left: 2.6cqi; width: 2.6cqi; height: 2.6cqi; border-radius: 50%; background: #c9a24a; box-shadow: inset -.4cqi -.5cqi 0 #9c7a2c, inset .3cqi .3cqi 0 #ecd28a, 0 .3cqi .4cqi rgb(21 19 15 / .35); }
    .cv-materials-hole { position: absolute; left: 2.8cqi; width: 2.2cqi; height: 2.2cqi; border-radius: 50%; background: #b98f2f; box-shadow: inset 0 .3cqi .3cqi rgb(21 19 15 / .3); }
    .cv-materials-tab { display: grid; grid-template-columns: 1fr auto; margin-top: 2.4cqi; border-top: 1.5px solid var(--rule-strong); }
    .cv-materials-tab > span { padding: 1.3cqi .4cqi; border-bottom: 1.5px solid var(--rule); font-variant-numeric: tabular-nums; }
    .cv-materials-tab > span:nth-child(2n) { text-align: right; }
    .cv-materials-tab > .h { border-bottom-color: var(--rule-strong); }
    .cv-materials-tab > .t { border-bottom: 0; border-top: 3px solid var(--ink); }
    .cv-materials-num { position: absolute; width: 7.5cqi; height: auto; overflow: visible; }
    .cv-materials-lines { display: grid; grid-template-columns: 5.4cqi 1fr; column-gap: 1.6cqi; row-gap: .6cqi; align-items: center; margin-left: -1cqi; }
    .cv-materials-lines svg { width: 4.6cqi; height: auto; overflow: visible; justify-self: center; }
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
  const arrow = (pts, w, len = 4, seed = 1) => { const n = pts.length, e = pts[n - 1], p = pts[n - 2], a = Math.atan2(e[1] - p[1], e[0] - p[0])
    return ink(pts, w, seed) + [.55, -.5].map((da, k) => ink([[e[0] - Math.cos(a + da) * len, e[1] - Math.sin(a + da) * len], e], w * .9, seed + k + 2)).join('') }

  // ---- marker numerals, drawn as strokes in a 12 × 13 box centred on 0,0
  const NUM = {
    1: [[[-1.6, -2.8], [.2, -4.8], [.5, -.4], [.3, 4.8]]],
    2: [[[-2.8, -2.6], [-.6, -4.9], [2.3, -3.8], [1.7, -.6], [-1.6, 2.6], [-3, 4.6], [.4, 4], [3.2, 4.4]]],
    3: [[[-2.8, -3.6], [0, -5], [2.7, -3.2], [.6, -.7], [-.9, -.3], [1.5, .2], [3, 2.5], [.8, 4.8], [-2.8, 3.8]]],
  }
  const numeral = (n, w = 1.15, seed = 1) => `<svg viewBox="-6 -6.5 12 13" aria-hidden="true"><g fill="var(--marker)">${NUM[n].map((p, k) => ink(p, w, seed + k)).join('')}</g></svg>`
  const cornerNum = (n, style) => numeral(n, 1.05, n * 3).replace('<svg ', `<svg class="cv-materials-num" style="${style}" `)

  // ---- the three piles, each a full page; content sits in the top half, so the foot lands on clean paper
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const para = (...w) => `<div style="display:grid;gap:1.1cqi;margin-top:1.4cqi">${bars(...w)}</div>`
  const treatment = (w) => `<div class="cv-materials-page" style="width:${w}cqi">
    <div class="cv-materials-row" style="padding-left:6.4cqi">${sp('metadata', 'Treatment')}${sp('metadata', 'Draft 2', 'class="soft"')}</div>
    <b style="display:block;height:2.6cqi;width:58%;background:rgb(21 19 15 / .82);margin:2.6cqi 0 .4cqi"></b><b style="display:block;height:1.2cqi;width:34%;background:rgb(21 19 15 / .3)"></b>
    ${para(100, 96, 98, 91, 64)}${para(97, 100, 93, 78)}${para(100, 92, 46)}
    ${cornerNum(1, 'left:1.4cqi;top:1.4cqi;transform:rotate(-6deg)')}</div>`
  const script = (w) => `<div class="cv-materials-cover" style="width:${w}cqi">
    <i class="cv-materials-brad" style="top:8%"></i><i class="cv-materials-hole" style="top:calc(50% - 1.1cqi)"></i><i class="cv-materials-brad" style="bottom:8%"></i>
    <div style="position:absolute;left:0;right:0;top:13%;display:grid;justify-items:center;gap:2.4cqi">${sp('metadata', 'Script', 'class="soft"')}<b style="width:56%;height:2.6cqi"></b>${sp('metadata', 'Written by', 'class="soft"')}<b style="width:34%;height:1.4cqi;background:rgb(21 19 15 / .45)"></b>${sp('metadata', 'Third draft', 'class="soft" style="margin-top:2cqi"')}</div>
    ${cornerNum(2, 'left:5.4cqi;top:1.6cqi;transform:rotate(4deg)')}</div>`
  const budget = (w) => `<div class="cv-materials-page" style="width:${w}cqi;gap:0">
    <div class="cv-materials-row" style="padding-left:6.4cqi">${sp('metadata', 'Budget')}${sp('metadata', 'In euros', 'class="soft"')}</div>
    <div class="cv-materials-tab">${[['Line', 'EUR', 'h'], ['Development', '€14,500'], ['Shoot', '€162,000'], ['Post', '€38,250'], ['Total', '€214,750', 't']]
      .map(([a, b, cls]) => `<span class="${cls || ''}">${sp(cls === 'h' ? 'metadata' : 'label', a)}</span><span class="${cls || ''}">${sp(cls === 'h' ? 'metadata' : 'label', b)}</span>`).join('')}</div>
    ${cornerNum(3, 'left:1.4cqi;top:1.4cqi;transform:rotate(-3deg)')}</div>`

  const swipeArrow = `<svg viewBox="0 0 40 14" aria-hidden="true"><g fill="var(--marker)">${arrow([[1, 9], [12, 6.4], [24, 6.8], [36, 5.6]], 1.7, 6, 3)}</g></svg>`

  cover('materials', { g: 'var(--goldenrod)', dark: false,
    art: (c) => {
      const sqr = c === 'square', sw = sqr ? 40 : 50
      // a hand of three pages, fanned from a point below the bottom edge; the right-hand page on top
      const T = sqr ? 69 : 66, px = 53, py = sqr ? 150 : 175
      const fan = [['treatment', -17], ['script', 0], ['budget', 16]]
      return fan.map(([k, r]) => `<div class="cv-materials-doc" style="left:${px - sw / 2}cqi;top:${T}cqi;width:${sw}cqi;transform-origin:50% ${py - T}cqi;transform:rotate(${r}deg)">${({ treatment, script, budget })[k](sw)}</div>`).join('')
    },
    html: (c, i, n) => `${ctop('What to send', i, n)}
      <div class="cv-materials-lines mt-m">${[[1, 'One film grant wants a treatment.'], [2, 'Another wants a script.'], [3, 'Another wants a budget in euros.']].map(([k, t]) => `${numeral(k, 1.15, k * 3)}${S('subhead', t)}`).join('')}</div>
      <div class="cv-materials-head mt-m">${S('display', `And you’re trying to keep track of ${circ('all three.', 'long', { l: '-6%', t: '-14%', w: '112%', h: '130%' })}`, 'style="max-inline-size:14ch"')}</div>
      <div class="grow"></div>
      <div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-materials-cue">${swipeArrow}${swipe}</span></div>`,
  })
}

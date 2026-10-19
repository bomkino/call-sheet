// Cover poster for the materials carousel. Calls cover('materials', {...}).
// Three grants, three piles of paper, stacked and slipping down the poster from the top edge: the
// treatment, the script (blue covers, brass brads) and the budget in euros. Each pile carries its own
// line of the copy and a marker number, and the punchline lands under the stack.
{
  // Until v2/materials.js adds the carousel, register its first slide so the cover can be previewed.
  if (!POSTS['materials-01']) P('materials-01', { name: 'materials 1/6', g: 'var(--goldenrod)', sizes: ['1080x1350', '1080x1080'],
    alt: 'One film grant wants a treatment. Another wants a script. Another wants a budget in euros. And you’re trying to keep track of all three.', render: () => ({ frame: '', art: '' }) })

  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-materials-sheet { position: absolute; z-index: 1; aspect-ratio: 8.5 / 11; background: var(--sheet); box-shadow: var(--lift); }
    .cv-materials-sheet.blue { background: var(--blue); }
    .cv-materials-sheet i.b { display: block; height: 1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .cv-materials-foot { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 6cqi 0 var(--pl, 6.4cqi); }
    .cv-materials-sheet.under { box-shadow: 0 1px 1px rgb(21 19 15 / .14), 0 .6cqi 1cqi -.4cqi rgb(21 19 15 / .3); background: #eeebe3; }
    .cv-materials-sheet.under.blue { background: #97b9dc; }
    .cv-materials-label { display: grid; grid-template-columns: 6.4cqi 1fr; column-gap: 1.6cqi; align-items: center; }
    .cv-materials-label > svg { width: 5.4cqi; height: auto; overflow: visible; justify-self: center; }
    .cv-materials-brad { position: absolute; width: 2.8cqi; height: 2.8cqi; border-radius: 50%; background: #c9a24a; box-shadow: inset -.4cqi -.5cqi 0 #9c7a2c, inset .3cqi .3cqi 0 #ecd28a, 0 .3cqi .4cqi rgb(21 19 15 / .35); }
    .cv-materials-tab { display: grid; grid-template-columns: 1fr auto; }
    .cv-materials-tab > span { padding: 1.2cqi .2cqi; font-variant-numeric: tabular-nums; border-top: 3px solid var(--ink); }
    .cv-materials-head [data-pd-social="display"] { font-size: 11.6cqi; line-height: .88; }
    .cv-materials-cue { display: inline-flex; align-items: center; gap: 1.6cqi; }
    .cv-materials-cue svg { width: 12cqi; height: auto; overflow: visible; }
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
  const swipeArrow = `<svg viewBox="0 0 54 14" aria-hidden="true"><g fill="var(--marker)">${arrow([[1, 8.6], [16, 6.2], [32, 7], [51, 5.4]], 1.8, 6.4, 3)}</g></svg>`

  // ---- marker numerals, drawn as strokes in a 12 × 13 box centred on 0,0
  const NUM = {
    1: [[[-1.6, -2.8], [.2, -4.8], [.5, -.4], [.3, 4.8]]],
    2: [[[-2.8, -2.6], [-.6, -4.9], [2.3, -3.8], [1.7, -.6], [-1.6, 2.6], [-3, 4.6], [.4, 4], [3.2, 4.4]]],
    3: [[[-2.8, -3.6], [0, -5], [2.7, -3.2], [.6, -.7], [-.9, -.3], [1.5, .2], [3, 2.5], [.8, 4.8], [-2.8, 3.8]]],
  }
  const numeral = (n, w = 1.2, seed = 1) => `<svg viewBox="-6 -6.5 12 13" aria-hidden="true"><g fill="var(--marker)">${NUM[n].map((p, k) => ink(p, w, seed + k)).join('')}</g></svg>`

  // a coffee ring: one full ring and the ghost of a second, in uneven brown
  const ringPath = (r0, a1, a2) => Array.from({ length: 73 }, (_, k) => { const a = k / 72 * Math.PI * 2, r = r0 + Math.sin(a * a1) * .9 + Math.sin(a * a2) * .5; return `${k ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}` }).join(' ')
  const ring = (style) => `<svg viewBox="-50 -50 100 100" style="position:absolute;${style};height:auto;overflow:visible" aria-hidden="true">
    <path d="${ringPath(40, 3, 7)}" fill="none" stroke="rgb(140 92 46 / .3)" stroke-width="3"/><path d="${ringPath(37.4, 5, 2)}" fill="none" stroke="rgb(140 92 46 / .13)" stroke-width="1.4"/>
    <path d="M-30 -36 A 46 46 0 0 1 36 -30" transform="translate(9 -7)" fill="none" stroke="rgb(140 92 46 / .18)" stroke-width="2.2"/></svg>`
  // a paperclip, steel wire, over the edge of two piles
  const clip = (style) => `<svg viewBox="0 0 16 44" style="position:absolute;z-index:1;${style};height:auto;overflow:visible" aria-hidden="true">
    <path d="M5 30 V8 a3.4 3.4 0 0 1 6.8 0 V36 a5.4 5.4 0 0 1 -10.8 0 V12" fill="none" stroke="rgb(21 19 15 / .25)" stroke-width="2.2" stroke-linecap="round" transform="translate(.8 1.4)"/>
    <path d="M5 30 V8 a3.4 3.4 0 0 1 6.8 0 V36 a5.4 5.4 0 0 1 -10.8 0 V12" fill="none" stroke="#9a968e" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M5.4 28 V9" fill="none" stroke="#e4e1db" stroke-width=".5" stroke-linecap="round"/></svg>`

  // ---- one pile: a sheet whose bottom edge lands at y (cqi), with its line of copy along that edge
  const label = (n, text, kind) => `<div class="cv-materials-label">${kind ? `<span></span>${sp('metadata', kind, 'class="soft" style="margin-bottom:.8cqi"')}` : ''}${numeral(n, 1.2, n * 3)}${S('subhead', text)}</div>`
  const bars = (...w) => w.map(x => `<i class="b" style="width:${x}%"></i>`).join('')
  // a pile: the top sheet, and the edges of two more under it
  const sheet = ({ x, w, y, r, cls = '' }, inner, pl = 6.4) => { const top = (y - w * 11 / 8.5).toFixed(2)
    const under = [[1.5, .9, 1.1], [.6, -.7, .5]].map(([dy, dr, dx]) => `<div class="cv-materials-sheet under ${cls}" style="left:${x + dx}cqi;width:${w}cqi;top:${top}cqi;transform:translateY(${dy}cqi) rotate(${r + dr}deg);transform-origin:50% 100%"></div>`).join('')
    return `${under}<div class="cv-materials-sheet ${cls}" style="left:${x}cqi;width:${w}cqi;top:${top}cqi;transform:rotate(${r}deg);transform-origin:50% 100%;--pl:${pl}cqi">${inner}</div>` }

  const GEO = {
    portrait: { t: { x: -5, w: 94, y: 40.5, r: -3.2, pl: 11 }, s: { x: 9, w: 98, y: 59, r: 2.4, pl: 5 }, b: { x: -7, w: 101, y: 77.5, r: -1.6, pl: 13 }, clip: 'left:83cqi;top:33cqi;width:5cqi;transform:rotate(-7deg)', ring: 'right:9cqi;bottom:10cqi;width:20cqi' },
    square:   { t: { x: -5, w: 94, y: 25.5, r: -2.6, pl: 11 }, s: { x: 9, w: 98, y: 41.5, r: 2, pl: 5 }, b: { x: -7, w: 101, y: 56, r: -1.3, pl: 13 }, clip: 'left:84cqi;top:18.5cqi;width:4.4cqi;transform:rotate(-7deg)', ring: 'right:4cqi;bottom:3.5cqi;width:15cqi' },
  }

  cover('materials', { g: 'var(--goldenrod)', dark: false,
    art: (c) => { const g = GEO[c], sqr = c === 'square'
      // back to front: budget, script, treatment
      const budget = sheet(g.b, `<div class="cv-materials-foot" style="padding-bottom:${sqr ? 1.6 : 2.4}cqi">${label(3, 'Another wants a budget in euros.', '')}
        <div class="cv-materials-tab" style="margin:${sqr ? 1.2 : 1.8}cqi 0 0 8cqi">${sp('label', 'Total, EUR')}${sp('label', '€214,750')}</div></div>`, g.b.pl)
      const script = sheet({ ...g.s, cls: 'blue' }, `<i class="cv-materials-brad" style="left:2.2cqi;bottom:${sqr ? 4.2 : 5}cqi"></i>
        <div class="cv-materials-foot" style="padding-bottom:${sqr ? 3.6 : 4.4}cqi;padding-right:10cqi">${label(2, 'Another wants a script.', 'Script · Draft 3')}</div>`, g.s.pl)
      const treatment = sheet(g.t, `<div class="cv-materials-foot" style="padding-bottom:${sqr ? 3.6 : 4.4}cqi">
        <div style="display:grid;gap:1.1cqi;margin:0 0 ${sqr ? 2.6 : 3.6}cqi 8cqi">${sqr ? '' : bars(98, 94, 100, 88, 54)}</div>
        ${label(1, 'One film grant wants a treatment.', 'Treatment')}</div>${ring(g.ring)}`, g.t.pl)
      return budget + script + treatment + clip(g.clip) },
    html: (c, i, n) => `${ctop('What to send', i, n)}
      <div class="grow"></div>
      <div class="cv-materials-head">${S('display', `And you’re trying to keep track of ${circ('all three.', 'long', { l: '-6%', t: '-14%', w: '112%', h: '130%' })}`, 'style="max-inline-size:14ch"')}</div>
      <div class="foot mt-m">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-materials-cue">${sp('credit', 'Swipe')}${swipeArrow}</span></div>`,
  })
}

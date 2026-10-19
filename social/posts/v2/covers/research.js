// Cover poster for the research carousel. Calls cover('research', {...}).
// Funding for looking for funding: the browser you're searching in shows this post, which shows the
// browser, which shows this post… a Droste loop that turns a little at every step, like the search does.
{
  // Until v2/research.js adds the carousel, register its first slide so the cover can be previewed.
  if (!POSTS['research-01']) P('research-01', { name: 'research 1/6', g: 'var(--paper)', sizes: ['1080x1350', '1080x1080'],
    alt: '“At this point, I need funding for the time I spend looking for film funding.”', render: () => ({ frame: '', art: '' }) })

  const QUOTE = `“At this point, I need funding for the time I spend looking for film ${circ('funding.”', 'wide', { l: '-7%', t: '-12%', w: '114%', h: '128%' })}`
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-research-lvl { position: absolute; inset: 0; background: var(--paper); overflow: hidden; }
    .cv-research-lvl .cv-research-in { position: absolute; inset: 8.5cqi 7.4cqi 8.9cqi; display: flex; flex-direction: column; }
    .cv-research-q .circ { text-indent: 0; }
    .cv-research-q { font-size: 9.6cqi !important; line-height: .96 !important; text-indent: -.42em; }
    .cv-research-win { position: absolute; z-index: 1; border-radius: 1.4cqi; background: #e6e2da; box-shadow: var(--lift); overflow: hidden; transform-origin: 0 0; }
    .cv-research-win .bar { height: 5cqi; display: flex; align-items: flex-end; gap: .35cqi; padding: 0 1cqi 0 8cqi; background: #d9d4ca; position: relative; }
    .cv-research-win .bar::before { content: ""; position: absolute; left: 1.8cqi; top: 1.7cqi; width: 1.3cqi; height: 1.3cqi; border-radius: 50%; background: #e3472d; box-shadow: 2cqi 0 0 #e6b640, 4cqi 0 0 #7fb069; }
    .cv-research-win .tab { flex: 1 1 0; min-width: 0; height: 3.3cqi; border-radius: .9cqi .9cqi 0 0; background: #cfc9be; display: flex; align-items: center; padding: 0 .6cqi; }
    .cv-research-win .tab i { width: 1.4cqi; height: 1.4cqi; border-radius: .35cqi; flex: none; background: var(--c, #888); }
    .cv-research-win .tab.on { background: #f3f0ea; flex: 0 0 14cqi; gap: .8cqi; }
    .cv-research-win .tab.on b { height: .7cqi; flex: 1; border-radius: 1cqi; background: rgb(21 19 15 / .2); }
    .cv-research-win .url { height: 4.6cqi; background: #f3f0ea; display: flex; align-items: center; gap: 1.2cqi; padding: 0 2cqi; border-bottom: 1.5px solid rgb(21 19 15 / .12); }
    .cv-research-win .url > span { flex: 1; height: 3cqi; border-radius: 1.5cqi; background: #e6e2da; display: flex; align-items: center; padding: 0 1.6cqi; }
    .cv-research-win .page { position: relative; overflow: hidden; background: #f3f0ea; }
    .cv-research-win .side { position: absolute; display: grid; gap: 1.4cqi; }
    .cv-research-win .side i { display: block; height: 1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .12); }
    .cv-research-win .sugg { display: grid; grid-template-columns: 5cqi 1fr; gap: 1.4cqi; align-items: center; margin-bottom: 1cqi; }
    .cv-research-win .sugg b { display: block; aspect-ratio: 4 / 5; border-radius: .4cqi; }
    .cv-research-win .sugg > div { display: grid; gap: 1cqi; }
    .cv-research-win .post { position: absolute; box-shadow: 0 1px 1px rgb(21 19 15 / .12), 0 1cqi 2cqi -1cqi rgb(21 19 15 / .3); }
    .cv-research-win .nest { position: relative; width: 100%; }
    .cv-research-note { position: absolute; z-index: 2; width: 19cqi; aspect-ratio: 1; padding: 0; }
    .cv-research-note svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .cv-research-ink { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .cv-research-ink > svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .cv-research-cue { display: inline-flex; align-items: center; gap: 1.4cqi; }
    .cv-research-cue svg { width: 9cqi; height: auto; overflow: visible; }
  </style>`)

  // ---- marker strokes
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
  const swipeArrow = `<svg viewBox="0 0 40 14" aria-hidden="true"><g fill="var(--marker)">${arrow([[1, 9], [12, 6.4], [24, 6.8], [36, 5.6]], 1.7, 6, 3)}</g></svg>`

  // ---- the browser, full of tabs, open on a page that shows this post, which shows the browser…
  const COL = ['#e3472d', '#4c7bd9', '#2f2f2f', '#e6b640', '#7fb069', '#b04fbf', '#d9822b', '#3aa6a6']
  const GEO = { portrait: { x: 3, y: 57.5, w: 101, r: -2.5, ph: 46, px: 25, py: 4.6, pw: 32 },
                square:   { x: 3, y: 54, w: 101, r: -2, ph: 44, px: 27, py: 4.4, pw: 33 } }
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const win = (c, d) => { const g = GEO[c]
    const tabs = Array.from({ length: 21 }, (_, k) => k === 13 ? `<span class="tab on"><i style="--c:#15130f"></i><b></b></span>` : `<span class="tab"><i style="--c:${COL[(k * 5) % 8]}"></i></span>`).join('')
    return `<div class="cv-research-win" style="left:${g.x}cqi;top:${g.y}cqi;width:${g.w}cqi;transform:rotate(${g.r}deg)"><div class="bar">${tabs}</div>
      <div class="url">${sp('metadata', '←&nbsp;&nbsp;→', 'class="soft"')}<span>${sp('metadata', 'film funding', 'class="soft" style="white-space:nowrap"')}</span></div>
      <div class="page" style="height:${g.ph}cqi">
        <div class="side" style="left:4cqi;top:${g.py + 1}cqi;width:15cqi">${bars(80, 60, 72, 50, 66, 40)}</div>
        <div class="post" style="left:${g.px}cqi;top:${g.py}cqi;width:${g.pw}cqi"><div class="nest" data-pd-canvas="${c}">${level(c, d + 1)}</div></div>
        <div class="side" style="left:${g.px + g.pw + 5}cqi;top:${g.py + 1}cqi;width:24cqi">${['#a8c8ea', '#f3b5c8', '#b5d9a2', '#e9d5ae'].map(col => `<div class="sugg"><b style="background:${col}"></b><div>${bars(90, 60)}</div></div>`).join('')}</div></div></div>` }

  // a sticky note on the screen, keeping count of the hours in marker tally gates
  const tally = (n, x0, y0, h, dx = 1.5) => { let out = '', x = x0, k = 0
    for (let g = 0; g * 5 < n; g++) { const m = Math.min(4, n - g * 5), gx = x
      for (let j = 0; j < m; j++, k++) { const jx = x + Math.sin(k * 2.1) * .2, jy = y0 + Math.sin(k * 1.3) * .4
        out += ink([[jx, jy], [jx + .12 + Math.sin(k) * .16, jy + h / 2], [jx - .08, jy + h]], .7, k); x += dx }
      if (n - g * 5 >= 5) out += ink([[gx - 1.2, y0 + h * .74], [gx + 2.4, y0 + h * .5], [x + .2, y0 + h * .24]], .7, k + 9)
      x += 2.2 }
    return out }
  const note = (c) => { const sqr = c === 'square'
    return `<div class="sticky cv-research-note" style="left:${sqr ? 70 : 69}cqi;top:${sqr ? 47 : 50}cqi;transform:rotate(5deg)">
      <svg viewBox="0 0 20 20" aria-hidden="true"><g fill="var(--marker)">${tally(13, 2.4, 2.6, 6.4)}${tally(9, 2.4, 11.4, 6.4)}</g></svg></div>` }

  const head = (c) => `<div class="mt-m" style="max-inline-size:${c === 'square' ? 88 : 86}cqi">${S('quote', QUOTE, 'class="cv-research-q"')}</div>`
  const footer = `<div class="foot" style="justify-content:flex-end"><span class="cv-research-cue">${swipeArrow}${swipe}</span></div>`
  const level = (c, d) => { if (d > 4) return `<div class="cv-research-lvl"></div>`
    return `<div class="cv-research-lvl">${win(c, d)}${note(c)}
      <div class="cv-research-in">${ctop('Call Sheet, by pitch.dog', 1, 6)}${head(c)}<div class="grow"></div>${footer}</div></div>` }

  cover('research', { g: 'var(--paper)', dark: false,
    art: (c) => win(c, 0) + note(c),
    html: (c, i, n) => `${ctop('Call Sheet, by pitch.dog', i, n)}${head(c)}<div class="grow"></div>${footer}`,
  })
}

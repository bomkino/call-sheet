// Cover poster for the sentence carousel. Calls cover('sentence', {...}).
// A wall of law: the one sentence, every line set to the full width, so the short lines shout and
// the long ones crowd in. Under it, the promise, with $10,000 circled, and a marker line that goes
// back up into the wall to look for it. The page's corner is folded, ready to turn.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-sentence-wall { position: relative; }
    .cv-sentence-wall > span { display: block; width: max-content; white-space: nowrap; line-height: .84; letter-spacing: -.045em; }
    .cv-sentence-wall .q { position: absolute; transform: translateX(-100%); }
    .cv-sentence-clause { position: absolute; color: var(--toner); --pd-type-ink: var(--toner); }
    .cv-sentence-ink { position: absolute; left: 0; top: 0; z-index: 4; overflow: visible; pointer-events: none; }
    .cv-sentence-ink path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .cv-sentence-ear { position: absolute; right: 0; top: 0; width: 8.6cqi; height: 8.6cqi; z-index: 5; overflow: visible; }
  </style>`)

  // The sentence, broken the way a title card would break it. Each line is fitted to the measure.
  const LINES = {
    portrait: ['“Applicants must demonstrate', 'qualifying co-production', 'status through a majority-held', 'entity domiciled in a', 'reciprocally recognised', 'territory.”'],
    square: ['“Applicants must demonstrate', 'qualifying co-production', 'status through a majority-held', 'entity domiciled in a', 'reciprocally recognised territory.”'],
  }
  const line = (t) => { const q = t.startsWith('“'); return sp('display', q ? `<span class="q">“</span>${t.slice(1)}` : t, `style="font-size:${(85 / (t.length * .47)).toFixed(2)}cqi"`) }

  // Fit every line to the wall's width, then draw the marker from the loop back up into the wall.
  const f = (n) => n.toFixed(1)
  const smooth = (P) => P.map((p, i) => { if (!i) return `M${f(p[0])} ${f(p[1])}`
    const a = P[i - 2] || P[i - 1], b = P[i - 1], d = P[i + 1] || p
    return `C${f(b[0] + (p[0] - a[0]) / 6)} ${f(b[1] + (p[1] - a[1]) / 6)} ${f(p[0] - (d[0] - b[0]) / 6)} ${f(p[1] - (d[1] - b[1]) / 6)} ${f(p[0])} ${f(p[1])}` }).join(' ')
  const fit = (post) => {
    const wall = post.querySelector('.cv-sentence-wall'); if (!wall) return
    const W = wall.clientWidth
    for (let k = 0; k < 3; k++) wall.querySelectorAll(':scope > span').forEach(s => { const w = s.getBoundingClientRect().width; if (w) s.style.fontSize = `${parseFloat(getComputedStyle(s).fontSize) * W / w}px` })
    const pr = post.getBoundingClientRect(), loop = post.querySelector('.cv-sentence-pay .circ'), tgt = post.querySelector('.cv-sentence-wall [data-cv-target]')
    if (!loop || !tgt) return
    const a = loop.getBoundingClientRect(), b = tgt.getBoundingClientRect(), u = pr.width / 100
    const x0 = a.right - pr.left + 1.2 * u, y0 = a.top - pr.top - .4 * u
    const x1 = b.right - pr.left + 1.4 * u, y1 = b.top - pr.top + b.height * .52, xm = 96.4 * u
    const sqr = post.dataset.pdCanvas === 'square'
    const P = sqr
      ? (() => { const xa = a.left - pr.left + a.width * .62, ya = a.top - pr.top + .2 * u, w = b.getBoundingClientRect ? 0 : 0
          const t2 = post.querySelector('.cv-sentence-wall > span:last-child').getBoundingClientRect(), xt = t2.left - pr.left + t2.width * .5, yt = t2.bottom - pr.top + 1.2 * u
          return [[xa, ya], [xa + 2 * u, ya - 4 * u], [xt - 4 * u, yt + 5 * u], [xt - 1 * u, yt + 1.2 * u], [xt, yt]] })()
      : [[x0, y0], [x0 + 6 * u, y0 - 3.4 * u], [xm, y0 - 9 * u], [xm + .4 * u, y1 + 6 * u], [xm - 1.2 * u, y1 + 1 * u], [x1, y1]]
    const e = P[P.length - 1], q = P[P.length - 2], ang = Math.atan2(e[1] - q[1], e[0] - q[0])
    const head = [[-.6, 3], [.58, 2.8]].map(([da, L]) => `M${f(e[0])} ${f(e[1])} L${f(e[0] - Math.cos(ang + da) * L * u)} ${f(e[1] - Math.sin(ang + da) * L * u)}`).join(' ')
    post.querySelector('.cv-sentence-ink')?.remove()
    post.insertAdjacentHTML('beforeend', `<svg class="cv-sentence-ink" width="${pr.width}" height="${pr.height}" aria-hidden="true"><path d="${smooth(P)} ${head}" style="stroke-width:${.78 * u}px"/></svg>`)
  }
  const refit = () => document.querySelectorAll('.post[data-id="sentence-01"]').forEach(fit)
  const root = document.querySelector('#root')
  if (root) new MutationObserver(() => { refit(); document.fonts.ready.then(() => requestAnimationFrame(refit)) }).observe(root, { childList: true })

  const ear = `<svg class="cv-sentence-ear" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 0 L100 100 L100 0 Z" fill="#f3a58a"/><path d="M0 0 L100 100 L0 100 Z" fill="rgb(21 19 15 / .18)" transform="translate(-3 4)"/><path d="M0 0 L100 100 L0 100 Z" fill="#e3472d"/></svg>`

  cover('sentence', { g: 'var(--white)', dark: false,
    art: () => ear,
    html: (c, i, n) => {
      const L = LINES[c] || LINES.portrait
      const lines = L.map((t) => t === 'entity domiciled in a' ? line(t).replace(' a<', ' <span data-cv-target>a</span><') : line(t)).join('')
      return `${ctop('Guidelines, § 4.2', i, n)}
        <div class="grow" style="display:flex;flex-direction:column;justify-content:center"><div class="cv-sentence-wall">${lines}</div></div>
        ${S('headline', `Somewhere in this sentence is ${circ('$10,000', 'wide', { l: '-9%', t: '-16%', w: '118%', h: '134%' })} for your next film, and we want to help you find it!!`, `class="cv-sentence-pay mt-m" style="max-inline-size:${sq(c, '22ch', '24ch')}"`)}
        <div class="mt-m"></div>
        <div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>`
    } })
}

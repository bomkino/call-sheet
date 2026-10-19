// Cover poster for the tz carousel. Calls cover('tz', {...}).
// A 24-hour world-time dial, bigger than the frame, with one hand. Midnight sits at the top, "there".
// A red marker arc walks round from it to where the hand lands, 08:00, "here": the same two times
// slide 3 of the carousel spells out. Where the headline crosses the dial, the dial drops out.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-tz-clock { position: absolute; z-index: 1; border-radius: 50%; box-shadow: 0 .3cqi .4cqi rgb(21 19 15 / .22), 0 2cqi 3cqi -1cqi rgb(21 19 15 / .26), 0 9cqi 14cqi -4cqi rgb(21 19 15 / .42); }
    .cv-tz-clock > svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .cv-tz-num { position: absolute; transform: translate(-50%, -52%); line-height: 1; white-space: nowrap; }
    .cv-tz-note { position: absolute; white-space: nowrap; color: var(--toner); --pd-type-ink: var(--toner); }
    .cv-tz-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-tz-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-tz-arrow path { fill: none; stroke: var(--marker); stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
    .cv-tz-pay { font-size: 11.6cqi; line-height: .86; }
  </style>`)

  const f = (n) => n.toFixed(2)
  const pt = (deg, r) => { const t = deg * Math.PI / 180; return [Math.sin(t) * r, -Math.cos(t) * r] }
  const smooth = (P) => P.map((p, i) => { if (!i) return `M${f(p[0])} ${f(p[1])}`
    const a = P[i - 2] || P[i - 1], b = P[i - 1], d = P[i + 1] || p
    return `C${f(b[0] + (p[0] - a[0]) / 6)} ${f(b[1] + (p[1] - a[1]) / 6)} ${f(p[0] - (d[0] - b[0]) / 6)} ${f(p[1] - (d[1] - b[1]) / 6)} ${f(p[0])} ${f(p[1])}` }).join(' ')
  const inGap = (deg, gaps) => gaps.some(([a, b]) => { const d = ((deg % 360) + 360) % 360; return a <= b ? d >= a && d <= b : d >= a || d <= b })

  // The dial in a 200-unit box. 24 hours round, one hand. `gaps` are angle ranges where the rim and
  // ticks drop out from behind the headline.
  const dial = (hour, gaps, rimGaps = gaps) => {
    const ha = hour * 15
    const ticks = Array.from({ length: 96 }, (_, i) => { const a = i * 3.75; if (inGap(a, gaps)) return ''
      const big = i % 4 === 0, [x1, y1] = pt(a, big ? 81 : 86.5), [x2, y2] = pt(a, 91)
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#15130f" stroke-width="${big ? 2.6 : .9}"/>` }).join('')
    // The rim: a thick ring drawn as arcs, skipping the gaps.
    const segs = []; let a0 = null
    for (let a = 0; a <= 360; a += 1) { const open = !inGap(a, rimGaps) && a < 360
      if (open && a0 === null) a0 = a
      if ((!open || a === 359) && a0 !== null) { segs.push([a0, open ? 360 : a]); a0 = null } }
    const arc = (r, [s, e], w) => { const [x1, y1] = pt(s, r), [x2, y2] = pt(e, r); return `<path d="M${f(x1)} ${f(y1)} A${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${f(x2)} ${f(y2)}" fill="none" stroke="#15130f" stroke-width="${w}"/>` }
    const rim = segs.map(sg => arc(95, sg, .7)).join('') + segs.map(sg => arc(93.4, sg, .35)).join('')
    // A world-time hand: a long blade with an arrow tip, and a counterweight disc on its tail.
    const hand = (dx, dy, c) => `<g transform="translate(${dx} ${dy}) rotate(${ha})"><path d="M-2.2 12 L-1.4 -48 L-5.4 -48 L0 -62 L5.4 -48 L1.4 -48 L2.2 12 Z" fill="${c}"/><circle r="5.4" fill="${c}"/></g>`
    // The marker: from midnight round to the hand, overshooting a touch, with a two-stroke arrowhead.
    const P = []; for (let k = 0; k <= 30; k++) { const t = k / 30; P.push(pt(-2 + (ha - 14 + 2) * t, 58 - t * 2 + Math.sin(t * 7) * .8)) }
    const e = P[P.length - 1], q = P[P.length - 3], ang = Math.atan2(e[1] - q[1], e[0] - q[0])
    const head = [[-.6, 8.5], [.62, 9]].map(([da, L]) => `M${f(e[0])} ${f(e[1])} L${f(e[0] - Math.cos(ang + da) * L)} ${f(e[1] - Math.sin(ang + da) * L)}`).join(' ')
    return `<svg viewBox="-100 -100 200 200" aria-hidden="true"><circle r="100" fill="#fbf9f3"/>${rim}${ticks}
      ${hand(1.5, 2.6, 'rgb(21 19 15 / .15)')}
      <path d="${smooth(P)} ${head}" fill="none" stroke="#e3472d" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
      ${hand(0, 0, '#15130f')}<circle r="1.6" fill="#fbf9f3"/></svg>`
  }
  // Even hours as numerals, on the dial; the rest are ticks. Numerals in a gap drop out too.
  const nums = (gaps) => Array.from({ length: 12 }, (_, k) => { const n = k * 2, a = n * 15; if (n && inGap(a, gaps)) return ''
    const [x, y] = pt(a, 71), t = sp('headline', String(n).padStart(2, '0'))
    return `<span class="cv-tz-num" style="left:${50 + x / 2}%;top:${50 + y / 2}%">${n === 8 ? circ(t, 'round', { l: '-34%', t: '-38%', w: '170%', h: '176%' }) : t}</span>` }).join('')

  // The swipe cue, drawn: the same marker arrow as the rest of the set.
  const arrow = `<svg class="cv-tz-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`

  cover('tz', { g: 'var(--yellow)', dark: false,
    art: (c) => {
      const sqr = c === 'square'
      const D = sqr ? 92 : 104, cx = sqr ? 60 : 62, cy = sqr ? 60 : 80, tilt = sqr ? 4 : 10
      const gaps = [[123, 352]]
      const note = (t, a, r, rot) => { const [x, y] = pt(a, r); return `<span class="cv-tz-note" style="left:${50 + x / 2}%;top:${50 + y / 2}%;transform:translate(-50%,-50%) rotate(${rot}deg)">${sp('metadata', t)}</span>` }
      return `<div class="cv-tz-clock" style="left:${cx - D / 2}cqi;top:${cy - D / 2}cqi;width:${D}cqi;height:${D}cqi;transform:rotate(${tilt}deg)">${dial(8, gaps, [[150, 352]])}${nums(gaps)}
        ${note('Midnight there', 27, 45, 27)}${note('Here', 98, 44, 8)}${note("24 hour", 306, 24, 0)}</div>`
    },
    html: (c, i, n) => {
      const sqr = c === 'square'
      return `${ctop('Deadlines', i, n)}
        ${S('subhead', 'Filmmaker friends,', 'class="mt-m"')}
        ${S('headline', 'Ever wished grant and festival deadlines showed up in your own time zone?', 'class="mt-xs" style="max-inline-size:13ch"')}
        <div class="grow"></div>
        ${S('display', 'Well, now they do.', `class="cv-tz-pay" style="max-inline-size:6ch;${sqr ? 'font-size:10.2cqi' : ''}"`)}
        <div class="mt-m"></div>
        <div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-tz-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>`
    } })
}

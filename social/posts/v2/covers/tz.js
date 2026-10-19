// Cover poster for the tz carousel. Calls cover('tz', {...}).
// A station clock bigger than the frame. The deadline was midnight somewhere else; a red marker
// arc walks the hour hand round from "midnight there" to where it lands for you, and runs on out of frame.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-tz-clock { position: absolute; z-index: 1; border-radius: 50%; box-shadow: 0 .3cqi .4cqi rgb(21 19 15 / .25), 0 2cqi 3cqi -1cqi rgb(21 19 15 / .3), 0 7cqi 10cqi -3cqi rgb(21 19 15 / .45); }
    .cv-tz-clock > svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .cv-tz-note { position: absolute; z-index: 2; white-space: nowrap; color: var(--toner); --pd-type-ink: var(--toner); }
    .cv-tz-ink { color: var(--ink); --pd-type-ink: var(--ink); }
  </style>`)

  const f = (n) => n.toFixed(2)
  const pt = (deg, r) => { const t = deg * Math.PI / 180; return [Math.sin(t) * r, -Math.cos(t) * r] }
  // Catmull-Rom through the points, as cubic Béziers: a line a hand would draw.
  const smooth = (P) => P.map((p, i) => { if (!i) return `M${f(p[0])} ${f(p[1])}`
    const a = P[i - 2] || P[i - 1], b = P[i - 1], d = P[i + 1] || p
    return `C${f(b[0] + (p[0] - a[0]) / 6)} ${f(b[1] + (p[1] - a[1]) / 6)} ${f(p[0] - (d[0] - b[0]) / 6)} ${f(p[1] - (d[1] - b[1]) / 6)} ${f(p[0])} ${f(p[1])}` }).join(' ')

  const hand = (deg, len, tail, w0, w1, fill) => `<path transform="rotate(${deg})" d="M${-w0} ${tail} L${-w1} ${-len} Q0 ${-len - w1 * 1.4} ${w1} ${-len} L${w0} ${tail} Z" fill="${fill}"/>`
  // The clock, in a 200-unit box. h/m is the time it shows; arc runs from 12 round to the hour hand.
  const clockSvg = (h, m, arc) => {
    const ha = (h % 12 + m / 60) * 30, ma = m * 6
    const ticks = Array.from({ length: 60 }, (_, i) => { const big = i % 5 === 0
      const [x1, y1] = pt(i * 6, big ? 74 : 85), [x2, y2] = pt(i * 6, 91)
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#15130f" stroke-width="${big ? 4.6 : 1.3}" stroke-linecap="butt"/>` }).join('')
    const hands = (dx, dy, c, c2) => `<g transform="translate(${dx} ${dy})">${hand(ha, 50, 16, 4.4, 3, c)}${hand(ma, 78, 18, 3.4, 2, c)}${hand(ma + 196, 64, 20, .7, .5, c2)}<circle r="5" fill="${c}"/></g>`
    let marker = ''
    if (arc) { const P = []
      for (let k = 0; k <= 24; k++) { const t = k / 24; const a = -6 + (ha - 11 + 6) * t; P.push(pt(a, arc.r + Math.sin(t * 9) * .9 - t * 3)) }
      const end = P[P.length - 1], pre = P[P.length - 3]
      const ang = Math.atan2(end[1] - pre[1], end[0] - pre[0])
      const head = [[-.55, 9], [.6, 9.5]].map(([da, L]) => `M${f(end[0])} ${f(end[1])} L${f(end[0] - Math.cos(ang + da) * L)} ${f(end[1] - Math.sin(ang + da) * L)}`).join(' ')
      marker = `<path d="${smooth(P)} ${head}" fill="none" stroke="#e3472d" stroke-width="${arc.w}" stroke-linecap="round" stroke-linejoin="round"/>` }
    return `<svg viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="100" fill="#15130f"/><circle r="95.5" fill="#fbf9f3"/><circle r="93.6" fill="none" stroke="rgb(21 19 15 / .12)" stroke-width=".6"/>${ticks}
      <circle r="16" fill="none" stroke="rgb(21 19 15 / .08)" stroke-width=".5"/>
      ${hands(1.6, 2.6, 'rgb(21 19 15 / .16)', 'rgb(21 19 15 / .1)')}${marker}${hands(0, 0, '#15130f', '#15130f')}<circle r="1.6" fill="#fbf9f3"/></svg>`
  }

  cover('tz', { g: 'var(--blue)', dark: false,
    art: (c) => {
      const sqr = c === 'square'
      const D = sqr ? 132 : 150, cx = sqr ? 66 : 64, cy = sqr ? 76 : 90
      return `<div class="cv-tz-clock" style="left:${cx - D / 2}cqi;top:${cy - D / 2}cqi;width:${D}cqi;height:${D}cqi">${clockSvg(4, 30, { r: 66, w: 2.2 })}</div>`
    },
    html: (c, i, n) => {
      const sqr = c === 'square'
      return `${ctop('Deadlines', i, n)}
        ${S('subhead', 'Filmmaker friends,', 'class="mt-m"')}
        ${S('display', 'Ever wished grant and festival deadlines showed up in your own time zone?', `class="mt-xs" style="max-inline-size:12ch"`)}
        <div class="grow"></div>
        ${S('display', 'Well, now they do.', 'style="max-inline-size:6ch"')}
        <div class="mt-m"></div>
        <div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>`
    } })
}

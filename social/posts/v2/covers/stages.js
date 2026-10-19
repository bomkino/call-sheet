// Cover poster for the stages carousel. Calls cover('stages', {...}).
// One frame of 35mm film, blown up to fill the poster, and it's still a pencil storyboard: the film
// isn't finished, and the headline is written on it. The next frame, already shot, peeks in from the
// right edge, and a grease-pencil line along the film runs out that way, into slide 2.
{
  const HOLE = '#c98168'        // the salmon desk seen through a perforation, in the strip's shadow
  const EDGE = '#d9b25a'        // edge print on the film base
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-stages-strip { position: absolute; z-index: 1; box-shadow: var(--lift); }
    .cv-stages-strip > svg { display: block; width: 100%; height: auto; overflow: visible; }
    .cv-stages-ink { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
    .cv-stages-ink > svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .cv-stages-tape { position: absolute; z-index: 2; background: rgb(240 232 210 / .8); box-shadow: 0 1px 1px rgb(21 19 15 / .14); clip-path: polygon(0 5%, 14% 0, 33% 4%, 55% 0, 76% 3%, 100% 0, 98% 52%, 100% 100%, 80% 96%, 58% 100%, 36% 95%, 16% 100%, 0 96%, 2% 48%); }
    .cv-stages-on { position: relative; transform-origin: 50% 0; }
    .cv-stages-on [data-pd-social="display"] { font-size: 12.2cqi; line-height: .86; }
    .cv-stages-cue { display: inline-flex; align-items: center; gap: 1.6cqi; }
    .cv-stages-cue svg { width: 12cqi; height: auto; overflow: visible; }
  </style>`)

  // ---- a marker stroke: a smooth line through the points, thicker in the middle, tapered at the ends
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

  // ---- the shot, in the frame's own cqi: a road to the horizon, a low sun, telegraph poles, someone walking
  const shot = (w, h, mode, sx = .83) => {
    const hy = h * .84, vx = w * .62, pole = (x) => hy + (x - vx) * .2
    const poles = (sx > .85 ? [[.975, .36], [.93, .22], [.89, .14], [.86, .09], [.84, .06]] : [[.97, .40], [.885, .25], [.825, .16], [.785, .1], [.76, .065]]).map(([x, ph]) => [w * x, h * ph])
    const fx = w * .66, fy = hy + h * .1, fs = h * .0135
    // someone walking away from us, toward the sun: head, a long coat, mid-stride; a long shadow back to camera
    const figure = (c, sw, fill = 'none') => `<g stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${fx - .8 * fs} ${fy + .2 * fs} L${fx - 6 * fs} ${fy + 3.4 * fs} M${fx + .9 * fs} ${fy} L${fx - 3.8 * fs} ${fy + 3.6 * fs}" stroke-width="${sw * .5}" opacity=".6"/>
      <circle cx="${fx}" cy="${fy - 10.6 * fs}" r="${1.35 * fs}" fill="${fill}"/>
      <path d="M${fx - 1.7 * fs} ${fy - 8.8 * fs} Q ${fx} ${fy - 9.5 * fs} ${fx + 1.7 * fs} ${fy - 8.8 * fs} L${fx + 2.4 * fs} ${fy - 3.2 * fs} L${fx - 2.3 * fs} ${fy - 3.2 * fs} Z" fill="${fill}"/>
      <path d="M${fx - .9 * fs} ${fy - 3.2 * fs} L${fx - 1.3 * fs} ${fy + .2 * fs} M${fx + .9 * fs} ${fy - 3.2 * fs} L${fx + 1.5 * fs} ${fy - .1 * fs}"/>
</g>`
    const sun = [w * sx, hy, h * (sx > .85 ? .12 : .15)]
    if (mode === 'pencil') {
      const g = '#5d5850'
      const hatch = Array.from({ length: 30 }, (_, i) => { const x = i * w / 26 - 4; return `M${x} ${h + 1} L${x + 5} ${hy + 1.6}` }).join(' ')
      const persp = [-.3, .05, .22, 1.3, 1.6].map(t => `M${vx} ${hy} L${w * t} ${t < .5 ? 0 : h * .02}`).join(' ')
      return `<rect width="${w}" height="${h}" fill="#f6f2e9"/>
        <g fill="none" stroke="${g}" stroke-linecap="round" stroke-linejoin="round">
          <path d="${persp}" stroke-width=".14" opacity=".35"/>
          <path d="M-1 ${hy + .3} L${w + 1} ${hy - .4}" stroke-width=".36"/><path d="M1 ${hy + 1} L${w - 2} ${hy + .5}" stroke-width=".16" opacity=".6"/>
          <path d="M${sun[0] - sun[2]} ${hy} A ${sun[2]} ${sun[2]} 0 0 1 ${sun[0] + sun[2]} ${hy}" stroke-width=".32"/><path d="M${sun[0] - sun[2] * 1.04} ${hy - .4} A ${sun[2] * 1.03} ${sun[2] * .98} 0 0 1 ${sun[0] + sun[2] * .97} ${hy - .6}" stroke-width=".16" opacity=".7"/>
          ${Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (1.12 + i * .127), r1 = sun[2] * 1.18, r2 = sun[2] * 1.38; return `<path d="M${sun[0] + Math.cos(a) * r1} ${hy + Math.sin(a) * r1} L${sun[0] + Math.cos(a) * r2} ${hy + Math.sin(a) * r2}" stroke-width=".2"/>` }).join('')}
          <path d="M-2 ${hy - h * .07} C ${w * .1} ${hy - h * .12}, ${w * .22} ${hy - h * .09}, ${w * .34} ${hy - .2}" stroke-width=".28"/>
          <path d="M${vx - .3} ${hy} L${w * .36} ${h + 1} M${vx + .3} ${hy} L${w * 1.02} ${h + 1}" stroke-width=".34"/>
          <path d="M${vx} ${hy + h * .03} L${vx + .05} ${hy + h * .05} M${vx + .3} ${hy + h * .08} L${vx + .5} ${hy + h * .115}" stroke-width=".5"/>
          ${poles.map(([x, ph]) => `<path d="M${x} ${pole(x)} L${x} ${pole(x) - ph} M${x - ph * .16} ${pole(x) - ph * .9} L${x + ph * .16} ${pole(x) - ph * .9}" stroke-width=".3"/>`).join('')}
          <path d="M${poles.map(([x, ph]) => `${x} ${pole(x) - ph * .9}`).join(' Q ')}" stroke-width=".12" opacity=".7"/>
          <path d="${hatch}" stroke-width=".12" opacity=".55"/>
          <path d="M${w * .79} ${hy - h * .52} l1.4 .9 l1.4 -.9 M${w * .85} ${hy - h * .58} l1.1 .7 l1.1 -.7" stroke-width=".22"/>
          <path d="M2 4.4 V2 H4.4 M${w - 4.4} 2 H${w - 2} V4.4 M2 ${h - 4.4} V${h - 2} H4.4 M${w - 4.4} ${h - 2} H${w - 2} V${h - 4.4}" stroke-width=".22"/>
          ${[[w - 3.4, h - 3.4, -1, -1], [3.4, h - 3.4, 1, -1]].map(([x, y, dx, dy]) => { const L2 = 5.4, ex = x + dx * L2, ey = y + dy * L2 * .72
            return `<path d="M${x} ${y} L${ex} ${ey} M${ex} ${ey} l${-dx * 1.4} ${-dy * .1} M${ex} ${ey} l${-dx * .1} ${-dy * 1.3}" stroke-width=".24"/>` }).join('')}
        </g>${figure(g, .3, 'rgb(93 88 80 / .32)')}`
    }
    // the next frame: shot, but not graded yet
    const C = { sky: ['#cfcbc3', '#d8d4cc', '#e2ded6'], sun: '#f2efe8', land: '#6e6a62', hill: '#57534c', road: '#3e3b36', ink: '#1f1d1a' }
    return `${[0, .3, .55].map((y, i) => `<rect y="${h * y}" width="${w}" height="${hy - h * y + 1}" fill="${C.sky[i]}"/>`).join('')}
      <circle cx="${w * .3}" cy="${hy}" r="${h * .15}" fill="${C.sun}"/><rect y="${hy}" width="${w}" height="${h - hy}" fill="${C.land}"/>
      <path d="M-2 ${hy - h * .07} C ${w * .06} ${hy - h * .12}, ${w * .14} ${hy - h * .09}, ${w * .22} ${hy} Z" fill="${C.hill}"/>
      <g fill="#2a2825"><rect x="${w * .1}" y="-1" width=".7" height="${h * .12}"/><rect x="${w * .07}" y="${h * .11}" width="${w * .07}" height="${h * .05}" rx="${h * .025}"/></g>`
  }

  // ---- the strip: a 35mm still frame's proportions, eight perforations a frame
  const L = { portrait: { FW: 88, FH: 60, RB: 11, x: 3, y: 15.6, r: -2.2, sx: .83 }, square: { FW: 88, FH: 47, RB: 8.4, x: 3, y: 13.4, r: -1.4, sx: .9 } }
  const strip = (c) => { const { FW, FH, RB } = L[c], GAP = 2.4, P = FW + GAP, SL = 3 * P, SH = FH + 2 * RB
    const hw = P / 8 * .44, hh = RB * .28, hy = RB * .22
    const holes = Array.from({ length: 24 }, (_, i) => [hy, SH - hy - hh].map(y => `<rect x="${(i * P / 8 + P / 16 - hw / 2).toFixed(2)}" y="${y.toFixed(2)}" width="${hw.toFixed(2)}" height="${hh.toFixed(2)}" rx="${(hh * .2).toFixed(2)}"/>`).join('')).join('')
    const txt = (x, y, t, a = 'start') => `<text x="${x}" y="${y}" font-size="${RB * .17}" fill="${EDGE}" text-anchor="${a}" style="letter-spacing:.16em;text-transform:uppercase">${t}</text>`
    return { P, SH, html: `<svg viewBox="0 0 ${SL} ${SH}" aria-hidden="true"><rect width="${SL}" height="${SH}" fill="#1c1a17"/><g fill="${HOLE}">${holes}</g>
      <svg x="${GAP / 2 + P}" y="${RB}" width="${FW}" height="${FH}" overflow="hidden">${shot(FW, FH, 'pencil', L[c].sx)}</svg>
      <svg x="${GAP / 2 + 2 * P}" y="${RB}" width="${FW}" height="${FH}" overflow="hidden">${shot(FW, FH, 'grey')}</svg>
      ${txt(P + GAP / 2 + .6, RB * .86, 'The idea · Scene 1 · Board 1A')}${txt(2 * P - GAP / 2 - .6, SH - RB * .5, '▸ 1A', 'end')}
      ${txt(2 * P + GAP / 2 + .6, RB * .86, 'Production')}</svg>` } }

  cover('stages', { g: 'var(--salmon)', dark: false,
    art: (c) => { const sqr = c === 'square', { FW, FH, RB, x, y, r } = L[c], { P, SH, html } = strip(c)
      const left = x - P - 1.2, rad = r * Math.PI / 180
      // a point on the strip, from the panel's top-left corner, in poster cqi
      const at = (u, v) => [x + u * Math.cos(rad) - v * Math.sin(rad), y + RB + u * Math.sin(rad) + v * Math.cos(rad)]
      // grease pencil: from the circled "six" up onto the bottom rebate, along it and out into the next frame
      const six = sqr ? [27.7, 79] : [30.2, 99.7]
      const rv = FH + RB * .5
      const run = [six, [six[0] + 2.6, six[1] - 3.2], at(40, rv + .3), at(62, rv - .2), at(84, rv + .1), at(100, rv - .3), at(112, rv + .2)]
      return `<div class="cv-stages-strip" style="left:${left}cqi;top:${y}cqi;width:${3 * P}cqi;transform-origin:${P + 1.2}cqi ${RB}cqi;transform:rotate(${r}deg)">${html}</div>
        <div class="cv-stages-tape" style="left:-4.6cqi;top:${y + RB * .2}cqi;width:10cqi;height:${sqr ? 8 : 9.5}cqi;transform:rotate(-34deg)"></div>
        <div class="cv-stages-tape" style="left:${sqr ? 84 : 85}cqi;top:${y + SH - (sqr ? 6.4 : 8.6)}cqi;width:11cqi;height:${sqr ? 8 : 10}cqi;transform:rotate(-41deg)"></div>
        <div class="cv-stages-ink"><svg viewBox="0 0 100 ${sqr ? 100 : 125}" preserveAspectRatio="none" aria-hidden="true"><g fill="var(--marker)">${ink(run, 1.1, 2)}</g></svg></div>` },
    html: (c, i, n) => { const sqr = c === 'square', { RB, r } = L[c]
      return `${ctop('Where you’re at', i, n)}
      <div class="cv-stages-on" style="margin-top:${sqr ? 12.4 : 15.4}cqi;padding:0 4cqi 0 1.4cqi;transform:rotate(${r}deg)">
        ${S('display', 'You don’t need<br>a finished film.')}
        ${S('subhead', 'There are opportunities you can apply for while you’re still writing, shooting or editing.', `class="mt-s" style="max-inline-size:${sqr ? 30 : 26}ch"`)}</div>
      <div class="grow"></div>
      ${S('subhead', `Here are ${circ('six,', 'wide', { l: '-12%', t: '-20%', w: '126%', h: '144%' })} depending on where your project’s at.`, `style="max-inline-size:${sqr ? 40 : 24}ch"`)}
      <div class="foot ${sqr ? 'mt-xs' : 'mt-s'}">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-stages-cue">${sp('credit', 'Swipe')}${swipeArrow}</span></div>` },
  })
}

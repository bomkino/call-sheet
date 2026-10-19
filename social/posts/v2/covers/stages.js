// Cover poster for the stages carousel. Calls cover('stages', {...}).
// One shot, six times: a strip of film that starts as a pencil storyboard and ends as the graded frame.
{
  const G = '#e6b640'           // goldenrod: the ground, and the colour the sprocket holes show through
  const HOLE = '#b98f2f'        // the desk seen through a perforation, in the strip's shadow
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-stages-strip { position: absolute; z-index: 1; transform-origin: 0 50%; box-shadow: var(--lift); }
    .cv-stages-strip > svg, .cv-stages-ink > svg, .cv-stages-tool > svg { display: block; width: 100%; height: auto; overflow: visible; }
    .cv-stages-ink { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
    .cv-stages-ink > svg { height: 100%; }
    .cv-stages-tool { position: absolute; z-index: 2; transform-origin: 0 50%; }
    .cv-stages-head [data-pd-social="display"] { font-size: 13.2cqi; line-height: .86; }
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
  const arrow = (pts, w, head = 4, seed = 1) => { const n = pts.length, e = pts[n - 1], p = pts[n - 2]; const a = Math.atan2(e[1] - p[1], e[0] - p[0])
    const wing = (da) => [[e[0] - Math.cos(a + da) * head, e[1] - Math.sin(a + da) * head], e]
    return ink(pts, w, seed) + ink(wing(.5), w * .9, seed + 2) + ink(wing(-.45), w * .9, seed + 3) }

  // ---- the same shot at six stages: pencil, cleaner pencil, inked board, grey footage, rough cut, graded
  const W = 120, H = 90, hz = 55, vx = 67
  const poles = [[108, 30], [93, 16.5], [84, 9.5], [78.5, 5.6], [75, 3.4]]   // x, height; bases run to the vanishing point
  const poleBase = (x) => hz + (x - vx) * .36
  const fig = (x, y, s, c, sw) => `<g stroke="${c}" stroke-width="${sw}" stroke-linecap="round" fill="none"><circle cx="${x}" cy="${y - 11 * s}" r="${1.7 * s}" fill="${c}"/><path d="M${x} ${y - 9 * s} L${x + .4 * s} ${y - 4 * s} M${x + .4 * s} ${y - 4 * s} L${x - 1.6 * s} ${y} M${x + .4 * s} ${y - 4 * s} L${x + 2.2 * s} ${y - .2 * s} M${x} ${y - 8 * s} L${x - 2 * s} ${y - 5 * s} M${x} ${y - 8 * s} L${x + 2.3 * s} ${y - 5.6 * s}"/></g>`
  const road = `M${vx - 1} ${hz} L${vx + 1} ${hz} L${W - 6} ${H} L${12} ${H} Z`
  const hill = `M0 ${hz - 6} C 14 ${hz - 13}, 30 ${hz - 9}, 44 ${hz - 1} L 44 ${hz} L0 ${hz} Z`
  const scene = (k) => {
    if (k <= 1) { // storyboard pencil on paper
      const g = k ? '#4f4a43' : '#8d877d', sw = k ? .75 : .6
      const hatch = k ? Array.from({ length: 16 }, (_, i) => `M${4 + i * 7} ${H - 1} L${12 + i * 7} ${hz + 3}`).join(' ') : ''
      return `<rect width="${W}" height="${H}" fill="#f5f1e7"/><g fill="none" stroke="${g}" stroke-width="${sw}" stroke-linecap="round">
        <path d="M-2 ${hz + .4} L${W + 2} ${hz - .6}"/>${k ? `<path d="M2 ${hz + 1.6} L${W - 4} ${hz + 1}" stroke-width=".35"/>` : ''}
        <ellipse cx="${vx}" cy="${hz - 5}" rx="17" ry="16.4" transform="rotate(-8 ${vx} ${hz - 5})"/><ellipse cx="${vx + .8}" cy="${hz - 5.6}" rx="16.2" ry="17" stroke-width="${sw * .6}"/>
        <path d="M${vx - .6} ${hz} L${14} ${H + 2} M${vx + .8} ${hz} L${W - 8} ${H + 2}"/>
        ${k ? `<path d="${hill}" stroke-width=".6"/><path d="M${vx} ${hz + 6} L${vx} ${hz + 9} M${vx + .5} ${hz + 14} L${vx + 1} ${hz + 20} M${vx + 2} ${hz + 26} L${vx + 2.6} ${H}" stroke-width="1.1"/>
          ${poles.map(([x, h]) => `<path d="M${x} ${poleBase(x)} L${x} ${poleBase(x) - h} M${x - h * .18} ${poleBase(x) - h * .9} L${x + h * .18} ${poleBase(x) - h * .9}"/>`).join('')}
          <path d="${hatch}" stroke-width=".3" opacity=".7"/><path d="M14 18 l3 2 l3 -2 M24 13 l2.4 1.6 l2.4 -1.6" stroke-width=".5"/>
          <path d="M4 6 L4 4 L8 4 M${W - 8} 4 L${W - 4} 4 L${W - 4} 6 M4 ${H - 6} L4 ${H - 4} L8 ${H - 4} M${W - 8} ${H - 4} L${W - 4} ${H - 4} L${W - 4} ${H - 6}" stroke-width=".4"/>`
        : '<path d="M30 14 C 34 10, 40 10, 42 14" stroke-width=".4"/>'}</g>
        ${fig(76, 77, 1.05, g, k ? .9 : .7)}`
    }
    if (k === 2) { // inked board with flat marker tones
      return `<rect width="${W}" height="${H}" fill="#f5f1e7"/><path d="M0 ${hz} H${W} V${H} H0 Z" fill="#d6d0c4"/><path d="${hill}" fill="#bdb6a9"/><path d="${road}" fill="#9d978c"/>
        <circle cx="${vx}" cy="${hz - 5}" r="16.6" fill="#f5f1e7" stroke="#15130f" stroke-width="1"/><path d="M-1 ${hz} H${W + 1}" stroke="#15130f" stroke-width="1.1"/>
        <g stroke="#15130f" stroke-width="1" stroke-linecap="round">${poles.map(([x, h]) => `<path d="M${x} ${poleBase(x)} L${x} ${poleBase(x) - h} M${x - h * .18} ${poleBase(x) - h * .9} L${x + h * .18} ${poleBase(x) - h * .9}"/>`).join('')}</g>
        <path d="M${vx - 1} ${hz} L12 ${H} M${vx + 1} ${hz} L${W - 6} ${H}" stroke="#15130f" stroke-width=".9" fill="none"/>${fig(76, 77, 1.05, '#15130f', 1.1)}`
    }
    // footage: grey (shoot), flat colour with burnt-in timecode (edit), graded (finished)
    const C = k === 3
      ? { sky: ['#cfcbc3', '#d8d4cc', '#e2ded6'], sun: '#f2efe8', land: '#6e6a62', hill: '#57534c', road: '#3e3b36', dash: '#a9a49b', ink: '#1f1d1a' }
      : k === 4
        ? { sky: ['#d9b6b0', '#e2bca3', '#e9d3a2'], sun: '#efdcae', land: '#5f6a52', hill: '#4c5643', road: '#2f2d2a', dash: '#d8c98f', ink: '#22201c' }
        : { sky: ['#f3b5c8', '#f3a58a', '#f4df77'], sun: '#fbf3d2', land: '#3f5b3a', hill: '#2c4429', road: '#15130f', dash: '#f4df77', ink: '#15130f' }
    const bands = [0, 22, 40].map((y, i) => `<rect y="${y}" width="${W}" height="${hz - y + 1}" fill="${C.sky[i]}"/>`).join('')
    return `${bands}<circle cx="${vx}" cy="${hz - 5}" r="16.6" fill="${C.sun}"/><path d="M0 ${hz} H${W} V${H} H0 Z" fill="${C.land}"/><path d="${hill}" fill="${C.hill}"/><path d="${road}" fill="${C.road}"/>
      <g fill="${C.dash}">${[[hz + 5, .5, 2], [hz + 11, .8, 4], [hz + 21, 1.2, 6.5]].map(([y, w, h]) => `<rect x="${vx + (y - hz) * .06 - w / 2}" y="${y}" width="${w}" height="${h}"/>`).join('')}</g>
      <g stroke="${C.ink}" stroke-width="1" stroke-linecap="round">${poles.map(([x, h]) => `<path d="M${x} ${poleBase(x)} L${x} ${poleBase(x) - h} M${x - h * .18} ${poleBase(x) - h * .9} L${x + h * .18} ${poleBase(x) - h * .9}"/>`).join('')}
      <path d="M${poles.map(([x, h]) => `${x} ${poleBase(x) - h * .9}`).join(' L')}" stroke-width=".35" fill="none"/></g>
      <path d="M76 77 L${76 + 26} ${77 + 9} L${76 + 22} ${77 + 11} Z" fill="${C.ink}" opacity=".35"/>${fig(76, 77, 1.05, C.ink, 1.2)}
      ${k === 3 ? `<g fill="#2a2825"><rect x="18" y="-1" width="1.2" height="9"/><rect x="13" y="7" width="11" height="5" rx="2.4"/></g>` : ''}
      ${k === 4 ? `<rect x="${W / 2 - 17}" y="${H - 9.5}" width="34" height="6.4" fill="#15130f"/><text x="${W / 2}" y="${H - 4.7}" text-anchor="middle" font-size="4.4" fill="#fbf9f3" style="font-variant-numeric:tabular-nums;letter-spacing:.06em">01:04:12:08</text>` : ''}`
  }

  // ---- the strip, in cqi: six frames with perforations and edge print
  const FW = 30, FH = 22.5, GAP = 2.2, RB = 6, P = FW + GAP, SH = FH + 2 * RB, LEAD = 6, SL = LEAD + 6 * P + 30
  const LBL = ['The idea', 'Development', 'A pilot script', 'Production', 'The edit', 'The finished film']
  const strip = () => { const holes = Array.from({ length: Math.ceil(SL / 3.1) }, (_, i) => [1.15, SH - 1.15 - 1.6].map(y => `<rect x="${(i * 3.1 + .6).toFixed(2)}" y="${y}" width="1.9" height="1.6" rx=".45"/>`).join('')).join('')
    const frames = LBL.map((t, k) => { const x = LEAD + k * P
      return `<svg x="${x}" y="${RB}" width="${FW}" height="${FH}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" overflow="hidden">${scene(k)}</svg>
        <text x="${x + .4}" y="${RB - 1.1}" font-size="1.45" fill="#d9b25a" style="letter-spacing:.14em;text-transform:uppercase">${t}</text>
        <text x="${x + FW - .4}" y="${SH - RB + 2.3}" text-anchor="end" font-size="1.3" fill="#d9b25a" style="letter-spacing:.1em">▸ ${k + 1}${k % 2 ? 'A' : ''}</text>` }).join('')
    return `<svg viewBox="0 0 ${SL} ${SH}" aria-hidden="true"><rect width="${SL}" height="${SH}" fill="#1c1a17"/><g fill="${HOLE}">${holes}</g>${frames}</svg>` }

  // ---- a red china marker, paper-wrapped, lying on the desk
  const chinaMarker = () => `<svg viewBox="-4 -8 136 22" aria-hidden="true">
    <path d="M3 9 L 128 9 L 120 14 L -2 14 Z" fill="rgb(21 19 15 / .16)"/><path d="M6 8 L 126 8 L 121 12 L 2 12 Z" fill="rgb(21 19 15 / .18)"/>
    <rect x="0" y="-5" width="104" height="10" rx="1.2" fill="#2a2724"/><rect x="0" y="-5" width="104" height="3" fill="#3d3935"/><rect x="0" y="2.6" width="104" height="2.4" fill="#1a1815"/>
    <g stroke="#f3e3da" stroke-width=".45" opacity=".75">${Array.from({ length: 16 }, (_, i) => `<path d="M${6 + i * 6} -5 L${2 + i * 6} 5"/>`).join('')}</g>
    <path d="M104 -5 L116 -2.2 Q 121 -.6, 121 0 Q 121 .6, 116 2.2 L104 5 Z" fill="#e3472d"/><path d="M104 -5 L116 -2.2 L 116 -1 L104 -2.4 Z" fill="#ef6a50"/>
    <path d="M104 -5.4 L104 5.4" stroke="#7a2414" stroke-width=".6"/><path d="M96 -5 C 99 -9, 104 -9, 108 -6.5" fill="none" stroke="#f3e3da" stroke-width=".5"/></svg>`

  cover('stages', { g: G, dark: false,
    art: (c) => {
      const sqr = c === 'square'
      const a = sqr ? -16 : -24, x0 = sqr ? -40 : -44, y0 = sqr ? 77 : 103   // left end of the strip, cqi
      const rad = a * Math.PI / 180, at = (s) => [x0 + s * Math.cos(rad), y0 + s * Math.sin(rad)]
      const Hh = sqr ? 100 : 125
      // the loop goes round the frame you're on; the arrow runs on along the strip and out the right edge
      const k = 1, [cx, cy] = at(LEAD + k * P + FW / 2)
      const loop = (() => { const rx = FW / 2 + 3.2, ry = FH / 2 + 3.4, pts = []
        for (let t = -2.3; t <= 4.25; t += .35) pts.push([cx + Math.cos(t) * rx * (1 + .05 * Math.sin(3 * t)), cy + Math.sin(t) * ry])
        return pts.map(([x, y]) => { const dx = x - cx, dy = y - cy; return [cx + dx * Math.cos(rad) - dy * Math.sin(rad), cy + dx * Math.sin(rad) + dy * Math.cos(rad)] }) })()
      const [ex, ey] = at(LEAD + 5 * P), off = SH / 2 + 3.4
      const nrm = [Math.sin(rad), -Math.cos(rad)]
      const start = at(LEAD + k * P + FW + 3), run = [[start[0] + nrm[0] * off, start[1] + nrm[1] * off], ...[1.4, 2.4, 3.6].map(m => { const q = at(LEAD + (k + m) * P); return [q[0] + nrm[0] * (off + Math.sin(m * 2) * .8), q[1] + nrm[1] * (off + Math.sin(m * 2) * .8)] }), [ex + nrm[0] * off + 12, ey + nrm[1] * off - 8]]
      return `<div class="cv-stages-strip" style="left:${x0}cqi;top:${y0 - SH / 2}cqi;width:${SL}cqi;transform:rotate(${a}deg)">${strip()}</div>
        <div class="cv-stages-tool" style="left:${sqr ? -6 : -8}cqi;top:${sqr ? 88 : 118}cqi;width:${sqr ? 44 : 52}cqi;transform:rotate(${a + 6}deg)">${chinaMarker()}</div>
        <div class="cv-stages-ink"><svg viewBox="0 0 100 ${Hh}" preserveAspectRatio="none" aria-hidden="true"><g fill="var(--marker)">${ink(loop, 1.1, 2)}${arrow(run, 1, 3.4, 4)}</g></svg></div>`
    },
    html: (c, i, n) => `${ctop('Where you’re at', i, n)}
      <div class="cv-stages-head mt-m">${S('display', 'You don’t need<br>a finished film.')}</div>
      ${S('subhead', 'There are opportunities you can apply for while you’re still writing, shooting or editing.', 'class="mt-s" style="max-inline-size:20ch"')}
      <div class="grow"></div>
      ${S('headline', 'Here are six, depending on where your project’s at.', 'style="max-inline-size:13ch;margin-left:auto;text-align:right"')}
      <div class="foot mt-s">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>`,
  })
}

// firstfilm: Post 05, "Making your first film?" The team's copy, verbatim; the last slide is closer().
// Four places to get money, so the thread is a route: one red marker line runs through the carousel,
// leaving each slide's right edge where the next one picks it up, and curls once around each stop's number.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .firstfilm-when { display: flex; align-items: center; gap: .55em; }
    .firstfilm-when .chip-dot { width: .6em; height: .6em; }
    .firstfilm-route { position: absolute; left: 0; top: 0; z-index: 1; overflow: visible; pointer-events: none; }
    .firstfilm-route path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .firstfilm-stop { position: absolute; z-index: 1; transform: translate(-50%, -50%) rotate(-4deg); color: var(--marker-text); --pd-type-ink: var(--marker-text); }
    .firstfilm-pen { position: absolute; z-index: 1; width: 2.2cqi; height: 2.2cqi; border-radius: 50%; background: var(--marker); transform: translate(-50%, -50%); }
    .firstfilm-tape { position: absolute; z-index: 3; width: 13cqi; height: 4cqi; background: rgb(251 249 243 / .62); box-shadow: 0 1px 2px rgb(21 19 15 / .12); }
    .firstfilm-card i.firstfilm-pin, .firstfilm-pin { position: absolute; z-index: 3; width: 3cqi; height: 3cqi; border-radius: 50%; background: var(--marker); box-shadow: inset -.4cqi -.5cqi 0 rgb(0 0 0 / .22), 0 .5cqi .7cqi rgb(21 19 15 / .35); }
    .firstfilm-cheque { position: relative; display: grid; grid-template-columns: 15cqi 1fr; background: var(--sheet); box-shadow: var(--lift); }
    .firstfilm-cheque .stub { padding: 3.4cqi 2.6cqi; border-right: .3cqi dashed rgb(21 19 15 / .3); display: grid; gap: 1.1cqi; align-content: start; }
    .firstfilm-cheque .stub i, .firstfilm-card i, .firstfilm-form i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .firstfilm-cheque .body { padding: 3.4cqi 4cqi 3cqi; display: grid; gap: .4cqi; }
    .firstfilm-cheque .row { display: flex; justify-content: space-between; align-items: baseline; }
    .firstfilm-cheque .micr { margin-top: 1.6cqi; letter-spacing: .32em; }
    .firstfilm-card { position: absolute; background: var(--sheet); box-shadow: var(--lift); padding: 2.6cqi 2.2cqi 3cqi; display: grid; gap: 1.1cqi; align-content: start; }
    .firstfilm-form { position: relative; background: var(--sheet); box-shadow: var(--lift); padding: 4cqi 4.6cqi 4.4cqi; display: grid; gap: .2cqi; }
    .firstfilm-form .head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.6cqi; margin-bottom: 1cqi; border-bottom: .3cqi solid var(--ink); }
    .firstfilm-form .row { display: grid; grid-template-columns: 4cqi 1fr auto; gap: 2cqi; align-items: baseline; padding: 1.5cqi 0; border-bottom: 1.5px solid var(--rule); }
    .firstfilm-form .row:last-of-type { border-bottom: 0; }
    .firstfilm-id { position: relative; background: var(--sheet); border-radius: 2cqi; overflow: hidden; box-shadow: var(--lift); }
    .firstfilm-id .band { display: flex; justify-content: space-between; align-items: center; background: var(--marker); color: var(--sheet); --pd-type-ink: var(--sheet); padding: 2.4cqi 3.4cqi; }
    .firstfilm-id .bd { display: grid; grid-template-columns: 15cqi 1fr; gap: 3cqi; padding: 3.4cqi; }
    .firstfilm-id .face { width: 15cqi; height: 19cqi; border-radius: 1cqi; background: #d9d3c7; position: relative; overflow: hidden; }
    .firstfilm-id .face::before { content: ""; position: absolute; left: 50%; top: 22%; width: 6.4cqi; height: 6.4cqi; margin-left: -3.2cqi; border-radius: 50%; background: #bdb5a6; }
    .firstfilm-id .face::after { content: ""; position: absolute; left: 50%; bottom: -4cqi; width: 12cqi; height: 10cqi; margin-left: -6cqi; border-radius: 50%; background: #bdb5a6; }
    .firstfilm-id .lines { display: grid; gap: 1.3cqi; align-content: center; }
    .firstfilm-id .lines i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .firstfilm-id .bar { display: flex; gap: .35cqi; height: 4cqi; margin-top: 1cqi; }
    .firstfilm-id .bar b { background: var(--ink); opacity: .8; }
  </style>`)

  /* ---- the route ---------------------------------------------------- */
  // A smooth path through points (Catmull-Rom, drawn as cubic Béziers).
  const smooth = (pts) => pts.map((p, k) => {
    if (!k) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`
    const a = pts[k - 2] || pts[k - 1], b = pts[k - 1], d = pts[k + 1] || p
    return `C${(b[0] + (p[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (p[1] - a[1]) / 6).toFixed(1)} ${(p[0] - (d[0] - b[0]) / 6).toFixed(1)} ${(p[1] - (d[1] - b[1]) / 6).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
  }).join('')
  // Every slide's line meets the edges at the same height, so slide k's exit is slide k+1's entry.
  const EDGE = { portrait: 1010, square: 838 }
  // One stretch of the route: from the left edge (or a pen-down dot) to the right edge, dipping by `dip`,
  // with one hand-drawn curl at x = `cx` that circles the stop number.
  const route = (c, n, { cx, dip, start = -20, r = 50 }) => {
    const W = 1080, H = c === 'square' ? 1080 : 1350, Y = EDGE[c]
    const base = (x) => Y + dip * Math.sin(Math.PI * Math.min(1, Math.max(0, x / W)))
    const drift = 30, cy = base(cx) - r
    const pts = []
    for (let x = start; x < cx - 26; x += 48) pts.push([x, base(x)])
    for (let k = 0; k <= 22; k++) {
      const f = k / 22, a = f * Math.PI * 2, rr = r * (1 + .07 * Math.sin(a * 3 + 1))
      pts.push([cx + rr * Math.sin(a) + drift * f, cy + rr * Math.cos(a)])
    }
    for (let x = cx + drift + 40; x < W + 60; x += 48) pts.push([x, base(x)])
    pts.push([W + 60, Y])
    const d = smooth(pts)
    return `<svg class="firstfilm-route" viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px" aria-hidden="true">
        <path d="${d}" stroke-width="7" opacity=".9"/><path d="${d}" stroke-width="2" opacity=".35" transform="translate(1.5 -1.2)"/></svg>
      ${start > 0 ? `<i class="firstfilm-pen" style="left:${start}px;top:${base(start)}px"></i>` : ''}
      <div class="firstfilm-stop" style="left:${cx + drift / 2}px;top:${cy + 2}px">${sp('headline', String(n))}</div>`
  }

  /* ---- the paperwork ------------------------------------------------ */
  const tape = (style) => `<i class="firstfilm-tape" style="${style}"></i>`
  const pin = (style) => `<i class="firstfilm-pin" style="${style}"></i>`

  // 1. A cheque with its stub still on.
  const chequeDoc = (w) => `<div class="firstfilm-cheque" style="width:${w}cqi">
    <div class="stub">${sp('metadata', 'No. 0001', 'class="soft"')}${bars(90, 70, 84, 48)}</div>
    <div class="body"><div class="row">${sp('metadata', 'Award', 'class="soft"')}${sp('metadata', 'No. 0001', 'class="soft"')}</div>
      <div class="ln" style="margin-top:1.4cqi">${sp('body', 'Pay')}<span class="lead"></span><span class="v">${circ(sp('headline', '£120,000'), 'wide', { l: '-9%', t: '-24%', w: '118%', h: '150%' })}</span></div>
      <div class="ln">${sp('body', 'For')}<span class="lead"></span><span class="v">${sp('label', 'A first documentary')}</span></div>
      <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span></span></div>
      ${sp('metadata', '0001 · 0100 · 0001', 'class="soft micr"')}</div></div>`

  // 2. Five award cards, pinned up in two rows: five first films.
  const five = (c) => {
    const sqr = c === 'square'
    const W = sqr ? 70 : 72, cw = sqr ? 12.6 : 22.5, ch = sqr ? 21 : 20
    const pos = sqr
      ? [[0, 3, -3], [14.3, 0, 2], [28.6, 2.5, -1], [42.9, 0, 3], [57.2, 3, -2]]
      : [[0, 0, -4], [24.5, 2.5, 2], [49, 0, -1.5], [12, 22, 3], [37, 23.5, -2.5]]
    return `<div style="position:relative;width:${W}cqi;height:${sqr ? 24 : 44}cqi;margin-right:${sqr ? 12 : 9}cqi">${pos.map(([x, y, r], k) => `<div class="firstfilm-card" style="left:${x}cqi;top:${y}cqi;width:${cw}cqi;height:${ch}cqi;transform:rotate(${r}deg)">
      <div style="display:grid;gap:1.6cqi;zoom:${sqr ? .56 : .8}">${sp('metadata', `Film ${k + 1} of 5`, 'class="soft"')}
      <div style="margin-top:1cqi">${k === (sqr ? 2 : 1) ? circ(sp('headline', '$5,000'), 'round', { l: '-14%', t: '-40%', w: '128%', h: '180%' }) : sp('headline', '$5,000')}</div>
      ${sqr ? '' : `<div style="display:grid;gap:1.3cqi;margin-top:1.4cqi">${bars(86, 58)}</div>`}</div>
      ${pin('left:50%;top:-1.2cqi;margin-left:-1.5cqi')}</div>`).join('')}</div>`
  }

  // 3. The fellowship's application, with the three facts filled in.
  const form = (w) => `<div class="firstfilm-form" style="width:${w}cqi">
    <div class="head">${sp('label', 'Michael Collyer Fellowship')}${sp('metadata', 'p. 1', 'class="soft"')}</div>
    ${[['1.', 'Age', circ(sp('label', '18 to 25'), 'wide', { l: '-12%', t: '-30%', w: '124%', h: '160%' })], ['2.', 'Script', sp('label', 'Original feature')], ['3.', 'Award', sp('label', '$10,000')], ['4.', 'Plus', sp('label', 'A mentor')]]
      .map(([n, k, v]) => `<div class="row">${sp('metadata', n, 'class="soft"')}${sp('body', k)}${v}</div>`).join('')}
    ${tape('left:50%;top:-2cqi;margin-left:-6.5cqi;transform:rotate(-3deg)')}</div>`

  // 4. A student card, with the lanyard slot and a barcode.
  const idDoc = (w) => `<div class="firstfilm-id" style="width:${w}cqi"><div class="band">${sp('label', 'Student')}${sp('metadata', '2026')}</div>
    <div class="bd"><i class="face"></i><div class="lines">${bars(92, 74, 56)}<div class="bar">${[3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1].map(x => `<b style="width:${x * .3}cqi"></b>`).join('')}</div></div></div></div>`

  /* ---- the slide ---------------------------------------------------- */
  const when = (t) => `<div class="firstfilm-when mt-s">${swatch}${sp('subhead', t)}</div>`
  const card = (label, head, subs, last, obj, o = {}) => ({ g: o.g,
    art: o.route ? (c) => route(c, o.n, sq(c, ...o.route)) : undefined,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, `class="mt-m ${o.hw || 'measure'}"`)}${subs.map((t) => S('subhead', t, 'class="mt-s wide"')).join('')}${last ? when(last) : ''}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${sq(c, 4, 3)}cqb">${obj ? obj(c) : ''}</div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  const SLIDES = [
    // Slide 1 is replaced by the cover poster (v2/covers/firstfilm.js); this stays as the fallback.
    card('First film', 'Making your first film?', ['Here are 4 places you could get money to make it!'], '',
      (c) => `<div style="transform:rotate(-1.5deg);zoom:${sq(c, 1.2, .9)}">${filmography(62)}</div>`, { g: 'var(--pink)' }),
    card('First documentary', '£120,000 for your first documentary.', ['The Whickers fund one director’s first documentary of 50 minutes or more.'], 'Free to enter. Opens 24 November.',
      (c) => `<div style="position:relative;transform:rotate(-2deg);zoom:${sq(c, .84, .82)};margin-left:${sq(c, 12, 0)}cqi">${chequeDoc(78)}</div>`,
      { g: 'var(--buff)', n: 1, route: [{ cx: 112, dip: 30, start: 44 }, { cx: 112, dip: 20, start: 44, r: 44 }] }),
    card('Directing debut', '$5,000 for your directing debut.', ['The WAVE Grant backs five first scripted films, each by a solo director.'], 'US residents only. Closes 15 November.',
      five, { g: 'var(--yellow)', n: 2, route: [{ cx: 966, dip: 60 }, { cx: 980, dip: 30, r: 40 }] }),
    card('Aged 18 to 25', '18 to 25? $10,000 and a mentor.', ['The Michael Collyer Fellowship, for an original feature script. US citizens and green-card holders.'], 'Closes 8 January.',
      (c) => `<div style="transform:rotate(1.5deg);zoom:${sq(c, 1, .8)};margin-left:${sq(c, 12, 14)}cqi">${form(70)}</div>`,
      { g: 'var(--blue)', n: 3, route: [{ cx: 112, dip: -30 }, { cx: 104, dip: 30, r: 40 }] }),
    card('Students', 'Still a student?', ['The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less.'], 'Closes 30 November.',
      (c) => `<div style="transform:rotate(-3deg);zoom:${sq(c, 1, .78)};margin-right:${sq(c, 10, 14)}cqi">${idDoc(60)}</div>`,
      { g: 'var(--green)', n: 4, route: [{ cx: 968, dip: 40 }, { cx: 968, dip: 40, r: 40 }] }),
    closer(),
  ]

  carousel('firstfilm', SLIDES, 'Making your first film? Here are 4 places you could get money to make it! £120,000 for your first documentary: the Whickers fund one director’s first documentary of 50 minutes or more. Free to enter. Opens 24 November. $5,000 for your directing debut: the WAVE Grant backs five first scripted films, each by a solo director. US residents only. Closes 15 November. 18 to 25? $10,000 and a mentor: the Michael Collyer Fellowship, for an original feature script. US citizens and green-card holders. Closes 8 January. Still a student? The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less. Closes 30 November. A red marker line runs from slide to slide like a route, circling a number at each of the four stops: a £120,000 cheque, five $5,000 award cards pinned up, a fellowship form and a student ID. Last slide: Call Sheet, by pitch.dog. Find film and TV grants, festivals, labs and fellowships, all in one place. Totally free! Comment Call Sheet and we will send you the link!')
}

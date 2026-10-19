// tz: Post 01, "Deadlines in your time zone". The team's copy, verbatim; the last slide is closer().
// The thread is one red marker line, drawn by hand across the carousel: it starts by circling a deadline
// in your time, leaves each slide's right edge where the next slide picks it up, and ends as the
// signature on the application. The grounds run from morning paper to evening blue, so the closer
// lands at midnight ink.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .tz-ink { position: absolute; left: 0; top: 0; z-index: 3; overflow: visible; pointer-events: none; }
    .tz-ink path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .tz-list header { padding: 2.4cqi 4cqi 2cqi; padding-right: 10cqi; }
    .tz-list .tz-row { display: grid; grid-template-columns: 12cqi 1fr auto; gap: 3cqi; align-items: center; padding: 1.9cqi 4cqi; border-bottom: 1.5px solid var(--rule); }
    .tz-list .tz-row:last-child { border-bottom: 0; }
    .tz-list .tz-row .d { display: grid; }
    .tz-list .tz-row .t { text-align: right; display: grid; gap: .5cqi; justify-items: end; }
    .tz-tag { display: inline-block; padding: .5em .7em .4em; background: #e7e3da; color: #55514a; --pd-type-ink: #55514a; }
    .tz-clocks { display: grid; grid-template-columns: 1fr 1fr; }
    .tz-clocks .cap { text-align: center; display: grid; gap: .8cqi; justify-items: center; }
    .tz-panel { background: var(--sheet); box-shadow: var(--lift); padding: 2.6cqi 4.4cqi 3cqi; display: grid; }
    .tz-panel .row { display: flex; flex-wrap: wrap; gap: 1.2cqi; margin-top: 1.2cqi; }
    .tz-panel .chip { padding: 1.25cqi 2.1cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
    .tz-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
    .tz-panel .chip.on::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .55em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
    .tz-panel .sec + .sec { margin-top: 1.8cqi; }
    .tz-panel .sec.gap { margin: 3cqi 0 1.2cqi; }
    .tz-panel .head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2cqi; margin-bottom: 2.4cqi; border-bottom: 3px solid var(--ink); }
    .tz-panel .head img { height: 5.6cqi; width: auto; }
    .tz-form { position: relative; background: var(--sheet); box-shadow: var(--lift); padding: 4cqi 4.6cqi 4.6cqi; display: grid; }
    .tz-form .head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.6cqi; margin-bottom: .6cqi; border-bottom: .3cqi solid var(--ink); }
    .tz-form .row { display: grid; grid-template-columns: 5cqi 1fr; gap: 2cqi; align-items: center; padding: 1.7cqi 0; border-bottom: 1.5px solid var(--rule); }
    .tz-form .row i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .tz-form .row .box { width: 3.4cqi; height: 3.4cqi; border: .3cqi solid rgb(21 19 15 / .35); border-radius: .4cqi; }
    .tz-form .sig { display: flex; align-items: flex-end; gap: 1.6cqi; margin-top: 3.4cqi; }
    .tz-form .sig > span:last-child { flex: 1; height: 7cqi; border-bottom: 2px solid var(--ink); }
    .tz-tape { position: absolute; width: 14cqi; height: 4.2cqi; background: rgb(251 249 243 / .6); box-shadow: 0 1px 2px rgb(21 19 15 / .14); }
  </style>`)

  const P_ = (c, a, b) => sq(c, a, b)
  // The standard grid: kicker, display headline, subhead lines, the object centred below, footer.
  const page = (label, head, subs, obj, o = {}) => ({ g: o.g, dark: o.dark,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, `class="mt-m" style="max-inline-size:${o.hw || '15ch'}"`)}
      ${subs.map((t, k) => S('subhead', t, `class="${k ? '' : 'mt-s'}" style="max-inline-size:${o.sw || '32ch'};text-wrap:${o.wrap || 'balance'}"`)).join('')}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${o.pt ?? 3}cqb">${typeof obj === 'function' ? obj(c) : obj}</div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  // 2. The list, soonest first, with the closing time worked out for someone in London.
  const row = (d, m, title, time, mark) => `<div class="tz-row"><div class="d">${sp('headline', d)}${sp('metadata', m, 'class="soft"')}</div>${S('label', title)}
    <div class="t" ${mark ? `data-tz="${mark}"` : ''}>${sp('headline', time)}${sp('metadata', 'Your time', 'class="soft"')}</div></div>`
  const tzList = (c) => `<div style="width:100%;transform:rotate(-1.2deg)"><div class="paper ear list tz-list"><span class="ear-flap"></span>
    <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${sp('metadata', 'Your time: London', 'class="soft"')}</header>
    ${row('3', 'Nov', 'TorinoFilmLab ScriptLab', '15:00')}${row('3', 'Nov', 'Sundance Merata Mita Fellowship', '23:30', 'a')}${c === 'square' ? '' : row('5', 'Nov', 'TorinoFilmLab FeatureLab', '15:00')}</div></div>`

  // 3. Midnight there is breakfast here.
  const clocks = (c) => `<div class="tz-clocks" style="width:${P_(c, 70, 58)}cqi;gap:${P_(c, 13, 12)}cqi">
    <div class="clock" style="transform:rotate(-3deg)"><div data-tz="f1" style="width:100%;border-radius:50%">${clockSvg(0, 0)}</div><div class="cap">${S('label', 'Midnight there')}${S('metadata', 'Los Angeles', 'class="soft"')}</div></div>
    <div class="clock" style="transform:rotate(2deg)"><div style="width:100%">${clockSvg(8, 0)}</div><div class="cap" data-tz="a">${S('label', '08:00 here')}${S('metadata', 'London', 'class="soft"')}</div></div></div>`

  // 4. The filters.
  const chips = (k, items, gap) => `<div class="sec${gap ? ' gap' : ''}">${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on, mark]) => `<span class="chip${on ? ' on' : ''}" ${mark ? `data-tz="${mark}"` : ''}>${sp('label', t)}</span>`).join('')}</div></div>`
  const filters = (c) => `<div class="tz-panel" style="width:100%;transform:rotate(1deg);${c === 'square' ? 'zoom:.88' : ''}">
    ${chips('Project type', [['Feature'], ['Documentary', 1], ['Series'], ['Short']])}
    ${chips('Based in', [['The UK', 1, 'a']], 1)}
    ${chips('Stage', [['Writing'], ['Development', 1], ['Production'], ['Post']])}</div>`

  // 5. The two reminders, one a week out and one the day before.
  const shortlist = (c) => `<div style="width:${P_(c, 100, 84)}%;display:grid;gap:${P_(c, 2.6, 2)}cqi;${c === 'square' ? 'zoom:.8;margin-bottom:6cqb' : ''}">
    <div style="width:92%;transform:rotate(-1.5deg)">${notif('27', 'A week to go: Merata Mita', 'Closes Tue 3 Nov, 23:30')}</div>
    <div style="width:92%;justify-self:end;transform:rotate(1.2deg)">${notif('2', 'Tomorrow: Merata Mita', 'Closes Tue 3 Nov, 23:30').replace('class="calic"', 'class="calic" data-tz="a"')}</div></div>`

  // 6. The application, still yours to do. The marker ends as the signature.
  const form = (c) => `<div style="position:relative;width:${P_(c, 74, 62)}cqi;transform:rotate(-1.5deg)"><div class="tz-form">
    <div class="head">${S('label', 'Application form')}${sp('metadata', 'Page 1 of 4', 'class="soft"')}</div>
    ${[[1, 62], [2, 84], [3, 48]].slice(0, P_(c, 3, 2)).map(([k, w]) => `<div class="row">${sp('metadata', `${k}.`, 'class="soft"')}<i style="width:${w}%"></i></div>`).join('')}
    <div class="sig">${sp('metadata', 'Signed', 'class="soft"')}<span data-tz="sig"></span></div></div>
    <i class="tz-tape" style="left:50%;top:-2cqi;margin-left:-7cqi;transform:rotate(-3deg)"></i></div>`

  const SLIDES = [
    page('Filmmaker friends', 'Filmmaker friends,', ['Ever wished grant and festival deadlines showed up in your own time zone?', 'Well, now they do.'], '', { g: 'var(--paper)' }),
    page('Introducing', 'Introducing Call Sheet.', ['Film and TV grants, festivals, labs and fellowships in one free list.', 'Soonest deadlines first, in your timezone.'], tzList, { g: 'var(--paper)', pt: 1.5 }),
    page('Time zones', '“Wait, is that midnight here or midnight there?”', ['When a fund gives us an exact closing time and time zone, Call Sheet shows what that means for you.'], clocks, { g: 'var(--goldenrod)', hw: '17ch' }),
    page('Filters', 'Find opportunities that fit what you’re making.', ['Choose your project type, where you’re based and what stage you’re at.', 'Then check who can apply, what it costs and what you need to send.'], filters, { g: 'var(--salmon)', hw: '17ch', pt: 1.5 }),
    page('Shortlist', 'Found a few worth applying to?', ['Save them to your shortlist.', 'Add the deadlines to your calendar.', 'Get a reminder a week before, <span style="white-space:nowrap">and the day before.</span>'], shortlist, { g: 'var(--pink)', wrap: 'pretty' }),
    page('Your part', 'You still have to do the application.', ['But hopefully, we’ve saved you some of the time you’d spend finding it and figuring it out.'], form, { g: 'var(--blue)' }),
    closer(),
  ]
  carousel('tz', SLIDES, 'Deadlines in your time zone. Filmmaker friends, ever wished grant and festival deadlines showed up in your own time zone? Well, now they do. Introducing Call Sheet: film and TV grants, festivals, labs and fellowships in one free list, soonest deadlines first, in your timezone. A printed list shows closing times worked out for someone in London, with one circled in red marker. “Wait, is that midnight here or midnight there?” Two clocks: midnight in Los Angeles, 08:00 in London. When a fund gives an exact closing time and time zone, Call Sheet shows what that means for you. Find opportunities that fit what you’re making: choose your project type, where you’re based and what stage you’re at, then check who can apply, what it costs and what you need to send. Save the ones worth applying to, add the deadlines to your calendar, and get a reminder a week before and the day before. You still have to do the application, but hopefully Call Sheet saves you some of the time you’d spend finding it and figuring it out. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')

  /* ------------------------------------------------------------ the marker line */
  // Where the line crosses from slide k to slide k + 1, as a share of the slide's height.
  const EDGE = { portrait: { 2: .74, 3: .745, 4: .865, 5: .865 }, square: { 2: .78, 3: .72, 4: .85, 5: .85 } }
  // Centripetal Catmull-Rom through the points: a smooth, hand-drawn line with no kinks where the spacing changes.
  const smooth = (p) => { const f = (n) => n.toFixed(1); let d = `M${f(p[0][0])} ${f(p[0][1])}`
    const dist = (u, v) => Math.max(1e-3, Math.sqrt(Math.hypot(v[0] - u[0], v[1] - u[1])))
    for (let k = 0; k < p.length - 1; k++) { const a = p[k - 1] || p[k], b = p[k], e = p[k + 1], g = p[k + 2] || e
      const d1 = dist(a, b), d2 = dist(b, e), d3 = dist(e, g)
      const c1 = k ? [0, 1].map(j => (d1 * d1 * e[j] - d2 * d2 * a[j] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * b[j]) / (3 * d1 * (d1 + d2))) : b
      const c2 = k < p.length - 2 ? [0, 1].map(j => (d3 * d3 * b[j] - d2 * d2 * g[j] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * e[j]) / (3 * d3 * (d3 + d2))) : e
      d += ` C${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(e[0])} ${f(e[1])}` }
    return d }
  // A loop around a box, the way a hand draws one: it opens a little and overshoots where it began.
  // Angles are on screen (y down): 0 is right, PI/2 is the bottom; a positive sweep runs clockwise.
  const loop = (r, { a0 = 0, sweep = 2.2 * Math.PI, pad = 14, grow = .12, tilt = -.05, n = 18, k = [1.14, 1.3] } = {}) => Array.from({ length: n + 1 }, (_, j) => {
    const t = j / n, a = a0 + sweep * t, s = 1 + grow * t, rx = (r.w / 2 * k[0] + pad) * s, ry = (r.h / 2 * k[1] + pad * .8) * s
    const x = rx * Math.cos(a), y = ry * Math.sin(a)
    return [r.cx + x * Math.cos(tilt) - y * Math.sin(tilt), r.cy + x * Math.sin(tilt) + y * Math.cos(tilt)] })
  // An arc round a centre, from angle a to angle b.
  const orbit = (cx, cy, R, a, b, n = 10) => Array.from({ length: n + 1 }, (_, j) => { const t = a + (b - a) * j / n; return [cx + R * Math.cos(t), cy + R * Math.sin(t)] })
  const into = (y) => [[-60, y], [10, y]]
  const out = (W, y) => [[W - 10, y], [W + 60, y]]
  const PI = Math.PI
  // Each slide's route, from the left edge (yIn) to the right edge (yOut), around its marked thing.
  const ROUTE = {
    // The pen goes down on the time that's yours, circles it, and runs off to the next slide.
    2: ({ W, a, yOut }) => [...loop(a, { a0: -.15 * PI, sweep: 2.25 * PI, pad: 12 }), [W - 40, yOut], ...out(W, yOut)],
    // In from the left, once round the clock that says midnight there, down between the two, and round 08:00 here.
    3: ({ W, c, f1, a, yIn, yOut }) => { const R = f1.w / 2 * (c === 'square' ? 1.32 : 1.24)
      return [...into(yIn), [f1.cx - R * 1.1, yIn - 18], ...orbit(f1.cx, f1.cy, R, 1.0 * PI, 2.05 * PI, 14), [a.x - 6, a.y - 30], ...loop(a, { a0: 1.3 * PI, sweep: 2.25 * PI, pad: 20, k: [1.14, 1.2], grow: .06, tilt: -.03 }), [a.x + a.w + 40, a.y - 40], [W - 50, yOut + 4], ...out(W, yOut)] },
    // Round "Based in: the UK", then out along the empty end of that row.
    4: ({ W, c, a, yIn, yOut }) => [...into(yIn), [a.x - 34, a.cy - 6], ...loop(a, { a0: .98 * PI, sweep: -2.5 * PI, pad: 10, k: [1.16, c === 'square' ? .98 : 1.12], grow: .04, tilt: -.02 }), [a.x + a.w + 90, a.cy + 22], [a.x + a.w + 220, a.cy + 6], [W * .8, a.cy + 10], [W - 60, (a.cy + yOut) / 2 + 30], [W - 10, yOut], ...out(W, yOut)],
    // Along the bottom, up round the day-before reminder, and on.
    5: ({ W, a, yIn, yOut }) => [...into(yIn), [a.x - 50, yIn - 6], ...loop(a, { a0: .62 * PI, sweep: -2.2 * PI, pad: 8, k: [1.12, 1.18] }), [a.x + a.w + 80, yOut - 4], [W * .6, yOut + 6], ...out(W, yOut)],
    // In along the bottom, up under the form, and it becomes the signature.
    6: ({ W, a, yIn }) => { const y = a.y + a.h - 14, x0 = a.x + 10, w = a.w * .72, h = a.h * .55
      const sig = [[0, .1], [.03, -.5], [.06, -1.1], [.085, -1.25], [.1, -.7], [.09, 0], [.12, -.55], [.16, -.2], [.2, -.75], [.24, -.1], [.29, -.65], [.33, -.05], [.38, -.7], [.42, -.15], [.47, -.5], [.53, 0], [.6, -.45], [.68, -.12], [.8, -.35], [.92, -.18], [1, -.28]]
      return [...into(yIn), [x0 - 90, yIn + 2], [x0 - 22, y + h * .3], ...sig.map(([u, v]) => [x0 + u * w, y + v * h])] },
  }
  const draw = (post) => {
    const id = post.dataset.id || ''; if (!id.startsWith('tz-')) return
    const i = +id.slice(3); const route = ROUTE[i]; if (!route) return
    const c = post.dataset.pdCanvas, W = post.clientWidth, H = post.clientHeight, pr = post.getBoundingClientRect()
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height, cx: r.left - pr.left + r.width / 2, cy: r.top - pr.top + r.height / 2 } }
    const a = box(post.querySelector('[data-tz="a"]') || post.querySelector('[data-tz="sig"]')), f1 = box(post.querySelector('[data-tz="f1"]'))
    const pts = route({ W, H, c, a, f1, yIn: EDGE[c][i - 1] * H, yOut: EDGE[c][i] * H })
    post.querySelector('.tz-ink')?.remove()
    post.insertAdjacentHTML('beforeend', `<svg class="tz-ink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${smooth(pts)}" style="stroke-width:${c === 'square' ? 7 : 8}px;opacity:.94"/></svg>`)
  }
  const redraw = () => document.querySelectorAll('.post[data-id^="tz-"]').forEach(draw)
  const root = document.querySelector('#root')
  if (root) new MutationObserver(() => { redraw(); document.fonts.ready.then(() => requestAnimationFrame(redraw)) }).observe(root, { childList: true })
}

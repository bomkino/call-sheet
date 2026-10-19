// tz: Post 01, "Deadlines in your time zone". The team's copy, verbatim; the last slide is closer().
// The thread is one red marker line, drawn by hand across the carousel: it starts by circling a deadline
// in your time, leaves each slide's right edge where the next slide picks it up, and ends as the
// signature on the application. The grounds run from morning paper to evening blue, so the closer
// lands at midnight ink.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .tz-ink { position: absolute; left: 0; top: 0; z-index: 3; overflow: visible; pointer-events: none; }
    .tz-ink path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .tz-list .tz-row { display: grid; grid-template-columns: 14cqi 1fr auto; gap: 3cqi; align-items: center; padding: 2.4cqi 4cqi; border-bottom: 1.5px solid var(--rule); }
    .tz-list .tz-row:last-child { border-bottom: 0; }
    .tz-list .tz-row .d { display: grid; }
    .tz-list .tz-row .t { text-align: right; display: grid; gap: .5cqi; justify-items: end; }
    .tz-tag { display: inline-block; padding: .5em .7em .4em; background: #e7e3da; color: #55514a; --pd-type-ink: #55514a; }
    .tz-clocks { display: grid; grid-template-columns: 1fr 1fr; }
    .tz-clocks .cap { text-align: center; display: grid; gap: .8cqi; justify-items: center; }
    .tz-panel { background: var(--sheet); box-shadow: var(--lift); padding: 3.6cqi 4.4cqi 4cqi; display: grid; }
    .tz-panel .row { display: flex; flex-wrap: wrap; gap: 1.2cqi; margin-top: 1.2cqi; }
    .tz-panel .chip { padding: 1.5cqi 2.1cqi 1.3cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
    .tz-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
    .tz-panel .chip.on::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .55em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
    .tz-panel .sec + .sec { margin-top: 2.6cqi; }
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
      ${subs.map((t, k) => S('subhead', t, `class="${k ? '' : 'mt-s'}" style="max-inline-size:${o.sw || '32ch'}"`)).join('')}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${o.pt ?? 3}cqb">${typeof obj === 'function' ? obj(c) : obj}</div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  // 2. The list, soonest first, with the closing time worked out for someone in London.
  const row = (d, m, title, time, mark) => `<div class="tz-row"><div class="d">${sp('headline', d)}${sp('metadata', m, 'class="soft"')}</div>${S('label', title)}
    <div class="t" ${mark ? `data-tz="${mark}"` : ''}>${sp('headline', time)}${sp('metadata', 'Your time', 'class="soft"')}</div></div>`
  const tzList = (c) => `<div style="width:100%;transform:rotate(-1.2deg)"><div class="paper ear list tz-list"><span class="ear-flap"></span>
    <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${sp('metadata', 'Your time: London', 'class="soft"')}</header>
    ${row('3', 'Nov', 'TorinoFilmLab ScriptLab', '15:00')}${row('3', 'Nov', 'Sundance Merata Mita Fellowship', '23:30', 'a')}${c === 'square' ? '' : row('5', 'Nov', 'TorinoFilmLab FeatureLab', '15:00')}</div></div>`

  // 3. Midnight there is breakfast here.
  const clocks = (c) => `<div class="tz-clocks" style="width:${P_(c, 70, 52)}cqi;gap:${P_(c, 12, 10)}cqi">
    <div class="clock" data-tz="c1" style="transform:rotate(-3deg)">${clockSvg(0, 0)}<div class="cap">${S('label', 'Midnight there')}${S('metadata', 'Los Angeles', 'class="soft"')}</div></div>
    <div class="clock" data-tz="c2" style="transform:rotate(2deg)">${clockSvg(8, 0)}<div class="cap"><span data-tz="a">${S('label', '08:00 here')}</span>${S('metadata', 'London', 'class="soft"')}</div></div></div>`

  // 4. The filters.
  const chips = (k, items) => `<div class="sec">${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on, mark]) => `<span class="chip${on ? ' on' : ''}" ${mark ? `data-tz="${mark}"` : ''}>${sp('label', t)}</span>`).join('')}</div></div>`
  const filters = (c) => `<div class="tz-panel" style="width:100%;transform:rotate(1deg)">
    ${chips('Project type', [['Feature'], ['Documentary', 1], ['Series'], ['Short']])}
    ${chips('Based in', [['The UK', 1, 'a']])}
    ${chips('Stage', [['Writing'], ['Development', 1], ['Production'], ['Post']])}</div>`

  // 5. The two reminders, one a week out and one the day before.
  const shortlist = (c) => `<div style="width:${P_(c, 100, 88)}%;display:grid;gap:${P_(c, 2.6, 2)}cqi">
    <div style="width:92%;transform:rotate(-1.5deg)">${notif('27', 'A week to go: Merata Mita', 'Closes Tue 3 Nov, 23:30')}</div>
    <div style="width:92%;justify-self:end;transform:rotate(1.2deg)" data-tz="a">${notif('2', 'Tomorrow: Merata Mita', 'Closes Tue 3 Nov, 23:30')}</div></div>`

  // 6. The application, still yours to do. The marker ends as the signature.
  const form = (c) => `<div style="position:relative;width:${P_(c, 74, 62)}cqi;transform:rotate(-1.5deg)"><div class="tz-form">
    <div class="head">${S('label', 'Application form')}${sp('metadata', 'Page 1 of 4', 'class="soft"')}</div>
    ${[[1, 62], [2, 84], [3, 48]].slice(0, P_(c, 3, 2)).map(([k, w]) => `<div class="row">${sp('metadata', `${k}.`, 'class="soft"')}<i style="width:${w}%"></i></div>`).join('')}
    <div class="sig">${sp('metadata', 'Signed', 'class="soft"')}<span data-tz="sig"></span></div></div>
    <i class="tz-tape" style="left:50%;top:-2cqi;margin-left:-7cqi;transform:rotate(-3deg)"></i></div>`

  const SLIDES = [
    page('Filmmaker friends', 'Filmmaker friends,', ['Ever wished grant and festival deadlines showed up in your own time zone?', 'Well, now they do.'], '', { g: 'var(--paper)' }),
    page('Introducing', 'Introducing Call Sheet.', ['Film and TV grants, festivals, labs and fellowships in one free list.', 'Soonest deadlines first, in your timezone.'], tzList, { g: 'var(--paper)' }),
    page('Time zones', '“Wait, is that midnight here or midnight there?”', ['When a fund gives us an exact closing time and time zone, Call Sheet shows what that means for you.'], clocks, { g: 'var(--yellow)', hw: '17ch' }),
    page('Filters', 'Find opportunities that fit what you’re making.', ['Choose your project type, where you’re based and what stage you’re at.', 'Then check who can apply, what it costs and what you need to send.'], filters, { g: 'var(--salmon)', hw: '17ch' }),
    page('Shortlist', 'Found a few worth applying to?', ['Save them to your shortlist.', 'Add the deadlines to your calendar.', 'Get a reminder a week before, and the day before.'], shortlist, { g: 'var(--pink)' }),
    page('Your part', 'You still have to do the application.', ['But hopefully, we’ve saved you some of the time you’d spend finding it and figuring it out.'], form, { g: 'var(--blue)' }),
    closer(),
  ]
  carousel('tz', SLIDES, 'Deadlines in your time zone. Filmmaker friends, ever wished grant and festival deadlines showed up in your own time zone? Well, now they do. Introducing Call Sheet: film and TV grants, festivals, labs and fellowships in one free list, soonest deadlines first, in your timezone. A printed list shows closing times worked out for someone in London, with one circled in red marker. “Wait, is that midnight here or midnight there?” Two clocks: midnight in Los Angeles, 08:00 in London. When a fund gives an exact closing time and time zone, Call Sheet shows what that means for you. Find opportunities that fit what you’re making: choose your project type, where you’re based and what stage you’re at, then check who can apply, what it costs and what you need to send. Save the ones worth applying to, add the deadlines to your calendar, and get a reminder a week before and the day before. You still have to do the application, but hopefully Call Sheet saves you some of the time you’d spend finding it and figuring it out. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')

  /* ------------------------------------------------------------ the marker line */
  // Where the line crosses from slide k to slide k + 1, as a share of the slide's height.
  const EDGE = { portrait: { 2: .80, 3: .66, 4: .88, 5: .70 }, square: { 2: .80, 3: .66, 4: .88, 5: .70 } }
  // Catmull-Rom through the points: a smooth, hand-drawn line.
  const smooth = (p) => { let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`
    for (let k = 0; k < p.length - 1; k++) { const a = p[k - 1] || p[k], b = p[k], e = p[k + 1], f = p[k + 2] || e, t = 1 / 6
      d += ` C${(b[0] + (e[0] - a[0]) * t).toFixed(1)} ${(b[1] + (e[1] - a[1]) * t).toFixed(1)}, ${(e[0] - (f[0] - b[0]) * t).toFixed(1)} ${(e[1] - (f[1] - b[1]) * t).toFixed(1)}, ${e[0].toFixed(1)} ${e[1].toFixed(1)}` }
    return d }
  // A loop around a box, the way a hand draws one: it opens a little and overshoots where it began.
  const loop = (r, { a0 = Math.PI * 1.05, sweep = -2.2 * Math.PI, pad = 16, grow = .14, tilt = -.05, n = 16 } = {}) => Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, a = a0 + sweep * t, s = 1 + grow * t, rx = (r.w / 2 * 1.14 + pad) * s, ry = (r.h / 2 * 1.3 + pad * .8) * s
    const x = rx * Math.cos(a), y = ry * Math.sin(a)
    return [r.cx + x * Math.cos(tilt) - y * Math.sin(tilt), r.cy + x * Math.sin(tilt) + y * Math.cos(tilt)] })
  const into = (W, y) => [[-40, y], [24, y]]
  const out = (W, y) => [[W - 24, y], [W + 40, y]]
  // Each slide's route, from the left edge (yIn) to the right edge (yOut), around its marked thing.
  const ROUTE = {
    2: ({ W, a, yOut }) => [...loop(a, { a0: -Math.PI * .62, sweep: 2.15 * Math.PI, pad: 14 }), [a.x + a.w + 50, a.cy + a.h * 1.1], [W - 70, yOut + 4], ...out(W, yOut)],
    3: ({ W, H, a, yIn, yOut }) => [...into(W, yIn), [W * .2, yIn + 10], [a.cx - a.w * .9, a.y + a.h + 34], ...loop(a, { a0: Math.PI * .8, sweep: -2.15 * Math.PI, pad: 14 }), [a.x + a.w + 60, a.cy + 10], [W - 70, yOut], ...out(W, yOut)],
    4: ({ W, a, yIn, yOut }) => [...into(W, yIn), [a.x - 60, a.cy + 30], ...loop(a, { a0: Math.PI * .85, sweep: -2.15 * Math.PI, pad: 12 }), [a.x + a.w + 70, a.y + a.h + 60], [W - 70, yOut], ...out(W, yOut)],
    5: ({ W, a, yIn, yOut }) => [...into(W, yIn), [a.x - 20, a.y - 30], ...loop({ ...a, w: a.h, cx: a.x + a.h * .9 }, { a0: Math.PI * .9, sweep: -2.1 * Math.PI, pad: 10 }), [a.x + a.h * 2.2, a.y + a.h + 40], [W - 70, yOut], ...out(W, yOut)],
    6: ({ W, a, yIn }) => { const y = a.y + a.h - 10, x0 = a.x + 8, w = a.w * .7
      const sig = [[0, 0], [.05, -.9], [.09, -1.3], [.11, -.5], [.1, .1], [.16, -.7], [.21, -.2], [.26, -.8], [.3, -.1], [.36, -.9], [.4, -.3], [.46, -.6], [.52, .05], [.6, -.5], [.7, -.15], [.84, -.4], [1, -.2]]
      return [...into(W, yIn), [W * .14, yIn + 20], [x0 - 40, y - 30], ...sig.map(([u, v]) => [x0 + u * w, y + v * a.h * .5])] },
  }
  const draw = (post) => {
    const id = post.dataset.id || ''; if (!id.startsWith('tz-')) return
    const i = +id.slice(3); const route = ROUTE[i]; if (!route) return
    const c = post.dataset.pdCanvas, W = post.clientWidth, H = post.clientHeight, pr = post.getBoundingClientRect()
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height, cx: r.left - pr.left + r.width / 2, cy: r.top - pr.top + r.height / 2 } }
    const a = box(post.querySelector('[data-tz="a"]') || post.querySelector('[data-tz="sig"]'))
    const pts = route({ W, H, c, a, yIn: EDGE[c][i - 1] * H, yOut: EDGE[c][i] * H })
    post.querySelector('.tz-ink')?.remove()
    post.insertAdjacentHTML('beforeend', `<svg class="tz-ink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${smooth(pts)}" style="stroke-width:${c === 'square' ? 7 : 8}px;opacity:.94"/></svg>`)
  }
  const redraw = () => document.querySelectorAll('.post[data-id^="tz-"]').forEach(draw)
  const root = document.querySelector('#root')
  if (root) new MutationObserver(() => { redraw(); document.fonts.ready.then(() => requestAnimationFrame(redraw)) }).observe(root, { childList: true })
}

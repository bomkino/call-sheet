// Post 10, Different Materials. The team's copy, verbatim; the last slide is closer().
// The thread: one red marker line keeping track. It runs under the three sticky-note questions,
// loops what you need to send on the Call Sheet card, runs under the checklist and passes the two
// calendar reminders to sign off under the last line. Each slide's line leaves the right edge at the
// height the next one comes in on the left (EDGE), so the swipe reads as one sheet.
{
  const K = 'materials'
  document.head.insertAdjacentHTML('beforeend', `<style>
    .${K}-thread { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
    .${K}-thread path { fill: none; stroke: var(--marker); stroke-width: 7.5; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-note { position: relative; background: var(--c, #f4df77); color: var(--ink); --pd-type-ink: var(--ink); padding: 3.2cqi 3.8cqi 3.6cqi;
      box-shadow: 0 1px 1px rgb(21 19 15 / .14), 0 1.4cqi 2cqi -1cqi rgb(21 19 15 / .38); }
    .${K}-note::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2.6cqi; background: rgb(21 19 15 / .045); }
    .${K}-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.8cqi 4.4cqi 2.4cqi; padding-right: 10cqi; border-bottom: 3px solid var(--ink); }
    .${K}-card header img { height: 6cqi; width: auto; }
    .${K}-card .f { display: grid; grid-template-columns: 30cqi 1fr; gap: 2cqi; align-items: center; padding: 1.7cqi 4.4cqi; border-bottom: 1.5px solid var(--rule); }
    .${K}-card .f i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .${K}-card .send { padding: 2.4cqi 4.4cqi 6.6cqi; display: grid; gap: 1.6cqi; }
    .${K}-chips { display: flex; flex-wrap: wrap; gap: 1.2cqi 4.4cqi; }
    .${K}-chips span { padding: 1.3cqi 2cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; white-space: nowrap; }
    .${K}-list li { display: grid; grid-template-columns: 6cqi 1fr; gap: 2.6cqi; align-items: center; padding: 1.5cqi 0; }
    .${K}-list li + li { border-top: 1.5px solid var(--rule); }
    .${K}-list svg { width: 6cqi; height: 6cqi; overflow: visible; }
    .${K}-list svg path { fill: none; stroke: var(--marker); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-list .done { text-decoration: line-through; text-decoration-color: var(--marker); text-decoration-thickness: .07em; opacity: .5; }
  </style>`)

  /* ---------------------------------------------------------------- the thread */
  // Points come from the laid-out page, so the line finds its marks at either size.
  // ops: ['in', y] / ['out', y] edges (fraction of height) · ['at', x, y] fractions of the canvas ·
  // ['by', name, fx, fy, dx, dy] a point on a marked element · ['loop', name, px, py, start°, turns] ·
  // ['under', name, dy] · ['z', 1 | 3] the line runs under the paperwork, or back on top, from there on.
  const thread = (spec) => [1, 3].map(z => `<svg class="${K}-thread" data-z="${z}" data-spec='${JSON.stringify(spec)}' style="z-index:${z}" aria-hidden="true"><path d=""/></svg>`).join('')
  const f = (n) => n.toFixed(1)
  const plot = (svg) => {
    const post = svg.closest('.post'); if (!post) return
    const P = post.getBoundingClientRect(), W = P.width, H = P.height
    const box = (n) => { const el = post.querySelector(`[data-${K}="${n}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - P.left, y: r.top - P.top, w: r.width, h: r.height } }
    const pts = []; let z = 3
    const push = (...q) => q.forEach(([x, y]) => pts.push([x, y, z]))
    for (const [op, ...a] of JSON.parse(svg.dataset.spec)) {
      if (op === 'z') { z = a[0]; continue }
      if (op === 'in') { push([-40, a[0] * H], [70, a[0] * H]); continue }
      if (op === 'out') { push([W - 70, a[0] * H], [W + 40, a[0] * H]); continue }
      if (op === 'at') { push([a[0] * W, a[1] * H]); continue }
      const b = box(a[0]); if (!b) continue
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2
      if (op === 'by') push([b.x + a[1] * b.w + (a[3] || 0), b.y + a[2] * b.h + (a[4] || 0)])
      if (op === 'loop') { const rx = b.w * .56 + (a[1] ?? 22), ry = b.h * .6 + (a[2] ?? 18), t0 = a[3] ?? 125, n = Math.round((a[4] ?? 1.1) * 8)
        for (let k = 0; k <= n; k++) { const s = 1 + k * .014, r = (t0 - k * 45) * Math.PI / 180; push([cx + Math.cos(r) * rx * s, cy + Math.sin(r) * ry * s]) } }
      if (op === 'under') { const y = b.y + b.h + (a[1] ?? 10); push([b.x - 6, y + 3], [b.x + b.w * .5, y - 1], [b.x + b.w + 10, y + 2]) }
    }
    // Catmull-Rom through the points; each piece is drawn on the layer its starting point asked for.
    let d = '', on = false
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i - 1] || pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] || c
      if (b[2] !== +svg.dataset.z) { on = false; continue }
      if (!on) { d += `M${f(b[0])} ${f(b[1])}`; on = true }
      d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.querySelector('path').setAttribute('d', d)
  }
  const drawAll = () => document.querySelectorAll(`svg.${K}-thread`).forEach(plot)
  const kick = () => { drawAll(); document.fonts.ready.then(() => requestAnimationFrame(drawAll)) }
  if (document.readyState === 'complete') kick(); else addEventListener('load', kick)
  document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(drawAll))

  // Where the line crosses from one slide into the next, as a fraction of the height: [portrait, square].
  const EDGE = { 23: [.845, .79], 34: [.78, .76], 45: [.668, .672] }
  const edge = (c, k) => sq(c, ...EDGE[k])
  const mark = (n) => `data-${K}="${n}"`

  /* ---------------------------------------------------------------- the paperwork */
  const note = (q, n, style) => `<div class="${K}-note" style="${style}" ${mark(n)}>${S('headline', q)}</div>`
  const box = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="6" width="28" height="28" rx="2" fill="none" stroke="rgb(21 19 15 / .38)" stroke-width="3"/></svg>'
  const item = (t, on) => `<li>${on ? tick : box}${S('headline', t, on ? 'class="done"' : '')}</li>`
  const field = (k, w) => `<div class="f">${sp('metadata', k, 'class="soft"')}<i style="width:${w}%"></i></div>`
  const nw = (t) => `<span style="white-space:nowrap">${t}</span>`
  const zone = (c, html, o = {}) => `<div class="grow" style="position:relative;display:flex;align-items:${o.a || 'center'};justify-content:${o.j || 'center'};padding:${sq(c, 3.4, 2.6)}cqb 0 ${sq(c, 3, 2)}cqb">${html}</div>`

  const SLIDES = [
    // 1. The cover poster replaces this slide (v2/covers/materials.js); kept simple so the count holds.
    slide('Materials', 'One film grant wants a treatment.', 'Another wants a script.<br>Another wants a budget in euros.<br>And you’re trying to keep track of all three.',
      (c) => c === 'square' ? '' : `<div class="scatter" style="width:84cqi;height:34cqi">${pileDoc('Treatment', 0, 6, -5, 26)}${pileDoc('Script', 33, 0, 3, 24)}<div style="position:absolute;left:58%;top:14%;transform:rotate(-3deg)">${finPlan(36)}</div></div>`, { g: 'var(--paper)', hw: 'wide' }),

    // 2. Three questions on three sticky notes; the line runs underneath them, joining them up.
    { g: 'var(--blue)',
      art: (c) => thread([['z', 1], ['by', 'q1', .5, .5], ['by', 'q1', .9, 1.15], ['by', 'q2', .3, -.1], ['by', 'q2', .5, .5], ['by', 'q2', .25, 1.1], ['by', 'q3', .75, -.1], ['by', 'q3', .5, .5], ['by', 'q3', 1.08, .75], ['at', .82, edge(c, 23) - .04], ['out', edge(c, 23)]]),
      html: (c, i, n) => `${ctop('Three questions', i, n)}
        ${zone(c, `<div style="width:100%;display:flex;flex-direction:column${c === 'square' ? ';zoom:.8' : ''}">
          ${note(`Which one needed the ${nw('two-page')} synopsis?`, 'q1', 'align-self:flex-start;width:84cqi;transform:rotate(-2.5deg)')}
          ${note('Was the director’s statement for this one?', 'q2', 'align-self:flex-end;width:80cqi;margin-top:-1.6cqi;--c:#f6bccd;transform:rotate(2deg)')}
          ${note('And when was it due?', 'q3', 'align-self:flex-start;width:50cqi;margin:-1.4cqi 0 0 4cqi;--c:#f8c99a;transform:rotate(-1.5deg)')}</div>`)}
        ${S('subhead', 'Finding the opportunity was apparently just the beginning.', 'class="wide"')}<div class="mt-m"></div>${foot()}` },

    // 3. Call Sheet's card for one opportunity: the useful details, and the line loops what you need to send.
    { g: 'var(--yellow)',
      art: (c) => thread([['in', edge(c, 23)], ['by', 'chips', .02, 1, 0, 20], ['by', 'chips', .4, 1, 0, 22], ['loop', 'euro', 2, 10, 160, 1.12], ['out', edge(c, 34)]]),
      html: (c, i, n) => `${ctop('Call Sheet', i, n)}${S('display', 'So we made Call Sheet.', 'class="mt-m wide"')}
        ${S('subhead', '180+ Film and TV funding opportunities with the useful details pulled together, including what you need to send.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${S('subhead', 'So you can work out what’s ready and what still needs writing.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${zone(c, `<div class="paper ear ${K}-card" style="--ear:7cqi;width:100%;transform:rotate(-1.2deg);zoom:${sq(c, .86, .78)}"><span class="ear-flap"></span>
          <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${sp('metadata', 'Film grant', 'class="soft"')}</header>
          ${c === 'square' ? '' : field('Who can apply', 72) + field('Deadline', 40)}
          <div class="send"><div>${sp('metadata', 'What you need to send', 'class="soft"')}</div><div class="${K}-chips" ${mark('chips')}>${['Treatment', 'Script', 'Budget in euros'].map((t, k) => `<span ${k === 2 ? mark('euro') : ''}>${sp('label', t)}</span>`).join('')}</div></div></div>`)}${foot()}` },

    // 4. Your own checklist. The line runs underneath it.
    { g: 'var(--green)',
      art: (c) => thread([['z', 1], ['in', edge(c, 34)], ['at', .5, (edge(c, 34) + edge(c, 45)) / 2], ['out', edge(c, 45)]]),
      html: (c, i, n) => `${ctop('Your checklist', i, n)}${S('display', 'Save the opportunities you’re interested in.', 'class="mt-m wide"')}
        ${S('subhead', 'Open each one to check the application materials.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${S('subhead', 'Tick things off as you get them ready. Your checklist stays saved on the same device.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${zone(c, `<div class="paper ear" style="--ear:6cqi;width:${sq(c, 100, 92)}%;padding:${sq(c, 2.6, 2)}cqi 5cqi;transform:rotate(1deg);zoom:${sq(c, .84, .72)}"><span class="ear-flap"></span>
          <ul class="${K}-list" style="list-style:none">${[['Treatment', 1], ['Script', 1], ['Two-page synopsis', 0], ['Budget in euros', 0]].map(([t, on]) => item(t, on)).join('')}</ul></div>`)}${foot()}` },

    // 5. The deadline in your calendar, two reminders, and the line signs off under the last line.
    { g: 'var(--buff)',
      art: (c) => thread([['in', edge(c, 45)], ['by', 'day', -.9, .9], ['loop', 'day', 4, 10, 160, 1.15]]),
      html: (c, i, n) => `${ctop('Your calendar', i, n)}${S('display', 'Add the deadlines to your calendar,', 'class="mt-m wide"')}
        ${S('subhead', 'with reminders a week before and the day before.', 'class="mt-xs wide"')}
        ${S('subhead', 'You still have to do the application.', 'class="mt-s wide"')}
        ${zone(c, `<div style="width:${sq(c, 92, 80)}%;display:grid;gap:${sq(c, 2.4, 1.8)}cqi${c === 'square' ? ';zoom:.82' : ''}">
          <div style="transform:rotate(-1.5deg)">${notif('24', 'A week to go', 'Reminder')}</div><div style="transform:rotate(1deg);margin-left:6cqi">${notif('30', 'Due tomorrow', 'Reminder').replace('<div class="calic"', `<div class="calic" ${mark('day')}`)}</div></div>`)}
        ${S('subhead', 'Hopefully, keeping track just got a little easier.', 'class="wide"')}<div class="mt-m"></div>${foot()}` },

    closer(),
  ]
  carousel(K, SLIDES, 'Different materials. One film grant wants a treatment, another wants a script, another wants a budget in euros, and you’re trying to keep track of all three. Which one needed the two-page synopsis? Was the director’s statement for this one? And when was it due? Call Sheet lists 180+ film and TV funding opportunities with the useful details pulled together, including what you need to send. Save the opportunities you’re interested in, open each one to check the application materials, and tick things off as you get them ready; the checklist stays saved on the same device. Add the deadlines to your calendar, with reminders a week before and the day before. A red marker line runs through the slides, under the sticky notes, around what to send and under the last line. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

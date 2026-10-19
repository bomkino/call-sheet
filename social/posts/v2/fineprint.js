// Post 04, The fine print. The team's copy, verbatim; the last slide is closer().
// The thread: one red marker line, a reader's pen working through the guidelines. It picks up on slide 2,
// loops the catches, slips through the crack, runs under the Call Sheet card, squiggles under the unclear
// rule and ends as a tick on the application form. Each slide's line leaves the right edge at the height
// the next one comes in on the left (EDGE), so the swipe reads as one sheet.
{
  const K = 'fineprint'
  document.head.insertAdjacentHTML('beforeend', `<style>
    .${K}-thread { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
    .${K}-thread path { fill: none; stroke: var(--marker); stroke-width: 7.5; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-row { display: grid; align-items: center; }
    .${K}-num { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.4cqi; border-bottom: 1.5px solid var(--rule-strong); }
    .${K}-slot { height: 4.4cqi; margin: .6cqi -1.4cqi; border: .3cqi dashed rgb(21 19 15 / .32); border-radius: .4em .8em .6em .3em; }
    .${K}-strip { position: absolute; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift-dark); padding: 1.2cqi 2.2cqi; }
    .${K}-flag { position: absolute; width: 11cqi; height: auto; overflow: visible; }
    .${K}-sig { position: absolute; left: 4%; bottom: .4cqi; width: 46%; height: 6cqi; overflow: visible; }
    .${K}-sig path { fill: none; stroke: #23324d; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-box { display: grid; grid-template-columns: 5cqi 1fr; gap: 2.4cqi; align-items: center; }
    .${K}-box > b { width: 5cqi; height: 5cqi; border: .45cqi solid rgb(21 19 15 / .5); border-radius: .5cqi; }
    .${K}-box > span { display: grid; gap: 1cqi; }
    .${K}-box > span i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .${K}-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.8cqi 4.4cqi 2.4cqi; padding-right: 10cqi; border-bottom: 3px solid var(--ink); }
    .${K}-card header img { height: 6cqi; width: auto; }
    .${K}-card .row { display: grid; grid-template-columns: 6cqi 1fr; gap: 1.6cqi; align-items: baseline; padding: 2.6cqi 4.4cqi; }
    .${K}-card .row + .row { border-top: 1.5px solid var(--rule); }
  </style>`)

  /* ---------------------------------------------------------------- the thread */
  // Points come from the laid-out page, so the line finds its marks at either size.
  // ops: ['in', y] / ['out', y] edges (fraction of height) · ['at', x, y] fractions of the canvas ·
  // ['by', name, fx, fy, dx, dy] a point on a marked element · ['loop', name, px, py] an e-shaped loop round it ·
  // ['under', name, dy] · ['wave', name, dy, n] a squiggle under it · ['tick', name] a tick into it (ends the line)
  // ['z', 1] sends the line under the paperwork from that point on, ['z', 3] brings it back on top.
  const thread = (spec) => [1, 3].map(z => `<svg class="${K}-thread" data-z="${z}" data-spec='${JSON.stringify(spec)}' style="z-index:${z}" aria-hidden="true"><path d=""/></svg>`).join('')
  const f = (n) => n.toFixed(1)
  const plot = (svg) => {
    const post = svg.closest('.post'); if (!post) return
    const P = post.getBoundingClientRect(), W = P.width, H = P.height
    const box = (n) => { const el = post.querySelector(`[data-${K}="${n}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - P.left, y: r.top - P.top, w: r.width, h: r.height } }
    const pts = []; let tail = '', z = 3
    const push = (...q) => q.forEach(([x, y]) => pts.push([x, y, z]))
    for (const [op, ...a] of JSON.parse(svg.dataset.spec)) {
      if (op === 'z') { z = a[0]; continue }
      if (op === 'in') { push([-40, a[0] * H], [70, a[0] * H]); continue }
      if (op === 'out') { push([W - 70, a[0] * H], [W + 40, a[0] * H]); continue }
      if (op === 'at') { push([a[0] * W, a[1] * H]); continue }
      const b = box(a[0]); if (!b) continue
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2
      if (op === 'by') push([b.x + a[1] * b.w + (a[3] || 0), b.y + a[2] * b.h + (a[4] || 0)])
      // a loop starts at angle a[3] (degrees, 0 = right, 90 = below) and goes round anticlockwise a[4] turns
      if (op === 'loop') { const rx = b.w * .56 + (a[1] ?? 22), ry = b.h * .6 + (a[2] ?? 18), t0 = a[3] ?? 125, n = Math.round((a[4] ?? 1.1) * 8)
        for (let k = 0; k <= n; k++) { const s = 1 + k * .014, r = (t0 - k * 45) * Math.PI / 180; push([cx + Math.cos(r) * rx * s, cy + Math.sin(r) * ry * s]) } }
      if (op === 'under') { const y = b.y + b.h + (a[1] ?? 10); push([b.x - 10, y + 3], [b.x + b.w * .45, y - 2], [b.x + b.w + 16, y + 2]) }
      if (op === 'wave') { const y = b.y + b.h + (a[1] ?? 10), n = a[2] || 7, amp = a[3] || 9
        for (let k = 0; k <= n; k++) push([b.x + b.w * k / n, y + (k % 2 ? -1 : 1) * amp * (k && k < n ? 1 : .3)]) }
      if (op === 'tick') { push([b.x + b.w * .1, b.y + b.h * .5], [b.x + b.w * .42, b.y + b.h * .86])
        tail = ` Q${f(b.x + b.w * .66)} ${f(b.y + b.h * .2)} ${f(b.x + b.w * 1.5)} ${f(b.y - b.h * .7)}` }
    }
    // Catmull-Rom through the points; each piece is drawn on the layer its starting point asked for.
    let d = '', on = false
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i - 1] || pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] || c
      if (b[2] !== +svg.dataset.z) { on = false; continue }
      if (!on) { d += `M${f(b[0])} ${f(b[1])}`; on = true }
      d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`
    }
    if (on && tail && pts[pts.length - 1][2] === +svg.dataset.z) d += tail
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.querySelector('path').setAttribute('d', d)
  }
  const drawAll = () => document.querySelectorAll(`svg.${K}-thread`).forEach(plot)
  const kick = () => { drawAll(); document.fonts.ready.then(() => requestAnimationFrame(drawAll)) }
  if (document.readyState === 'complete') kick(); else addEventListener('load', kick)
  document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(drawAll))

  // Where the line crosses from one slide into the next, as a fraction of the height: [portrait, square].
  const EDGE = { 23: [.75, .757], 34: [.7, .7], 45: [.77, .74], 56: [.69, .7] }
  const edge = (c, k) => sq(c, ...EDGE[k])
  const mark = (n) => `data-${K}="${n}"`

  /* ---------------------------------------------------------------- the paperwork */
  const hl = (html, extra = '') => `<div class="hl" style="margin:.8cqi 0" ${extra}>${html}</div>`
  const head = (l, r, cls = 'soft') => `<div class="${K}-num">${sp('metadata', l, `class="${cls}"`)}${sp('metadata', r, 'class="soft"')}</div>`
  // The guidelines page, the object the whole carousel reads from.
  const guide = (w, line) => `<div class="doc" style="width:${w}cqi;padding:4cqi 4.4cqi;gap:1.2cqi">${head('Guidelines', 'Page 6 of 6')}${bars(96, 88, 92, 70)}${hl(line)}${bars(90, 84, 58)}</div>`
  // A prize slip, clause 6.2: the money comes back later.
  const prize = (w) => `<div class="doc receipt" style="width:${w}cqi;padding:3.4cqi 4cqi 3.6cqi"><div class="${K}-num" style="border:0;padding:0">${sp('label', 'Prize')}${sp('metadata', '§ 6.2', 'class="soft"')}</div><hr>${bars(88, 64)}<div class="ln" style="margin-top:1.4cqi">${sp('body', 'Paid as')}<span class="lead"></span><span class="v">${sp('label', 'Reimbursement', mark('reimb'))}</span></div>${zz}</div>`
  // A participant's badge: the fee comes after selection.
  const badge = (w) => `<div class="idcard" style="width:${w}cqi"><div class="band" style="display:flex;justify-content:space-between">${sp('label', 'Participant')}${sp('metadata', '§ 9.1')}</div>
    <div class="id-body" style="grid-template-columns:13cqi 1fr;padding:3cqi 3.4cqi 3.4cqi"><i class="face" style="width:13cqi;height:15cqi"></i><div style="display:grid;gap:1.1cqi;align-content:center">${bars(84, 60, 72)}</div></div><div class="ln" style="padding:0 3.4cqi 3cqi">${sp('body', 'Fee')}<span class="lead"></span><span class="v">${sp('label', 'After selection', mark('after'))}</span></div></div>`
  const flag = (style) => `<svg class="${K}-flag" viewBox="0 0 44 60" style="${style}" aria-hidden="true"><path d="M4 58 V4" stroke="#15130f" stroke-width="3" stroke-linecap="round"/><path d="M5 5 C 16 1, 24 11, 40 6 L 36 18 L 41 30 C 25 35, 17 25, 5 29 Z" fill="#e3472d"/></svg>`
  const sig = `<svg class="${K}-sig" viewBox="0 0 100 24" aria-hidden="true"><path d="M2 18 C 8 2, 14 2, 12 16 C 11 22, 20 6, 26 10 C 30 13, 28 20, 34 14 C 40 8, 44 18, 52 12 C 58 8, 62 16, 70 11 C 78 7, 86 14, 98 8"/></svg>`
  const clause = (t) => `<div style="margin-bottom:1.2cqb">${sp('metadata', t, 'class="num"')}</div>`
  const nw = (t, n) => `<span style="white-space:nowrap" ${mark(n)}>${t}</span>`
  const clauseRow = (no, k, v, n) => `<div class="ln" style="padding:1.5cqi 0">${sp('metadata', no, 'class="num"')}${sp('body', k)}<span class="lead"></span><span class="v">${sp('label', v, mark(n))}</span></div>`
  const zone = (c, html, o = {}) => `<div class="grow" style="position:relative;display:flex;align-items:${o.a || 'center'};justify-content:${o.j || 'center'};padding:${sq(c, 3.4, 2.6)}cqb 0 ${sq(c, 3, 2)}cqb">${html}</div>`

  const SLIDES = [
    // 1. The cover poster replaces this slide (v2/covers/fineprint.js); kept simple so the count holds.
    slide('The fine print', 'Sometimes, film festivals and funding opportunities come with a catch.', 'It’s usually somewhere in the fine print.',
      (c) => c === 'square' ? '' : `<div style="transform:rotate(-2deg);zoom:.8">${guide(60, S('label', 'It’s usually somewhere in the fine print.'))}</div>`, { g: 'var(--goldenrod)', hw: 'wide' }),

    // 2. The two catches in full, then the page they come from: two clauses, and the pen loops what each one hides.
    { g: 'var(--paper)',
      art: (c) => thread([['loop', 'r', 16, 10, 160, 1.12], ['by', 'r', .1, 1.75], ['loop', 'p', 16, 10, 160, 1.12], ['out', edge(c, 23)]]),
      html: (c, i, n) => `${ctop('For example', i, n)}
        <div class="mt-m">${S('headline', 'Sometimes, a prize is a reimbursement.', 'class="wide"')}${S('subhead', 'You need to spend the money first.', 'class="mt-xs"')}</div>
        <div class="mt-m">${S('headline', 'Sometimes, programmes have a participation fee.', 'class="wide"')}${S('subhead', 'You pay it after you’re selected.', 'class="mt-xs"')}</div>
        ${S('subhead', 'These are useful things to know before you apply.', `class="mt-s wide soft"`)}
        ${zone(c, `<div style="width:${sq(c, 96, 90)}%;transform:rotate(-1.2deg)${c === 'square' ? ';zoom:.72' : ''}"><div class="doc" style="padding:2.6cqi 4.4cqi 2.6cqi;gap:.8cqi">${head('Guidelines', 'Page 6 of 6')}
          ${clauseRow('§ 6.2', 'Prize', 'Reimbursement', 'r')}${bars(70)}${clauseRow('§ 9.1', 'Participation fee', 'After selection', 'p')}</div></div>`)}${foot()}` },

    // 3. The turn, on ink: the highlighted line has slipped out of the page, and the pen drops through after it.
    { g: 'var(--ink)', dark: true,
      art: (c) => thread([['in', edge(c, 23)], ['by', 'slot', .12, .6], ['by', 'slot', .5, .64], ['by', 'slot', 1.06, .5], ['by', 'strip', .6, -.55], ['out', edge(c, 34)]]),
      html: (c, i, n) => `${ctop('The catch', i, n)}${S('display', 'None of that necessarily makes it a bad opportunity.', 'class="mt-m wide"')}
        ${S('subhead', 'But it might make it the wrong one for you, and very often this fine print slips through the cracks.', 'class="mt-s wide soft"')}${S('subhead', 'So, we found a way to make it easier', 'class="mt-s wide"')}
        ${zone(c, `<div style="position:relative;width:52cqi;margin-left:3cqi;transform:rotate(1.5deg);zoom:${sq(c, .92, .62)}">
          <div class="doc" style="width:100%;padding:3.4cqi 4cqi 4cqi;gap:1.1cqi">${head('Guidelines', 'Page 6 of 6')}${bars(94, 86, 92, 70)}<div class="${K}-slot" ${mark('slot')}></div>${bars(62)}</div>
          <div class="${K}-strip" style="left:44cqi;top:${sq(c, 70, 74)}%;width:48cqi;transform:rotate(-6deg)">${hl(S('label', 'Prizes are paid as reimbursement of expenses.'), mark('strip'))}</div></div>`, { j: 'flex-start', a: 'flex-start' })}${foot('Call Sheet, by pitch.dog', true)}` },

    // 4. Call Sheet, with the conditions pulled out onto one card. The line runs on underneath it.
    { g: 'var(--blue)',
      art: (c) => thread([['z', 1], ['in', edge(c, 34)], ['at', .5, (edge(c, 34) + edge(c, 45)) / 2], ['out', edge(c, 45)]]),
      html: (c, i, n) => `${ctop('Introducing', i, n)}${S('display', `Introducing ${circ('Call Sheet.', 'long', { ml: '.08em', l: '-5%', t: '-14%', w: '110%', h: '132%' })}`, 'class="mt-m wide"')}
        ${S('subhead', 'Film and TV funding opportunities, with the important conditions pulled out and explained plainly.', 'class="mt-s wide"')}
        ${zone(c, `<div class="paper ear ${K}-card" style="--ear:7cqi;width:100%;transform:rotate(-1.2deg)"><span class="ear-flap"></span><div style="padding:${sq(c, 1.6, 1)}cqi 0">
          ${['What you get.', 'What it costs.', 'What to check before applying.'].map((t, k) => `<div class="row" style="padding:${sq(c, 2.8, 2)}cqi 4.4cqi">${sp('label', `0${k + 1}`, 'class="num"')}${S('headline', t)}</div>`).join('')}</div></div>`)}${foot()}` },

    // 5. Two house rules on the paperwork. The pen comes in under the fee slip, squiggles under the unclear rule and plants a flag.
    { g: 'var(--yellow)',
      art: (c) => thread([['z', 1], ['in', edge(c, 45)], ['by', 'fee', .55, .55], ['by', 'fee', 1.06, .62], ['z', 3], ['by', 'rule', -.08, 1, 0, 20], ['wave', 'rule', 16, 8, 9], ['by', 'rule', 1.18, .9], ['out', edge(c, 56)]]),
      html: (c, i, n) => `${ctop('House rules', i, n)}${S('display', 'If a fee isn’t published, we say that.', 'class="mt-m wide"')}${S('display', 'If a rule is unclear, we flag it.', 'class="mt-s wide"')}
        ${S('subhead', 'You’ve got enough to figure out without making confident guesses.', 'class="mt-m wide"')}
        ${zone(c, `<div style="display:flex;gap:${sq(c, 7, 6)}cqi;align-items:center;zoom:${sq(c, .86, .72)}">
          <div style="position:relative;width:38cqi;transform:rotate(-2deg)" ${mark('fee')}><div class="doc receipt" style="padding:3.4cqi 4cqi 5cqi">${S('label', 'Entry fee')}<hr>${sp('headline', '— — —')}${zz}</div>${stamp('notpub', 'right:-5cqi;bottom:-2cqi;width:28cqi;transform:rotate(-9deg)')}</div>
          <div style="position:relative;width:40cqi;transform:rotate(2.5deg)"><div class="doc" style="padding:3.4cqi 4cqi 5.4cqi;gap:1.2cqi">${S('label', 'Eligibility')}${bars(92, 80)}<i style="width:78%;background:rgb(21 19 15 / .3)" ${mark('rule')}></i>${bars(64)}</div>${flag('right:-4cqi;top:-7cqi;transform:rotate(8deg)')}</div></div>`)}${foot()}` },

    // 6. Your call. The line comes in across the form and ends as a tick in its box.
    { g: 'var(--green)',
      art: (c) => thread([['in', edge(c, 56)], ['by', 'box', -1.4, .6], ['tick', 'box']]),
      html: (c, i, n) => `${ctop('Your call', i, n)}${S('display', 'If the terms work for you, apply.', 'class="mt-m wide"')}${S('subhead', 'If they don’t, hopefully we’ve saved you some time.', 'class="mt-s wide"')}
        ${zone(c, `<div style="position:relative;width:${sq(c, 72, 60)}cqi;transform:rotate(-1.5deg)"><div class="doc" style="padding:4cqi 4.6cqi;gap:1.3cqi">
          ${head('Application form', 'Page 1 of 1', '')}${bars(94, 82, 88, 56)}
          <div class="${K}-box" style="margin-top:2cqi"><b ${mark('box')}></b><span>${bars(86, 54)}</span></div>
          <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span style="position:relative">${sig}</span></div></div></div>`)}${foot()}` },

    closer(),
  ]
  carousel(K, SLIDES, 'The fine print. Sometimes, film festivals and funding opportunities come with a catch, usually somewhere in the fine print. Sometimes a prize is a reimbursement, so you spend the money first; sometimes a programme has a participation fee you pay after you’re selected. None of that makes it a bad opportunity, but it might make it the wrong one for you, and this fine print often slips through the cracks. Call Sheet pulls out the important conditions and explains them plainly: what you get, what it costs, what to check before applying. If a fee isn’t published, it says so; if a rule is unclear, it flags it. A red marker line runs through the slides, circling each catch and ending as a tick on an application form. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

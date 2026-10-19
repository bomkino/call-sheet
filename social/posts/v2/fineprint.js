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
    .${K}-strip { position: absolute; background: var(--sheet); box-shadow: var(--lift-dark); padding: 1.2cqi 2.2cqi; }
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
  const thread = (spec, z = 3) => `<svg class="${K}-thread" data-spec='${JSON.stringify(spec)}' style="z-index:${z}" aria-hidden="true"><path d=""/></svg>`
  const curve = (p) => p.slice(0, -1).reduce((d, b, i) => { const a = p[i - 1] || b, c = p[i + 1], e = p[i + 2] || c
    return d + ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}` }, `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`)
  const plot = (svg) => {
    const post = svg.closest('.post'); if (!post) return
    const P = post.getBoundingClientRect(), W = P.width, H = P.height
    const box = (n) => { const el = post.querySelector(`[data-${K}="${n}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - P.left, y: r.top - P.top, w: r.width, h: r.height } }
    const pts = []; let tail = ''
    for (const [op, ...a] of JSON.parse(svg.dataset.spec)) {
      if (op === 'in') { pts.push([-40, a[0] * H], [70, a[0] * H]); continue }
      if (op === 'out') { pts.push([W - 70, a[0] * H], [W + 40, a[0] * H]); continue }
      if (op === 'at') { pts.push([a[0] * W, a[1] * H]); continue }
      const b = box(a[0]); if (!b) continue
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2
      if (op === 'by') pts.push([b.x + a[1] * b.w + (a[3] || 0), b.y + a[2] * b.h + (a[4] || 0)])
      if (op === 'loop') { const rx = b.w * .58 + (a[1] ?? 22), ry = b.h * .62 + (a[2] ?? 18)
        ;[125, 80, 35, -10, -55, -100, -145, -190, -235, -275].forEach((t, k) => { const s = 1 + k * .012, r = t * Math.PI / 180
          pts.push([cx + Math.cos(r) * rx * s, cy + Math.sin(r) * ry * s]) }) }
      if (op === 'under') { const y = b.y + b.h + (a[1] ?? 10); pts.push([b.x - 10, y + 3], [b.x + b.w * .45, y - 2], [b.x + b.w + 16, y + 2]) }
      if (op === 'wave') { const y = b.y + b.h + (a[1] ?? 10), n = a[2] || 7
        for (let k = 0; k <= n; k++) pts.push([b.x + b.w * k / n, y + (k % 2 ? -1 : 1) * b.h * .09 * (k && k < n ? 1 : .3)]) }
      if (op === 'tick') { pts.push([b.x + b.w * .1, b.y + b.h * .5], [b.x + b.w * .42, b.y + b.h * .86])
        tail = ` Q${(b.x + b.w * .66).toFixed(1)} ${(b.y + b.h * .2).toFixed(1)} ${(b.x + b.w * 1.5).toFixed(1)} ${(b.y - b.h * .7).toFixed(1)}` }
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.querySelector('path').setAttribute('d', pts.length > 1 ? curve(pts) + tail : '')
  }
  const drawAll = () => document.querySelectorAll(`svg.${K}-thread`).forEach(plot)
  const kick = () => { drawAll(); document.fonts.ready.then(() => requestAnimationFrame(drawAll)) }
  if (document.readyState === 'complete') kick(); else addEventListener('load', kick)
  document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(drawAll))

  // Where the line crosses from one slide into the next, as a fraction of the height: [portrait, square].
  const EDGE = { 23: [.86, .86], 34: [.9, .9], 45: [.93, .9], 56: [.88, .86] }
  const edge = (c, k) => sq(c, ...EDGE[k])
  const mark = (n) => `data-${K}="${n}"`

  /* ---------------------------------------------------------------- the paperwork */
  const hl = (html, extra = '') => `<div class="hl" style="margin:.8cqi 0" ${extra}>${html}</div>`
  // The guidelines page, the object the whole carousel reads from.
  const guide = (w, line) => `<div class="doc" style="width:${w}cqi;padding:4cqi 4.4cqi;gap:1.2cqi"><div class="${K}-num">${sp('metadata', 'Guidelines', 'class="soft"')}${sp('metadata', 'Page 6 of 6', 'class="soft"')}</div>${bars(96, 88, 92, 70)}${hl(line)}${bars(90, 84, 58)}</div>`
  // A prize slip: the money comes back later.
  const prize = (w) => `<div class="doc receipt" style="width:${w}cqi;padding:3.4cqi 4cqi 3.4cqi"><div class="${K}-num" style="border:0;padding:0">${sp('label', 'Prize')}${sp('metadata', '§ 6.2', 'class="soft"')}</div><hr>${S('metadata', 'Paid as', 'class="soft"')}
    <div style="margin-top:1cqi">${sp('label', 'Reimbursement', mark('reimb'))}</div>${zz}</div>`
  // A participant's pass: the fee comes after selection.
  const badge = (w) => `<div class="pass" style="width:${w}cqi"><i class="slot"></i><div class="band">${sp('label', 'Participant')}</div>
    <div class="pass-body"><i class="face"></i>${bars(70, 52)}${S('metadata', 'Fee', 'class="soft mt-xs"')}${sp('label', 'After selection', mark('after'))}</div></div>`
  const flag = (style) => `<svg class="${K}-flag" viewBox="0 0 44 60" style="${style}" aria-hidden="true"><path d="M4 58 V4" stroke="#15130f" stroke-width="3" stroke-linecap="round"/><path d="M5 5 C 16 1, 24 11, 40 6 L 36 18 L 41 30 C 25 35, 17 25, 5 29 Z" fill="#e3472d"/></svg>`
  const sig = `<svg class="${K}-sig" viewBox="0 0 100 24" aria-hidden="true"><path d="M2 18 C 8 2, 14 2, 12 16 C 11 22, 20 6, 26 10 C 30 13, 28 20, 34 14 C 40 8, 44 18, 52 12 C 58 8, 62 16, 70 11 C 78 7, 86 14, 98 8"/></svg>`
  const foot2 = (dark) => foot('Call Sheet, by pitch.dog', dark)

  const SLIDES = [
    // 1. The cover poster replaces this slide (v2/covers/fineprint.js); kept simple so the count holds.
    slide('The fine print', 'Sometimes, film festivals and funding opportunities come with a catch.', 'It’s usually somewhere in the fine print.',
      (c) => `<div style="transform:rotate(-2deg)">${guide(sq(c, 70, 56), S('label', 'It’s usually somewhere in the fine print.'))}</div>`, { g: 'var(--goldenrod)', hw: 'wide' }),

    // 2. Two catches, zig-zag, each with its paperwork; the pen loops both and underlines the moral.
    { g: 'var(--paper)',
      art: (c) => thread([['by', 'reimb', -.12, .2, -10], ['loop', 'reimb', 18, 16], ['by', 'reimb', .3, 1, 0, sq(c, 90, 60)], ['loop', 'after', 18, 16], ['by', 'last', .05, 1, 0, 26], ['under', 'last', 12], ['out', edge(c, 23)]]),
      html: (c, i, n) => `${ctop('For example', i, n)}
        <div class="mt-m ${K}-row" style="grid-template-columns:1fr ${sq(c, 33, 27)}cqi;gap:${sq(c, 6, 5)}cqi">
          <div>${S('headline', 'Sometimes, a prize is a reimbursement.')}${S('subhead', 'You need to spend the money first.', 'class="mt-xs"')}</div>
          <div style="transform:rotate(3deg)">${prize(sq(c, 33, 27))}</div></div>
        <div class="grow" style="display:flex;align-items:center"><div class="${K}-row" style="width:100%;grid-template-columns:${sq(c, 29, 22)}cqi 1fr;gap:${sq(c, 7, 6)}cqi">
          <div style="transform:rotate(-3deg)${c === 'square' ? ';zoom:.8' : ''}">${badge(sq(c, 29, 27))}</div>
          <div>${S('headline', 'Sometimes, programmes have a participation fee.')}${S('subhead', 'You pay it after you’re selected.', 'class="mt-xs"')}</div></div></div>
        ${S('subhead', 'These are useful things to know before you apply.', `class="wide" ${mark('last')}`)}<div class="mt-m"></div>${foot2()}` },

    // 3. The turn, on ink: the highlighted line has slipped out of the page, and the pen goes after it.
    { g: 'var(--ink)', dark: true,
      art: (c) => thread([['in', edge(c, 23)], ['by', 'slot', .1, .5, 0, 0], ['by', 'slot', .9, .5], ['by', 'strip', .2, 1.6], ['loop', 'strip', 18, 14], ['out', edge(c, 34)]]),
      html: (c, i, n) => `${ctop('The catch', i, n)}${S('display', 'None of that necessarily makes it a bad opportunity.', 'class="mt-m wide"')}
        ${S('subhead', 'But it might make it the wrong one for you, and very often this fine print slips through the cracks.', 'class="mt-s wide soft"')}${S('subhead', 'So, we found a way to make it easier', 'class="mt-s wide"')}
        <div class="grow" style="position:relative;display:flex;align-items:center;justify-content:flex-start;padding:3cqb 0">${c === 'square' ? '' : `<div style="position:relative;width:56cqi;margin-left:6cqi;transform:rotate(1.5deg)">
          <div class="doc" style="width:100%;padding:3.4cqi 4cqi;gap:1.1cqi"><div class="${K}-num">${sp('metadata', 'Guidelines', 'class="soft"')}${sp('metadata', 'Page 6 of 6', 'class="soft"')}</div>${bars(94, 86, 70)}<div class="${K}-slot" ${mark('slot')}></div>${bars(90, 62)}</div>
          <div class="${K}-strip" style="left:46cqi;top:60%;width:40cqi;transform:rotate(-14deg)">${hl(S('label', 'Prizes are paid as reimbursement of expenses.'), mark('strip'))}</div></div>`}</div>${foot2(true)}` },

    // 4. Call Sheet, with the conditions pulled out onto one card. The line runs underneath.
    { g: 'var(--blue)',
      art: (c) => thread([['in', edge(c, 34)], ['at', .5, edge(c, 34) - .02], ['out', edge(c, 45)]], 1),
      html: (c, i, n) => `${ctop('Introducing', i, n)}${S('display', `Introducing ${circ('Call Sheet.', 'long', { ml: '.08em', l: '-5%', t: '-14%', w: '110%', h: '132%' })}`, 'class="mt-m wide"')}
        ${S('subhead', 'Film and TV funding opportunities, with the important conditions pulled out and explained plainly.', 'class="mt-s wide"')}
        <div class="grow" style="display:flex;align-items:center;padding:3cqb 0"><div class="paper ear ${K}-card" style="--ear:7cqi;width:100%;transform:rotate(-1.2deg)"><span class="ear-flap"></span>
          <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet"></header>
          ${['What you get.', 'What it costs.', 'What to check before applying.'].map((t, k) => `<div class="row">${sp('label', `0${k + 1}`, 'class="num"')}${S('headline', t)}</div>`).join('')}</div></div>${foot2()}` },

    // 5. Two house rules, shown on the paperwork. The pen squiggles under the unclear rule and plants a flag.
    { g: 'var(--yellow)',
      art: (c) => thread([['in', edge(c, 45)], ['by', 'rule', -.1, 1, 0, 30], ['wave', 'rule', 14, 8], ['by', 'rule', 1.15, .4], ['out', edge(c, 56)]]),
      html: (c, i, n) => `${ctop('House rules', i, n)}${S('display', 'If a fee isn’t published, we say that.', 'class="mt-m wide"')}${S('display', 'If a rule is unclear, we flag it.', 'class="mt-s wide"')}
        ${S('subhead', 'You’ve got enough to figure out without making confident guesses.', 'class="mt-m wide"')}
        <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:3cqb 0"><div style="display:flex;gap:${sq(c, 7, 6)}cqi;align-items:center;zoom:${sq(c, 1, .8)}">
          <div style="position:relative;width:38cqi;transform:rotate(-2deg)"><div class="doc receipt" style="padding:3.4cqi 4cqi 5cqi">${S('label', 'Entry fee')}<hr>${sp('headline', '— — —')}${zz}</div>${stamp('notpub', 'right:-5cqi;bottom:-2cqi;width:28cqi;transform:rotate(-9deg)')}</div>
          <div style="position:relative;width:38cqi;transform:rotate(2.5deg)"><div class="doc" style="padding:3.4cqi 4cqi 4.6cqi;gap:1.2cqi">${S('label', 'Eligibility')}${bars(92, 80)}<i style="width:78%;background:rgb(21 19 15 / .3)" ${mark('rule')}></i>${bars(64)}</div>${flag('right:-4cqi;top:-6cqi;transform:rotate(8deg)')}</div></div></div>${foot2()}` },

    // 6. Your call. The line ends as a tick on the application form.
    { g: 'var(--green)',
      art: (c) => thread([['in', edge(c, 56)], ['by', 'box', -.6, .9, 0, 0], ['tick', 'box']]),
      html: (c, i, n) => `${ctop('Your call', i, n)}${S('display', 'If the terms work for you, apply.', 'class="mt-m wide"')}${S('subhead', 'If they don’t, hopefully we’ve saved you some time.', 'class="mt-s wide"')}
        <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:3cqb 0"><div style="position:relative;width:${sq(c, 70, 58)}cqi;transform:rotate(-1.5deg)"><div class="doc" style="padding:4cqi 4.6cqi;gap:1.3cqi">
          <div class="${K}-num">${sp('label', 'Application form')}${sp('metadata', 'Page 1 of 1', 'class="soft"')}</div>${bars(94, 82, 88, 56)}
          <div class="${K}-box" style="margin-top:2cqi"><b ${mark('box')}></b><span>${bars(86, 54)}</span></div>
          <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span style="position:relative">${sig}</span></div></div></div></div>${foot2()}` },

    closer(),
  ]
  carousel(K, SLIDES, 'The fine print. Sometimes, film festivals and funding opportunities come with a catch, usually somewhere in the fine print. Sometimes a prize is a reimbursement, so you spend the money first; sometimes a programme has a participation fee you pay after you’re selected. None of that makes it a bad opportunity, but it might make it the wrong one for you, and this fine print often slips through the cracks. Call Sheet pulls out the important conditions and explains them plainly: what you get, what it costs, what to check before applying. If a fee isn’t published, it says so; if a rule is unclear, it flags it. A red marker line runs through the slides, circling each catch and ending as a tick on an application form. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

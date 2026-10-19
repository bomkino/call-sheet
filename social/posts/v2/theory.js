// theory: Post 02, "Conspiracy theory". The team's copy, verbatim; the last slide is closer().
// The thread is a case board's red string. Each slide's paperwork is pinned where the last slide's
// string can reach it, and the string runs from pin to pin, out of one slide and into the next,
// from the guidelines nobody can read to the official rules you'll still check.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .theory-board { position: absolute; inset: 0; z-index: 1; }
    .theory-board > * { position: absolute; }
    .theory-string { left: 0; top: 0; overflow: visible; pointer-events: none; }
    .theory-page { padding: 3.6cqi 4.2cqi 4cqi; gap: 1.6cqi; }
    .theory-page .hd { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.4cqi; border-bottom: 1.5px solid var(--rule-strong); }
    .theory-page .cl { display: grid; grid-template-columns: 6cqi 1fr; gap: 1.6cqi; align-items: start; }
    .theory-page .cl > div { display: grid; gap: 1.2cqi; padding-top: .6cqi; }
    .theory-ring { position: relative; justify-self: center; width: 86%; margin: 4.4cqi 0 3.6cqi; }
    .theory-ring > svg.loop { position: absolute; left: -10%; top: -36%; width: 120%; height: 172%; overflow: visible; }
    .theory-cut { border-top: .35cqi dashed rgb(21 19 15 / .45); }
    .theory-card { padding: 0; }
    .theory-card header { display: flex; justify-content: space-between; align-items: center; padding: 4cqi 3.6cqi 2.2cqi; border-bottom: 3px solid var(--ink); }
    .theory-card header img { height: 5.4cqi; width: auto; }
    .theory-card .in { padding: 3cqi 3.6cqi 3.6cqi; display: grid; gap: 1.8cqi; }
    .theory-card .in i { display: block; height: 1.6cqi; border-radius: 1cqi; background: rgb(21 19 15 / .2); }
    .theory-index { position: relative; background: #fbf9f3; box-shadow: var(--lift); padding: 4.6cqi 3cqi 4cqi 2cqi; background-image: repeating-linear-gradient(to bottom, transparent 0 calc(var(--lh) - 2px), rgb(76 123 217 / .22) calc(var(--lh) - 2px) var(--lh)); background-position: 0 calc(4.6cqi + var(--lh) * .84); }
    .theory-index::before { content: ""; position: absolute; left: 9.4cqi; top: 0; bottom: 0; width: 2px; background: rgb(227 71 45 / .55); }
    .theory-index .ticks { gap: 0; }
    .theory-index .ticks li { min-height: var(--lh); grid-template-columns: 6cqi 1fr; gap: 2.6cqi; }
    .theory-index .ticks li > div { white-space: nowrap; }
    .theory-index .ticks svg { width: 6cqi; height: 6cqi; }
    .theory-stack { position: absolute; inset: 0; background: var(--sheet); box-shadow: 0 1px 1px rgb(21 19 15 / .12), 0 3px 6px -2px rgb(21 19 15 / .16); }
    .theory-chip { display: inline-block; white-space: nowrap; padding: 1.1cqi 1.7cqi .9cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
    .theory-chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
    .theory-chip.on::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .5em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
    .theory-saved > div { display: grid; grid-template-columns: 4cqi 1fr; gap: 1.8cqi; align-items: center; padding: 1.6cqi 0; border-bottom: 1.5px solid var(--rule); }
    .theory-saved > div:last-child { border-bottom: 0; }
    .theory-saved svg { width: 4cqi; height: 4cqi; }
    .theory-saved i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
  </style>`)

  // The canvas is a fixed board: everything below is placed in pixels, on a 1080-wide slide.
  const at = (o, inner, cls = '') => `<div class="${cls}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;transform-origin:0 0;transform:rotate(${o.r || 0}deg) scale(${o.s || 1})">${inner}</div>`
  const page = (label, top, board, o = {}) => ({ g: o.g, dark: o.dark,
    art: (c) => `<div class="theory-board" data-theory="${o.n}">${board(c)}</div>`,
    html: (c, i, n) => `${ctop(label, i, n)}${top(c)}<div class="grow"></div>${o.bottom ? o.bottom(c) + '<div class="mt-m"></div>' : ''}${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })
  const head = (t, subs, hw = '15ch') => `${S('display', t, `class="mt-m" style="max-inline-size:${hw}"`)}${subs.map((s, k) => S('subhead', s, `class="${k ? '' : 'mt-s'}" style="max-inline-size:32ch;text-wrap:balance"`)).join('')}`

  // 2. A clause of guidelines that uses only easy words and still says nothing.
  const guide = (c) => `<div class="doc theory-page"><div class="hd">${sp('metadata', 'Guidelines, section 4', 'class="soft"')}</div>
    <div class="cl">${sp('label', '4.1', 'class="soft"')}<div>${c === 'square' ? bars(94) : bars(94, 58)}</div></div>
    <div class="theory-ring" ${c === 'square' ? 'style="width:80%;margin:5cqi 0 4.6cqi"' : ''}>${S(sq(c, 'subhead', 'body'), `${sp('label', '4.2', 'class="soft" style="margin-right:.5em"')}Applicants who are not ineligible may apply, unless clause 4.2 does not apply.`, 'style="text-wrap:balance;text-align:center;max-inline-size:none"')}${c === 'square' ? loopSvg('wide').replace('class="loop"', 'class="loop" style="top:-52%;height:204%;left:-11%;width:122%"') : loopSvg('wide')}</div>
    </div>`

  // 3. The fluff, cut off and falling away; what's left is plain.
  const scissors = `<svg viewBox="0 0 60 40" style="position:absolute;right:-4cqi;top:-3.2cqi;width:9cqi;transform:rotate(172deg)" aria-hidden="true"><g fill="none" stroke="#15130f" stroke-width="3" stroke-linecap="round"><circle cx="9" cy="10" r="6.5"/><circle cx="9" cy="30" r="6.5"/><path d="M14 13 L56 27 M14 27 L56 13"/></g><circle cx="33" cy="20" r="2" fill="#15130f"/></svg>`
  const fluff = (c) => `<div class="doc theory-cut" style="padding:3cqi 3.6cqi;gap:1.1cqi">${scissors}${['4.4', '4.5', '4.6', '4.7'].slice(0, sq(c, 4, 2)).map(k => `<div class="cl" style="display:grid;grid-template-columns:5cqi 1fr;gap:1.4cqi">${sp('metadata', k, 'class="soft"')}<div style="display:grid;gap:.9cqi">${bars(96, 90, 64)}</div></div>`).join('')}</div>`
  const plain = (c) => `<div class="paper ear theory-card"><span class="ear-flap"></span><header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet"></header><div class="in"><i style="width:72%"></i><i style="width:54%"></i><i style="width:64%"></i></div></div>`

  // 4. The five questions, ticked by hand on an index card.
  const QS = ['Can I apply?', 'What do I get?', 'What does it cost?', 'What do I need to send?', 'When’s the deadline?']
  const index = (c) => `<div class="theory-index" style="--lh:${sq(c, 12, 9.6)}cqi"><ul class="ticks">${QS.map(q => `<li>${tick}${S('headline', q)}</li>`).join('')}</ul></div>`

  // 5. Tell it, narrow it, save it, put it in the calendar.
  const chip = (t, on) => `<span class="theory-chip${on ? ' on' : ''}">${sp('label', t)}</span>`
  const tellIt = (c) => `<div class="doc" style="padding:4.4cqi 3cqi 3.4cqi;gap:1.2cqi">${S('metadata', 'Making', 'class="soft"')}<div style="display:flex;flex-wrap:wrap;gap:1cqi">${chip('Documentary', 1)}${c === 'square' ? '' : chip('Feature')}</div>
    ${S('metadata', 'Based in', 'class="soft mt-xs"')}<div>${chip('Canada', 1)}</div></div>`
  const flag = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" fill="${on ? '#e3472d' : 'none'}" stroke="${on ? '#e3472d' : 'rgb(21 19 15 / .35)'}" stroke-width="2" stroke-linejoin="round"/></svg>`
  const saved = () => `<div class="doc theory-saved" style="padding:2cqi 3cqi">${[[1, 80], [0, 62], [1, 70]].map(([on, w]) => `<div>${flag(on)}<i style="width:${w}%"></i></div>`).join('')}</div>`

  // 6. The official rules, still on the board.
  const rules = (c) => `<div style="position:relative"><i class="theory-stack" style="transform:rotate(4deg) translate(1.4cqi,-1cqi)"></i><i class="theory-stack" style="transform:rotate(-3deg) translate(-1cqi,.6cqi)"></i><div class="doc" style="padding:4cqi 4.4cqi;gap:1.3cqi"><div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:1.4cqi;border-bottom:1.5px solid var(--rule-strong)">${S('label', 'Official rules')}${sp('metadata', 'Page 1', 'class="soft"')}</div>${bars(96, 88, 92, 70, ...(c === 'square' ? [] : [94, 84, 58]))}</div></div>`

  // Where everything sits, per canvas: [x, y, width, rotation] in pixels. Pins are [x, y].
  const BOARD = {
    portrait: {
      2: { guide: { x: 90, y: 690, w: 900, r: -1.2 }, pins: [[540, 702]] },
      3: { fluff: { x: 400, y: 900, w: 540, r: 7 }, plain: { x: 96, y: 740, w: 560, r: -2.5 }, pins: [[380, 754]] },
      4: { index: { x: 52, y: 192, w: 1080, r: -1 }, pins: [[96, 912]], deco: [[96, 214]] },
      5: { tell: { x: 90, y: 790, w: 300, r: -3 }, saved: { x: 420, y: 846, w: 270, r: 2.5 }, cal: { x: 735, y: 800, w: 240, r: 4 }, pins: [[240, 806], [555, 862], [855, 826]] },
      6: { rules: { x: 230, y: 860, w: 620, r: -2 }, pins: [[540, 876]] },
    },
    square: {
      2: { guide: { x: 110, y: 572, w: 860, r: -1.2 }, pins: [[540, 584]] },
      3: { fluff: { x: 520, y: 740, w: 430, r: 8 }, plain: { x: 120, y: 580, w: 470, r: -2.5 }, pins: [[355, 596]] },
      4: { index: { x: 64, y: 150, w: 1060, r: -1 }, pins: [[104, 736]], deco: [[104, 172]] },
      5: { tell: { x: 100, y: 618, w: 290, r: -3, s: .86 }, saved: { x: 424, y: 652, w: 260, r: 2.5, s: .86 }, cal: { x: 730, y: 622, w: 220, r: 4, s: .9 }, pins: [[224, 630], [534, 664], [832, 648]] },
      6: { rules: { x: 260, y: 650, w: 560, r: -2 }, pins: [[540, 664]] },
    },
  }
  // The cover's string leaves its right edge from a pin at c, aiming for e (cqi; mirrors P.c and P.e in covers/theory.js). Slide 2 picks it up there.
  const COVER = { portrait: { c: [86, 60.5], e: [104, 63] }, square: { c: [85, 55], e: [104, 50] } }

  // The red string: one quadratic sag between each pair of pins, drawn on both slides it crosses.
  const W = 1080
  const chain = (c) => Object.entries(BOARD[c]).flatMap(([k, s]) => s.pins.map(([x, y]) => [x + (+k - 2) * W, y, +k]))
  const string = (c, n) => {
    const P = chain(c), off = (n - 2) * W, H = c === 'square' ? 1080 : 1350
    const segs = P.slice(1).map((b, k) => [P[k], b]).filter(([a, b]) => a[2] === n || b[2] === n)
    const d = segs.map(([a, b]) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), sag = 10 + L * .035
      return `M${a[0] - off} ${a[1]} Q${(a[0] + b[0]) / 2 - off} ${(a[1] + b[1]) / 2 + sag}, ${b[0] - off} ${b[1]}` }).join(' ')
    let lead = ''
    if (n === 2) { const q = 10.8, C = COVER[c], cc = [C.c[0] * q - W, C.c[1] * q], e = [C.e[0] * q - W, C.e[1] * q], L = Math.hypot(e[0] - cc[0], e[1] - cc[1])
      const k = [(cc[0] + e[0]) / 2, (cc[1] + e[1]) / 2 + L * .02], t = [(e[0] - k[0]) / L, (e[1] - k[1]) / L], p = P[0], L2 = p[0] - e[0]
      lead = `M${cc[0]} ${cc[1]} Q${k[0]} ${k[1]}, ${e[0]} ${e[1]} C${e[0] + t[0] * 45} ${e[1] + t[1] * 45}, ${p[0] - L2 * .45} ${p[1] + 34}, ${p[0]} ${p[1]}` }
    const pins = [...BOARD[c][n].pins, ...(BOARD[c][n].deco || [])].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="5" cy="9" rx="13" ry="9" fill="rgb(21 19 15 / .22)"/><circle r="13" fill="#c2381f"/><circle r="11" fill="#e3472d"/><circle cx="-4" cy="-4.5" r="3.6" fill="rgb(255 255 255 / .55)"/></g>`).join('')
    return `<svg class="theory-string" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path d="${lead} ${d}" fill="none" stroke="rgb(21 19 15 / .16)" stroke-width="4.6" stroke-linecap="round" transform="translate(4 9)"/>
      <path d="${lead} ${d}" fill="none" stroke="#c2381f" stroke-width="4.4" stroke-linecap="round"/>${pins}</svg>`
  }
  const board = (n, parts) => (c) => { const B = BOARD[c][n]; return parts(c, B) + string(c, n) }

  const SLIDES = [
    page('Conspiracy theory', (c) => head('Conspiracy theory:', ['Filmmaking grants and festival submissions are deliberately confusing, so you’re too tired to apply after reading the rules!!']), () => '', { g: 'var(--goldenrod)', n: 1 }),
    page('Exhibit A', (c) => head('Okay, maybe that’s not true.', ['But you can’t deny there are times when you understand every word in these “guidelines” but still have no idea what the sentence means.']),
      board(2, (c, B) => at(B.guide, guide(c))), { g: 'var(--salmon)', n: 2 }),
    page('Introducing', (c) => head('So, we cut the fluff.', ['Introducing Call Sheet.', 'Film and TV grants, fellowships, labs and festivals, explained in language you don’t need a PhD to understand.']),
      board(3, (c, B) => at(B.fluff, fluff(c)) + at(B.plain, plain(c))), { g: 'var(--paper)', n: 3 }),
    page('The questions', () => '',
      board(4, (c, B) => at(B.index, index(c))), { g: 'var(--yellow)', n: 4, bottom: () => S('subhead', 'The things you came to find out, in one place.', 'style="max-inline-size:32ch"') }),
    page('How it works', (c) => head('Tell it what you’re making and where you’re based.', ['Narrow down the list.', 'Save the opportunities you’re interested in.', 'Put the deadlines in your calendar.'], '17ch'),
      board(5, (c, B) => at(B.tell, tellIt(c)) + at(B.saved, saved()) + at(B.cal, calPlain('Tuesday', '3', 'November'))), { g: 'var(--green)', n: 5 }),
    page('Fair warning', (c) => head('You’ll still need to check the official rules before applying.', ['But hopefully, you’ll spend less time figuring out whether to apply in the first place.'], '17ch'),
      board(6, (c, B) => at(B.rules, rules(c))), { g: 'var(--blue)', n: 6 }),
    closer(),
  ]
  carousel('theory', SLIDES, 'Conspiracy theory: filmmaking grants and festival submissions are deliberately confusing, so you’re too tired to apply after reading the rules!! Okay, maybe that’s not true. But you can’t deny there are times when you understand every word in these “guidelines” but still have no idea what the sentence means. A page of guidelines pinned to a board, with one clause circled in red: “Applicants who are not ineligible may apply, unless clause 4.2 does not apply.” A red string runs from pin to pin through the carousel. So, we cut the fluff: introducing Call Sheet, film and TV grants, fellowships, labs and festivals, explained in language you don’t need a PhD to understand. An index card with five questions ticked in red: Can I apply? What do I get? What does it cost? What do I need to send? When’s the deadline? The things you came to find out, in one place. Tell it what you’re making and where you’re based, narrow down the list, save the opportunities you’re interested in and put the deadlines in your calendar. You’ll still need to check the official rules before applying, but hopefully you’ll spend less time figuring out whether to apply in the first place. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

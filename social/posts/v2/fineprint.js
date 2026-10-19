// Post 04, The fine print. The team's copy, verbatim; the paperwork carries the catch.
{
  // A slide whose copy is more than a headline: `top` is the text block, `obj` the paperwork below it.
  const page = (label, top, obj = '', o = {}) => ({ g: o.g, dark: o.dark, art: o.art,
    html: (c, i, n) => `${ctop(label, i, n)}<div class="mt-m">${typeof top === 'function' ? top(c) : top}</div>
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${o.pt ?? 3}cqb">${typeof obj === 'function' ? obj(c) : obj}</div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot('Call Sheet, by pitch.dog', o.dark)}` })
  const hl = (html) => `<div class="hl" style="margin:.8cqi 0">${html}</div>`

  document.head.insertAdjacentHTML('beforeend', `<style>
    .fineprint-row { display: grid; align-items: center; }
    .fineprint-slot { height: 4.6cqi; margin: .8cqi -1.4cqi; border: .3cqi dashed rgb(21 19 15 / .3); border-radius: .4em .8em .6em .3em; }
    .fineprint-flag { position: absolute; width: 11cqi; height: auto; overflow: visible; }
    .fineprint-sig { display: block; width: 46%; height: 6cqi; overflow: visible; }
    .fineprint-sig path { fill: none; stroke: #23324d; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  </style>`)

  // Guidelines, with one line highlighted. `line` is already-rendered type.
  const guide = (w, line, head = 'Guidelines, page 6 of 6') => `<div class="doc" style="width:${w}cqi;padding:4cqi 4.4cqi;gap:1.2cqi">${S('metadata', head, 'class="soft"')}${bars(96, 88, 92, 70, 94)}${hl(line)}${bars(90, 84, 58)}</div>`
  // A prize slip: the money comes back later.
  const prize = (w) => `<div class="doc receipt" style="width:${w}cqi;padding:3.4cqi 4cqi 3cqi">${S('label', 'Prize')}<hr>${S('metadata', 'Paid as', 'class="soft"')}
    <div style="margin-top:1.4cqi">${circ(sp('label', 'Reimbursement'), 'wide', { l: '-12%', t: '-34%', w: '124%', h: '168%' })}</div>${zz}</div>`
  // A participant's pass: the fee comes after selection.
  const badge = (w) => `<div class="pass" style="width:${w}cqi"><i class="slot"></i><div class="band">${sp('label', 'Participant')}</div>
    <div class="pass-body"><i class="face"></i>${bars(70, 52)}${S('metadata', 'Fee', 'class="soft mt-xs"')}${circ(sp('label', 'After selection'), 'wide', { l: '-10%', t: '-30%', w: '120%', h: '160%' })}</div></div>`
  const flag = (style) => `<svg class="fineprint-flag" viewBox="0 0 44 60" style="${style}" aria-hidden="true"><path d="M4 58 V4" stroke="#15130f" stroke-width="3" stroke-linecap="round"/><path d="M5 5 C 16 1, 24 11, 40 6 L 36 18 L 41 30 C 25 35, 17 25, 5 29 Z" fill="#e3472d"/></svg>`
  const squiggle = `<svg viewBox="0 0 100 6" preserveAspectRatio="none" style="display:block;width:78%;height:1.6cqi;margin-top:-.6cqi;overflow:visible" aria-hidden="true"><path d="M1 3 ${Array.from({ length: 16 }, (_, k) => `Q ${k * 6.2 + 4.1} ${k % 2 ? 6 : 0}, ${k * 6.2 + 7.2} 3`).join(' ')}" fill="none" stroke="#e3472d" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`

  const SLIDES = [
    // 1. The catch, and the line it hides in.
    page('The fine print',
      S('display', `Sometimes, film festivals and funding opportunities come with a ${circ('catch.', 'wide', { ml: '.1em', l: '-9%', t: '-10%', w: '118%', h: '126%' })}`, 'style="max-inline-size:15ch"'),
      (c) => `<div style="transform:rotate(-2deg)">${guide(sq(c, 78, 66), S('subhead', 'It’s usually somewhere in the fine print.'))}</div>`,
      { g: 'var(--goldenrod)' }),

    // 2. Two catches, each with its paperwork.
    page('For example', (c) => `<div style="display:grid;gap:${sq(c, 4.4, 3)}cqb">
        <div class="fineprint-row" style="grid-template-columns:1fr ${sq(c, 33, 27)}cqi;gap:${sq(c, 5, 4)}cqi">
          <div>${S('headline', 'Sometimes, a prize is a reimbursement.')}${S('subhead', 'You need to spend the money first.', 'class="mt-xs"')}</div>
          <div style="transform:rotate(3deg)">${prize(sq(c, 33, 27))}</div></div>
        <div class="fineprint-row" style="grid-template-columns:1fr ${sq(c, 29, 23)}cqi;gap:${sq(c, 5, 4)}cqi">
          <div>${S('headline', 'Sometimes, programmes have a participation fee.')}${S('subhead', 'You pay it after you’re selected.', 'class="mt-xs"')}</div>
          <div style="transform:rotate(-3deg)">${badge(sq(c, 29, 23))}</div></div></div>`,
      S('subhead', 'These are useful things to know before you apply.', 'class="wide" style="align-self:flex-end"'),
      { g: 'var(--paper)', pt: 0 }),

    // 3. The turn: on ink, the line slips out of the page.
    page('The catch',
      `${S('display', 'None of that necessarily makes it a bad opportunity.', 'style="max-inline-size:15ch"')}${S('subhead', 'But it might make it the wrong one for you, and very often this fine print slips through the cracks.', 'class="mt-s wide soft"')}${S('subhead', 'So, we found a way to make it easier', 'class="mt-s wide"')}`,
      (c) => c === 'square' ? '' : `<div style="position:relative;width:58cqi;margin-right:14cqi;transform:rotate(1.5deg)">
        <div class="doc" style="width:100%;padding:3.4cqi 4cqi;gap:1.1cqi">${S('metadata', 'Guidelines, page 6 of 6', 'class="soft"')}${bars(94, 86, 70)}<div class="fineprint-slot"></div>${bars(90, 62)}</div>
        <div class="doc" style="position:absolute;left:26cqi;top:62%;width:52cqi;padding:1.6cqi 2.6cqi;transform:rotate(-13deg)">${hl(S('label', 'Prizes are paid as reimbursement of expenses.'))}</div></div>`,
      { g: 'var(--ink)', dark: true }),

    // 4. Call Sheet, with the conditions pulled out onto one card.
    page('Introducing',
      `${S('display', `Introducing ${circ('Call Sheet.', 'long', { ml: '.08em', l: '-5%', t: '-14%', w: '110%', h: '132%' })}`, 'style="max-inline-size:15ch"')}${S('subhead', 'Film and TV funding opportunities, with the important conditions pulled out and explained plainly.', 'class="mt-s wide"')}`,
      (c) => `<div class="paper ear" style="--ear:7cqi;width:100%;transform:rotate(-1.2deg)"><span class="ear-flap"></span>
        <div style="padding:${sq(c, 3.4, 2.6)}cqi 5cqi">${[['What you get.', [84, 52]], ['What it costs.', [70, 40]], ['What to check before applying.', [90, 64]]].map(([t, b], k) => `<div style="padding:${sq(c, 2.4, 1.6)}cqi 0;${k ? 'border-top:1.5px solid var(--rule)' : ''};display:grid;gap:1.2cqi">
          <div style="display:flex;gap:2.4cqi;align-items:baseline">${sp('label', `0${k + 1}`, 'class="num"')}${S('headline', t)}</div>${c === 'square' ? '' : `<div class="doc" style="box-shadow:none;background:none;padding:0 0 0 5.4cqi;gap:1cqi">${bars(...b)}</div>`}</div>`).join('')}</div></div>`,
      { g: 'var(--blue)' }),

    // 5. Two house rules, shown on the paperwork.
    page('House rules',
      (c) => `${S('display', 'If a fee isn’t published, we say that.', 'style="max-inline-size:15ch"')}${S('display', 'If a rule is unclear, we flag it.', `class="mt-s" style="max-inline-size:15ch"`)}${S('subhead', 'You’ve got enough to figure out without making confident guesses.', 'class="mt-m wide"')}`,
      (c) => `<div style="display:flex;gap:${sq(c, 7, 6)}cqi;align-items:center;zoom:${sq(c, 1, .82)}">
        <div style="position:relative;width:40cqi;transform:rotate(-2deg)"><div class="doc receipt" style="padding:3.4cqi 4cqi 5cqi">${S('label', 'Entry fee')}<hr>${sp('headline', '— — —')}${zz}</div>${stamp('notpub', 'right:-5cqi;bottom:-2cqi;width:28cqi;transform:rotate(-9deg)')}</div>
        <div style="position:relative;width:38cqi;transform:rotate(2.5deg)"><div class="doc" style="padding:3.4cqi 4cqi;gap:1.2cqi">${S('label', 'Eligibility')}${bars(92, 80)}<i style="width:78%;background:rgb(21 19 15 / .3)"></i>${squiggle}${bars(64)}</div>${flag('right:-4cqi;top:-6cqi;transform:rotate(8deg)')}</div></div>`,
      { g: 'var(--salmon)' }),

    // 6. Your call: sign it, or put it down.
    page('Your call',
      `${S('display', 'If the terms work for you, apply.', 'style="max-inline-size:15ch"')}${S('subhead', 'If they don’t, hopefully we’ve saved you some time.', 'class="mt-s wide"')}`,
      (c) => `<div style="position:relative;width:${sq(c, 66, 54)}cqi;transform:rotate(-1.5deg)"><div class="doc" style="padding:4cqi 4.6cqi;gap:1.3cqi">${S('label', 'Application form')}${bars(94, 82, 88, 56)}
        <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span style="position:relative"><svg class="fineprint-sig" viewBox="0 0 100 24" style="position:absolute;left:4%;bottom:.4cqi" aria-hidden="true"><path d="M2 18 C 8 2, 14 2, 12 16 C 11 22, 20 6, 26 10 C 30 13, 28 20, 34 14 C 40 8, 44 18, 52 12 C 58 8, 62 16, 70 11 C 78 7, 86 14, 98 8"/></svg></span></div></div>
        ${stamp('checked', `right:-6cqi;top:-5cqi;width:${sq(c, 34, 28)}cqi;transform:rotate(8deg)`)}</div>`,
      { g: 'var(--green)' }),

    closer(),
  ]
  carousel('fineprint', SLIDES, 'The fine print. Sometimes, film festivals and funding opportunities come with a catch, usually somewhere in the fine print. Sometimes a prize is a reimbursement, so you spend the money first; sometimes a programme has a participation fee you pay after you’re selected. None of that makes it a bad opportunity, but it might make it the wrong one for you. Call Sheet pulls out the important conditions and explains them plainly: what you get, what it costs, what to check before applying. If a fee isn’t published, it says so; if a rule is unclear, it flags it. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

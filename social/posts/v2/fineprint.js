// Post 04, The fine print. The team's copy, verbatim; the last slide is closer().
// Calm pass: one object per slide in the same zone under the words, at most one red mark per slide.
// The thread is the paperwork itself: the guidelines page (slides 2–3) becomes the Call Sheet card
// (slides 4–5), which becomes the application form (slide 6), over a paper → ink → blue → yellow → green ground run.
{
  const K = 'fineprint'
  document.head.insertAdjacentHTML('beforeend', `<style>
    .${K}-num { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.4cqi; border-bottom: 1.5px solid var(--rule-strong); }
    .${K}-slot { height: 4.4cqi; margin: .6cqi -1.4cqi; border: .3cqi dashed rgb(21 19 15 / .32); border-radius: .4em .8em .6em .3em; }
    .${K}-strip { background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift-dark); padding: 1.2cqi 2.2cqi; }
    .${K}-sig { position: absolute; left: 4%; bottom: .4cqi; width: 46%; height: 6cqi; overflow: visible; }
    .${K}-sig path { fill: none; stroke: #23324d; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-box { display: grid; grid-template-columns: 5cqi 1fr; gap: 2.4cqi; align-items: center; }
    .${K}-box > b { position: relative; width: 5cqi; height: 5cqi; border: .45cqi solid rgb(21 19 15 / .5); border-radius: .5cqi; }
    .${K}-box > b svg { position: absolute; left: -10%; top: -45%; width: 140%; height: 140%; overflow: visible; }
    .${K}-box > b svg path { fill: none; stroke: var(--marker); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-box > span { display: grid; gap: 1cqi; }
    .${K}-box > span i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .${K}-card .row { display: grid; grid-template-columns: 6cqi 1fr; gap: 1.6cqi; align-items: baseline; padding: 2.6cqi 4.4cqi; }
    .${K}-card .row + .row { border-top: 1.5px solid var(--rule); }
    .${K}-card .kv { display: flex; justify-content: space-between; align-items: center; gap: 3cqi; padding: 3cqi 10cqi 3cqi 4.4cqi; }
    .${K}-card .kv + .kv { border-top: 1.5px solid var(--rule); }
    .${K}-card .kv .tag { margin: 0; }
  </style>`)

  /* ---------------------------------------------------------------- the paperwork */
  const hl = (html) => `<div class="hl" style="margin:.8cqi 0">${html}</div>`
  const head = (l, r) => `<div class="${K}-num">${sp('metadata', l, 'class="soft"')}${sp('metadata', r, 'class="soft"')}</div>`
  // The guidelines page, the object the carousel starts from.
  const guide = (w, line) => `<div class="doc" style="width:${w}cqi;padding:4cqi 4.4cqi;gap:1.2cqi">${head('Guidelines', 'Page 6 of 6')}${bars(96, 88, 92, 70)}${hl(line)}${bars(90, 84, 58)}</div>`
  // One clause row on that page; the catch itself is highlighted, not circled.
  const clauseRow = (no, k, v) => `<div class="ln" style="padding:1.4cqi 0">${sp('metadata', no, 'class="soft"')}${sp('body', k)}<span class="lead"></span><span class="v"><span class="hl" style="display:inline-block;padding:.4cqi .2cqi">${sp('label', v)}</span></span></div>`
  // The Call Sheet card, with the ear and its own rows.
  const card = (rows) => `<div class="paper ear ${K}-card" style="--ear:7cqi;width:100%;transform:rotate(-1deg)"><span class="ear-flap" style="--flap:#d8d2c4"></span><div style="padding:1.2cqi 0">${rows}</div></div>`
  const sig = `<svg class="${K}-sig" viewBox="0 0 100 24" aria-hidden="true"><path d="M2 18 C 8 2, 14 2, 12 16 C 11 22, 20 6, 26 10 C 30 13, 28 20, 34 14 C 40 8, 44 18, 52 12 C 58 8, 62 16, 70 11 C 78 7, 86 14, 98 8"/></svg>`
  const tickSvg = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 22 C 10 25, 13 29, 15 33 C 20 21, 27 11, 37 4"/></svg>'
  // The object zone: the same place on every slide, under the words and clear of the footer.
  const zone = (c, html) => `<div class="grow" style="display:flex;align-items:center;justify-content:center;padding:${sq(c, 4, 3)}cqb 0 ${sq(c, 4, 3)}cqb">${html}</div>`

  const SLIDES = [
    // 1. The cover poster replaces this slide (v2/covers/fineprint.js); kept simple so the count holds.
    slide('The fine print', 'Sometimes, film festivals and funding opportunities come with a catch.', 'It’s usually somewhere in the fine print.',
      (c) => c === 'square' ? '' : `<div style="transform:rotate(-1.5deg);zoom:.8">${guide(60, S('label', 'It’s usually somewhere in the fine print.'))}</div>`, { g: 'var(--goldenrod)', hw: 'wide' }),

    // 2. The two catches, then the page they come from: two clauses, each catch highlighted.
    { g: 'var(--paper)',
      html: (c, i, n) => `${ctop('For example', i, n)}
        <div class="mt-m">${S('headline', 'Sometimes, a prize is a reimbursement.', 'class="wide"')}${S('subhead', 'You need to spend the money first.', 'class="mt-xs"')}</div>
        <div class="${sq(c, 'mt-m', 'mt-s')}">${S('headline', 'Sometimes, programmes have a participation fee.', 'class="wide"')}${S('subhead', 'You pay it after you’re selected.', 'class="mt-xs"')}</div>
        ${S('subhead', 'These are useful things to know before you apply.', `class="${sq(c, 'mt-s', 'mt-xs')} wide soft"`)}
        ${zone(c, `<div style="width:${sq(c, 92, 96)}%${c === 'square' ? ';zoom:.84' : ''}"><div class="doc" style="padding:${sq(c, 2.8, 1.6)}cqi 4.4cqi;gap:.8cqi">${c === 'square' ? '' : head('Guidelines', 'Page 6 of 6')}
          ${clauseRow('§ 6.2', 'Prize', 'Reimbursement')}${bars(70)}${clauseRow('§ 9.1', 'Participation fee', 'After selection')}</div></div>`)}${foot()}` },

    // 3. The same page on ink: the highlighted line has slipped out of its place and lies below it.
    { g: 'var(--ink)', dark: true,
      html: (c, i, n) => `${ctop('The catch', i, n)}${S('display', 'None of that necessarily makes it a bad opportunity.', 'class="mt-m wide"')}
        ${S('subhead', 'But it might make it the wrong one for you, and very often this fine print slips through the cracks.', 'class="mt-s wide soft"')}${S('subhead', 'So, we found a way to make it easier', 'class="mt-s wide"')}
        ${zone(c, `<div style="display:grid;justify-items:start;gap:${sq(c, 2.4, 1.6)}cqi;width:${sq(c, 78, 70)}cqi;zoom:${sq(c, .84, .66)}">
          <div class="doc" style="width:56cqi;padding:3.4cqi 4cqi 4cqi;gap:1.1cqi">${head('Guidelines', 'Page 6 of 6')}${bars(94, 70)}<div class="${K}-slot"></div>${bars(62)}</div>
          <div class="${K}-strip" style="justify-self:end;width:46cqi;transform:rotate(-3deg)">${hl(c === 'square' ? `<div style="display:grid;gap:1.4cqi;padding:.8cqi 0">${[92, 58].map(w => `<i style="display:block;height:1.6cqi;border-radius:1cqi;background:rgb(21 19 15 / .22);width:${w}%"></i>`).join('')}</div>` : S('label', 'Prizes are paid as reimbursement of expenses.'))}</div></div>`)}${foot('Call Sheet, by pitch.dog', true)}` },

    // 4. Call Sheet: the conditions pulled out onto one card. The headline's loop is the slide's one red mark.
    { g: 'var(--blue)',
      html: (c, i, n) => `${ctop('Introducing', i, n)}${S('display', `Introducing ${circ('Call Sheet.', 'long', { ml: '.08em', l: '-5%', t: '-14%', w: '110%', h: '132%' })}`, 'class="mt-m wide"')}
        ${S('subhead', 'Film and TV funding opportunities, with the important conditions pulled out and explained plainly.', 'class="mt-s wide"')}
        ${zone(c, card(['What you get.', 'What it costs.', 'What to check before applying.'].map((t, k) => `<div class="row" style="padding:${sq(c, 2.6, 1.8)}cqi 4.4cqi">${sp('label', `0${k + 1}`, 'class="soft"')}${S('headline', t)}</div>`).join('')))}${foot()}` },

    // 5. The same card, saying what it doesn't know: a grey tag for the fee, one red tag for the unclear rule.
    { g: 'var(--yellow)',
      html: (c, i, n) => `${ctop('House rules', i, n)}${S('display', 'If a fee isn’t published, we say that.', 'class="mt-m wide"')}${S('display', 'If a rule is unclear, we flag it.', 'class="mt-s wide"')}
        ${S('subhead', 'You’ve got enough to figure out without making confident guesses.', 'class="mt-m wide"')}
        ${zone(c, `<div style="width:100%${c === 'square' ? ';zoom:.8' : ''}">${card(`<div class="kv">${S('subhead', 'Entry fee')}<span class="tag grey">${sp('metadata', 'Not published')}</span></div>
          <div class="kv">${S('subhead', 'Who can apply')}<span class="tag red">${sp('metadata', 'Unclear')}</span></div>`)}</div>`)}${foot()}` },

    // 6. Your call: the application form, with one tick in its box.
    { g: 'var(--green)',
      html: (c, i, n) => `${ctop('Your call', i, n)}${S('display', 'If the terms work for you, apply.', 'class="mt-m wide"')}${S('subhead', 'If they don’t, hopefully we’ve saved you some time.', 'class="mt-s wide"')}
        ${zone(c, `<div style="width:${sq(c, 72, 60)}cqi;transform:rotate(-1deg)"><div class="doc" style="padding:4cqi 4.6cqi;gap:1.3cqi">
          ${head('Application form', 'Page 1 of 1')}${bars(94, 82, 88, 56)}
          <div class="${K}-box" style="margin-top:2cqi"><b>${tickSvg}</b><span>${bars(86, 54)}</span></div>
          <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span style="position:relative">${sig}</span></div></div></div>`)}${foot()}` },

    closer(),
  ]
  carousel(K, SLIDES, 'The fine print. Sometimes, film festivals and funding opportunities come with a catch, usually somewhere in the fine print. Sometimes a prize is a reimbursement, so you spend the money first; sometimes a programme has a participation fee you pay after you’re selected. None of that makes it a bad opportunity, but it might make it the wrong one for you, and this fine print often slips through the cracks. Call Sheet pulls out the important conditions and explains them plainly: what you get, what it costs, what to check before applying. If a fee isn’t published, it says so; if a rule is unclear, it flags it. If the terms work for you, apply. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

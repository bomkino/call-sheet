// Post 03: Somewhere in this sentence. The team's copy, verbatim; the last slide is closer().
{
  document.head.insertAdjacentHTML('beforeend', `<style>
  .sentence-hl { background: rgb(244 223 119); -webkit-box-decoration-break: clone; box-decoration-break: clone; padding: 0 .14em; margin: 0 -.06em; border-radius: .12em .3em .18em .08em; }
  .sentence-doc { position: relative; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift); }
  .sentence-doc .rule { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.6cqi; border-bottom: 1.5px solid var(--rule-strong); }
  .sentence-doc i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
  .sentence-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.8cqi 4cqi 2.4cqi; padding-right: 10cqi; border-bottom: 3px solid var(--ink); }
  .sentence-card header img { height: 6cqi; width: auto; }
  .sentence-card .in { padding: 3.4cqi 4cqi 4cqi; }
  .sentence-panel { background: var(--sheet); box-shadow: var(--lift); padding: 3.6cqi 4cqi 4cqi; display: grid; gap: 1.4cqi; }
  .sentence-panel .row { display: flex; flex-wrap: wrap; gap: 1.2cqi; }
  .sentence-panel .chip { padding: 1.5cqi 2.1cqi 1.3cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
  .sentence-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
  .sentence-panel .chip.on::before { content: ""; display: inline-block; width: .75em; height: .75em; margin-right: .6em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
  .sentence-saved { display: grid; grid-template-columns: 6cqi 1fr; gap: 2.6cqi; align-items: center; padding: 2.6cqi 3.4cqi; background: var(--sheet); box-shadow: var(--lift); border-radius: 1.4cqi; }
  .sentence-saved svg { width: 6cqi; height: 6cqi; }
  .sentence-saved .b { display: grid; gap: 1.2cqi; }
  .sentence-saved .b i { display: block; height: 1.2cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
  .sentence-bell { width: 9cqi; height: 9cqi; border-radius: 2cqi; background: var(--marker); display: grid; place-items: center; }
  .sentence-bell svg { width: 5.4cqi; height: 5.4cqi; }
  .sentence-bell svg * { fill: none; stroke: var(--sheet); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  </style>`)

  const hl = (t) => `<span class="sentence-hl">${t}</span>`
  const lines = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const LEGAL = '“Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.”'

  // A page of guidelines with the one sentence that matters marked up in highlighter.
  const guideline = (c) => `<div class="sentence-doc" style="width:100%;padding:${sq(c, '3.6cqi 4.4cqi 4cqi', '3cqi 4cqi 3.4cqi')};transform:rotate(-1.4deg);display:grid;gap:${sq(c, 2.2, 1.6)}cqi">
    <div class="rule">${sp('metadata', 'Guidelines', 'class="soft"')}${sp('metadata', '§ 4.2', 'class="soft"')}</div>
    ${c === 'square' ? '' : `<div style="display:grid;gap:1.3cqi">${lines(94, 86, 62)}</div>`}
    ${S(sq(c, 'headline', 'subhead'), hl(LEGAL), 'style="max-inline-size:none"')}
    <div style="display:grid;gap:1.3cqi">${lines(90, 72)}</div></div>`

  // A pile of the paperwork one application can involve.
  const pile = (c) => `<div class="scatter" style="width:${sq(c, 86, 70)}cqi;height:${sq(c, 56, 30)}cqi">
    ${pileDoc('Guidelines', 0, 4, -6, sq(c, 32, 24))}${pileDoc('Eligibility', 34, 0, 3, sq(c, 30, 23))}${pileDoc('Terms and conditions', 66, 8, -2, sq(c, 30, 24))}
    ${pileDoc('FAQ', 6, 52, 4, sq(c, 26, 20))}${pileDoc('Annex B', 38, 50, -3, sq(c, 28, 22))}${pileDoc('Submission rules', 70, 56, 5, sq(c, 28, 21))}
    ${sticky('???', `position:absolute;left:${sq(c, 30, 32)}%;top:${sq(c, 30, 26)}%;transform:rotate(-8deg);padding:1.6cqi 2.6cqi`)}</div>`

  // Call Sheet's card: the five things you came to find out, highlighted in the team's own sentence.
  const card = (c) => `<div class="paper ear sentence-card" style="width:100%;transform:rotate(-1deg)"><span class="ear-flap"></span>
    <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet"></header>
    <div class="in">${S('body', 'With the useful details highlighted and simplified:', 'class="soft"')}
    ${S(sq(c, 'headline', 'subhead'), `${hl('Who can apply')}, ${hl('what you get')}, ${hl('what it costs')}, ${hl('what you need to send')}, and ${hl('the deadline')}—in your own timezone.`, `class="mt-xs" style="line-height:${sq(c, 1.08, 1.3)}"`)}</div></div>`

  // Filters: what you're making, where you're based, what stage it's at.
  const chips = (k, items) => `${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on]) => `<span class="chip${on ? ' on' : ''}">${sp('label', t)}</span>`).join('')}</div>`
  const filters = (c) => `<div class="sentence-panel" style="width:100%;transform:rotate(1deg)">
    ${chips('Project type', [['Feature'], ['Documentary', 1], ['Series'], ['Short'], ['Animation']])}
    <div class="mt-xs"></div>${chips('Based in', [['Canada', 1]])}
    <div class="mt-xs"></div>${chips('Stage', [['Writing'], ['Development', 1], ['Production'], ['Post']])}</div>`

  const bookmark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" fill="#e3472d"/></svg>`
  const bellSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`
  const saved = (w1, w2) => `<div class="sentence-saved">${bookmark}<div class="b"><i style="width:${w1}%"></i><i style="width:${w2}%;opacity:.6"></i></div></div>`
  const ping = (title, when) => `<div class="notif" style="grid-template-columns:9cqi 1fr"><div class="sentence-bell">${bellSvg}</div><div>${S('label', title)}${S('metadata', when, 'class="soft"')}</div></div>`
  const reminders = (c) => `<div style="width:100%;display:grid;gap:${sq(c, 2.4, 1.8)}cqi">
    <div style="transform:rotate(-1.2deg);display:grid;gap:1.6cqi">${saved(72, 46)}${c === 'square' ? '' : saved(58, 38)}</div>
    <div style="display:grid;gap:1.8cqi;margin-top:${sq(c, 2, 1)}cqi;transform:rotate(.8deg)">${ping('A week to go', 'Calendar reminder')}${ping('Due tomorrow', 'Calendar reminder')}</div></div>`

  // The official rules, read and stamped.
  const rules = (c) => `<div style="position:relative;width:${sq(c, 64, 52)}cqi;transform:rotate(-2deg)"><div class="sentence-doc" style="padding:4cqi 4.4cqi;display:grid;gap:1.4cqi">
    <div class="rule">${sp('metadata', 'Official rules', 'class="soft"')}</div>${lines(96, 88, 92, 70, 94, 84, 90, 58)}</div>
    ${stamp('checked', `right:-5cqi;bottom:${sq(c, 4, 2)}cqi;width:${sq(c, 40, 34)}cqi;transform:rotate(-9deg)`)}</div>`

  carousel('sentence', [
    { g: 'var(--blue)', html: (c, i, n) => `${ctop('Guidelines', i, n)}
      <div class="grow" style="display:flex;align-items:center;padding-top:${sq(c, 2, 1)}cqb">${guideline(c)}</div>
      ${S('headline', `Somewhere in this sentence is ${circ('$10,000', 'wide', { l: '-9%', t: '-16%', w: '118%', h: '134%' })} for your next film, and we want to help you find it!!`, `class="${sq(c, 'mt-m', 'mt-s')}" style="max-inline-size:${sq(c, '22ch', '26ch')}"`)}
      <div class="${sq(c, 'mt-m', 'mt-s')}"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` },
    slide('The problem', 'Film grants and festival submissions are confusing and tiresome.', 'And we want to make that process easier for filmmakers.', pile, { g: 'var(--salmon)', hw: 'wide' }),
    { g: 'var(--green)', html: (c, i, n) => `${ctop('Call Sheet', i, n)}${S('display', 'So we made Call Sheet.', 'class="mt-m measure"')}
      ${S('subhead', 'A free list of film and TV grants, festivals, labs and fellowships.', 'class="mt-s wide"')}
      <div class="grow" style="display:flex;align-items:center;padding-top:${sq(c, 3, 2)}cqb">${card(c)}</div>${foot()}` },
    { g: 'var(--yellow)', html: (c, i, n) => `${ctop('How it works', i, n)}${S('display', 'Start with what you’re making and where you’re based.', 'class="mt-m wide"')}
      ${S('subhead', 'Filter by project type and stage to find opportunities worth looking into.', 'class="mt-s wide"')}
      <div class="grow" style="display:flex;align-items:center;padding-top:3cqb">${c === 'square' ? `<div style="zoom:.86;width:100%">${filters(c)}</div>` : filters(c)}</div>${foot()}` },
    { g: 'var(--pink)', html: (c, i, n) => `${ctop('Save', i, n)}${S('display', 'Save the ones you’re interested in.', 'class="mt-m measure"')}
      ${S('subhead', 'Add the deadlines to your calendar.', 'class="mt-s wide"')}${S('subhead', 'Get reminders a week before and the day before.', 'class="wide"')}
      <div class="grow" style="display:flex;align-items:center;padding-top:3cqb">${reminders(c)}</div>${foot()}` },
    slide('Fair warning', 'You’ll still need to check the official rules.', 'We can’t do the whole application for you. But hopefully, we can save you some time discovering and translating these opportunities.', rules, { g: 'var(--buff)', hw: 'wide' }),
    closer(),
  ], 'Somewhere in this sentence is $10,000 for your next film. A page of guidelines with one sentence highlighted: “Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.” Film grants and festival submissions are confusing and tiresome, so pitch.dog made Call Sheet: a free list of film and TV grants, festivals, labs and fellowships, with who can apply, what you get, what it costs, what you need to send and the deadline highlighted and simplified, in your own timezone. Filter by project type and stage, save the ones you’re interested in, add the deadlines to your calendar and get reminders a week before and the day before. You’ll still need to check the official rules. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

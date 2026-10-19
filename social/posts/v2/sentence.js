// Post 03: Somewhere in this sentence. The team's copy, verbatim; the last slide is closer().
// Calm set: one simple object per slide in the same zone under the copy, at most one red mark,
// and the ground colours moving pink, green, blue, yellow, buff, then ink.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
  .sentence-hl { box-shadow: inset 0 -.6em 0 rgb(244 223 119); -webkit-box-decoration-break: clone; box-decoration-break: clone; padding: 0 .1em; margin: 0 -.04em; border-radius: .1em .24em .14em .06em; }
  .sentence-doc { position: absolute; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift); padding: 1.8cqi 3cqi 2.8cqi; display: grid; gap: 1.2cqi; align-content: start; }
  .sentence-doc i, .sentence-rules i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
  .sentence-doc .hd { padding-bottom: 1.2cqi; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: .4cqi; }
  .sentence-card .in { padding: 3cqi 4.4cqi 3.2cqi; }
  .sentence-card .in > :first-child { padding-right: 6cqi; }
  .sentence-list { line-height: 1.17; }
  .sentence-panel { background: var(--sheet); box-shadow: var(--lift); border-radius: 1.4cqi; padding: 3.4cqi 4.4cqi 3.8cqi; display: grid; gap: 1.2cqi; }
  .sentence-panel .row { display: flex; flex-wrap: wrap; align-items: center; gap: 1.4cqi 3cqi; margin-bottom: 1.2cqi; }
  .sentence-panel .row:last-child { margin-bottom: 0; }
  .sentence-panel.inline { grid-template-columns: 24cqi 1fr; align-items: center; row-gap: 2.8cqi; padding: 3.6cqi 4.4cqi; }
  .sentence-panel.inline .row { margin: 0; }
  .sentence-panel .chip { display: inline-block; padding: 1.3cqi 2.2cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; white-space: nowrap; }
  .sentence-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
  .sentence-cal { background: var(--sheet); box-shadow: var(--lift); border-radius: 1.2cqi; padding: 2.4cqi; }
  .sentence-cal .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.2cqi; }
  .sentence-cal .d { position: relative; border: 1.5px solid var(--rule); border-radius: .6cqi; padding: 1.6cqi 0 1.4cqi; display: grid; align-content: space-between; justify-items: center; }
  .sentence-cal .d.due { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
  .sentence-cal .d.due > svg.loop { position: absolute; left: -11%; top: -5%; width: 122%; height: 110%; overflow: visible; }
  .sentence-cal .bell { width: 4.2cqi; height: 4.2cqi; }
  .sentence-cal .bell * { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; opacity: .7; }
  .sentence-rules { background: var(--sheet); box-shadow: var(--lift); padding: 3.6cqi 4.6cqi 4.4cqi; display: grid; gap: 1.2cqi; }
  .sentence-rules .hd { padding-bottom: 1.6cqi; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: 1cqi; }
  .sentence-rules .cl { display: grid; grid-template-columns: 5.4cqi 1fr; gap: 1.6cqi; align-items: start; margin-top: .8cqi; }
  .sentence-rules .cl > div { display: grid; gap: 1.1cqi; padding-top: .5cqi; }
  </style>`)

  /* ---- a slide on the shared grid: kicker, the copy at the headline baseline, the object zone, the footer ---- */
  const page = (label, g, copy, zone) => ({ g,
    html: (c, i, n) => `${ctop(label, i, n)}<div class="mt-m">${copy(c)}</div>
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:${sq(c, 3.4, 2.6)}cqb 0 ${sq(c, 3, 2.6)}cqb">${zone(c)}</div>${foot()}` })
  const head = (t, hw = 'measure') => S('display', t, `class="${hw}"`)
  const sub = (t, first = true) => S('subhead', t, `class="${first ? 'mt-s' : 'mt-xs'} wide"`)
  const hl = (t) => `<span class="sentence-hl">${t}</span>`
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const LEGAL = '“Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.”'

  /* ---- slide 2: the paperwork one application can involve, as one stack ---- */
  const PILE = ['Guidelines', 'Eligibility', 'Terms and conditions', 'Submission rules']
  const pile = (c) => { const dy = sq(c, 5.6, 5.4), h = sq(c, 12.6, 12), w = sq(c, 76, 70)
    return `<div class="scatter" style="width:${w + 4}cqi;height:${dy * 3 + h}cqi">${PILE.map((l, k) => `<div class="sentence-doc" style="left:${[2, 0, 3, 1][k]}cqi;top:${k * dy}cqi;width:${w}cqi;height:${h}cqi;overflow:hidden;transform:rotate(${[-1.2, .6, -.5, .7][k]}deg)"><div class="hd">${sp('metadata', l)}</div>${bars(96, 84, 62)}</div>`).join('')}</div>` }

  /* ---- slide 3: Call Sheet's card, with the five things you came to find out highlighted ---- */
  const card = (c) => `<div class="paper ear sentence-card" style="width:100%;transform:rotate(-.8deg)"><span class="ear-flap"></span>
    <div class="in">${S('label', 'With the useful details highlighted and simplified:', 'class="soft"')}
    ${S(sq(c, 'headline', 'subhead'), `${hl('Who can apply')}, ${hl('what you get')}, ${hl('what it costs')}, ${hl('what you need to send')}, and ${hl('the deadline')}—in your own time zone, when it’s given.`, 'class="mt-xs sentence-list"')}</div></div>`

  /* ---- slide 4: the filters, with what you're making circled ---- */
  const chip = (t, on, ring) => { const h = `<span class="chip${on ? ' on' : ''}">${sp('label', t)}</span>`
    return ring ? circ(h, 'wide', { l: '-11%', t: '-26%', w: '122%', h: '152%' }) : h }
  const chips = (k, items) => `${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on, ring]) => chip(t, on, ring)).join('')}</div>`
  const filters = (c) => `<div class="sentence-panel${sq(c, '', ' inline')}" style="width:100%">
    ${chips('Project type', sq(c, [['Feature'], ['Documentary', 1, 1], ['Series'], ['Short']], [['Feature'], ['Documentary', 1, 1], ['Series']]))}
    ${chips('Based in', [['US'], ['UK'], ['Canada', 1]])}
    ${chips('Stage', sq(c, [['Writing'], ['Development', 1], ['Production'], ['Post']], [['Writing'], ['Development', 1], ['Post']]))}</div>`

  /* ---- slide 5: two weeks on the calendar: the deadline circled, a reminder a week before and the day before ---- */
  const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const bellSvg = `<svg class="bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`
  const cal = (c) => `<div class="sentence-cal" style="width:100%"><div class="grid">
    ${Array.from({ length: 14 }, (_, k) => k + 13).map((d, k) => `<div class="d${d === 20 ? ' due' : ''}" style="height:${sq(c, 16, 12.4)}cqi">${sp('metadata', WD[(k + 1) % 7], 'class="soft"')}${sp('subhead', d)}${d === 13 || d === 19 ? bellSvg : '<span class="bell"></span>'}${d === 20 ? loopSvg('round') : ''}</div>`).join('')}</div></div>`

  /* ---- slide 6: the official rules, still yours to read ---- */
  const clause = (n, ...w) => `<div class="cl">${sp('label', n, 'class="soft"')}<div>${bars(...w)}</div></div>`
  const rules = (c) => `<div class="sentence-rules" style="width:${sq(c, 70, 62)}cqi;transform:rotate(-1deg)">
    <div class="hd">${circ(sp('label', 'Official rules'), 'wide', { l: '-12%', t: '-36%', w: '124%', h: '172%' })}</div>
    ${clause('1.1', 96, 88, 70)}${clause('1.2', 92, 54)}${c === 'square' ? '' : clause('1.3', 94, 62)}</div>`

  carousel('sentence', [
    // 1. Replaced at load time by the cover poster in v2/covers/sentence.js.
    { g: 'var(--blue)', html: (c, i, n) => `${ctop('Guidelines', i, n)}${S('headline', LEGAL, 'class="mt-m soft"')}${S('display', 'Somewhere in this sentence is $10,000 for your next film, and we want to help you find it!!', 'class="mt-m wide"')}<div class="grow"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` },
    page('The problem', 'var(--pink)', (c) => `${head('Film grants and festival submissions are confusing and tiresome.', 'wide')}${sub('And we want to make that process easier for filmmakers.')}`, pile),
    page('Call Sheet', 'var(--green)', (c) => `${head('So we made Call Sheet.')}${sub('A free list of film and TV grants, festivals, labs and fellowships.')}`, card),
    page('How it works', 'var(--blue)', (c) => `${head('Start with what you’re making and where you’re based.', 'wide')}${sub('Filter by project type and stage to find opportunities worth looking into.')}`, filters),
    page('Save', 'var(--yellow)', (c) => `${head('Save the ones you’re interested in.')}${sub('Add the deadlines to your calendar.')}${sub('Get reminders a week before and the day before.', false)}`, cal),
    page('Fair warning', 'var(--buff)', (c) => `${head('You’ll still need to check the official rules.', 'wide')}${sub('We can’t do the whole application for you. But hopefully, we can save you some time discovering and translating these opportunities.')}`, rules),
    closer(),
  ], 'Somewhere in this sentence is $10,000 for your next film, and pitch.dog wants to help you find it. “Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.” Film grants and festival submissions are confusing and tiresome: a stack of guidelines, eligibility rules, terms and conditions and submission rules. So pitch.dog made Call Sheet: a free list of film and TV grants, festivals, labs and fellowships, with who can apply, what you get, what it costs, what you need to send and the deadline highlighted and simplified, in your own time zone, when it’s given. Start with what you’re making and where you’re based, and filter by project type and stage. Save the ones you’re interested in, add the deadlines to your calendar and get reminders a week before and the day before: a week on a calendar with the deadline circled. You’ll still need to check the official rules. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

// Post 03: Somewhere in this sentence. The team's copy, verbatim; the last slide is closer().
// One red marker line runs through slides 2 to 6: it tangles in the paperwork, rings the
// Call Sheet card, picks the filters, circles the deadline and ends in a tick on the official rules.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
  .sentence-thread { position: absolute; left: -80px; width: 1080px; z-index: 4; pointer-events: none; overflow: visible; }
  .sentence-thread path { fill: none; stroke: var(--marker); stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; }
  .sentence-hl { background: rgb(244 223 119); -webkit-box-decoration-break: clone; box-decoration-break: clone; padding: 0 .12em; margin: 0 -.04em; border-radius: .12em .3em .18em .08em; }
  .sentence-doc { position: absolute; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift); padding: 2.4cqi 2.6cqi 2.8cqi; display: grid; gap: 1.1cqi; align-content: start; }
  .sentence-doc i, .sentence-rules i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
  .sentence-doc .hd, .sentence-rules .hd { display: flex; justify-content: space-between; align-items: baseline; gap: 2cqi; padding-bottom: 1cqi; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: .4cqi; }
  .sentence-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.8cqi 4.4cqi 2.4cqi; padding-right: 11cqi; border-bottom: 3px solid var(--ink); }
  .sentence-card header img { height: 6cqi; width: auto; }
  .sentence-card .in { padding: 3cqi 4.4cqi 3.8cqi; }
  .sentence-list { line-height: 1.24; }
  .sentence-panel { background: var(--sheet); box-shadow: var(--lift); border-radius: 1.4cqi; padding: 3.4cqi 4.4cqi 3.8cqi; display: grid; gap: 1.2cqi; }
  .sentence-panel .row { display: flex; flex-wrap: wrap; gap: 1.4cqi 3.2cqi; margin-bottom: 1.6cqi; }
  .sentence-panel .row:last-child { margin-bottom: 0; }
  .sentence-panel .chip { padding: 1.5cqi 2.2cqi 1.3cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; white-space: nowrap; }
  .sentence-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
  .sentence-cal { background: var(--sheet); box-shadow: var(--lift); border-radius: 1.2cqi; padding: 2.6cqi 3cqi 3cqi; }
  .sentence-cal .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: .9cqi; }
  .sentence-cal .wd { text-align: center; padding-bottom: .8cqi; }
  .sentence-cal .d { position: relative; border: 1.5px solid var(--rule); border-radius: .6cqi; padding: 1.2cqi 1.4cqi; display: grid; align-content: space-between; justify-items: start; }
  .sentence-cal .d.off { opacity: .4; }
  .sentence-cal .d.due { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
  .sentence-cal .bell { width: 3.6cqi; height: 3.6cqi; justify-self: end; }
  .sentence-cal .bell * { fill: none; stroke: var(--marker); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .sentence-saved { position: absolute; display: grid; grid-template-columns: 4.6cqi 1fr; gap: 2.2cqi; align-items: center; padding: 2.2cqi 3cqi 2.2cqi 2.6cqi; background: var(--sheet); box-shadow: var(--lift); border-radius: 1cqi; }
  .sentence-saved svg { width: 4.6cqi; height: 5.6cqi; }
  .sentence-saved .b { display: grid; gap: 1.1cqi; }
  .sentence-saved .b i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
  .sentence-rules { position: relative; background: var(--sheet); box-shadow: var(--lift); padding: 3.6cqi 4.4cqi 4.4cqi; display: grid; gap: 1.2cqi; }
  .sentence-rules .cl { display: grid; grid-template-columns: 5.4cqi 1fr; gap: 1.6cqi; align-items: start; margin-top: .8cqi; }
  .sentence-rules .cl > div { display: grid; gap: 1.1cqi; padding-top: .5cqi; }
  .sentence-tape { position: absolute; width: 15cqi; height: 4.4cqi; background: rgb(251 249 243 / .62); box-shadow: 0 1px 2px rgb(21 19 15 / .12); }
  </style>`)

  /* ---- the marker line: points in canvas pixels, smoothed into one hand-drawn stroke ---- */
  const curve = (p) => {
    let d = `M${p[0][0]} ${p[0][1]}`
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c
      const f = (v) => +v.toFixed(1)
      d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)}, ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)}, ${f(c[0])} ${f(c[1])}`
    }
    return d
  }
  // An open loop around (cx, cy), drawn the way a hand does it: it overshoots where it started.
  const ring = (cx, cy, rx, ry, a0 = 200, sweep = 400, n = 16, grow = .12) => Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, a = (a0 + sweep * t) * Math.PI / 180, g = 1 - grow / 2 + grow * t
    return [cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g] })
  // runs: arrays of points; each run is one smooth stroke, and runs meet at sharp corners (a tick).
  const thread = (c, runs) => runs ? `<svg class="sentence-thread" data-thread viewBox="0 0 1080 ${sq(c, 1350, 1080)}" style="top:-${sq(c, 92, 80)}px;height:${sq(c, 1350, 1080)}px" aria-hidden="true"><path d="${runs.map(curve).join(' ')}"/></svg>` : ''

  /* ---- a slide on the shared grid: kicker, the copy block at the headline baseline, the object zone, the footer ---- */
  const page = (label, g, copy, zone, th, o = {}) => ({ g,
    html: (c, i, n) => `${ctop(label, i, n)}<div class="mt-m">${copy(c)}</div>
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${sq(c, 3, 2.4)}cqb">${zone(c)}</div>${foot()}${thread(c, th && th[c])}` })
  const head = (t, hw = 'measure') => S('display', t, `class="${hw}"`)
  const sub = (t, first = true) => S('subhead', t, `class="${first ? 'mt-s' : 'mt-xs'} wide"`)

  const hl = (t) => `<span class="sentence-hl">${t}</span>`
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const LEGAL = '“Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.”'

  /* ---- slide 2: the paperwork one application can involve ---- */
  const doc = (label, ref, x, y, r, w, b = bars(100, 84, 92, 58)) => `<div class="sentence-doc" style="left:${x}cqi;top:${y}cqi;width:${w}cqi;transform:rotate(${r}deg)"><div class="hd">${sp('metadata', label)}${sp('metadata', ref, 'class="soft"')}</div>${b}</div>`
  const pile = (c) => c === 'square'
    ? `<div class="scatter" data-a="pile" style="width:84cqi;height:26cqi">
      ${doc('Guidelines', '§ 4.2', 0, 1, -5, 27)}${doc('Eligibility', 'p. 3', 28.5, 0, 2.5, 27)}${doc('Terms', 'Annex B', 57, 2, -2, 27)}
      ${doc('FAQ', 'p. 11', 6, 14, 3, 25, bars(100, 76, 88))}${doc('Submission rules', '§ 9', 46, 15, -3, 31, bars(100, 82, 64))}</div>`
    : `<div class="scatter" data-a="pile" style="width:92cqi;height:43cqi">
      ${doc('Guidelines', '§ 4.2', 1, 1, -5, 30)}${doc('Eligibility', 'p. 3', 31, 0, 2.5, 29)}${doc('Terms and conditions', 'Annex B', 61, 3, -2, 31)}
      ${doc('FAQ', 'p. 11', 3, 22, 3.5, 27)}${doc('Submission rules', '§ 9', 32, 23, -3, 32)}${doc('Annex B', 'p. 1 of 6', 66, 22, 4, 26, bars(100, 70, 90, 44))}
      ${sticky('???', 'position:absolute;left:52cqi;top:16cqi;transform:rotate(-7deg);padding:1.6cqi 2.4cqi;z-index:2')}</div>`

  /* ---- slide 3: Call Sheet's card, with the five things you came to find out highlighted ---- */
  const card = (c) => `<div class="paper ear sentence-card" data-a="card" style="width:100%;transform:rotate(-1deg)"><span class="ear-flap"></span>
    <header><img data-a="mark" src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet"></header>
    <div class="in">${S('body', 'With the useful details highlighted and simplified:', 'class="soft"')}
    ${S(sq(c, 'headline', 'subhead'), `${hl('Who can apply')}, ${hl('what you get')}, ${hl('what it costs')}, ${hl('what you need to send')}, and ${hl('the deadline')}—in your own timezone.`, `class="mt-xs sentence-list"`)}</div></div>`

  /* ---- slide 4: the filters ---- */
  const chips = (k, items) => `${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on]) => `<span class="chip${on ? ' on' : ''}"${on ? ` data-a="chip-${t}"` : ''}>${sp('label', t)}</span>`).join('')}</div>`
  const filters = (c) => `<div class="sentence-panel" data-a="panel" style="width:100%;transform:rotate(.8deg)">
    ${chips('Project type', c === 'square' ? [['Feature'], ['Documentary', 1], ['Series'], ['Short']] : [['Feature'], ['Documentary', 1], ['Series'], ['Short'], ['Animation']])}
    ${chips('Based in', [['Canada', 1]])}
    ${chips('Stage', [['Writing'], ['Development', 1], ['Production'], ['Post']])}</div>`

  /* ---- slide 5: saved, then on the calendar with two reminders ---- */
  const bookmark = `<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M2 1h16v22l-8-6-8 6z" fill="#e3472d"/></svg>`
  const bellSvg = `<svg class="bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`
  const cal = (c) => {
    const days = Array.from({ length: 14 }, (_, k) => k + 12)
    return `<div style="position:relative;width:100%;padding-top:${sq(c, 7, 5)}cqi">
      <div class="sentence-saved" style="left:-1cqi;top:0;z-index:2;transform:rotate(-3deg)">${bookmark}<div class="b">${S('label', 'Saved')}<i style="width:24cqi"></i><i style="width:15cqi;opacity:.6"></i></div></div>
      <div class="sentence-cal" data-a="cal" style="transform:rotate(1deg)"><div class="grid">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="wd">${sp('metadata', d, 'class="soft"')}</span>`).join('')}
      ${days.map(d => `<div class="d${d === 20 ? ' due' : ''}${d > 20 ? ' off' : ''}" style="height:${sq(c, 11, 9)}cqi"${d === 20 ? ' data-a="due"' : ''}>${sp('label', d)}${d === 13 || d === 19 ? bellSvg : ''}</div>`).join('')}</div></div></div>`
  }

  /* ---- slide 6: the official rules, still yours to read ---- */
  const clause = (n, ...w) => `<div class="cl">${sp('label', n, 'class="soft"')}<div>${bars(...w)}</div></div>`
  const rules = (c) => `<div class="sentence-rules" data-a="rules" style="width:${sq(c, 70, 60)}cqi;transform:rotate(-1.5deg)">
    <span class="sentence-tape" style="left:50%;top:-2cqi;margin-left:-7.5cqi;transform:rotate(3deg)"></span>
    <div class="hd">${sp('label', 'Official rules', 'data-a="rules-title"')}${sp('metadata', 'p. 1 of 12', 'class="soft"')}</div>
    ${clause('1.1', 96, 88, 70)}${clause('1.2', 92, 54)}${c === 'square' ? '' : clause('1.3', 94, 86, 62)}${clause('2.1', 90, 78)}</div>`

  const TH = {}

  carousel('sentence', [
    // 1. Replaced at load time by the cover poster in v2/covers/sentence.js.
    slide('Guidelines', LEGAL, 'Somewhere in this sentence is $10,000 for your next film, and we want to help you find it!!', '', { g: 'var(--blue)', hw: 'wide' }),
    page('The problem', 'var(--pink)', (c) => `${head('Film grants and festival submissions are confusing and tiresome.', 'wide')}${sub('And we want to make that process easier for filmmakers.')}`, pile, TH.s2),
    page('Call Sheet', 'var(--green)', (c) => `${head('So we made Call Sheet.')}${sub('A free list of film and TV grants, festivals, labs and fellowships.')}`, card, TH.s3),
    page('How it works', 'var(--blue)', (c) => `${head('Start with what you’re making and where you’re based.', 'wide')}${sub('Filter by project type and stage to find opportunities worth looking into.')}`, filters, TH.s4),
    page('Save', 'var(--yellow)', (c) => `${head('Save the ones you’re interested in.')}${sub('Add the deadlines to your calendar.')}${sub('Get reminders a week before and the day before.', false)}`, cal, TH.s5),
    page('Fair warning', 'var(--buff)', (c) => `${head('You’ll still need to check the official rules.', 'wide')}${sub('We can’t do the whole application for you. But hopefully, we can save you some time discovering and translating these opportunities.')}`, rules, TH.s6),
    closer(),
  ], 'Somewhere in this sentence is $10,000 for your next film, and pitch.dog wants to help you find it. “Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.” Film grants and festival submissions are confusing and tiresome: a pile of guidelines, eligibility rules, terms, FAQs and annexes, with a red marker line tangled through it. So pitch.dog made Call Sheet: a free list of film and TV grants, festivals, labs and fellowships, with who can apply, what you get, what it costs, what you need to send and the deadline highlighted and simplified, in your own timezone. Start with what you’re making and where you’re based, and filter by project type and stage. Save the ones you’re interested in, add the deadlines to your calendar and get reminders a week before and the day before. You’ll still need to check the official rules. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

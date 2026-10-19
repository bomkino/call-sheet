// Post 11: Funding for looking for funding. The team's copy, verbatim; the last slide is closer().
// Calm set: one simple object per slide in the same zone under the copy, at most one red mark,
// and the ground colours moving yellow, paper, blue, green, then ink.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
  .research-steps { list-style: none; display: grid; position: relative; }
  .research-steps li { display: grid; grid-template-columns: 13cqi 1fr; align-items: baseline; }
  .research-back { position: absolute; left: -80px; width: 1080px; pointer-events: none; overflow: visible; }
  .research-back path { fill: none; stroke: var(--marker); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
  .research-card i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
  .research-card .chips { display: flex; gap: 3cqi; padding: 4.4cqi 11cqi 4.2cqi 5cqi; }
  .research-card .chip { padding: 1.3cqi 2.2cqi 1.1cqi; border-radius: 5cqi; background: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); white-space: nowrap; }
  .research-card .rows { display: grid; grid-template-columns: repeat(3, auto); justify-content: space-between; padding: 3.2cqi 5cqi 3.4cqi; border-top: 3px solid var(--ink); }
  .research-card .row { display: flex; gap: 1.6cqi; align-items: center; }
  .research-card .row svg { width: 4.6cqi; height: 4.6cqi; overflow: visible; }
  .research-card .row svg path { fill: none; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; opacity: .75; }
  .research-month { background: var(--sheet); box-shadow: var(--lift); border-radius: 1.2cqi; }
  .research-month .grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 2.6cqi 3cqi 3cqi; row-gap: .6cqi; }
  .research-month .grid > span { position: relative; display: grid; place-items: center; }
  .research-month .grid > .wd { padding-bottom: 1.2cqi; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: 1cqi; }
  .research-month .grid > .due > svg.loop { position: absolute; left: 4%; top: 2%; width: 92%; height: 96%; overflow: visible; }
  </style>`)

  /* ---- a slide on the shared grid: kicker, the copy at the headline baseline, the object zone, the footer ---- */
  const page = (label, g, copy, zone) => ({ g,
    html: (c, i, n) => `${ctop(label, i, n)}<div class="mt-m">${copy(c)}</div>
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:${sq(c, 3.4, 2.6)}cqb 0 ${sq(c, 3, 2.6)}cqb">${zone(c)}</div>${foot()}` })
  const head = (t, hw = 'measure') => S('display', t, `class="${hw}"`)
  const sub = (t, first = true) => S('subhead', t, `class="${first ? 'mt-s' : 'mt-xs'} wide"`)
  const tickSvg = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 22 C 10 25, 13 29, 15 33 C 20 21, 27 11, 37 4"/></svg>`

  /* ---- slide 2: the five steps, and one arrow back to the first, in the list's own right-hand column ---- */
  const STEPS = ['Finding an opportunity.', 'Checking if it’s still open.', 'Reading the requirements.', 'Finding out you’re not eligible.', 'Back to looking.']
  // Canvas pixels: from the end of "Back to looking." up the free column to the first step.
  const BACK = { portrait: 'M796 1004 C 900 1000, 948 960, 950 860 L 950 420 C 948 330, 900 296, 704 290 M736 262 L 704 290 L 738 316',
    square: 'M736 828 C 860 824, 940 790, 942 700 L 942 340 C 940 276, 890 254, 640 250 M672 222 L 640 250 L 674 276' }
  const steps = (c) => `<ol class="research-steps mt-m" style="row-gap:${sq(c, 3.4, 2.6)}cqb;max-inline-size:${sq(c, 70, 64)}cqi">${STEPS.map((t, k) => `<li>${sp('metadata', `0${k + 1}`, 'class="soft"')}${S('headline', t)}</li>`).join('')}</ol>
    <svg class="research-back" viewBox="0 0 1080 ${sq(c, 1350, 1080)}" style="top:-${sq(c, 92, 80)}px;height:${sq(c, 1350, 1080)}px" aria-hidden="true"><path d="${BACK[c]}"/></svg>`

  /* ---- slide 3: the film you could have been working on ---- */
  const film = (c) => `<div style="transform:rotate(-2deg)">${clapper(sq(c, 62, 48))}</div>`

  /* ---- slide 4: Call Sheet, filtered, with the three things to check ---- */
  const card = (c) => `<div class="paper ear research-card" style="width:100%;transform:rotate(-.6deg)"><span class="ear-flap"></span>
    <div class="chips">${['Feature', 'Canada', 'Development'].map(t => `<span class="chip">${sp('label', t)}</span>`).join('')}</div>
    ${c === 'square' ? '' : `<div class="rows">${['Costs', 'Requirements', 'Deadlines'].map(t => `<div class="row">${tickSvg}${sp('label', t)}</div>`).join('')}</div>`}</div>`

  /* ---- slide 5: three weeks of the calendar, with the deadline circled ---- */
  const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const month = (c) => `<div class="research-month" style="width:${sq(c, 84, 70)}cqi;transform:rotate(-1deg)"><div class="grid">
    ${WD.map(d => `<span class="wd">${sp('metadata', d, 'class="soft"')}</span>`).join('')}
    ${Array.from({ length: 21 }, (_, k) => k + 6).map(d => `<span${d === 20 ? ' class="due"' : ''} style="height:${sq(c, 8.4, 6.6)}cqi">${sp('subhead', d)}${d === 20 ? loopSvg('round') : ''}</span>`).join('')}</div></div>`

  carousel('research', [
    // 1. Replaced at load time by the cover poster in v2/covers/research.js.
    { g: 'var(--blue)', html: (c, i, n) => `${ctop('The search', i, n)}${S('display', '“At this point, I need funding for the time I spend looking for film funding.”', 'class="mt-m wide"')}<div class="grow"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` },
    { g: 'var(--yellow)', html: (c, i, n) => `${ctop('The loop', i, n)}${steps(c)}<div class="grow"></div>${foot()}` },
    page('The time', 'var(--paper)', (c) => `${head('That’s time you could have spent on the film.', 'wide')}${sub('Or at least on an application you can actually submit.')}${sub('We wanted to make the finding part easier.', false)}`, film),
    page('Call Sheet', 'var(--blue)', (c) => `${head('Introducing Call Sheet.')}${sub('Film and TV grants, festivals, labs and fellowships in one place.')}${sub('Filter by what you’re making, where you’re based and what stage you’re at.', false)}${sub('Then check the costs, requirements and deadlines.', false)}`, card),
    page('Save', 'var(--green)', (c) => `${head('Save the opportunities worth a closer look.', 'wide')}${sub('Add the deadlines to your calendar.')}${sub('We can’t fund your research time. But hopefully, we can help you spend less of it.', false)}`, month),
    closer(),
  ], 'Funding for looking for funding. “At this point, I need funding for the time I spend looking for film funding.” Finding an opportunity. Checking if it’s still open. Reading the requirements. Finding out you’re not eligible. Back to looking, with a red arrow running back up to the first step. That’s time you could have spent on the film, or at least on an application you can actually submit, so pitch.dog wanted to make the finding part easier. Introducing Call Sheet: film and TV grants, festivals, labs and fellowships in one place. Filter by what you’re making, where you’re based and what stage you’re at, then check the costs, requirements and deadlines. Save the opportunities worth a closer look and add the deadlines to your calendar: three weeks of a calendar with one date circled. We can’t fund your research time, but hopefully we can help you spend less of it. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

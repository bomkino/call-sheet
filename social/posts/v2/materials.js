// Post 10, Different Materials. The team's copy, verbatim; the last slide is closer().
// Calm pass: one object per slide in the same zone under the words, at most one red mark per slide.
// The thread is the three materials themselves: questions on notes, then listed on the Call Sheet card,
// then ticked off, then in the calendar, over a blue → yellow → green → buff ground run.
{
  const K = 'materials'
  document.head.insertAdjacentHTML('beforeend', `<style>
    .${K}-note { position: relative; background: var(--c, #f4df77); color: var(--ink); --pd-type-ink: var(--ink); padding: 3.2cqi 3.8cqi 3.6cqi;
      box-shadow: 0 1px 1px rgb(21 19 15 / .14), 0 1.4cqi 2cqi -1cqi rgb(21 19 15 / .38); }
    .${K}-note::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2.6cqi; background: rgb(21 19 15 / .045); }
    .${K}-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.8cqi 4.4cqi 2.4cqi; padding-right: 10cqi; border-bottom: 3px solid var(--ink); }
    .${K}-card header img { height: 6cqi; width: auto; }
    .${K}-card .f { display: grid; grid-template-columns: 30cqi 1fr; gap: 2cqi; align-items: center; padding: 1.7cqi 4.4cqi; border-bottom: 1.5px solid var(--rule); }
    .${K}-card .f i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .${K}-card .send { padding: 2.4cqi 4.4cqi 6.6cqi; display: grid; gap: 1.6cqi; }
    .${K}-chips { display: flex; flex-wrap: wrap; gap: 1.2cqi 4.4cqi; }
    .${K}-chips > span:not(.circ) { padding: 1.3cqi 2cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; white-space: nowrap; }
    .${K}-list li { display: grid; grid-template-columns: 6cqi 1fr; gap: 2.6cqi; align-items: center; padding: 1.5cqi 0; }
    .${K}-list li + li { border-top: 1.5px solid var(--rule); }
    .${K}-list svg { width: 6cqi; height: 6cqi; overflow: visible; }
    .${K}-list svg path { fill: none; stroke: var(--marker); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; }
    .${K}-list .done { opacity: .5; }
  </style>`)

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

    // 2. Three questions on three sticky notes, each on its own, none overlapping. No red mark.
    { g: 'var(--blue)',
      html: (c, i, n) => `${ctop('Three questions', i, n)}
        ${zone(c, `<div style="width:100%;display:flex;flex-direction:column${c === 'square' ? ';zoom:.8' : ''}">
          ${note(`Which one needed the ${nw('two-page')} synopsis?`, 'q1', 'align-self:flex-start;width:84cqi;transform:rotate(-1.5deg)')}
          ${note('Was the director’s statement for this one?', 'q2', 'align-self:flex-end;width:80cqi;margin-top:2.4cqi;--c:#f6bccd;transform:rotate(1.5deg)')}
          ${note('And when was it due?', 'q3', 'align-self:flex-start;width:50cqi;margin:2.4cqi 0 0 4cqi;--c:#f8c99a;transform:rotate(-1.5deg)')}</div>`)}
        ${S('subhead', 'Finding the opportunity was apparently just the beginning.', 'class="wide"')}<div class="mt-m"></div>${foot()}` },

    // 3. Call Sheet's card for one opportunity: the useful details. One loop, round the budget in euros.
    { g: 'var(--yellow)',
      html: (c, i, n) => `${ctop('Call Sheet', i, n)}${S('display', 'So we made Call Sheet.', 'class="mt-m wide"')}
        ${S('subhead', '180+ Film and TV funding opportunities with the useful details pulled together, including what you need to send.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${S('subhead', 'So you can work out what’s ready and what still needs writing.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${zone(c, `<div class="paper ear ${K}-card" style="--ear:7cqi;width:100%;transform:rotate(-1.2deg);zoom:${sq(c, .86, .96)}"><span class="ear-flap" style="--flap:#d8d2c4"></span>
          <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${sp('metadata', 'Film grant', 'class="soft"')}</header>
          ${c === 'square' ? '' : field('Who can apply', 72) + field('Deadline', 40)}
          <div class="send"><div>${sp('metadata', 'What you need to send', 'class="soft"')}</div><div class="${K}-chips" style="align-items:center">${['Treatment', 'Script'].map(t => `<span>${sp('label', t)}</span>`).join('')}${circ(`<span style="display:inline-block;padding:1.3cqi 2cqi 1.1cqi;border:1.5px solid var(--rule-strong);border-radius:5cqi">${sp('label', 'Budget in euros')}</span>`, 'wide', { l: '-9%', t: '-26%', w: '118%', h: '152%' })}</div></div></div>`)}${foot()}` },

    // 4. Your own checklist, with one thing ticked off.
    { g: 'var(--green)',
      html: (c, i, n) => `${ctop('Your checklist', i, n)}${S('display', 'Save the opportunities you’re interested in.', 'class="mt-m wide"')}
        ${S('subhead', 'Open each one to check the application materials.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${S('subhead', 'Tick things off as you get them ready. Your checklist stays saved on the same device.', 'class="mt-s" style="max-inline-size:34ch"')}
        ${zone(c, `<div class="paper ear" style="--ear:6cqi;width:${sq(c, 94, 92)}%;padding:${sq(c, 2.6, 2)}cqi 5cqi;transform:rotate(1deg);zoom:${sq(c, .7, .68)}"><span class="ear-flap" style="--flap:#d8d2c4"></span>
          <ul class="${K}-list" style="list-style:none">${[['Treatment', 1], ['Script', 0], ['Two-page synopsis', 0], ['Budget in euros', 0]].map(([t, on]) => item(t, on)).join('')}</ul></div>`)}${foot()}` },

    // 5. The deadline in your calendar: the two reminders, one above the other. No red mark beyond the icons.
    { g: 'var(--buff)',
      html: (c, i, n) => `${ctop('Your calendar', i, n)}${S('display', 'Add the deadlines to your calendar,', 'class="mt-m wide"')}
        ${S('subhead', 'with reminders a week before and the day before.', 'class="mt-xs wide"')}
        ${S('subhead', 'You still have to do the application.', 'class="mt-s wide"')}
        ${zone(c, `<div style="width:${sq(c, 92, 80)}%;display:grid;gap:${sq(c, 2.4, 1.8)}cqi${c === 'square' ? ';zoom:.76' : ''}">
          <div style="transform:rotate(-1.5deg)">${notif('24', 'A week to go', 'Reminder')}</div><div style="transform:rotate(1deg);margin-left:6cqi">${notif('30', 'Due tomorrow', 'Reminder')}</div></div>`)}
        ${S('subhead', 'Hopefully, keeping track just got a little easier.', 'class="wide"')}<div class="mt-m"></div>${foot()}` },

    closer(),
  ]
  carousel(K, SLIDES, 'Different materials. One film grant wants a treatment, another wants a script, another wants a budget in euros, and you’re trying to keep track of all three. Which one needed the two-page synopsis? Was the director’s statement for this one? And when was it due? Call Sheet lists 180+ film and TV funding opportunities with the useful details pulled together, including what you need to send. Save the opportunities you’re interested in, open each one to check the application materials, and tick things off as you get them ready; the checklist stays saved on the same device. Add the deadlines to your calendar, with reminders a week before and the day before. You still have to do the application; hopefully keeping track just got a little easier. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

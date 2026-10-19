// theory: Post 02, "Conspiracy theory". The team's copy, verbatim; the last slide is closer().
// Calm by rule: one object per slide, at most one red loop, nothing crossing anything. The thread is one
// sheet of paper that evolves: the guidelines page (as on the cover), cut down to a Call Sheet card, the card
// holding the five questions, then the filters, and finally the official rules you'll still read. The grounds
// run warm to cool, into the ink closer, and every slide keeps the same grid.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .theory-page { padding: 3.6cqi 4.4cqi 4.4cqi; gap: 1.6cqi; }
    .theory-page .hd { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.4cqi; border-bottom: 1.5px solid var(--rule-strong); }
    .theory-page .cl { display: grid; grid-template-columns: 6cqi 1fr; gap: 1.6cqi; align-items: start; }
    .theory-page .cl > div { display: grid; gap: 1.2cqi; padding-top: .6cqi; }
    .theory-ring { position: relative; justify-self: center; width: 86%; margin: 4.4cqi 0 3.6cqi; }
    .theory-ring > svg.loop { position: absolute; left: -10%; top: -36%; width: 120%; height: 172%; overflow: visible; }
    .theory-card { background: var(--sheet); box-shadow: var(--lift); }
    .theory-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.6cqi 4cqi 2cqi; border-bottom: 3px solid var(--ink); }
    .theory-card header img { height: 5.6cqi; width: auto; }
    .theory-card .in { padding: 3.2cqi 4cqi 3.8cqi; display: grid; gap: 1.8cqi; }
    .theory-card .in i { display: block; height: 1.6cqi; border-radius: 1cqi; background: rgb(21 19 15 / .18); }
    .theory-cut { display: flex; align-items: center; gap: 1.6cqi; margin: 2.2cqi 0; }
    .theory-cut::after { content: ""; flex: 1; border-top: .3cqi dashed rgb(21 19 15 / .4); }
    .theory-cut svg { width: 6.4cqi; flex: none; }
    .theory-fluff { opacity: .5; transform: translateY(.6cqi) rotate(1.4deg); transform-origin: 0 0; padding: 2.6cqi 4cqi 3cqi; gap: 1cqi; box-shadow: 0 1px 1px rgb(21 19 15 / .1), 0 4px 8px -3px rgb(21 19 15 / .2); }
    .theory-qs { list-style: none; padding: 1.4cqi 2.4cqi 2.2cqi; }
    .theory-qs li { display: grid; grid-template-columns: 3.6cqi 1fr; gap: 1.6cqi; align-items: center; padding: var(--qp) 0; border-bottom: 1.5px solid var(--rule); }
    .theory-qs li:last-child { border-bottom: 0; }
    .theory-qs li > div { white-space: nowrap; }
    .theory-qs svg { width: 3.6cqi; height: 3.6cqi; overflow: visible; }
    .theory-qs svg path { fill: none; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
    .theory-chip { display: inline-block; white-space: nowrap; padding: 1.3cqi 2cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
    .theory-chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
    .theory-chip.on::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .5em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
    .theory-row { display: grid; grid-template-columns: 4.4cqi 1fr 5.4cqi; gap: 2.4cqi; align-items: center; padding: 1.8cqi 0; border-top: 1.5px solid var(--rule); }
    .theory-row svg { width: 100%; height: auto; display: block; }
    .theory-row i { display: block; height: 1.3cqi; border-radius: 1cqi; background: rgb(21 19 15 / .16); }
  </style>`)

  // The standard grid: kicker, display headline, subhead lines, the object centred below, footer.
  const page = (label, head, subs, obj, o = {}) => ({ g: o.g, dark: o.dark,
    html: (c, i, n) => `${ctop(label, i, n)}${head ? S('display', head, `class="mt-m" style="max-inline-size:${o.hw || '15ch'}"`) : ''}
      ${subs.map((t, k) => S('subhead', t, `class="${k ? '' : 'mt-s'}" style="max-inline-size:32ch;text-wrap:balance"`)).join('')}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${o.pt ?? 3}cqb">${typeof obj === 'function' ? obj(c) : obj}</div>
      ${o.bottom ? o.bottom + '<div class="mt-m"></div>' : ''}
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })
  const header = (right = '') => `<header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${right}</header>`

  // 2. The guidelines page from the cover: one clause in easy words that still says nothing, circled.
  const guide = (c) => `<div class="doc theory-page" style="width:100%;transform:rotate(-1deg)"><div class="hd">${sp('metadata', 'Guidelines', 'class="soft"')}${sp('metadata', '§ 4.2', 'class="soft"')}</div>
    <div class="cl">${sp('label', '4.1', 'class="soft"')}<div>${c === 'square' ? bars(94) : bars(94, 58)}</div></div>
    <div class="theory-ring" ${c === 'square' ? 'style="width:80%;margin:4cqi 0 3.4cqi"' : ''}>${S(sq(c, 'subhead', 'body'), `${sp('label', '4.2', 'class="soft" style="margin-right:.5em"')}Applicants who are not ineligible may apply, unless clause 4.2 does not apply.`, 'style="text-wrap:balance;text-align:center;max-inline-size:none"')}${c === 'square' ? loopSvg('wide').replace('class="loop"', 'class="loop" style="top:-46%;height:192%;left:-11%;width:122%"') : loopSvg('wide')}</div></div>`

  // 3. The same page, cut: the plain part stays, the fluff drops away.
  const scissors = `<svg viewBox="0 0 60 40" aria-hidden="true"><g fill="none" stroke="#15130f" stroke-width="3" stroke-linecap="round"><circle cx="9" cy="10" r="6.5"/><circle cx="9" cy="30" r="6.5"/><path d="M14 13 L56 27 M14 27 L56 13"/></g><circle cx="33" cy="20" r="2" fill="#15130f"/></svg>`
  const cut = (c) => `<div style="width:${sq(c, 100, 80)}%;${c === 'square' ? 'zoom:.86' : ''}"><div class="theory-card">${header()}<div class="in"><i style="width:72%"></i><i style="width:54%"></i>${c === 'square' ? '' : '<i style="width:64%"></i>'}</div></div>
    <div class="theory-cut">${scissors}</div>
    <div class="doc theory-fluff">${['4.4', '4.5'].slice(0, sq(c, 2, 1)).map(k => `<div style="display:grid;grid-template-columns:5cqi 1fr;gap:1.4cqi">${sp('metadata', k, 'class="soft"')}<div style="display:grid;gap:.9cqi">${bars(96, 90, 64)}</div></div>`).join('')}</div></div>`

  // 4. The card again, now holding the five questions.
  const QS = ['Can I apply?', 'What do I get?', 'What does it cost?', 'What do I need to send?', 'When’s the deadline?']
  const questions = (c) => `<div class="theory-card" style="width:100%;--qp:${sq(c, 1.9, 1.2)}cqi">${header()}<ul class="theory-qs">${QS.map(q => `<li>${tick}${S('headline', q)}</li>`).join('')}</ul></div>`

  // 5. The card as the list: what you're making, where you're based, saved, in the calendar.
  const chip = (t, on) => `<span class="theory-chip${on ? ' on' : ''}">${sp('label', t)}</span>`
  const mark = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" fill="${on ? '#15130f' : 'none'}" stroke="${on ? '#15130f' : 'rgb(21 19 15 / .35)'}" stroke-width="2" stroke-linejoin="round"/></svg>`
  const cal = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true" style="opacity:${on ? 1 : .35}"><rect x="3" y="5" width="18" height="16" rx="2.5" fill="none" stroke="#15130f" stroke-width="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="#15130f" stroke-width="2" stroke-linecap="round"/>${on ? '<path d="M8.5 15.2l2.4 2.3 4.6-4.8" fill="none" stroke="#15130f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}</svg>`
  const narrowed = (c) => `<div class="theory-card" style="width:${sq(c, 100, 84)}%;${c === 'square' ? 'zoom:.76' : ''}">${header()}<div class="in" style="gap:0;padding-top:2.6cqi">
    <div style="display:flex;flex-wrap:wrap;gap:1.2cqi;padding-bottom:2.4cqi">${chip('Documentary', 1)}${chip('Based in Canada', 1)}</div>
    ${[[1, 1, 78], [0, 0, 60]].map(([s, k, w]) => `<div class="theory-row">${mark(s)}<i style="width:${w}%"></i>${cal(k)}</div>`).join('')}</div></div>`

  // 6. The official rules: the same kind of page you started with.
  const rules = (c) => `<div class="doc theory-page" style="width:${sq(c, 78, 64)}cqi;transform:rotate(-1deg)"><div class="hd">${S('label', 'Official rules')}${sp('metadata', 'Page 1', 'class="soft"')}</div>${bars(96, 88, 92, 70, ...(c === 'square' ? [] : [94, 84, 58]))}</div>`

  const SLIDES = [
    page('Conspiracy theory', 'Conspiracy theory:', ['Filmmaking grants and festival submissions are deliberately confusing, so you’re too tired to apply after reading the rules!!'], '', { g: 'var(--buff)' }),
    page('Exhibit A', 'Okay, maybe that’s not true.', ['But you can’t deny there are times when you understand every word in these “guidelines” but still have no idea what the sentence means.'], guide, { g: 'var(--salmon)', pt: 1.5 }),
    page('Introducing', 'So, we cut the fluff.', ['Introducing Call Sheet.', 'Film and TV grants, fellowships, labs and festivals, explained in language you don’t need a PhD to understand.'], cut, { g: 'var(--paper)', pt: 1.5 }),
    page('The questions', '', [], questions, { g: 'var(--yellow)', pt: 4, bottom: S('subhead', 'The things you came to find out, in one place.', 'style="max-inline-size:32ch"') }),
    page('How it works', 'Tell it what you’re making and where you’re based.', ['Narrow down the list.', 'Save the opportunities you’re interested in.', 'Put the deadlines in your calendar.'], narrowed, { g: 'var(--green)', hw: '17ch', pt: 1.5 }),
    page('Fair warning', 'You’ll still need to check the official rules before applying.', ['But hopefully, you’ll spend less time figuring out whether to apply in the first place.'], rules, { g: 'var(--blue)', hw: '17ch' }),
    closer(),
  ]
  carousel('theory', SLIDES, 'Conspiracy theory: filmmaking grants and festival submissions are deliberately confusing, so you’re too tired to apply after reading the rules!! Okay, maybe that’s not true. But you can’t deny there are times when you understand every word in these “guidelines” but still have no idea what the sentence means. A page of guidelines with one clause circled in red: “Applicants who are not ineligible may apply, unless clause 4.2 does not apply.” So, we cut the fluff: the page is cut down to a plain Call Sheet card. Introducing Call Sheet: film and TV grants, fellowships, labs and festivals, explained in language you don’t need a PhD to understand. The card lists five questions, each ticked: Can I apply? What do I get? What does it cost? What do I need to send? When’s the deadline? The things you came to find out, in one place. Tell it what you’re making and where you’re based, narrow down the list, save the opportunities you’re interested in and put the deadlines in your calendar. You’ll still need to check the official rules before applying, but hopefully you’ll spend less time figuring out whether to apply in the first place. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

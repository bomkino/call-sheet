// tz: Post 01, "Deadlines in your time zone". The team's copy, verbatim; the last slide is closer().
// Calm by rule: one object per slide, at most one red loop, nothing crossing anything. The thread is the
// grid (same headline, same object zone), one deadline that recurs (Doc Edge Pitch: 23:59 in Auckland on
// Sunday 20 December, 10:59 that morning for someone in London), and the grounds running from morning paper
// to evening blue, so the ink closer lands at midnight. The examples close well after the post goes out
// (Saturday 24 October): London is on GMT for both, and LA's midnight is London's 08:00 from 1 November.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .tz-list header { padding: 2.4cqi 4cqi 2cqi; padding-right: 10cqi; }
    .tz-list .tz-row { display: grid; grid-template-columns: 12cqi 1fr auto; gap: 3cqi; align-items: center; padding: 1.9cqi 4cqi; border-bottom: 1.5px solid var(--rule); }
    .tz-list .tz-row:last-child { border-bottom: 0; }
    .tz-list .tz-row .d { display: grid; }
    .tz-list .tz-row .t { text-align: right; display: grid; gap: .5cqi; justify-items: end; }
    .tz-clocks { display: grid; grid-template-columns: 1fr 1fr; }
    .tz-clocks .cap { text-align: center; display: grid; gap: 2.2cqi; justify-items: center; }
    .tz-panel { background: var(--sheet); box-shadow: var(--lift); padding: 2.6cqi 4.4cqi 3cqi; display: grid; }
    .tz-panel .row { display: flex; flex-wrap: wrap; gap: 1.2cqi; margin-top: 1.2cqi; }
    .tz-panel .chip { padding: 1.25cqi 2.1cqi 1.1cqi; border: 1.5px solid var(--rule-strong); border-radius: 5cqi; }
    .tz-panel .chip.on { background: var(--ink); border-color: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); }
    .tz-panel .chip.on::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .55em; vertical-align: .02em; border-radius: 50%; background: var(--marker); }
    .tz-panel .sec + .sec { margin-top: 1.8cqi; }
    .tz-panel .sec.gap { margin: 3cqi 0 3.4cqi; }
    .tz-panel .sec.gap .row { margin-top: 2.8cqi; padding-left: 1.6cqi; }
    .tz-panel .head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2cqi; margin-bottom: 2.4cqi; border-bottom: 3px solid var(--ink); }
    .tz-panel .head img { height: 5.6cqi; width: auto; }
    .tz-form { position: relative; background: var(--sheet); box-shadow: var(--lift); padding: 4cqi 4.6cqi 4.6cqi; display: grid; }
    .tz-form .head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.6cqi; margin-bottom: .6cqi; border-bottom: .3cqi solid var(--ink); }
    .tz-form .row { display: grid; grid-template-columns: 5cqi 1fr; gap: 2cqi; align-items: center; padding: 1.7cqi 0; border-bottom: 1.5px solid var(--rule); }
    .tz-form .row i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .tz-form .row .box { width: 3.4cqi; height: 3.4cqi; border: .3cqi solid rgb(21 19 15 / .35); border-radius: .4cqi; }
    .tz-form .sig { display: flex; align-items: flex-end; gap: 1.6cqi; margin-top: 3.4cqi; }
    .tz-form .sig > span:last-child { flex: 1; height: 7cqi; border-bottom: 2px solid var(--ink); }
  </style>`)

  const P_ = (c, a, b) => sq(c, a, b)
  // The standard grid: kicker, display headline, subhead lines, the object centred below, footer.
  const page = (label, head, subs, obj, o = {}) => ({ g: o.g, dark: o.dark,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, `class="mt-m" style="max-inline-size:${o.hw || '15ch'}"`)}
      ${subs.map((t, k) => S('subhead', t, `class="${k ? '' : 'mt-s'}" style="max-inline-size:${o.sw || '32ch'};text-wrap:${o.wrap || 'balance'}"`)).join('')}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${o.pt ?? 3}cqb">${typeof obj === 'function' ? obj(c) : obj}</div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  // 2. The list, soonest first, with the closing time worked out for someone in London.
  const row = (d, m, title, time, mark) => `<div class="tz-row"><div class="d">${sp('headline', d)}${sp('metadata', m, 'class="soft"')}</div>${S('label', title)}
    <div class="t">${mark ? circ(sp('headline', time), 'wide', { l: '-14%', t: '-30%', w: '128%', h: '160%' }) : sp('headline', time)}</div></div>`
  const tzList = (c) => `<div style="width:100%;transform:rotate(-1deg)"><div class="paper ear list tz-list"><span class="ear-flap"></span>
    <header><img src="/brand/logo/call-sheet-wordmark.svg" alt="Call Sheet">${sp('metadata', 'Your time: London', 'class="soft"')}</header>
    ${row('30', 'Nov', 'TorinoFilmLab ComedyLab', '15:00')}${row('20', 'Dec', 'Doc Edge Pitch', '10:59', 'a')}</div></div>`

  // 3. Midnight there is breakfast here.
  const clocks = (c) => `<div class="tz-clocks" style="width:${P_(c, 70, 58)}cqi;gap:${P_(c, 13, 12)}cqi">
    <div class="clock"><div style="width:100%">${clockSvg(0, 0)}</div><div class="cap">${S('label', 'Midnight there')}${S('metadata', 'Los Angeles', 'class="soft"')}</div></div>
    <div class="clock"><div style="width:100%">${clockSvg(8, 0)}</div><div class="cap">${S('label', circ('08:00 here', 'wide', { l: '-17%', t: '-46%', w: '134%', h: '192%' }))}${S('metadata', 'London', 'class="soft"')}</div></div></div>`

  // 4. The filters.
  const chips = (k, items, gap) => `<div class="sec${gap ? ' gap' : ''}">${S('metadata', k, 'class="soft"')}<div class="row">${items.map(([t, on, mark]) => (mark ? (h) => circ(h, 'wide', { l: '-17%', t: '-62%', w: '134%', h: '224%' }) : (h) => h)(`<span class="chip${on ? ' on' : ''}">${sp('label', t)}</span>`)).join('')}</div></div>`
  const filters = (c) => `<div class="tz-panel" style="width:100%;${c === 'square' ? 'zoom:.88' : ''}">
    ${chips('Project type', [['Feature'], ['Documentary', 1], ['Series'], ['Short']])}
    ${chips('Based in', [['The UK', 1, 'a']], 1)}
    ${chips('Stage', [['Writing'], ['Development', 1], ['Production'], ['Post']])}</div>`

  // 5. The two reminders, one a week out and one the day before: one stack, nothing marked.
  const shortlist = (c) => `<div style="width:${P_(c, 100, 86)}%;display:grid;gap:${P_(c, 2.4, 2)}cqi;${c === 'square' ? 'zoom:.86' : ''}">
    ${notif('13', 'A week to go: Doc Edge Pitch', 'Closes Sun 20 Dec, 10:59')}${notif('19', 'Tomorrow: Doc Edge Pitch', 'Closes Sun 20 Dec, 10:59')}</div>`

  // 6. The application, still blank: that part is yours.
  const form = (c) => `<div class="tz-form" style="width:${P_(c, 74, 62)}cqi">
    <div class="head">${S('label', 'Application form')}${sp('metadata', 'Page 1 of 4', 'class="soft"')}</div>
    ${[[1, 62], [2, 84], [3, 48]].slice(0, P_(c, 3, 2)).map(([k, w]) => `<div class="row">${sp('metadata', `${k}.`, 'class="soft"')}<i style="width:${w}%"></i></div>`).join('')}
    <div class="sig">${sp('metadata', 'Signed', 'class="soft"')}<span></span></div></div>`

  const SLIDES = [
    page('Filmmaker friends', 'Filmmaker friends,', ['Ever wished grant and festival deadlines showed up in your own time zone?', 'Well, now they do.'], '', { g: 'var(--paper)' }),
    page('Introducing', 'Introducing Call Sheet.', ['Film and TV grants, festivals, labs and fellowships in one free list.', 'Soonest deadlines first, in your time zone when it’s given.'], tzList, { g: 'var(--paper)', pt: 1.5 }),
    page('Time zones', '“Wait, is that midnight here or midnight there?”', ['When a fund gives us an exact closing time and time zone, Call Sheet shows what that means for you.'], clocks, { g: 'var(--goldenrod)', hw: '17ch' }),
    page('Filters', 'Find opportunities that fit what you’re making.', ['Choose your project type, where you’re based and what stage you’re at.', 'Then check who can apply, what it costs and what you need to send.'], filters, { g: 'var(--salmon)', hw: '17ch', pt: 1.5 }),
    page('Shortlist', 'Found a few worth applying to?', ['Save them to your shortlist.', 'Add the deadlines to your calendar.', 'Get a reminder a week before, <span style="white-space:nowrap">and the day before.</span>'], shortlist, { g: 'var(--pink)', wrap: 'pretty' }),
    page('Your part', 'You still have to do the application.', ['But hopefully, we’ve saved you some of the time you’d spend finding it and figuring it out.'], form, { g: 'var(--blue)' }),
    closer(),
  ]
  carousel('tz', SLIDES, 'Deadlines in your time zone. Filmmaker friends, ever wished grant and festival deadlines showed up in your own time zone? Well, now they do. Introducing Call Sheet: film and TV grants, festivals, labs and fellowships in one free list, soonest deadlines first, in your time zone when it’s given. A printed list shows closing times worked out for someone in London: TorinoFilmLab ComedyLab at 15:00 on 30 November, and Doc Edge Pitch at 10:59 on 20 December, circled in red. “Wait, is that midnight here or midnight there?” Two clocks: midnight in Los Angeles, 08:00 in London. When a fund gives an exact closing time and time zone, Call Sheet shows what that means for you. Find opportunities that fit what you’re making: choose your project type, where you’re based and what stage you’re at, then check who can apply, what it costs and what you need to send. Save the ones worth applying to, add the deadlines to your calendar, and get a reminder a week before and the day before. You still have to do the application, but hopefully Call Sheet saves you some of the time you’d spend finding it and figuring it out. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')

}

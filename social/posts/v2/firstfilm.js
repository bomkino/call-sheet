// firstfilm: Post 05, "Making your first film?" The team's copy, in the FIRST carousel's design.
// Four first-film opportunities, one per slide, each with its own piece of paperwork.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .firstfilm-when { display: flex; align-items: center; gap: .55em; }
    .firstfilm-when .chip-dot { width: .6em; height: .6em; }
  </style>`)

  // The closing line of each example (eligibility, dates) sits on its own, after a red dot.
  const when = (t) => `<div class="firstfilm-when mt-s">${swatch}${sp('subhead', t)}</div>`
  // A slide: kicker, the first line as display, the rest as subhead lines, then the paperwork.
  const card = (label, head, subs, last, obj, o = {}) => ({ g: o.g,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, `class="mt-m ${o.hw || 'measure'}"`)}${subs.map((t, k) => S('subhead', t, `class="${k ? 'mt-xs' : 'mt-s'} wide"`)).join('')}${last ? when(last) : ''}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:3cqb"><div style="zoom:${sq(c, ...(o.z || [1, 1]))}">${obj(c)}</div></div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  const SLIDES = [
    card('First film', 'Making your first film?', ['Here are 4 places you could get money to make it!'], '',
      (c) => `<div style="transform:rotate(-1.5deg)">${filmography(sq(c, 62, 50))}</div>`, { g: 'var(--pink)', z: [1.22, 1] }),
    card('First documentary', '£120,000 for your first documentary.', ['The Whickers fund one director’s first documentary of 50 minutes or more.'], 'Free to enter. Opens 24 November.',
      (c) => `<div style="transform:rotate(-2deg)">${cheque(sq(c, 70, 58), '£120,000', 'A first documentary')}</div>`, { g: 'var(--paper)', z: [1.12, .9] }),
    card('Directing debut', '$5,000 for your directing debut.', ['The WAVE Grant backs five first scripted films, each by a solo director.'], 'US residents only. Closes 15 November.',
      (c) => awards(sq(c, 66, 60)), { g: 'var(--yellow)', z: [1.28, 1] }),
    card('Aged 18 to 25', '18 to 25? $10,000 and a mentor.', ['The Michael Collyer Fellowship, for an original feature script. US citizens and green-card holders.'], 'Closes 8 January.',
      (c) => `<div style="width:${sq(c, 64, 56)}cqi;transform:rotate(1.5deg)">${sheetDoc('Michael Collyer Fellowship', [ln('Award', '$10,000'), ln('Plus', 'A mentor'), ln('Age', '18 to 25')])}</div>`, { g: 'var(--blue)', z: [1.18, .86] }),
    card('Students', 'Still a student?', ['The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less.'], 'Closes 30 November.',
      (c) => `<div style="transform:rotate(-3deg)">${idCard(sq(c, 56, 44))}</div>`, { g: 'var(--green)', z: [1.22, 1] }),
    closer(),
  ]

  carousel('firstfilm', SLIDES, 'Making your first film? Here are 4 places you could get money to make it! £120,000 for your first documentary: the Whickers fund one director’s first documentary of 50 minutes or more, free to enter, opening 24 November. $5,000 for your directing debut: the WAVE Grant backs five first scripted films, each by a solo director, for US residents only, closing 15 November. 18 to 25? $10,000 and a mentor: the Michael Collyer Fellowship, for an original feature script, for US citizens and green-card holders, closing 8 January. Still a student? The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less, closing 30 November. Each slide shows a piece of paperwork: an empty filmography, a £120,000 cheque, five $5,000 awards, a fellowship sheet and a student ID. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link!')
}

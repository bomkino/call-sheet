// firstfilm: Post 05, "Making your first film?" The team's copy, verbatim; the last slide is closer().
// Calm by design: one piece of paperwork per slide, at most one red loop, nothing overlapping.
// The thread is a quiet band above the footer listing the four amounts, with the current one in ink.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .firstfilm-when { display: flex; align-items: center; gap: .55em; }
    .firstfilm-when .chip-dot { width: .6em; height: .6em; }
    .firstfilm-band { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.4cqi; }
    .firstfilm-band > div { display: grid; gap: 1.2cqi; }
    .firstfilm-band b { display: block; height: .45cqi; border-radius: 1cqi; background: var(--rule-strong); }
    .firstfilm-band .on b { height: .45cqi; background: var(--ink); }
    .firstfilm-doc { background: var(--sheet); box-shadow: var(--lift); }
    .firstfilm-doc i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .firstfilm-cheque { padding: 4cqi 4.6cqi 3.6cqi; display: grid; gap: .4cqi; }
    .firstfilm-cards { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2.4cqi; }
    .firstfilm-cards > div { grid-column: span 2; padding: 2.8cqi 3cqi 3.2cqi; display: grid; gap: 1.6cqi; align-content: start; }
    .firstfilm-cards > div:nth-child(4) { grid-column: 2 / span 2; }
    .firstfilm-cards.row { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1.8cqi; }
    .firstfilm-cards.row > div { grid-column: auto; padding: 2.2cqi 1.8cqi 2.6cqi; }
    .firstfilm-form { padding: 4cqi 4.6cqi 3cqi; display: grid; }
    .firstfilm-form .head { padding-bottom: 1.8cqi; margin-bottom: .6cqi; border-bottom: .3cqi solid var(--ink); }
    .firstfilm-form .row { display: flex; justify-content: space-between; align-items: baseline; gap: 3cqi; padding: 1.6cqi 0; border-bottom: 1.5px solid var(--rule); }
    .firstfilm-form .row:last-child { border-bottom: 0; }
    .firstfilm-id { border-radius: 2cqi; overflow: hidden; }
    .firstfilm-id .band { background: var(--ink); color: var(--sheet); --pd-type-ink: var(--sheet); padding: 2.4cqi 3.4cqi; }
    .firstfilm-id .bd { display: grid; grid-template-columns: 15cqi 1fr; gap: 3.4cqi; padding: 3.4cqi; align-items: center; }
    .firstfilm-id .face { width: 15cqi; height: 19cqi; border-radius: 1cqi; background: #d9d3c7; }
    .firstfilm-id .lines { display: grid; gap: 1.6cqi; }
  </style>`)

  // The thread: the four places as four amounts, the current one in ink.
  const PLACES = ['£120,000', '$5,000', '$10,000', '$3,000']
  const band = (k) => `<div class="firstfilm-band">${PLACES.map((t, j) => `<div class="${j === k ? 'on' : ''}"><b></b>${sp('metadata', t, j === k ? '' : 'class="soft"')}</div>`).join('')}</div>`

  /* ---- the paperwork, one object per slide ------------------------------ */
  const loopAmount = (html) => circ(html, 'wide', { l: '-9%', t: '-24%', w: '118%', h: '150%' })

  const chequeDoc = (w) => `<div class="firstfilm-doc firstfilm-cheque" style="width:${w}cqi">${sp('metadata', 'Award', 'class="soft"')}
    <div class="ln" style="margin-top:1.6cqi">${sp('body', 'Pay')}<span class="lead"></span><span class="v">${loopAmount(sp('headline', '£120,000'))}</span></div>
    <div class="ln">${sp('body', 'For')}<span class="lead"></span><span class="v">${sp('label', 'A first documentary')}</span></div>
    <div class="sign" style="margin-top:2.4cqi">${sp('headline', '×')}<span></span></div></div>`

  // Five award cards on a tidy grid: three over two on portrait, one row on square.
  const five = (c) => {
    const row = c === 'square'
    return `<div class="firstfilm-cards${row ? ' row' : ''}" style="width:${row ? 80 : 76}cqi">${[1, 2, 3, 4, 5].map(k => `<div class="firstfilm-doc">
      ${sp('metadata', `Film ${k}`, 'class="soft"')}<div style="zoom:${row ? .54 : .74}">${sp('headline', '$5,000')}</div></div>`).join('')}</div>`
  }

  const form = (w) => `<div class="firstfilm-doc firstfilm-form" style="width:${w}cqi"><div class="head">${sp('label', 'Michael Collyer Fellowship')}</div>
    ${[['Age', loopAmount(sp('label', '18 to 25'))], ['Script', sp('label', 'Original feature')], ['Award', sp('label', '$10,000')], ['Plus', sp('label', 'A mentor')]]
      .map(([k, v]) => `<div class="row">${sp('body', k)}${v}</div>`).join('')}</div>`

  const idDoc = (w) => `<div class="firstfilm-doc firstfilm-id" style="width:${w}cqi"><div class="band">${sp('label', 'Student')}</div>
    <div class="bd"><i class="face"></i><div class="lines">${bars(92, 74, 56)}</div></div></div>`

  /* ---- the slide: same grid every time ---------------------------------- */
  const when = (t) => `<div class="firstfilm-when mt-s">${swatch}${sp('subhead', t)}</div>`
  const card = (label, head, subs, last, obj, o = {}) => ({ g: o.g,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, 'class="mt-m measure"')}${subs.map((t) => S('subhead', t, 'class="mt-s wide"')).join('')}${last ? when(last) : ''}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:${sq(c, 3.4, 2.4)}cqb 0 ${sq(c, 4.4, 3.4)}cqb">${obj ? `<div style="zoom:${sq(c, ...(o.z || [1, .8]))}">${obj(c)}</div>` : ''}</div>
      ${band(o.k)}<div class="mt-s"></div>
      ${i === 1 ? `<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : foot()}` })

  const SLIDES = [
    // Slide 1 is replaced by the cover poster (v2/covers/firstfilm.js); this stays as the fallback.
    card('First film', 'Making your first film?', ['Here are 4 places you could get money to make it!'], '',
      () => filmography(62), { g: 'var(--pink)', k: -1, z: [1.1, .8] }),
    card('First documentary', '£120,000 for your first documentary.', ['The Whickers fund one director’s first documentary of 50 minutes or more.'], 'Free to enter. Opens 24 November.',
      () => chequeDoc(76), { g: 'var(--buff)', k: 0, z: [.94, .78] }),
    card('Directing debut', '$5,000 for your directing debut.', ['The WAVE Grant backs five first scripted films, each by a solo director.'], 'US residents only. Closes 15 November.',
      five, { g: 'var(--yellow)', k: 1, z: [1, 1] }),
    card('Aged 18 to 25', '18 to 25? $10,000 and a mentor.', ['The Michael Collyer Fellowship, for an original feature script. US citizens and green-card holders.'], 'Closes 8 January.',
      () => form(66), { g: 'var(--blue)', k: 2, z: [.8, .58] }),
    card('Students', 'Still a student?', ['The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less.'], 'Closes 30 November.',
      () => idDoc(60), { g: 'var(--green)', k: 3, z: [1, .74] }),
    closer(),
  ]

  carousel('firstfilm', SLIDES, 'Making your first film? Here are 4 places you could get money to make it! £120,000 for your first documentary: the Whickers fund one director’s first documentary of 50 minutes or more. Free to enter. Opens 24 November. $5,000 for your directing debut: the WAVE Grant backs five first scripted films, each by a solo director. US residents only. Closes 15 November. 18 to 25? $10,000 and a mentor: the Michael Collyer Fellowship, for an original feature script. US citizens and green-card holders. Closes 8 January. Still a student? The Carole Dorothy Joyce Student Grant gives $3,000 plus donated services, for films budgeted at $50,000 or less. Closes 30 November. Each slide shows one piece of paperwork: a £120,000 cheque, five $5,000 award cards, a fellowship form and a student ID, above a band listing the four amounts. Last slide: Call Sheet, by pitch.dog. Find film and TV grants, festivals, labs and fellowships, all in one place. Totally free! Comment Call Sheet and we will send you the link!')
}

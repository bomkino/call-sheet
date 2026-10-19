// Cover poster for the firstfilm carousel. Calls cover('firstfilm', {...}).
// A clapperboard, bigger than the frame: the question is chalked in the PROD. field, take one,
// and the promise is written on a strip of camera tape, the way a first AC labels a slate.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-firstfilm-clap { position: absolute; z-index: 1; transform-origin: 0 0; }
    .cv-firstfilm-stick { position: absolute; left: 0; right: 0; height: 10cqi; border-radius: .6cqi; overflow: hidden; background: #f4f1ea; }
    .cv-firstfilm-stick svg { display: block; width: 100%; height: 100%; }
    .cv-firstfilm-stick.top { transform-origin: 2.6cqi 100%; box-shadow: 0 1px 1px rgb(21 19 15 / .3), 0 2.6cqi 3.4cqi -1.4cqi rgb(21 19 15 / .5); }
    .cv-firstfilm-hinge { position: absolute; width: 4.2cqi; height: 4.2cqi; border-radius: 50%; background: #c9c3b8; box-shadow: inset 0 0 0 .7cqi #8f897f, 0 .3cqi .5cqi rgb(0 0 0 / .4); }
    .cv-firstfilm-slate { position: relative; background: #1d1b18; color: var(--sheet); --pd-type-ink: var(--sheet); border-radius: 0 0 1.4cqi 1.4cqi; box-shadow: 0 1px 1px rgb(21 19 15 / .25), 0 1.2cqi 2cqi -.6cqi rgb(21 19 15 / .35), 0 6cqi 9cqi -3cqi rgb(21 19 15 / .55); overflow: hidden; }
    .cv-firstfilm-slate .row { position: relative; border-bottom: .45cqi solid rgb(243 239 230 / .8); }
    .cv-firstfilm-slate .row:last-child { border-bottom: 0; }
    .cv-firstfilm-slate .cells { display: grid; }
    .cv-firstfilm-slate .cells > div { position: relative; padding: 1.6cqi 2.4cqi 1.8cqi; border-right: .45cqi solid rgb(243 239 230 / .8); }
    .cv-firstfilm-slate .cells > div:last-child { border-right: 0; }
    .cv-firstfilm-lbl { display: block; opacity: .62; }
    .cv-firstfilm-head { font-size: 13.4cqi; line-height: .9; }
    .cv-firstfilm-take { font-size: 30cqi; line-height: .74; letter-spacing: -.06em; display: block; }
    .cv-firstfilm-mid { font-size: 9cqi; line-height: .8; display: block; }
    .cv-firstfilm-blank { display: block; height: 2.6cqi; }
    .cv-firstfilm-tape { position: absolute; z-index: 3; background: #ece2c6; color: var(--ink); --pd-type-ink: var(--ink); padding: 2.2cqi 5cqi 2.4cqi 4.4cqi;
      box-shadow: 0 1px 1px rgb(21 19 15 / .25), 0 .8cqi 1.2cqi -.6cqi rgb(21 19 15 / .4);
      clip-path: polygon(0 4%, 1.2% 0, 98.4% 2%, 100% 14%, 98.9% 30%, 100% 47%, 99.1% 66%, 100% 84%, 98.6% 100%, 1.4% 97%, 0 86%, .9% 70%, 0 52%, 1% 34%, 0 18%); }
    .cv-firstfilm-tape > div { max-inline-size: 22ch; }
    .cv-firstfilm-chalk path { fill: none; stroke: rgb(243 239 230 / .07); stroke-linecap: round; }
    .cv-firstfilm-boxes { display: flex; gap: 2.4cqi; margin-top: 1.4cqi; }
    .cv-firstfilm-boxes span { border: .3cqi solid rgb(243 239 230 / .55); padding: .5cqi 1cqi .3cqi; border-radius: .4cqi; }
    .cv-firstfilm-boxes span.on { background: rgb(243 239 230 / .9); color: #1d1b18; --pd-type-ink: #1d1b18; }
    .cv-firstfilm-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-firstfilm-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-firstfilm-arrow path { fill: none; stroke: var(--marker); stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
  </style>`)

  const W = 124  // the board is wider than the frame, so it bleeds off both sides
  // Diagonal stripes: black and white, like every clapper on every set.
  const stripes = (off) => `<svg viewBox="0 0 ${W} 10" preserveAspectRatio="none" aria-hidden="true"><rect width="${W}" height="10" fill="#1d1b18"/>${Array.from({ length: 12 }, (_, k) => { const x = k * 11 + off; return `<polygon points="${x},10 ${x + 5.5},10 ${x + 11},0 ${x + 5.5},0" fill="#f4f1ea"/>` }).join('')}</svg>`
  // Eraser smears: last take's chalk, half wiped.
  const chalk = `<svg class="cv-firstfilm-chalk" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
    <path d="M14 22 C 30 18, 52 26, 74 20" style="stroke-width:7"/><path d="M58 30 C 66 27, 80 31, 92 27" style="stroke-width:4"/><path d="M8 63 C 18 60, 26 66, 40 61" style="stroke-width:5"/></svg>`
  const lbl = (t) => sp('metadata', t, 'class="cv-firstfilm-lbl"')
  const cells = (cols, html) => `<div class="row cells" style="grid-template-columns:${cols}"><div style="border-right:0"></div>${html}</div>`

  const board = (c) => {
    const sqr = c === 'square'
    return `<div class="cv-firstfilm-clap" style="left:-9cqi;width:${W}cqi;top:${sqr ? 32.5 : 26.5}cqb;transform:rotate(-4deg)">
      <div class="cv-firstfilm-stick top" style="top:-10.6cqi;transform:rotate(${sqr ? -11 : -13}deg)">${stripes(-3)}</div>
      <div class="cv-firstfilm-stick" style="position:relative;border-radius:.6cqi .6cqi 0 0">${stripes(2.5)}</div>
      <i class="cv-firstfilm-hinge" style="left:10.6cqi;top:-6.4cqi"></i>
      <div class="cv-firstfilm-slate">${chalk}
        <div class="row" style="padding:1.8cqi 4cqi 2.8cqi 13cqi">
          <div style="display:flex;justify-content:space-between;align-items:baseline">${lbl('Prod.')}<div class="cv-firstfilm-boxes" style="margin:0 12cqi 0 0;${sqr ? 'display:none' : ''}">${['Int.', 'Ext.'].map((t, k) => `<span class="${k ? '' : 'on'}">${sp('metadata', t)}</span>`).join('')}${['Day', 'Night'].map((t, k) => `<span class="${k ? 'on' : ''}">${sp('metadata', t)}</span>`).join('')}</div></div>
          ${S('display', `Making your ${circ('first', 'wide', { l: '-9%', t: '-6%', w: '118%', h: '124%' })} film?`, 'class="cv-firstfilm-head" style="margin-top:2cqi;max-inline-size:6.4em"')}
        </div>
        ${cells('11cqi 1fr 1fr 1.25fr', `<div>${lbl('Roll')}${sqr ? '' : '<span class="cv-firstfilm-mid" data-pd-social="metric" style="margin-top:3.4cqi">A001</span>'}</div>
          <div>${lbl('Scene')}${sqr ? '' : '<span class="cv-firstfilm-mid" data-pd-social="metric" style="margin-top:3.4cqi">1</span>'}</div>
          <div>${lbl('Take')}<span class="cv-firstfilm-take" data-pd-social="metric" style="margin:1cqi 0 -1.4cqi;font-size:${sqr ? 27 : 30}cqi">1</span></div>`)}
        ${sqr ? cells('11cqi 1.3fr 1fr 1fr', `<div>${lbl('Director')}<span class="cv-firstfilm-blank"></span></div><div>${lbl('Camera')}<span class="cv-firstfilm-blank"></span></div><div>${lbl('Date')}<span class="cv-firstfilm-blank" style="height:30cqi"></span></div>`) : ''}
      </div>
      <div class="cv-firstfilm-tape" style="left:${sqr ? 15 : 13}cqi;top:${sqr ? 41.5 : 63.5}cqi;transform:rotate(${sqr ? 2 : 2.5}deg)">${S('subhead', 'Here are 4 places you could get money to make it!')}</div>
    </div>`
  }
  // The swipe cue, drawn: a marker arrow that runs on towards the edge of the frame.
  const arrow = `<svg class="cv-firstfilm-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`

  cover('firstfilm', { g: 'var(--pink)', dark: false,
    art: board,
    html: (c, i, n) => `${c === 'square' ? `<div class="top">${swatch}${sp('metadata', 'First film', 'class="soft"')}<span style="margin-left:2cqi">${N(i, n)}</span></div>` : ctop('First film', i, n)}<div class="grow"></div><div class="foot" ${c === 'square' ? 'style="color:var(--sheet);--pd-type-ink:var(--sheet)"' : ''}>${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-firstfilm-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>` })
}

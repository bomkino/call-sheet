// Cover poster for the how carousel. Calls cover('how', {...}).
// A one-minute sand timer, standing taller than the frame and cut off by its top edge,
// with the sand mid-fall: the minute has started, and the next six slides fit inside it.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-how-glass { position: absolute; z-index: 1; aspect-ratio: 1 / 2; transform-origin: 50% 0; }
    .cv-how-glass svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .cv-how-head { font-size: 13.2cqi; line-height: .88; }
    .cv-how-arrow path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; stroke-width: 5.5; }
    .cv-how-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-how-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-how-tape { display: inline-block; background: #ece2c6; padding: 1.1cqi 2.4cqi 1cqi; margin-left: -2cqi; transform: rotate(-2.5deg); box-shadow: 0 1px 1px rgb(21 19 15 / .2), 0 .6cqi 1cqi -.5cqi rgb(21 19 15 / .35);
      clip-path: polygon(0 8%, 2% 0, 97% 4%, 100% 22%, 98.6% 50%, 100% 80%, 97.6% 100%, 2.4% 95%, 0 74%, 1.4% 46%); }
  </style>`)

  // The glass, drawn once: two bulbs pinched to a neck at the middle.
  const glass = 'M 21 13 C 13 52, 30 78, 46.4 96.5 L 46.4 103.5 C 30 122, 13 148, 21 187 L 79 187 C 87 148, 70 122, 53.6 103.5 L 53.6 96.5 C 70 78, 87 52, 79 13 Z'
  // A turned beech post: shaft, highlight, and three beads.
  const post = (x) => `<rect x="${x}" y="11" width="6.4" height="178" fill="#8a5a34"/><rect x="${x + 1.2}" y="11" width="1.5" height="178" fill="#b98352" opacity=".8"/>
    ${[30, 170].map(y => `<ellipse cx="${x + 3.2}" cy="${y}" rx="5.2" ry="3.4" fill="#8a5a34"/><ellipse cx="${x + 2.4}" cy="${y - .8}" rx="2.4" ry="1.4" fill="#c99560" opacity=".8"/>`).join('')}`
  const cap = (y, top) => `<rect x="0" y="${y}" width="100" height="12" rx="2.4" fill="#9a6a3e"/><rect x="1.2" y="${top ? y + .8 : y + 1}" width="97.6" height="3" rx="1.4" fill="#c18a55" opacity=".85"/><rect x="0" y="${y + 9.6}" width="100" height="2.4" rx="1.2" fill="#6e4526"/>`
  const timer = `<svg viewBox="0 0 100 200" aria-hidden="true">
    <defs><clipPath id="cv-how-in"><path d="${glass}"/></clipPath></defs>
    <g transform="translate(7 4)" opacity=".16"><rect x="2.4" y="11" width="6.4" height="178" fill="#15130f"/><rect x="91.2" y="11" width="6.4" height="178" fill="#15130f"/><rect x="0" y="1" width="100" height="12" rx="2.4" fill="#15130f"/><rect x="0" y="187" width="100" height="12" rx="2.4" fill="#15130f"/><path d="${glass}" fill="#15130f" opacity=".35"/></g>
    ${post(91.2)}
    <path d="${glass}" fill="rgb(251 249 243 / .3)"/>
    <g clip-path="url(#cv-how-in)">
      <path d="M 0 68 C 26 69, 40 74, 50 84 C 60 74, 74 69, 100 68 L 100 101 L 0 101 Z" fill="#e6b640"/>
      <path d="M 50 84 C 60 74, 74 69, 100 68 L 100 101 L 50 101 Z" fill="#cf9b2a" opacity=".55"/>
      <path d="M 0 188 L 0 166 C 24 160, 40 146, 50 134 C 60 146, 76 160, 100 166 L 100 188 Z" fill="#e6b640"/>
      <path d="M 50 134 C 60 146, 76 160, 100 166 L 100 188 L 50 188 Z" fill="#cf9b2a" opacity=".55"/>
      <rect x="49.4" y="96" width="1.2" height="39" fill="#e6b640"/>
      ${[[49.1, 112], [50.7, 121], [49.5, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" fill="#e6b640"/>`).join('')}
    </g>
    <path d="${glass}" fill="none" stroke="rgb(251 249 243 / .9)" stroke-width="1.1"/>
    <path d="M 27 22 C 22 42, 27 63, 38 80" fill="none" stroke="#fbf9f3" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
    <path d="M 28 178 C 24 160, 28 140, 37 124" fill="none" stroke="#fbf9f3" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    <path d="M 74 30 C 77 40, 77 48, 75 56" fill="none" stroke="#fbf9f3" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
    ${post(2.4)}
    ${cap(1, true)}${cap(187, false)}
    <text x="50" y="195.6" font-size="4.2" font-weight="600" text-anchor="middle" letter-spacing=".9" fill="#6e4526" opacity=".9">1 MIN</text>
  </svg>`

  const art = (c) => {
    const sqr = c === 'square'
    const [x, y, w, r] = sqr ? [52, -14, 48, 3] : [42, -17.5, 62, 3]
    return `<div class="cv-how-glass" style="left:${x}cqi;top:${y}cqi;width:${w}cqi;transform:rotate(${r}deg)">${timer}</div>`
  }
  const arrow = `<svg class="cv-how-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`

  cover('how', { g: 'var(--blue)', dark: false, art,
    html: (c, i, n) => `${ctop('How it works', i, n)}${S('display', `Find your next grant in a ${circ('minute.', 'wide', { ml: '.18em', l: '-8%', t: '-13%', w: '121%', h: '134%' })}`, 'class="mt-m cv-how-head" style="max-inline-size:6.6em"')}${S('subhead', 'Call Sheet is a free list of film and TV grants, labs and festivals, sorted by deadline.', `class="mt-s" style="max-inline-size:${c === 'square' ? 12 : 12.5}ch"`)}<div class="grow"></div><div class="foot"><span class="cv-how-tape">${sp('credit', 'Call Sheet, by pitch.dog')}</span><span class="cv-how-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>` })
}

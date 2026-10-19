// Cover poster for the how carousel. Calls cover('how', {...}).
// A stopwatch, bigger than the frame, reset to zero and waiting for the press:
// one minute, which is about how long the next six slides take.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-how-watch { position: absolute; z-index: 1; }
    .cv-how-watch .body { position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 .4cqi .6cqi rgb(21 19 15 / .25), 0 3cqi 5cqi -1cqi rgb(21 19 15 / .3), 0 14cqi 22cqi -6cqi rgb(21 19 15 / .45); }
    .cv-how-watch svg { position: absolute; inset: -12%; width: 124%; height: 124%; overflow: visible; }
    .cv-how-watch text { font-family: inherit; fill: #15130f; }
    .cv-how-head { font-size: 13.2cqi; line-height: .88; }
    .cv-how-arrow path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .cv-how-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-how-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-how-arrow path { stroke-width: 5.5; }
    .cv-how-tape { display: inline-block; background: #ece2c6; padding: 1.1cqi 2.4cqi 1cqi; margin-left: -2cqi; transform: rotate(-2.5deg); box-shadow: 0 1px 1px rgb(21 19 15 / .2), 0 .6cqi 1cqi -.5cqi rgb(21 19 15 / .35);
      clip-path: polygon(0 8%, 2% 0, 97% 4%, 100% 22%, 98.6% 50%, 100% 80%, 97.6% 100%, 2.4% 95%, 0 74%, 1.4% 46%); }
  </style>`)

  const P = (r, deg) => { const t = deg * Math.PI / 180; return [(Math.sin(t) * r).toFixed(2), (-Math.cos(t) * r).toFixed(2)] }
  // The dial: fifths of a second, numbered every five, and a small register that counts minutes.
  const ticks = Array.from({ length: 300 }, (_, i) => { const big = i % 25 === 0, mid = i % 5 === 0
    const [x1, y1] = P(big ? 86 : mid ? 92 : 95, i * 1.2), [x2, y2] = P(99, i * 1.2)
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#15130f" stroke-width="${big ? 2.4 : mid ? 1.1 : .45}"/>` }).join('')
  const nums = Array.from({ length: 12 }, (_, k) => { const n = (k + 1) * 5; const [x, y] = P(74, n * 6)
    return `<text x="${x}" y="${y}" font-size="${n === 60 ? 15 : 11.5}" font-weight="${n === 60 ? 700 : 500}" text-anchor="middle" dominant-baseline="central">${n}</text>` }).join('')
  const sub = (cx, cy) => `<g transform="translate(${cx} ${cy})"><circle r="21" fill="none" stroke="#15130f" stroke-width=".8"/>${Array.from({ length: 30 }, (_, i) => { const [a, b] = P(i % 5 ? 18.5 : 16, i * 12), [c, d] = P(21, i * 12); return `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#15130f" stroke-width="${i % 5 ? .4 : .9}"/>` }).join('')}
    ${[[10, 120], [20, 240], [30, 0]].map(([n, a]) => { const [x, y] = P(11, a); return `<text x="${x}" y="${y}" font-size="5.4" text-anchor="middle" dominant-baseline="central">${n}</text>` }).join('')}
    <text y="7" font-size="3.6" text-anchor="middle" letter-spacing=".6">MIN</text>
    <line x1="0" y1="2" x2="0" y2="-16" stroke="#15130f" stroke-width="1.6" stroke-linecap="round" transform="rotate(12)"/><circle r="2.2" fill="#15130f"/></g>`
  const watch = `<svg viewBox="-134 -134 268 268" aria-hidden="true">
    <g transform="rotate(14)">
      <rect x="-9" y="-131" width="18" height="12" rx="2.5" fill="#bdb6aa"/><rect x="-12" y="-136" width="24" height="7" rx="3" fill="#d9d3c8"/><rect x="-5" y="-120" width="10" height="6" fill="#a39c90"/>
    </g>
    <g transform="rotate(58)"><rect x="-7" y="-126" width="14" height="10" rx="2" fill="#bdb6aa"/><rect x="-9.5" y="-130" width="19" height="6" rx="2.6" fill="#d9d3c8"/></g>
    <circle r="118" fill="#c9c3b8"/><circle r="114" fill="#e4dfd6"/>
    <path d="M -96 -62 A 114 114 0 0 1 -30 -110" fill="none" stroke="#fbf9f3" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <path d="M 90 70 A 114 114 0 0 1 30 110" fill="none" stroke="#a39c90" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <circle r="105" fill="#15130f"/><circle r="101.5" fill="#fbf9f3"/>
    ${ticks}${nums}
    <text x="-30" y="-48" font-size="5.2" text-anchor="middle" letter-spacing="1.1" opacity=".7">1/5 SECOND</text>
    ${sub(0, 40)}
    <g><line x1="0" y1="24" x2="0" y2="-97" stroke="#15130f" stroke-width="1.9" stroke-linecap="round"/><circle cy="18" r="5" fill="none" stroke="#15130f" stroke-width="1.9"/><circle r="5.2" fill="#15130f"/><circle r="1.8" fill="#c9c3b8"/></g>
  </svg>`
  const art = (c) => {
    const sqr = c === 'square'
    const [cx, cy, d] = sqr ? [84, 97, 81] : [58, 126, 112]
    return `<div class="cv-how-watch" style="left:${cx - d / 2}cqi;top:${cy - d / 2}cqi;width:${d}cqi;height:${d}cqi;transform:rotate(${sqr ? -8 : -1}deg)"><div class="body"></div>${watch}</div>`
  }
  const arrow = `<svg class="cv-how-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`

  cover('how', { g: 'var(--blue)', dark: false, art,
    html: (c, i, n) => `${ctop('How it works', i, n)}${S('display', `Find your next grant in a ${circ('minute.', 'wide', { ml: '.18em', l: '-8%', t: '-13%', w: '121%', h: '134%' })}`, 'class="mt-m cv-how-head" style="max-inline-size:6.6em"')}${S('subhead', 'Call Sheet is a free list of film and TV grants, labs and festivals, sorted by deadline.', `class="mt-s" style="max-inline-size:${c === 'square' ? 15 : 17}ch"`)}<div class="grow"></div><div class="foot">${c === 'square' ? sp('credit', 'Call Sheet, by pitch.dog') : `<span class="cv-how-tape">${sp('credit', 'Call Sheet, by pitch.dog')}</span>`}<span class="cv-how-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>` })
}

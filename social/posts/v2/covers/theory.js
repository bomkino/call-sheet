// Cover poster for the theory carousel. Calls cover('theory', {...}).
// A conspiracy board. "Conspiracy theory:" on a torn clipping, the theory itself typed on an index
// card, and the guidelines pinned up behind it with red string running clause to clause, to the one
// word that gives the game away, and on out of the frame.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-theory-board { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
    .cv-theory-board > * { position: absolute; }
    .cv-theory-cork { inset: 0; width: 100%; height: 100%; }
    .cv-theory-page { background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift); padding: 2.6cqi 3cqi; display: grid; gap: 1.1cqi; align-content: start; }
    .cv-theory-page i { display: block; height: .9cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
    .cv-theory-page i.hl { background: rgb(244 223 119); height: 1.5cqi; margin: -.3cqi -.6cqi; border-radius: .3cqi .6cqi .4cqi .2cqi; }
    .cv-theory-page .hd { display: flex; justify-content: space-between; gap: 2cqi; padding-bottom: 1cqi; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: .6cqi; }
    .cv-theory-clip { background: var(--paper); color: var(--ink); --pd-type-ink: var(--ink); padding: 3.4cqi 6cqi 3.8cqi;
      box-shadow: 0 1px 1px rgb(21 19 15 / .2), 0 1.4cqi 2.4cqi -1cqi rgb(21 19 15 / .45);
      clip-path: polygon(0 3%, 3% 0, 9% 2%, 16% 0, 24% 1.5%, 33% 0, 41% 2%, 50% .5%, 58% 2%, 67% 0, 75% 1.6%, 84% .2%, 92% 2%, 100% 0, 99% 18%, 100% 34%, 98.6% 52%, 100% 70%, 99% 86%, 100% 100%, 92% 98.4%, 84% 100%, 75% 98%, 66% 99.6%, 57% 98%, 48% 100%, 39% 98.2%, 30% 100%, 21% 98.4%, 12% 99.6%, 4% 98%, 0 100%, 1.2% 82%, 0 64%, 1.4% 46%, 0 28%); }
    .cv-theory-clip .big { font-size: 15.6cqi; line-height: .84; letter-spacing: -.045em; }
    .cv-theory-card { background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); padding: 3.6cqi 4.6cqi 4.4cqi; box-shadow: var(--lift); }
    .cv-theory-card .say { font-size: 6.3cqi; line-height: 1.02; position: relative; }
    .cv-theory-card .rules { position: absolute; inset: 0; pointer-events: none; }
    .cv-theory-svg { overflow: visible; }
  </style>`)

  const f = (n) => n.toFixed(2)
  // Cork: goldenrod board, flecked darker and lighter. A fixed seed, so it's the same board every time.
  const cork = (W, H) => { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    const dots = Array.from({ length: 1400 }, () => { const x = rnd() * W, y = rnd() * H, r = .12 + rnd() * .38, dark = rnd() < .62
      return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * (1 + rnd()))}" ry="${f(r)}" transform="rotate(${Math.round(rnd() * 180)} ${f(x)} ${f(y)})" fill="${dark ? `rgb(120 78 20 / ${f(.18 + rnd() * .3)})` : `rgb(255 240 200 / ${f(.2 + rnd() * .3)})`}"/>` }).join('')
    return `<svg class="cv-theory-cork" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${dots}</svg>` }
  // A pushpin, seen from the front: head, a rim and a glint, and its shadow on the board.
  const PIN = { ink: ['#2b2824', '#15130f', '#6e6a62'], cream: ['#f1ead8', '#cfc6b0', '#ffffff'], blue: ['#4f78b8', '#36578c', '#a9c4ec'], yellow: ['#f2cf4a', '#c9a326', '#fff3b8'] }
  const pin = (x, y, c = 'ink', s = 2.6) => { const [a, b, g] = PIN[c]
    return `<g transform="translate(${x} ${y})"><ellipse cx="${s * .55}" cy="${s * .7}" rx="${s * .95}" ry="${s * .8}" fill="rgb(40 25 5 / .32)"/>
      <circle r="${s}" fill="${b}"/><circle r="${s * .8}" cy="${-s * .1}" fill="${a}"/><circle cx="${-s * .32}" cy="${-s * .4}" r="${s * .26}" fill="${g}" opacity=".85"/></g>` }
  // Red string from pin to pin, sagging a little, with a faint shadow on the cork.
  const string = (pts, sag = .05) => { const d = pts.slice(1).map((p, k) => { const a = pts[k], L = Math.hypot(p[0] - a[0], p[1] - a[1])
      return `Q${f((a[0] + p[0]) / 2)} ${f((a[1] + p[1]) / 2 + L * sag)} ${f(p[0])} ${f(p[1])}` }).join(' ')
    const path = `M${f(pts[0][0])} ${f(pts[0][1])} ${d}`
    return `<path d="${path}" transform="translate(.5 .9)" fill="none" stroke="rgb(40 25 5 / .25)" stroke-width=".55" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="#c2381f" stroke-width=".5" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="#e3472d" stroke-width=".26" stroke-linecap="round" stroke-dasharray=".6 .5" opacity=".7"/>` }
  const bars = (...w) => w.map(x => x === 'hl' ? '<i class="hl" style="width:78%"></i>' : `<i style="width:${x}%"></i>`).join('')
  const page = (style, hd, pg, body) => `<div class="cv-theory-page" style="${style}"><div class="hd">${sp('metadata', hd, 'class="soft"')}${sp('metadata', pg, 'class="soft"')}</div>${body}</div>`

  // A coffee ring, left by someone who read the rules twice.
  const ring = (style) => `<svg viewBox="-12 -12 24 24" style="${style}" aria-hidden="true"><circle r="9.6" fill="none" stroke="rgb(120 74 24 / .22)" stroke-width="1.1"/><circle r="9.1" cx=".3" cy=".2" fill="none" stroke="rgb(120 74 24 / .14)" stroke-width=".5"/><path d="M-8 6 A10 10 0 0 0 7 7" fill="none" stroke="rgb(120 74 24 / .18)" stroke-width="1.8"/></svg>`

  cover('theory', { g: 'var(--buff)', dark: false,
    art: (c) => {
      const sqr = c === 'square', H = sqr ? 100 : 125
      const L = sqr
        ? { clip: 11, p1: [-5, 39, -7], p2: [31, 36, 4], p3: [66, 41, -3], card: [26, 55, 1.8, 70, 5.1] }
        : { clip: 12, p1: [-5, 43, -7], p2: [33, 40, 4], p3: [68, 46, -3], card: [8, 72, 1.6, 86, 6.3] }
      // Pins on the highlighted clauses, one beside the giveaway word, and the string's way out.
      const P = sqr
        ? { a: [24, 52], b: [54, 51.5], c: [85, 55], d: [29.6, 69.4], e: [104, 50] }
        : { a: [11, 57.8], b: [56, 56.5], c: [86, 60.5], d: [11.6, 93.2], e: [104, 63] }
      const [cx, cy, cr, cw, cf] = L.card
      return `<div class="cv-theory-board">${cork(100, H)}
        ${page(`left:${L.p1[0]}cqi;top:${L.p1[1]}cqi;width:40cqi;transform:rotate(${L.p1[2]}deg)`, 'Guidelines', 'p. 3', bars(92, 80, 'hl', 88, 64, 90, 76, 84, 58, 80, 66))}
        ${page(`left:${L.p2[0]}cqi;top:${L.p2[1]}cqi;width:36cqi;transform:rotate(${L.p2[2]}deg)`, 'Annex B', '§ 4.2', bars(86, 94, 70, 88, 'hl', 82, 60, 92, 74, 84))}
        ${page(`left:${L.p3[0]}cqi;top:${L.p3[1]}cqi;width:38cqi;transform:rotate(${L.p3[2]}deg)`, 'Eligibility', circ('p. 9', 'round', { l: '-30%', t: '-40%', w: '160%', h: '180%' }), bars(90, 72, 84, 'hl', 66, 88, 80, 70))}
        ${ring(`left:${sqr ? 40 : 42}cqi;top:${sqr ? 40 : 44}cqi;width:15cqi;height:15cqi;transform:rotate(30deg)`)}
        <svg class="cv-theory-svg" viewBox="0 0 100 ${H}" style="inset:0;width:100%;height:100%;z-index:3" aria-hidden="true">
          ${string([P.a, P.b, P.c])}${string([P.c, P.e], .02)}
          ${pin(...P.a, 'yellow')}${pin(...P.b, 'blue')}${pin(...P.c, 'cream')}</svg>
        <div class="cv-theory-clip" style="left:4cqi;top:${L.clip}cqi;width:${sqr ? 86 : 88}cqi;transform:rotate(-2.5deg);z-index:4">
          ${S('display', 'Conspiracy theory:', 'class="big"')}</div>
        <div class="cv-theory-card" style="left:${cx}cqi;top:${cy}cqi;width:${cw}cqi;padding-left:${sqr ? 6.4 : 7.6}cqi;transform:rotate(${cr}deg);z-index:6">
          ${S('headline', `Filmmaking grants and festival submissions are ${circ('deliberately', 'wide', { l: '-6%', t: '-12%', w: '112%', h: '130%' })} confusing, so you’re too tired to apply after reading the rules!!`, `class="say" style="font-size:${cf}cqi"`)}</div>
        <svg class="cv-theory-svg" viewBox="0 0 100 ${H}" style="inset:0;width:100%;height:100%;z-index:7" aria-hidden="true">
          ${string([P.a, P.d], .02)}${pin(50, L.clip + 1.6, 'ink', 2.4)}${pin(...P.d, 'yellow', 2.2)}</svg>
      </div>`
    },
    html: (c, i, n) => `${ctop('A theory', i, n)}<div class="grow"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` })
}

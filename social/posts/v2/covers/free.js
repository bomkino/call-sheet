// Cover poster for the free carousel. Calls cover('free', {...}).
// One long till receipt for all twelve: every line comes to 0.00, the total is underlined twice
// the way a bookkeeper does it, and the stamp lands across the lot.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-free-rcpt { position: absolute; z-index: 1; transform-origin: 0 0; }
    .cv-free-paper { position: relative; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); padding: 3cqi 5cqi 2.8cqi;
      box-shadow: 0 1px 1px rgb(21 19 15 / .12), 0 1cqi 1.6cqi -.6cqi rgb(21 19 15 / .22), 0 5cqi 8cqi -3cqi rgb(21 19 15 / .4); }
    .cv-free-zz { position: absolute; left: 0; width: 100%; height: 2.4cqi; display: block; }
    .cv-free-zz path { fill: var(--sheet); }
    .cv-free-head { font-size: 9cqi; line-height: .9; }
    .cv-free-rule { border: 0; border-top: .3cqi dashed rgb(21 19 15 / .35); margin: 2cqi 0 1.2cqi; }
    .cv-free-item { display: grid; grid-template-columns: 7cqi auto 1fr auto; gap: 1.4cqi; align-items: baseline; padding: .3cqi 0; }
    .cv-free-item .lead { border-bottom: .25cqi dotted rgb(21 19 15 / .32); transform: translateY(-.3em); }
    .cv-free-item > span { font-size: 1.9cqi; white-space: nowrap; overflow: hidden; }
    .cv-free-item .nm { text-overflow: clip; }
    .cv-free-item .v { font-variant-numeric: tabular-nums; }
    .cv-free-total { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.2cqi; }
    .cv-free-total .big { font-size: 12cqi; position: relative; }
    .cv-free-dbl { position: absolute; left: -4%; width: 110%; bottom: -3.2cqi; height: 3cqi; overflow: visible; }
    .cv-free-dbl path, .cv-free-arrow path { fill: none; stroke: var(--marker); stroke-linecap: round; stroke-linejoin: round; }
    .cv-free-ring { position: absolute; z-index: 0; overflow: visible; pointer-events: none; }
    .cv-free-ring path { fill: none; stroke-linecap: round; }
    .cv-free-swipe { display: flex; align-items: center; gap: 1.6cqi; margin-right: -3cqi; }
    .cv-free-arrow { width: 15cqi; height: 6cqi; overflow: visible; }
    .cv-free-arrow path { stroke-width: 5.5; }
  </style>`)

  const zz = (top) => `<svg class="cv-free-zz" viewBox="0 0 100 3" preserveAspectRatio="none" style="${top ? 'bottom:calc(100% - 1px);transform:scaleY(-1)' : 'top:calc(100% - 1px)'}" aria-hidden="true"><path d="M0 0 H100 ${Array.from({ length: 34 }, (_, k) => `L${100 - k * 100 / 34 - 50 / 34} 3 L${100 - (k + 1) * 100 / 34} 0`).join(' ')} Z"/></svg>`
  const day = (iso) => `${+iso.slice(8)} ${mon(iso)}`
  const name = (f) => short(f.title).replace(/ call$/, '')
  const item = (f) => `<div class="cv-free-item">${sp('metadata', day(f.closes), 'class="soft"')}${sp('metadata', name(f), 'class="nm"')}<span class="lead"></span>${sp('metadata', '0.00', 'class="v"')}</div>`
  // A bookkeeper's double underline, drawn fast.
  const dbl = `<svg class="cv-free-dbl" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 3 C 30 1.6, 64 3.8, 98 2" style="stroke-width:1.6"/><path d="M5 8 C 36 6.8, 70 8.6, 96 7" style="stroke-width:1.4"/></svg>`
  const arrow = `<svg class="cv-free-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M3 24 C 24 19, 46 27, 68 21 S 88 18, 96 19"/><path d="M83 7 C 88 12, 92 15, 97 19 C 91 22, 87 27, 84 33"/></svg>`
  // Last night's mug, set down on the desk.
  // Last night's mug, set down on the receipt: a ring that's darker where the coffee pooled.
  const ring = (style) => `<svg class="cv-free-ring" viewBox="-50 -50 100 100" style="${style}" aria-hidden="true">
    <path d="M -40 8 A 41 41 0 1 1 30 29" style="stroke:rgb(150 96 42 / .22);stroke-width:3"/>
    <path d="M 26 32 A 41 41 0 0 1 -41 4" style="stroke:rgb(150 96 42 / .34);stroke-width:4.6"/>
    <path d="M -36 -14 A 38 38 0 0 1 14 -36" style="stroke:rgb(150 96 42 / .12);stroke-width:1.4"/></svg>`

  const receipt = (c, i, n) => {
    const sqr = c === 'square'
    const items = (window.FREE || []).slice(0, 12)
    return `    <div class="cv-free-rcpt" style="left:5.5cqi;top:-2cqi;width:88cqi;transform:rotate(-2.6deg)">
      <div class="cv-free-paper">${zz(false)}${ring(`position:absolute;left:${sqr ? -6 : 56}cqi;top:${sqr ? 50 : 69}cqi;width:30cqi;height:30cqi`)}
        <div class="top" style="justify-content:space-between;padding-top:3.4cqi"><div class="top">${swatch}${sp('metadata', 'Save this', 'class="soft"')}</div>${N(i, n)}</div>
        ${S('display', `Twelve funding opportunities for your film that are<br>${circ('COMPLETELY&nbsp;FREE', 'long', { l: '-3%', t: '-12%', w: '106%', h: '128%' })} to apply for.`, 'class="cv-free-head" style="margin-top:3.2cqi"')}
        <hr class="cv-free-rule" style="margin-top:3cqi">
        <div style="display:flex;justify-content:space-between;padding-bottom:.6cqi">${sp('metadata', 'Closes', 'class="soft"')}${sp('metadata', 'Entry fee', 'class="soft"')}</div>
        ${items.slice(0, sqr ? 2 : 12).map(item).join('')}
        <hr class="cv-free-rule">
        <div class="cv-free-total">${sp('label', 'Total')}<span class="big" data-pd-social="metric">0.00${dbl}</span></div>
      </div>
      ${stamp('free', `left:${sqr ? 8 : 5}cqi;top:${sqr ? 54 : 62}cqi;width:${sqr ? 54 : 60}cqi;transform:rotate(-10deg)`)}
    </div>`
  }

  cover('free', { g: 'var(--yellow)', dark: false,
    art: (c) => receipt(c, 1, 6),
    html: (c, i, n) => `<div class="grow"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}<span class="cv-free-swipe">${sp('credit', 'Swipe')}${arrow}</span></div>` })
}

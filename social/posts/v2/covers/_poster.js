// The cover system. Every cover is the same calm poster: words on clean ground at the top, one simple
// object below them in its own zone, the footer at the bottom. The zones can't overlap, by construction.
// The object is an SVG drawn to its own viewBox; it scales to fit the zone and may bleed off the right edge.
const POSTER_R = { portrait: 80, square: 80 }   // the frame's right inset, so an object can bleed to the edge
function poster ({ g, dark, label, pre, head, sub, words, obj, hw = '14ch', sw = '24em', bleed = true, align = 'xMax' }) {
  return { g, dark, html: (c, i, n) => {
    const svg = typeof obj === 'function' ? obj(c) : obj
    return `${ctop(label, i, n)}
<div>${words ? words(c) : `${pre ? S('subhead', pre, 'class="mt-m"') : ''}${S('display', head, `class="${pre ? 'mt-xs' : 'mt-m'}" style="max-inline-size:${hw}"`)}${sub ? S('subhead', sub, `class="mt-s${dark ? ' soft' : ''}" style="max-inline-size:${sw}"`) : ''}`}</div>
<div class="grow" style="position:relative;margin:${sq(c, 5, 4)}cqi ${bleed ? -POSTER_R[c] : 0}px ${sq(c, 4, 3)}cqi 0">${!svg.startsWith('<svg') ? svg : svg.replace('<svg ', `<svg preserveAspectRatio="${align}YMax meet" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" `)}</div>
<div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` } }
}
// Drawing helpers: one shadow tone, paper, ink, toner.
const PV = { paper: '#FBF9F3', ink: '#15130F', toner: '#66625A', rule: '#D9D3C7', shade: 'rgba(21,19,15,.14)', head: 'var(--pd-font-head)', mono: 'var(--pd-font-eyebrow)' }

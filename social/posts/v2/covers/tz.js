// Cover: a plain clock, two minutes to midnight.
{
  const ticks = Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6, big = k % 3 === 0, r1 = big ? 232 : 250
    return `<line x1="${380 + Math.sin(a) * r1}" y1="${300 - Math.cos(a) * r1}" x2="${380 + Math.sin(a) * 268}" y2="${300 - Math.cos(a) * 268}" stroke="${PV.ink}" stroke-width="${big ? 14 : 7}" stroke-linecap="round"/>` }).join('')
  const hand = (deg, len, w) => `<line x1="380" y1="300" x2="${380 + Math.sin(deg * Math.PI / 180) * len}" y2="${300 - Math.cos(deg * Math.PI / 180) * len}" stroke="${PV.ink}" stroke-width="${w}" stroke-linecap="round"/>`
  const clock = `<svg viewBox="0 0 560 610" aria-hidden="true">
  <circle cx="396" cy="318" r="292" fill="${PV.shade}"/>
  <circle cx="380" cy="300" r="292" fill="${PV.paper}" stroke="${PV.ink}" stroke-width="12"/>
  ${ticks}${hand(-1, 165, 20)}${hand(-12, 235, 12)}
  <circle cx="380" cy="300" r="16" fill="${PV.ink}"/>
</svg>`
  cover('tz', poster({ g: 'var(--yellow)', label: 'Deadlines', obj: clock,
    words: (c) => `${S('subhead', 'Filmmaker friends,', 'class="mt-m"')}${S('headline', 'Ever wished grant and festival deadlines showed up in your own time zone?', 'class="mt-xs" style="max-inline-size:20ch"')}${S('display', `Well, ${circ('now', 'wide', { l: '-6%', t: '-6%', w: '112%', h: '118%' })} they do.`, 'class="mt-s"')}` }))
}

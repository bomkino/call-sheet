// Cover: one page of guidelines, pinned to the wall.
{
  const rows = [86, 70, 92, 60, 84, 78, 52, 88, 66].map((w, k) => `<rect x="70" y="${150 + k * 38}" width="${w * 3.6}" height="14" rx="7" fill="${PV.rule}"/>`).join('')
  const page = `<svg viewBox="0 0 560 560" aria-hidden="true"><g transform="rotate(4 300 300)">
  <rect x="58" y="66" width="440" height="520" rx="10" fill="${PV.shade}"/>
  <rect x="40" y="48" width="440" height="520" rx="10" fill="${PV.paper}"/>
  <text x="70" y="118" font-family="${PV.mono}" font-size="24" letter-spacing="3" fill="${PV.toner}">GUIDELINES</text>
  <text x="450" y="118" text-anchor="end" font-family="${PV.mono}" font-size="24" fill="${PV.toner}">§ 4.2</text>
  ${rows}</g>
  <ellipse cx="270" cy="58" rx="20" ry="9" fill="${PV.shade}"/><circle cx="262" cy="46" r="20" fill="${PV.ink}"/><circle cx="256" cy="40" r="6" fill="${PV.toner}"/>
</svg>`
  cover('theory', poster({ g: 'var(--buff)', label: 'A theory', head: 'Conspiracy theory:', sw: '22em', align: 'xMid', bleed: false,
    sub: `Filmmaking grants and festival submissions are ${circ('deliberately', 'wide', { l: '-4%', t: '-10%', w: '108%', h: '124%' })} confusing, so you’re too tired to apply after reading the rules!!`, obj: page }))
}

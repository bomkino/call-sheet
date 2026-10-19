// Cover: a price tag. The price is nothing.
{
  const art = `<svg viewBox="0 0 700 380" aria-hidden="true">
  <g transform="rotate(-7 400 200)">
    <path d="M196 62 H720 V362 H196 L96 212 Z" fill="${PV.shade}" transform="translate(16 18)"/>
    <path d="M196 62 H720 V362 H196 L96 212 Z" fill="${PV.paper}"/>
    <circle cx="160" cy="212" r="20" fill="var(--green)"/>
    <text x="250" y="140" font-family="${PV.mono}" font-size="30" letter-spacing="4" fill="${PV.toner}">ENTRY FEE</text>
    <text x="242" y="300" font-family="${PV.head}" font-weight="800" font-size="170" fill="${PV.ink}">0.00</text>
  </g>
</svg>`
  cover('free', poster({ g: 'var(--green)', label: 'Save this', hw: '18ch',
    head: `${FREE_N} funding opportunities for your film that are ${circ('COMPLETELY&nbsp;FREE', 'long', { l: '-2%', t: '-10%', w: '104%', h: '124%' })} to apply for.`, obj: art }))
}

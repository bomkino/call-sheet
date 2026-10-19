// Cover: a one-minute sand timer.
{
  const art = `<svg viewBox="0 0 420 600" aria-hidden="true">
  <rect x="78" y="40" width="300" height="560" rx="20" fill="${PV.shade}"/>
  <rect x="60" y="20" width="300" height="44" rx="14" fill="${PV.ink}"/>
  <rect x="60" y="536" width="300" height="44" rx="14" fill="${PV.ink}"/>
  <rect x="84" y="64" width="16" height="472" fill="${PV.ink}"/><rect x="320" y="64" width="16" height="472" fill="${PV.ink}"/>
  <path d="M120 70 H300 C300 190 226 250 218 300 C226 350 300 410 300 530 H120 C120 410 194 350 202 300 C194 250 120 190 120 70 Z" fill="${PV.paper}" stroke="${PV.ink}" stroke-width="6"/>
  <path d="M150 170 H270 C258 220 222 262 210 296 C198 262 162 220 150 170 Z" fill="#E6B640"/>
  <rect x="207" y="296" width="6" height="170" fill="#E6B640"/>
  <path d="M130 524 C150 470 190 452 210 452 C230 452 270 470 290 524 Z" fill="#E6B640"/>
</svg>`
  cover('how', poster({ g: 'var(--blue)', label: 'How it works', align: 'xMid', bleed: false,
    head: `Find your next grant in a ${circ('minute.', 'wide', { l: '-5%', t: '-6%', w: '110%', h: '118%' })}`,
    sub: 'Call Sheet is a free list of film and TV grants, labs and festivals, sorted by deadline.', obj: art }))
}

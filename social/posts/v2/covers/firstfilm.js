// Cover: a clapperboard, sticks open, on take one.
{
  const stripes = (y) => Array.from({ length: 10 }, (_, k) => { const x = 40 + k * 80; return `<polygon points="${x},${y} ${x + 40},${y} ${x + 15},${y + 52} ${x - 25},${y + 52}" fill="${PV.paper}"/>` }).join('')
  const stick = (y, extra = '') => `<g ${extra}><clipPath id="cv-ff-c${y}"><rect x="40" y="${y}" width="680" height="52" rx="6"/></clipPath><rect x="40" y="${y}" width="680" height="52" rx="6" fill="${PV.ink}"/><g clip-path="url(#cv-ff-c${y})">${stripes(y)}</g></g>`
  const board = `<svg viewBox="0 0 560 540" aria-hidden="true">
  <rect x="58" y="248" width="680" height="282" rx="16" fill="${PV.shade}"/>
  <rect x="40" y="230" width="680" height="282" rx="16" fill="${PV.ink}"/>
  ${stick(176)}
  ${stick(176, 'transform="rotate(-17 46 176)"')}
  <circle cx="58" cy="202" r="11" fill="${PV.toner}"/>
  <text x="96" y="306" font-family="${PV.mono}" font-size="26" letter-spacing="3" fill="#B9B3A9">TAKE</text>
  <text x="84" y="492" font-family="${PV.head}" font-weight="800" font-size="200" fill="${PV.paper}">1</text>
</svg>`
  cover('firstfilm', poster({ g: 'var(--pink)', label: 'First film',
    head: `Making your ${circ('first', 'wide', { l: '-5%', t: '-6%', w: '110%', h: '118%' })} film?`,
    sub: 'Here are 4 places you could get money to make it!', obj: board }))
}

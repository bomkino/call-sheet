// Cover: a reel, its film running out of frame.
{
  const holes = Array.from({ length: 6 }, (_, k) => { const a = k * Math.PI / 3; return `<circle cx="${200 + Math.cos(a) * 98}" cy="${360 + Math.sin(a) * 98}" r="44" fill="var(--ink)"/>` }).join('')
  const sprockets = (y) => Array.from({ length: 14 }, (_, k) => `<rect x="${250 + k * 46}" y="${y}" width="22" height="16" rx="3" fill="var(--ink)"/>`).join('')
  const art = `<svg viewBox="0 0 640 600" aria-hidden="true">
  <g transform="rotate(-14 250 330)">
    <rect x="240" y="250" width="700" height="150" fill="${PV.paper}"/>${sprockets(262)}${sprockets(372)}
    ${[0, 1, 2, 3].map(k => `<rect x="${262 + k * 170}" y="290" width="150" height="70" rx="4" fill="#3A3732"/>`).join('')}
    <rect x="262" y="290" width="150" height="70" rx="4" fill="#A8C8EA"/><path d="M262 360 L310 322 L350 344 L412 310 V360 Z" fill="#B5D9A2"/><circle cx="380" cy="308" r="10" fill="#F4DF77"/>
  </g>
  <circle cx="200" cy="360" r="210" fill="${PV.paper}"/>${holes}
  <circle cx="200" cy="360" r="30" fill="${PV.toner}"/><circle cx="200" cy="360" r="12" fill="var(--ink)"/>
</svg>`
  cover('why', poster({ g: 'var(--ink)', dark: true, label: 'Call Sheet',
    head: `Why good films ${circ('miss', 'wide', { l: '-6%', t: '-6%', w: '112%', h: '118%' })} good funds`,
    sub: 'It’s rarely the film.', obj: art }))
}

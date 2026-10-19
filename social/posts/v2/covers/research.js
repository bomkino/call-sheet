// Cover: a browser with far too many tabs open.
{
  const tabs = Array.from({ length: 13 }, (_, k) => `<rect x="${64 + k * 44}" y="44" width="40" height="34" rx="6" fill="${k === 12 ? PV.paper : '#E2DDD3'}"/>`).join('')
  const art = `<svg viewBox="0 0 640 460" aria-hidden="true">
  <rect x="58" y="38" width="680" height="430" rx="16" fill="${PV.shade}"/>
  <rect x="40" y="20" width="680" height="430" rx="16" fill="${PV.ink}"/>${tabs}
  <rect x="52" y="78" width="656" height="360" rx="6" fill="${PV.paper}"/>
  <text x="84" y="138" font-family="${PV.mono}" font-size="22" letter-spacing="2" fill="${PV.toner}">FILM FUNDING</text>
  ${[0, 1, 2, 3, 4, 5].map(k => `<rect x="84" y="${170 + k * 38}" width="${[420, 360, 440, 300, 400, 340][k]}" height="12" rx="6" fill="${PV.rule}"/>`).join('')}
</svg>`
  cover('research', poster({ g: '#F3EFE6', label: 'Research', hw: '17ch',
    head: '“At this point, I need funding for the time I spend looking for film funding.”', obj: art }))
}

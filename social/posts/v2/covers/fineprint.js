// Cover: a magnifying glass over the fine print, and the one word it finds.
{
  const rows = Array.from({ length: 9 }, (_, k) => `<rect x="80" y="${70 + k * 34}" width="${[560, 480, 600, 420, 560, 520, 460, 600, 380][k]}" height="10" rx="5" fill="${PV.rule}"/>`).join('')
  const art = `<svg viewBox="0 0 720 420" aria-hidden="true">
  <rect x="58" y="38" width="760" height="370" rx="10" fill="rgba(21,19,15,.22)"/>
  <rect x="40" y="20" width="760" height="370" rx="10" fill="${PV.paper}"/>${rows}
  <line x1="470" y1="300" x2="590" y2="400" stroke="${PV.ink}" stroke-width="38" stroke-linecap="round"/>
  <circle cx="362" cy="196" r="150" fill="rgba(21,19,15,.22)" transform="translate(12 14)"/>
  <circle cx="362" cy="196" r="150" fill="${PV.paper}" stroke="${PV.ink}" stroke-width="20"/>
  <text x="362" y="226" text-anchor="middle" font-family="${PV.head}" font-weight="800" font-size="96" fill="${PV.ink}">catch</text>
</svg>`
  cover('fineprint', poster({ g: '#CF3B52', dark: true, label: 'The fine print', hw: '17ch', align: 'xMax',
    head: 'Sometimes, film festivals and funding opportunities come with a catch.',
    sub: 'It’s usually somewhere in the fine print.', obj: art }))
}

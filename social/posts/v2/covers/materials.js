// Cover: three documents three funds want, side by side.
{
  const doc = (x, rot, label, extra = '') => `<g transform="rotate(${rot} ${x + 120} 300)">
    <rect x="${x + 14}" y="${96}" width="240" height="320" rx="8" fill="${PV.shade}"/>
    <rect x="${x}" y="80" width="240" height="320" rx="8" fill="${PV.paper}"/>
    <text x="${x + 24}" y="130" font-family="${PV.mono}" font-size="22" letter-spacing="2" fill="${PV.ink}">${label}</text>
    ${[0, 1, 2, 3, 4].map(k => `<rect x="${x + 24}" y="${168 + k * 34}" width="${[180, 150, 170, 120, 160][k]}" height="10" rx="5" fill="${PV.rule}"/>`).join('')}${extra}</g>`
  const art = `<svg viewBox="0 0 800 440" aria-hidden="true">
  ${doc(10, -6, 'TREATMENT')}
  ${doc(280, 2, 'SCRIPT', `<circle cx="296" cy="150" r="7" fill="${PV.ink}"/><circle cx="296" cy="340" r="7" fill="${PV.ink}"/>`)}
  ${doc(550, -3, 'BUDGET (EUR)', `<text x="766" y="380" text-anchor="end" font-family="${PV.head}" font-weight="800" font-size="64" fill="${PV.ink}">€</text>`)}
</svg>`
  cover('materials', poster({ g: 'var(--goldenrod)', label: 'What to send', align: 'xMid', bleed: false,
    words: () => `${S('subhead', 'One film grant wants a treatment.<br>Another wants a script.<br>Another wants a budget in euros.', 'class="mt-m"')}${S('display', 'And you’re trying to keep track of all three.', 'class="mt-s" style="max-inline-size:15ch"')}`,
    obj: art }))
}

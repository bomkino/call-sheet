// Cover: four frames of one film, from nothing to finished.
{
  const sprockets = (y) => Array.from({ length: 16 }, (_, k) => `<rect x="${12 + k * 44}" y="${y}" width="22" height="16" rx="3" fill="var(--salmon)"/>`).join('')
  const f = (k) => 20 + k * 172
  const frames = [
    `<rect x="${f(0)}" y="60" width="150" height="110" rx="4" fill="${PV.paper}"/>`,
    `<rect x="${f(1)}" y="60" width="150" height="110" rx="4" fill="${PV.paper}"/><path d="M${f(1) + 10} 150 L${f(1) + 60} 112 L${f(1) + 92} 134 L${f(1) + 140} 104" fill="none" stroke="${PV.toner}" stroke-width="3"/><circle cx="${f(1) + 112}" cy="86" r="12" fill="none" stroke="${PV.toner}" stroke-width="3"/>`,
    `<rect x="${f(2)}" y="60" width="150" height="110" rx="4" fill="#B9B3A9"/><path d="M${f(2)} 170 V150 L${f(2) + 60} 112 L${f(2) + 92} 134 L${f(2) + 150} 100 V170 Z" fill="#7D776D"/><circle cx="${f(2) + 112}" cy="86" r="12" fill="#E2DDD3"/>`,
    `<rect x="${f(3)}" y="60" width="150" height="110" rx="4" fill="#A8C8EA"/><path d="M${f(3)} 170 V150 L${f(3) + 60} 112 L${f(3) + 92} 134 L${f(3) + 150} 100 V170 Z" fill="#7FB86A"/><circle cx="${f(3) + 112}" cy="86" r="12" fill="#F4DF77"/>`]
  const art = `<svg viewBox="0 0 680 236" aria-hidden="true">
  <rect x="16" y="34" width="720" height="190" fill="${PV.shade}"/>
  <rect x="0" y="20" width="720" height="190" fill="${PV.ink}"/>${sprockets(32)}${sprockets(182)}${frames.join('')}
</svg>`
  cover('stages', poster({ g: 'var(--salmon)', label: 'Where you’re at', align: 'xMin',
    words: () => `${S('display', 'You don’t need a finished film.', 'class="mt-m" style="max-inline-size:14ch"')}${S('subhead', 'There are opportunities you can apply for while you’re still writing, shooting or editing.', 'class="mt-s" style="max-inline-size:24em"')}${S('subhead', 'Here are six, depending on where your project’s at.', 'class="mt-xs" style="max-inline-size:24em"')}`,
    obj: art }))
}

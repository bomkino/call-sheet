// Post 11: Funding for looking for funding. The team's copy, verbatim; the last slide is closer().
// One red marker line: on slide 2 it runs round the search in a loop it can't get out of, on slide 3
// it shakes itself loose, on slide 4 it picks the filters, and on slide 5 it goes straight to the date.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
  .research-thread { position: absolute; left: -80px; width: 1080px; z-index: 4; pointer-events: none; overflow: visible; }
  .research-thread path { fill: none; stroke: var(--marker); stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; }
  .research-steps { list-style: none; display: grid; }
  .research-steps li { display: grid; grid-template-columns: 13cqi 1fr; align-items: baseline; }
  .research-steps li .n { color: var(--marker-text); --pd-type-ink: var(--marker-text); }
  .research-sheet { position: relative; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); box-shadow: var(--lift); }
  .research-sheet i, .research-card i, .research-short i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .14); }
  .research-form { padding: 3cqi 3.6cqi 3.4cqi; display: grid; gap: 1.5cqi; }
  .research-form .hd, .research-short .hd { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.4cqi; border-bottom: 1.5px solid var(--rule-strong); }
  .research-form .f { display: grid; gap: .9cqi; }
  .research-form .box { height: 4.6cqi; border: 1.5px solid var(--rule-strong); border-radius: .5cqi; }
  .research-form .go { justify-self: end; margin-top: .6cqi; padding: 1.3cqi 3cqi 1.1cqi; background: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); border-radius: 4cqi; }
  .research-card header { display: flex; justify-content: space-between; align-items: center; padding: 2.4cqi 4.4cqi 2cqi; padding-right: 11cqi; border-bottom: 3px solid var(--ink); }
  .research-card header img { height: 5.2cqi; width: auto; }
  .research-card .chips { display: flex; gap: 7.4cqi; padding: 2.8cqi 11cqi 2.6cqi 4.4cqi; }
  .research-card .rows { border-top: 3px solid var(--ink); }
  .research-card .chip { padding: 1.3cqi 2.2cqi 1.1cqi; border-radius: 5cqi; background: var(--ink); color: var(--paper); --pd-type-ink: var(--paper); white-space: nowrap; }
  .research-card .chip::before { content: ""; display: inline-block; width: .7em; height: .7em; margin-right: .55em; vertical-align: .04em; border-radius: 50%; background: var(--marker); }
  .research-card .rows { padding: .4cqi 4.4cqi 1.4cqi; }
  .research-card .row { display: grid; grid-template-columns: 1fr 26cqi 6cqi; gap: 3cqi; align-items: center; padding: 1.1cqi 0; border-bottom: 1.5px solid var(--rule); }
  .research-card .row:last-child { border-bottom: 0; }
  .research-card .row svg { width: 5.4cqi; height: 5.4cqi; overflow: visible; }
  .research-card .row svg path { fill: none; stroke: var(--marker); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  .research-short { padding: 2.4cqi 3.2cqi 1.2cqi; border-radius: 1cqi; }
  .research-short .it { display: grid; grid-template-columns: 3.2cqi 1fr; gap: 2.2cqi; align-items: center; padding: 1.6cqi 0; border-bottom: 1.5px solid var(--rule); }
  .research-short .it:last-child { border-bottom: 0; }
  .research-short .it .b { display: grid; gap: 1cqi; }
  .research-short svg { width: 3.2cqi; height: 4cqi; }
  .research-month { border-radius: 1.2cqi; overflow: hidden; }
  .research-month .bind { background: var(--marker); color: var(--sheet); --pd-type-ink: var(--sheet); padding: 1.8cqi 2.6cqi 1.6cqi; }
  [data-pd-canvas="square"] .research-month .bind { padding: 1.1cqi 2.6cqi 1cqi; }
  [data-pd-canvas="square"] .research-month .grid { padding-top: 1cqi; padding-bottom: 1.2cqi; }
  .research-month .grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 1.6cqi 2cqi 2cqi; row-gap: .4cqi; }
  .research-month .grid > span { display: grid; place-items: center; }
  .research-month .grid > .wd { padding-bottom: .6cqi; }
  .research-month .grid > .off { opacity: .32; }
  </style>`)

  /* ---- the marker line: points in canvas pixels, smoothed into one hand-drawn stroke ---- */
  const curve = (p) => {
    let d = `M${p[0][0]} ${p[0][1]}`
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c
      const f = (v) => +v.toFixed(1)
      d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)}, ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)}, ${f(c[0])} ${f(c[1])}`
    }
    return d
  }
  // A stroke is a list of points and loops. A loop {c: centre, r: radii} leaves the line on its
  // tangent, goes once round and rejoins heading for the next point, the way a hand draws one.
  const expand = (items) => { const out = []
    items.forEach((it, k) => {
      if (Array.isArray(it)) { out.push(it); return }
      const A = out[out.length - 1], nx = items[k + 1], B = Array.isArray(nx) ? nx : nx.c
      const [cx, cy] = it.c, [rx, ry] = it.r
      const ang = (dx, dy, cw) => Math.atan2(cw ? -dx : dx, cw ? dy : -dy) * 180 / Math.PI
      let best
      for (const cw of it.cw === undefined ? [true, false] : [it.cw]) {
        const st = ang(cx - A[0], cy - A[1], cw), en = ang(B[0] - cx, B[1] - cy, cw)
        let sw = (((cw ? en - st : st - en) % 360) + 360) % 360; if (sw < 250) sw += 360
        if (!best || Math.abs(sw - 370) < Math.abs(best.sw - 370)) best = { cw, st, sw } }
      const n = Math.round(best.sw / 20)
      for (let j = 0; j <= n; j++) { const t = j / n, a = (best.st + (best.cw ? 1 : -1) * best.sw * t) * Math.PI / 180, g = .95 + .1 * t
        out.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]) } })
    return out }
  // runs: each run is one smooth stroke; consecutive runs meet at a sharp corner (an arrowhead).
  const thread = (c, runs) => runs ? `<svg class="research-thread" data-thread viewBox="0 0 1080 ${sq(c, 1350, 1080)}" style="top:-${sq(c, 92, 80)}px;height:${sq(c, 1350, 1080)}px" aria-hidden="true"><path d="${runs.map(r => curve(expand(r))).join(' ')}"/></svg>` : ''

  /* ---- a slide on the shared grid: kicker, the copy at the headline baseline, the object zone, the footer ---- */
  const page = (label, g, copy, zone, th, o = {}) => ({ g,
    html: (c, i, n) => `${ctop(label, i, n)}<div class="mt-m">${copy(c)}</div>
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding:${o.pt ? sq(c, ...o.pt) : sq(c, 3, 2.4)}cqb 0 ${sq(c, 2.6, 2.4)}cqb">${zone(c)}</div>${foot()}${thread(c, th && th[c])}` })
  const head = (t, hw = 'measure') => S('display', t, `class="${hw}"`)
  const sub = (t, first = true) => S('subhead', t, `class="${first ? 'mt-s' : 'mt-xs'} wide"`)
  const bars = (...w) => w.map(x => `<i style="width:${x}%"></i>`).join('')
  const bookmark = `<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M2 1h16v22l-8-6-8 6z" fill="#e3472d"/></svg>`
  const tickSvg = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 22 C 10 25, 13 29, 15 33 C 20 21, 27 11, 37 4"/></svg>`

  /* ---- slide 2: the five steps, a loop with no way out ---- */
  const STEPS = ['Finding an opportunity.', 'Checking if it’s still open.', 'Reading the requirements.', 'Finding out you’re not eligible.', 'Back to looking.']
  const steps = (c) => `<ol class="research-steps mt-m" style="row-gap:${sq(c, 3.4, 2.4)}cqb;max-inline-size:${sq(c, 80, 84)}cqi">${STEPS.map((t, k) => `<li data-a="step${k + 1}">${sp('metadata', `0${k + 1}`, `class="n" data-a="n${k + 1}"`)}${S('headline', t, `data-a="t${k + 1}"`)}</li>`).join('')}</ol>`

  /* ---- slide 3: no object. The loop from slide 2 is pulled out straight, like a spring. ---- */
  const coil = (c) => `<div data-a="coil" style="width:100%;height:100%"></div>`

  /* ---- slide 4: Call Sheet, filtered, with the three things to check ---- */
  const card = (c) => `<div class="paper ear research-card" data-a="card" style="width:100%;transform:rotate(-.8deg)"><span class="ear-flap"></span>
    <div class="chips">${['Documentary', 'Canada', 'Development'].map(t => `<span class="chip" data-a="chip-${t}">${sp('label', t)}</span>`).join('')}</div>
    ${c === 'square' ? '' : `<div class="rows">${[['Costs', 54], ['Requirements', 80], ['Deadlines', 40]].map(([t, w]) => `<div class="row">${sp('label', t)}<i style="width:${w}%"></i>${tickSvg}</div>`).join('')}</div>`}</div>`

  /* ---- slide 5: a shortlist, and the date on the calendar ---- */
  const shortlist = (c) => `<div class="research-sheet research-short" data-a="short" style="width:${sq(c, 38, 34)}cqi;transform:rotate(2.5deg)"><div class="hd">${sp('label', 'Saved')}</div>
    ${[[92, 60], [80, 66], [88, 50]].slice(0, sq(c, 3, 2)).map(([a, b]) => `<div class="it">${bookmark}<div class="b"><i style="width:${a}%"></i><i style="width:${b}%;opacity:.6"></i></div></div>`).join('')}</div>`
  const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Three weeks of a month. The date the line rings opens the first row, so it can come straight in from the left.
  const DAYS = Array.from({ length: 21 }, (_, k) => [k + 6, 0])
  const month = (c) => `<div class="research-sheet research-month" data-a="month" style="width:${sq(c, 50, 46)}cqi;transform:rotate(-1.5deg)"><div class="bind">${sp('label', 'Calendar')}</div><div class="grid">
    ${WD.map(d => `<span class="wd">${sp('metadata', d, 'class="soft"')}</span>`).join('')}
    ${DAYS.map(([d]) => `<span style="height:${sq(c, 7.4, 6.4)}cqi"${d === 6 ? ' data-a="due"' : ''}>${sp('label', d)}</span>`).join('')}</div></div>`
  const save = (c) => `<div style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:4cqi">${month(c)}${shortlist(c)}</div>`

  // The line's route, in canvas pixels, slide by slide. Each slide picks it up where the last one left it.
  const arrow = (x, y) => [[[x + 32, y - 26], [x, y]], [[x, y], [x + 34, y + 24]]]
  const cw = (c, r) => ({ c, r, cw: true })
  const TH = {
    s2: { portrait: [[[-20, 228], cw([96, 228], [44, 34]), cw([96, 424], [44, 34]), cw([96, 620], [44, 34]), cw([96, 816], [44, 34]), cw([96, 1012], [44, 34]),
        [150, 1086], [450, 1110], [850, 1096], [992, 1010], [1012, 800], [1006, 500], [980, 340], [900, 296], [700, 290]], ...arrow(700, 290)],
      square: [[[-20, 196], cw([96, 196], [42, 30]), cw([96, 288], [42, 30]), cw([96, 380], [42, 30]), cw([96, 538], [42, 30]), cw([96, 696], [42, 30]),
        [150, 764], [450, 792], [850, 782], [1008, 700], [1034, 500], [1030, 290], [1002, 212], [950, 186]], ...arrow(950, 186)] },
    s3: { portrait: [[[-20, 1080], [40, 1070], cw([210, 1000], [120, 150]), cw([400, 975], [84, 108]), cw([540, 952], [54, 70]), cw([640, 934], [30, 40]), [760, 922], [1100, 918]]],
      square: [[[-20, 860], [40, 852], cw([196, 760], [104, 126]), cw([370, 782], [72, 92]), cw([496, 800], [46, 58]), cw([586, 816], [26, 34]), [700, 830], [1100, 840]]] },
    s4: { portrait: [[[-20, 918], [30, 918], cw([226, 918], [128, 46]), cw([473, 915], [93, 46]), cw([719, 912], [126, 46]), [880, 868], [975, 920], [1100, 957]]],
      square: [[[-20, 840], [30, 840], cw([245, 843], [138, 50]), cw([524, 839], [101, 50]), cw([801, 835], [136, 50]), [975, 780], [1100, 734]]] },
    s5: { portrait: [[[-20, 957], [40, 957], { c: [133, 957], r: [40, 36] }, [64, 1020]]],
      square: [[[-20, 734], [40, 734], { c: [134, 734], r: [44, 33] }, [64, 796]]] },
  }

  carousel('research', [
    // 1. Replaced at load time by the cover poster in v2/covers/research.js.
    { g: 'var(--blue)', html: (c, i, n) => `${ctop('The search', i, n)}${S('display', '“At this point, I need funding for the time I spend looking for film funding.”', 'class="mt-m wide"')}<div class="grow"></div><div class="foot">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` },
    { g: 'var(--yellow)', html: (c, i, n) => `${ctop('The loop', i, n)}${steps(c)}<div class="grow"></div>${foot()}${thread(c, TH.s2 && TH.s2[c])}` },
    page('The time', 'var(--paper)', (c) => `${head('That’s time you could have spent on the film.', 'wide')}${sub('Or at least on an application you can actually submit.')}${sub('We wanted to make the finding part easier.', false)}`, coil, TH.s3),
    page('Call Sheet', 'var(--blue)', (c) => `${head('Introducing Call Sheet.')}${sub('Film and TV grants, festivals, labs and fellowships in one place.')}${sub('Filter by what you’re making, where you’re based and what stage you’re at.', false)}${sub('Then check the costs, requirements and deadlines.', false)}`, (c) => `<div style="width:100%;zoom:${sq(c, .84, 1)}">${card(c)}</div>`, TH.s4),
    page('Save', 'var(--green)', (c) => `${head('Save the opportunities worth a closer look.', 'wide')}${sub('Add the deadlines to your calendar.')}${sub('We can’t fund your research time. But hopefully, we can help you spend less of it.', false)}`, save, TH.s5),
    closer(),
  ], 'Funding for looking for funding. “At this point, I need funding for the time I spend looking for film funding.” Finding an opportunity. Checking if it’s still open. Reading the requirements. Finding out you’re not eligible. Back to looking: the five steps drawn as a red marker loop that circles back to the start. That’s time you could have spent on the film, or at least on an application you can actually submit, so pitch.dog wanted to make the finding part easier. Introducing Call Sheet: film and TV grants, festivals, labs and fellowships in one place. Filter by what you’re making, where you’re based and what stage you’re at, then check the costs, requirements and deadlines. Save the opportunities worth a closer look and add the deadlines to your calendar. We can’t fund your research time, but hopefully we can help you spend less of it. Last slide: Call Sheet, by pitch.dog. Comment Call Sheet and we will send you the link.')
}

// stages: Post 09, "You don't need a finished film". The team's copy, verbatim; the last slide is closer().
// The thread is a production timeline (idea, draft, shoot, edit, finished) along the foot of every slide.
// It runs off both edges, so the slides join up, and its red marker dot moves on one step per slide.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .stages-when { display: flex; align-items: center; gap: .55em; }
    .stages-tl { position: relative; margin: 0 -80px; padding: 0 80px; }
    .stages-tl .rail { position: relative; height: 4.4cqi; }
    .stages-tl .base { position: absolute; left: -80px; right: -80px; top: 50%; height: 2px; margin-top: -1px; background: var(--rule-strong); }
    .stages-tl .ticks { position: absolute; left: -80px; right: -80px; top: 50%; height: 1.4cqi; margin-top: -.7cqi;
      background: repeating-linear-gradient(to right, var(--rule-strong) 0 1.5px, transparent 1.5px 2.3cqi); opacity: .55; }
    .stages-tl .done { position: absolute; left: -80px; top: 50%; height: 3cqi; margin-top: -1.5cqi; overflow: visible; }
    .stages-tl .done path { fill: none; stroke: var(--marker); stroke-width: 6; stroke-linecap: round; vector-effect: non-scaling-stroke; }
    .stages-tl .stop { position: absolute; top: 50%; width: 1.9cqi; height: 1.9cqi; margin: -.95cqi 0 0 -.95cqi; border-radius: 50%; background: var(--g, var(--paper)); border: 2px solid rgb(21 19 15 / .45); }
    .stages-tl .stop.past { background: var(--ink); border-color: var(--ink); }
    .stages-tl .now { position: absolute; top: 50%; width: 4cqi; height: 4cqi; margin: -2cqi 0 0 -2cqi; border-radius: 50%; background: var(--marker); border: .6cqi solid var(--sheet); box-shadow: 0 .3cqi .8cqi rgb(21 19 15 / .35); }
    .stages-tl .names { position: relative; height: 3.6cqi; margin-top: .6cqi; }
    .stages-tl .names > span { position: absolute; top: 0; white-space: nowrap; }
    .stages-tl .names > span.on { opacity: 1; }
    .stages-stamp { position: absolute; padding: 1.2cqi 2.2cqi 1cqi; border: .55cqi solid var(--marker); border-radius: .8cqi; color: var(--marker-text); --pd-type-ink: var(--marker-text); opacity: .88; white-space: nowrap; }
    .stages-card { position: relative; background: var(--sheet); box-shadow: var(--lift); }
    .stages-card .rule { position: absolute; left: 0; right: 0; top: 9.6cqi; height: 2px; background: rgb(227 71 45 / .55); }
    .stages-card .lines { position: absolute; left: 0; right: 0; top: 9.6cqi; bottom: 0; background: repeating-linear-gradient(to bottom, transparent 0 calc(5.4cqi - 1.5px), rgb(76 123 217 / .22) calc(5.4cqi - 1.5px) 5.4cqi); }
    .stages-card .in { position: relative; padding: 3cqi 4.4cqi 3.6cqi; }
    .stages-title { aspect-ratio: 8.5 / 11; padding: 5cqi; background: var(--sheet); box-shadow: var(--lift); }
    .stages-title i { display: block; height: 1.1cqi; border-radius: 1cqi; background: rgb(21 19 15 / .13); }
    .stages-title .redact { display: block; height: 2.4cqi; background: var(--ink); }
  </style>`)

  /* ---- the thread: a production timeline -------------------------------- */
  const STOPS = ['Idea', 'Draft', 'Shoot', 'Edit', 'Finished']
  // p: where the project is, 0 (idea) to 4 (finished); fractions sit between two stops.
  const timeline = (c, p) => {
    const x = (k) => `${k * 25}%`
    // the stretch already travelled, drawn in marker: a slightly wobbly line from the left edge
    const done = p == null ? '' : `<svg class="done" viewBox="0 0 100 10" preserveAspectRatio="none" style="width:calc(80px + ${p * 25}%)" aria-hidden="true"><path d="M0 5.4 C 18 4.2, 34 6.2, 52 5 S 84 4.4, 100 5.2"/></svg>`
    return `<div class="stages-tl mt-s"><div class="rail"><i class="ticks"></i><i class="base"></i>${done}
      ${STOPS.map((t, k) => `<i class="stop${p != null && k < p ? ' past' : ''}" style="left:${x(k)}"></i>`).join('')}
      ${p == null ? '' : `<i class="now" style="left:${x(p)}"></i>`}</div>
      <div class="names">${STOPS.map((t, k) => {
        const on = p === k
        const al = k === 0 ? 'left:0' : k === 4 ? 'right:0' : `left:${x(k)};transform:translateX(-50%)`
        return `<span class="${on ? 'on' : ''}" style="${al}">${on ? circ(sp('metadata', t), 'wide', { l: '-22%', t: '-42%', w: '144%', h: '184%' }) : sp('metadata', t, 'class="soft"')}</span>`
      }).join('')}</div></div>`
  }

  /* ---- the paperwork ---------------------------------------------------- */
  // 2. The idea, on an index card, before there's any script.
  const ideaCard = (w) => `<div style="position:relative;width:${w}cqi">
    <div class="stages-card"><i class="lines"></i><i class="rule"></i><div class="in">
      <div style="display:flex;justify-content:space-between;align-items:baseline;height:6.6cqi">${sp('label', 'Feature idea')}</div>
      <div style="margin-top:.4cqi">${ln('Logline', 'One line')}${ln('Script draft', circ(sp('label', 'Not yet'), 'wide', { l: '-14%', t: '-34%', w: '128%', h: '168%' }))}</div></div></div>
    ${sticky('What if…?', 'position:absolute;right:-6cqi;top:-3.4cqi;transform:rotate(6deg);padding:1.6cqi 2.4cqi')}</div>`

  // 3. A first draft: the title page, stamped.
  const draft = (w) => `<div style="position:relative;width:${w * 1.62}cqi;height:${w * 11 / 8.5 + 2}cqi">
    <div class="stages-title" style="position:absolute;left:${w * .62}cqi;top:1cqi;width:${w}cqi;transform:rotate(5deg);padding:4cqi 4cqi;display:grid;gap:1.2cqi;align-content:start;overflow:hidden">
      <div style="display:flex;justify-content:flex-end">${sp('metadata', '1.', 'class="soft"')}</div>
      ${bars(94, 70)}<div style="display:grid;gap:1.2cqi;justify-items:center;margin:.8cqi 0">${bars(30, 52, 44)}</div>${bars(90, 84, 46)}<div style="display:grid;gap:1.2cqi;justify-items:center;margin-top:.8cqi">${bars(26, 48)}</div></div>
    <div class="stages-title" style="position:absolute;left:0;top:0;width:${w}cqi;transform:rotate(-3deg)">
      <div style="display:grid;gap:1.8cqi;justify-items:center;margin-top:16%"><b class="redact" style="width:64%"></b>${sp('metadata', 'Written by', 'class="soft"')}<b class="redact" style="width:42%"></b></div>
      <div class="stages-stamp" style="left:50%;bottom:5cqi;transform:translateX(-50%) rotate(-7deg)">${sp('headline', 'Draft&nbsp;1')}</div></div></div>`

  // 7. The finished film's festival entry.
  const ticket = (w) => `<div class="ticket" style="width:${w}cqi"><div>${sp('metadata', 'Festival entry', 'class="soft"')}${sp('headline', 'Feature documentary')}${sp('body', 'Finished after 1 Jan 2026', 'class="soft"')}</div><div class="stub">${sp('metadata', 'Admit one')}</div></div>`

  /* ---- the slide -------------------------------------------------------- */
  const stage = (label, head, sub, when, obj, o = {}) => ({ g: o.g,
    html: (c, i, n) => `${ctop(label, i, n)}${S('display', head, 'class="mt-m" style="max-inline-size:15ch"')}
      ${S('subhead', sub, 'class="mt-s wide"')}${when ? `<div class="stages-when mt-xs">${sp('subhead', when)}</div>` : ''}
      <div class="grow" style="display:flex;align-items:center;justify-content:center;padding-top:${sq(c, 3, 2)}cqb">${obj ? `<div style="zoom:${sq(c, ...(o.z || [1, .7]))}">${obj(c)}</div>` : ''}</div>
      ${timeline(c, o.p)}
      ${i === 1 ? `<div class="foot mt-s">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` : `<div class="mt-s"></div>${foot()}`}` })

  const SLIDES = [
    // Slide 1 is replaced by the cover poster (v2/covers/stages.js); this stays as the fallback.
    { g: 'var(--yellow)', html: (c, i, n) => `${ctop('Where you’re at', i, n)}${S('display', 'You don’t need a finished film.', 'class="mt-m" style="max-inline-size:15ch"')}
      ${S('subhead', 'There are opportunities you can apply for while you’re still writing, shooting or editing.', 'class="mt-s wide"')}
      ${S('subhead', 'Here are six, depending on where your project’s at.', 'class="mt-xs wide"')}<div class="grow"></div>${timeline(c, null)}
      <div class="foot mt-s">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` },
    stage('The idea', 'Haven’t written the script yet?', 'TorinoFilmLab ScriptLab accepts feature ideas that don’t have a script draft yet.', 'Closes 3 November.',
      (c) => `<div style="transform:rotate(-2deg)">${ideaCard(64)}</div>`, { g: 'var(--paper)', p: 0, z: [1.05, .74] }),
    stage('Development', 'Got a first draft?', 'TorinoFilmLab FeatureLab supports teams developing a director’s first or second feature, with at least a first draft ready.', 'Closes 5 November.',
      (c) => draft(27), { g: 'var(--buff)', p: 1, z: [1, .68] }),
    stage('A pilot script', 'Writing a series about science?', 'Sundance’s Sloan Episodic Science Grant gives $17,000 to one series about science.', 'Closes 3 December.',
      (c) => `<div style="transform:rotate(1.5deg)">${scriptPages('58cqi', 'Ext. Observatory – Night', '1.')}</div>`, { g: 'var(--yellow)', p: 1.5, z: [.8, .54] }),
    stage('Production', 'Ready to shoot?', 'Telefilm backs English-language features budgeted under CAD 3.5 million, made by companies based in Canada.', 'Open 26 January to 9 February.',
      (c) => `<div style="transform:rotate(-3deg)">${clapper(60)}</div>`, { g: 'var(--green)', p: 2, z: [1.15, .78] }),
    stage('The edit', 'Got a rough cut?', 'SeriesFest’s Pilots in Progress screens rough cuts to an audience for feedback.', 'Final deadline 5 January.',
      (c) => `<div style="transform:rotate(1deg)">${editStrip(74)}</div>`, { g: 'var(--blue)', p: 3, z: [1.05, .8] }),
    stage('The finished film', 'Finished your documentary?', 'Hot Docs accepts documentaries from anywhere, finished after 1 January 2026.', 'Feature entries close 4 January.',
      (c) => `<div style="transform:rotate(-2deg)">${ticket(64)}</div>`, { g: 'var(--pink)', p: 4, z: [.98, .74] }),
    closer(),
  ]

  carousel('stages', SLIDES, 'You don’t need a finished film. There are opportunities you can apply for while you’re still writing, shooting or editing. Here are six, depending on where your project’s at. Haven’t written the script yet? TorinoFilmLab ScriptLab accepts feature ideas that don’t have a script draft yet. Closes 3 November. Got a first draft? TorinoFilmLab FeatureLab supports teams developing a director’s first or second feature, with at least a first draft ready. Closes 5 November. Writing a series about science? Sundance’s Sloan Episodic Science Grant gives $17,000 to one series about science. Closes 3 December. Ready to shoot? Telefilm backs English-language features budgeted under CAD 3.5 million, made by companies based in Canada. Open 26 January to 9 February. Got a rough cut? SeriesFest’s Pilots in Progress screens rough cuts to an audience for feedback. Final deadline 5 January. Finished your documentary? Hot Docs accepts documentaries from anywhere, finished after 1 January 2026. Feature entries close 4 January. Along the foot of every slide runs a production timeline, idea, draft, shoot, edit, finished, with a red dot moving one step on each slide past an index card, a title page stamped Draft 1, script pages, a clapperboard, an edit timeline and a festival ticket. Last slide: Call Sheet, by pitch.dog. Find film and TV grants, festivals, labs and fellowships, all in one place. Totally free! Comment Call Sheet and we will send you the link!')
}

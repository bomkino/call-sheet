// Cover poster for the fineprint carousel. Calls cover('fineprint', {...}).
// A page of terms set so small you can't read it, and a magnifying glass over the one clause that
// matters. Under the lens it's the post's own second line, underlined in red by someone who found it.
// The rest of the fine print is the carousel's copy: the catches slide 2 goes on to explain.
{
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cv-fineprint-page { position: absolute; transform-origin: 0 0; overflow: hidden; height: calc(var(--ph, 200) * 1cqi); background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink); padding: 3.4cqi 4cqi; box-shadow: var(--lift-dark); }
    .cv-fineprint-page .hd { display: flex; justify-content: space-between; padding-bottom: 1.2cqi; border-bottom: .3cqi solid var(--ink); margin-bottom: 1.6cqi; }
    .cv-fineprint-page .cols { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2.6cqi; }
    .cv-fineprint-page .cl { font-size: 1.3cqi; line-height: 1.36; margin-bottom: .8cqi; }
    .cv-fineprint-page .cl b { font-weight: 600; margin-right: .35em; }
    .cv-fineprint-page .key { position: relative; }
    .cv-fineprint-page .key { display: block; }
    .cv-fineprint-page .key > span { position: relative; display: inline-block; }
    .cv-fineprint-page .key svg { position: absolute; left: -3%; width: 106%; bottom: -.3cqi; height: .9cqi; overflow: visible; }
    .cv-fineprint-glass { position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; }
    .cv-fineprint-glass > * { position: absolute; }
    .cv-fineprint-lens { border-radius: 50%; overflow: hidden; background: var(--sheet); }
    .cv-fineprint-lens > .mag { position: absolute; width: 100cqi; height: 125cqi; }
  </style>`)

  // The fine print. Clause numbers are made up; the words are the carousel's, and 6.7 is the post's line 2.
  const T = [
    'Sometimes, a prize is a reimbursement. You need to spend the money first.',
    'Sometimes, programmes have a participation fee. You pay it after you’re selected.',
    'These are useful things to know before you apply.',
    'None of that necessarily makes it a bad opportunity.',
    'But it might make it the wrong one for you, and very often this fine print slips through the cracks.',
  ]
  const under = `<svg viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true"><path d="M1 3.8 C 20 2.2, 46 4.6, 70 2.8 S 92 3.4, 99 1.8" fill="none" stroke="#e3472d" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:.3cqi"/></svg>`
  const clause = (n, t, key) => S('body', key ? `<span class="key"><span><b>${n}</b>${t[0]}${under}</span><br><span>${t[1]}${under.replace('M1 3.8', 'M1 2.6')}</span></span>` : `<b>${n}</b>${t}`, 'class="cl"')
  // Five columns of clauses; the key clause sits in the third column, a few clauses down.
  const cols = Array.from({ length: 5 }, (_, k) => `<div>${Array.from({ length: 9 }, (_, j) => { const n = k * 9 + j + 1
    return k === 2 && j === 3 ? clause(`6.${n}`, ['It’s usually somewhere', 'in the fine print.'], 1) : clause(`6.${n}`, T[(k * 3 + j * 2) % T.length]) }).join('')}</div>`).join('')
  const pageHtml = (st) => `<div class="cv-fineprint-page" style="${st}"><div class="hd">${sp('metadata', 'Terms and conditions', 'class="soft"')}${sp('metadata', 'Page 6 of 6', 'class="soft"')}</div><div class="cols">${cols}</div></div>`

  // Centre the glass on the key clause once the page is laid out. --lx/--ly are in cqi.
  // The lens stays where the poster wants it; the page slides until the key clause sits under it.
  const aim = (post) => {
    const g = post.querySelector('.cv-fineprint-glass'), key = post.querySelector(':scope > .cv-fineprint-page .key'); if (!g || !key) return
    const pr = post.getBoundingClientRect(), u = pr.width / 100
    for (let it = 0; it < 2; it++) { const k = key.getBoundingClientRect(), cs = getComputedStyle(post)
      const sx = +(cs.getPropertyValue('--sx') || 0), sy = +(cs.getPropertyValue('--sy') || 0)
      post.style.setProperty('--sx', (sx + +g.dataset.lx - (k.left + k.width / 2 - pr.left) / u).toFixed(2))
      post.style.setProperty('--sy', (sy + +g.dataset.ly - (k.top + k.height / 2 - pr.top) / u).toFixed(2)) }
    // Then cut the page so its lowest corner stops short of the footer, which stays on the cherry.
    const pg = post.querySelector(':scope > .cv-fineprint-page')
    for (let it = 0; it < 3; it++) { const ph = +(getComputedStyle(post).getPropertyValue('--ph') || 200), b = (pg.getBoundingClientRect().bottom - pr.top) / u
      post.style.setProperty('--ph', (ph + (+g.dataset.bottom - b) / Math.cos(6 * Math.PI / 180)).toFixed(2)) }
  }
  const reaim = () => document.querySelectorAll('.post[data-id="fineprint-01"]').forEach(aim)
  const root = document.querySelector('#root')
  if (root) new MutationObserver(() => { reaim(); document.fonts.ready.then(() => requestAnimationFrame(reaim)) }).observe(root, { childList: true })

  const LAY = { portrait: { page: [-6, 66, 118, -6], d: 60, m: 3.1, lx: 54, ly: 88, hand: 100, bottom: 111 }, square: { page: [-4, 56, 112, -6], d: 46, m: 3.1, lx: 56, ly: 70, hand: 98, bottom: 88 } }

  cover('fineprint', { g: 'var(--cherry)', dark: false,
    art: (c) => {
      const L = LAY[c] || LAY.portrait, [px, py, pw, pr] = L.page, d = L.d, r = d / 2
      const st = `left:calc((${px} + var(--sx, 0)) * 1cqi);top:calc((${py} + var(--sy, 0)) * 1cqi);width:${pw}cqi;transform:rotate(${pr}deg)`
      const at = (dx, dy) => `left:calc((var(--lx) + ${dx}) * 1cqi);top:calc((var(--ly) + ${dy}) * 1cqi)`
      // The handle leaves the lens down and to the right, and runs out of frame.
      const ha = L.hand
      return `${pageHtml(st)}
        <div class="cv-fineprint-glass" data-lx="${L.lx}" data-ly="${L.ly}" data-bottom="${L.bottom}" style="--lx:${L.lx};--ly:${L.ly}">
          <div style="${at(-r + 2.4, -r + 3.6)};width:${d}cqi;height:${d}cqi;border-radius:50%;box-shadow:0 0 2.6cqi 1cqi rgb(21 19 15 / .3)"></div>
          <div style="${at(0, 0)};width:80cqi;height:8cqi;transform-origin:0 50%;transform:translate(1.6cqi, -0.4cqi) rotate(${ha - 90}deg) translate(${r}cqi, 2.4cqi);border-radius:2cqi;background:rgb(21 19 15 / .26)"></div>
          <div style="${at(0, 0)};width:80cqi;height:6.4cqi;transform-origin:0 50%;transform:rotate(${ha - 90}deg) translate(${r}cqi, -3.2cqi);display:flex;align-items:center">
            <i style="display:block;width:4cqi;height:4.4cqi;background:#3a3631;border-radius:.4cqi"></i><i style="display:block;width:3.2cqi;height:5.2cqi;background:#8d877c;border-radius:.4cqi;box-shadow:inset 0 .8cqi 0 rgb(255 255 255 / .35)"></i>
            <i style="display:block;flex:1;height:6.4cqi;background:#15130f;border-radius:1cqi 3.2cqi 3.2cqi 1cqi;box-shadow:inset 0 1.1cqi 0 -.4cqi rgb(255 255 255 / .16)"></i></div>
          <div class="cv-fineprint-lens" style="${at(-r, -r)};width:${d}cqi;height:${d}cqi">
            <div class="mag" style="left:calc((var(--lx) - ${r}) * -1cqi);top:calc((var(--ly) - ${r}) * -1cqi);transform-origin:calc(var(--lx) * 1cqi) calc(var(--ly) * 1cqi);transform:scale(${L.m})">${pageHtml(st)}</div></div>
          <div style="${at(-r - 1.8, -r - 1.8)};width:${d + 3.6}cqi;height:${d + 3.6}cqi;border-radius:50%;border:2.6cqi solid #15130f;box-shadow:inset 0 0 0 .45cqi #4a4640, inset 0 .9cqi 1.4cqi rgb(21 19 15 / .35)"></div>
          <svg style="${at(-r, -r)};width:${d}cqi;height:${d}cqi;overflow:visible" viewBox="-50 -50 100 100" aria-hidden="true">
            <path d="M-38 -14 A40 40 0 0 1 -14 -38" fill="none" stroke="rgb(255 255 255 / .6)" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M-40 -3 A40 40 0 0 1 -39 -9" fill="none" stroke="rgb(255 255 255 / .45)" stroke-width="1.6" stroke-linecap="round"/></svg>
        </div>`
    },
    html: (c, i, n) => `<div style="color:var(--sheet);--pd-type-ink:var(--sheet)">${ctop('The fine print', i, n)}
        ${S('display', 'Sometimes, film festivals and funding opportunities come with a catch.', `class="mt-m" style="max-inline-size:17ch"`)}</div>
        <div class="grow"></div><div class="foot" style="color:var(--sheet);--pd-type-ink:var(--sheet)">${sp('credit', 'Call Sheet, by pitch.dog')}${swipe}</div>` })
}

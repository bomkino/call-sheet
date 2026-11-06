// Captures real Call Sheet UI states from the local site for the explainer.
//
//   node capture/capture.mjs [base-url]      default http://127.0.0.1:8788
//
// Serve the site build there first; ../README.md and SCRIPT.md say how.
//
// Mobile layout (390 px) at 3x, so a capture stays sharp up to 3x on screen.
// The clock is fixed at 17 Oct 2026, 10:00 UTC; the viewer is in New York
// (Sydney for the time-zone page), in pitch.dog's client markets.
// Writes public/ui/<name>.png and public/ui/meta.json: each capture's size in
// CSS px, plus the boxes of the words the marker circles, ticks or folds.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Playwright isn't a dependency of this project: use a local install if there
// is one, else the global one (`npm i -g playwright && npx playwright install chromium`).
const loadPlaywright = async () => {
  try {
    return await import('playwright')
  } catch {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
    return import(pathToFileURL(join(root, 'playwright/index.mjs')).href)
  }
}
const { chromium } = await loadPlaywright()

const BASE = process.argv[2] ?? 'http://127.0.0.1:8788'
const OUT = new URL('../public/ui/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const meta = {}
const W = 390
const DPR = 3

const FIX = () => {
  const fixed = new Date('2026-10-17T10:00:00Z').getTime()
  const D = Date
  class FD extends D { constructor (...a) { super(...(a.length ? a : [fixed])) } static now () { return fixed } }
  globalThis.Date = FD
}
// The page's own paper goes transparent, so the UI prints onto the film's paper.
const CLEAR = `
  html, body, main, section, article, .cs-results, .cs-group, .cs-list, .cs-stage, .cs-block, .cs-finder
    { background: transparent !important; background-image: none !important; box-shadow: none !important }
  .pd-whatsapp-fab, .mobile-menu, .skip { display: none !important }
  .cs-see-row { position: static !important; background: transparent !important; box-shadow: none !important }
  .cs-results-head { position: static !important }
  *, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important }
`

async function open (browser, path, storage, tz = 'America/New_York') {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: DPR, timezoneId: tz, colorScheme: 'light', acceptDownloads: true })
  await ctx.addInitScript(FIX)
  if (storage) await ctx.addInitScript(storage)
  const page = await ctx.newPage()
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: CLEAR })
  await page.waitForTimeout(300)
  return { ctx, page }
}

// Boxes of parts inside a capture, in CSS px from its top-left. A part is a
// selector, or { text, in } for a run of words inside a selector.
async function parts (loc, spec) {
  return loc.evaluate((root, spec) => {
    const r0 = root.getBoundingClientRect()
    const out = {}
    for (const [k, s] of Object.entries(spec)) {
      let r
      if (typeof s === 'string') { const [sel, i] = s.split('@'); r = (i === undefined ? root.querySelector(sel) : root.querySelectorAll(sel)[+i])?.getBoundingClientRect() }
      else {
        const host = s.in ? root.querySelector(s.in) : root
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const n = walker.currentNode
          const i = n.textContent.indexOf(s.text)
          if (i >= 0) { const range = document.createRange(); range.setStart(n, i); range.setEnd(n, i + s.text.length); r = range.getBoundingClientRect(); break }
        }
      }
      if (r) out[k] = { x: +(r.left - r0.left).toFixed(1), y: +(r.top - r0.top).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }
      else out[k] = null
    }
    return out
  }, spec)
}

async function shot (loc, name, spec = {}, pad = 0) {
  // Park the pointer in a corner, so nothing is captured in its hover state.
  await loc.page().mouse.move(1, 1)
  await loc.scrollIntoViewIfNeeded()
  await loc.page().waitForTimeout(120)
  const box = await loc.boundingBox()
  const file = `${OUT}${name}.png`
  if (pad) await loc.page().screenshot({ path: file, omitBackground: true, clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad } })
  else await loc.screenshot({ path: file, omitBackground: true })
  const p = await parts(loc, spec)
  if (pad) for (const v of Object.values(p)) if (v) { v.x += pad; v.y += pad }
  meta[name] = { w: Math.round(box.width + 2 * pad), h: Math.round(box.height + 2 * pad), parts: p }
  console.log('  ', name, meta[name].w, 'x', meta[name].h, JSON.stringify(p))
}

const ROW = { save: '.cs-save', title: '.cs-title', date: '.cs-date', left: '.cs-left', fee: '.cs-fee', who: '.cs-facts > div:nth-child(1) dd', get: '.cs-facts > div:nth-child(2) dd', newb: '.cs-badge--new' }

const browser = await chromium.launch()

console.log('== list')
{
  const { ctx, page } = await open(browser, '/call-sheet/')
  const row = slug => page.locator(`.cs-call[data-slug="${slug}"]`)
  for (const slug of ['roy-w-dean-fall-grant-2026', 'cph-forum', 'sundance-merata-mita-fellowship-2027', 'torinofilmlab-featurelab', 'doc-edge-pitch'])
    await shot(row(slug), `row-${slug}`, ROW)

  // The finder, one choice at a time: based in the United States, then documentary, then open now.
  const making = page.locator('fieldset[data-facet="format"]')
  const place = page.locator('.cs-facet--place')
  const only = page.locator('fieldset:has(input[name="only"])')
  const see = page.locator('.cs-see-row').first()
  const seeBtn = page.locator('.cs-see-row button, .cs-see-row a').filter({ hasText: /See \d+ (opportunities|opportunity)/ }).first()
  const seeSpec = { button: ':scope > *@0' }
  const states = []
  const count = async () => (await seeBtn.textContent()).replace(/\s+/g, ' ').trim()
  await shot(making, 'making-0', { doc: 'label.cs-chip:has(input[value="documentary"])' })
  await shot(place, 'place-0', { field: '.cs-input-wrap' })
  await shot(only, 'only-0', { open: 'label.cs-chip:has(input[value="open"])' })
  await shot(see, 'see-0', seeSpec, 16); states.push(await count())
  await page.selectOption('#cs-from', 'US'); await page.waitForTimeout(250)
  await shot(place, 'place-1', { field: '.cs-input-wrap' })
  await shot(see, 'see-1', seeSpec, 16); states.push(await count())
  await page.locator('label.cs-chip:has(input[value="documentary"])').click(); await page.waitForTimeout(250)
  await shot(making, 'making-1', { doc: 'label.cs-chip:has(input[value="documentary"])' })
  await shot(see, 'see-2', seeSpec, 16); states.push(await count())
  // The opportunities a documentary-maker based in the US now sees, soonest first: the film's closing list comes from these.
  meta['us-doc-rows'] = await page.evaluate(() => [...document.querySelectorAll('.cs-call')].filter(r => r.offsetParent)
    .map(r => ({ slug: r.dataset.slug, title: r.querySelector('.cs-title')?.textContent.replace(/\s+/g, ' ').trim(), closes: r.dataset.closes })))
  meta['place-label'] = await page.evaluate(() => document.querySelector('#cs-from').selectedOptions[0].textContent)
  await page.locator('label.cs-chip:has(input[name="only"][value="open"])').click(); await page.waitForTimeout(250)
  await shot(only, 'only-1', { open: 'label.cs-chip:has(input[value="open"])' })
  await shot(see, 'see-3', seeSpec, 16); states.push(await count())
  meta['see-states'] = states
  console.log('   see', states)

  // Save three. Each row in its saved state, then the bar and the sheet.
  for (const slug of ['roy-w-dean-fall-grant-2026', 'cph-forum', 'doc-edge-pitch']) {
    await row(slug).locator('.cs-save').click(); await page.waitForTimeout(200)
    await shot(row(slug), `row-${slug}-saved`, ROW)
  }
  await page.waitForTimeout(300)
  const bar = page.locator('[data-sheetbar] .cs-sheetbar-button')
  await bar.screenshot({ path: `${OUT}sheetbar.png`, omitBackground: true })
  const bb = await bar.boundingBox(); meta.sheetbar = { w: Math.round(bb.width), h: Math.round(bb.height), text: (await bar.textContent()).replace(/\s+/g, ' ').trim() }
  console.log('   bar', meta.sheetbar)
  await page.locator('[data-open-sheet]').click(); await page.waitForTimeout(600)
  await shot(page.locator('.cs-sheet-inner'), 'sheet', { actions: '.cs-sheet-actions', ics: '[data-sheet-ics]', print: '[data-sheet-print]', share: '[data-sheet-share]' })
  await shot(page.locator('.cs-sheet-actions'), 'sheet-actions', { ics: '[data-sheet-ics]', print: '[data-sheet-print]', share: '[data-sheet-share]' })
  await page.locator('[data-close-sheet]').click()
  await ctx.close()
}

console.log('== returning visitor')
{
  const { ctx, page } = await open(browser, '/call-sheet/')
  const slugs = await page.evaluate(() => [...document.querySelectorAll('.cs-call')].map(r => r.dataset.slug))
  await ctx.close()
  const fresh = ['doc-edge-pitch', 'torinofilmlab-featurelab', 'hot-docs-forum', 'eurodoc-annual-programme']
  const prev = slugs.filter(s => !fresh.includes(s))
  const storage = new Function(`try { localStorage.setItem('pitchdog-call-sheet-seen', JSON.stringify({ at: new Date('2026-10-10T09:00:00Z').getTime(), slugs: ${JSON.stringify(prev)} })) } catch {}`)
  const r = await open(browser, '/call-sheet/', storage)
  for (const slug of ['doc-edge-pitch', 'torinofilmlab-featurelab']) await shot(r.page.locator(`.cs-call[data-slug="${slug}"]`), `row-${slug}-new`, ROW)
  if (await r.page.locator('.cs-welcome').count()) await shot(r.page.locator('.cs-welcome'), 'welcome')
  await r.ctx.close()
}

console.log('== the perfect fund')
{
  const { ctx, page } = await open(browser, '/call-sheet/')
  const r = page.locator('.cs-call').first()
  await r.evaluate(el => {
    el.querySelector('.cs-day').textContent = '16'
    el.querySelector('.cs-month').textContent = 'Oct'
    el.querySelector('.cs-title a').textContent = 'The perfect fund'
    el.querySelector('.cs-org').textContent = ''
    el.querySelector('.cs-tagrow').innerHTML = '<span>Grant</span><span>Your format</span><span>Your stage</span>'
    el.querySelectorAll('.cs-badge').forEach(b => { b.hidden = !b.matches('.cs-badge--open, .cs-badge--place') })
    el.querySelector('.cs-badge--place').textContent = 'Open to you'
    const dd = el.querySelectorAll('.cs-facts dd')
    dd[0].textContent = 'People making exactly your film'
    dd[1].textContent = 'Exactly the amount you need'
    dd[2].textContent = 'Free to enter'; dd[2].className = 'cs-fee cs-fee--free'
    el.querySelector('.cs-left').textContent = ' '
    el.querySelector('.cs-save')?.remove()
    el.dataset.film = 'perfect'
  })
  // The joke card keeps the look it had: no "your time" line under its date.
  await page.addStyleTag({ content: '[data-film] .cs-clock { display: none !important }' })
  await page.waitForTimeout(150)
  await shot(r, 'perfect-open', { title: '.cs-title a', date: '.cs-date', left: '.cs-left' })
  await r.evaluate(el => {
    el.querySelector('.cs-left').textContent = 'Closed yesterday'
    const open = el.querySelector('.cs-badge--open'); open.textContent = 'Closed'; open.className = 'cs-badge'
  })
  await page.waitForTimeout(150)
  await shot(r, 'perfect-closed', { title: '.cs-title a', date: '.cs-date', left: '.cs-left' })
  await ctx.close()
}

console.log('== an opportunity page, read from New York')
{
  const { ctx, page } = await open(browser, '/call-sheet/doc-edge-pitch/')
  await shot(page.locator('.cs-countdown'), 'countdown', { big: '[data-countdown-text]', when: '[data-countdown-when]', local: '[data-local]', time: { text: '13:59', in: '[data-local]' }, there: { text: '23:59', in: '[data-countdown-when]' } })
  meta.countdownText = (await page.locator('.cs-countdown').textContent()).replace(/\s+/g, ' ').trim()
  const bring = page.locator('.cs-block--bring')
  const bspec = { box0: '.cs-bring-box@0', box1: '.cs-bring-box@1', item0: '.cs-bring-item@0', item1: '.cs-bring-item@1' }
  await shot(bring, 'bring-0', bspec)
  await page.locator('input[data-bring="0"]').check({ force: true }); await page.waitForTimeout(150)
  await shot(bring, 'bring-1', bspec)
  await page.locator('input[data-bring="1"]').check({ force: true }); await page.waitForTimeout(150)
  await shot(bring, 'bring-2', bspec)
  await shot(page.locator('.cs-block--sources'), 'sources')
  await ctx.close()
}

console.log('== TorinoFilmLab FeatureLab, read from Sydney')
{
  const { ctx, page } = await open(browser, '/call-sheet/torinofilmlab-featurelab/', null, 'Australia/Sydney')
  await shot(page.locator('.cs-countdown'), 'countdown-syd', { big: '[data-countdown-text]', when: '[data-countdown-when]', local: '[data-local]', time: { text: '02:00', in: '[data-local]' }, there: { text: '16:00', in: '[data-countdown-when]' } })
  meta.countdownSydText = (await page.locator('.cs-countdown').textContent()).replace(/\s+/g, ' ').trim()
  await ctx.close()
}

writeFileSync(`${OUT}meta.json`, JSON.stringify(meta, null, 1))
await browser.close()

// node social/posts/render.mjs [filter] [--pdf]
// Renders every post at every size to out/png/<id>__<size>.png, and with --pdf a flat vector PDF
// per post for Figma (out/pdf), then writes out/report.json with anything that spills out of its
// safe area. Start social/posts/serve.py first. [filter] is an id prefix or a comma list of ids.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import { mkdirSync, writeFileSync } from 'node:fs'
const args = process.argv.slice(2)
const filter = args.find(a => !a.startsWith('--')) || ''
const pdf = args.includes('--pdf')
const base = process.env.POSTS_URL || 'http://127.0.0.1:8790/social/posts/posts.html'
const OUT = process.env.OUT || 'out'
mkdirSync(OUT + '/png', { recursive: true }); if (pdf) mkdirSync(OUT + '/pdf', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage()
const hi = await (await browser.newContext({ deviceScaleFactor: 3 })).newPage()
await page.goto(base); const manifest = await page.evaluate(() => window.MANIFEST)
const report = []
for (const [id, m] of Object.entries(manifest)) {
  if (filter && !id.startsWith(filter) && !filter.split(',').includes(id)) continue
  for (const size of m.sizes) {
    const [w, h] = size.split('x').map(Number)
    const pg = id.startsWith('thumb') ? hi : page
    await pg.setViewportSize({ width: w, height: h })
    await pg.goto(`${base}?id=${id}&size=${size}`)
    await pg.evaluate(() => document.fonts.ready)
    await pg.waitForTimeout(150)
    // Anything that spills out of the safe frame (loops may overhang a little on purpose).
    const issues = await pg.evaluate(() => {
      const f = document.querySelector('.frame').getBoundingClientRect()
      const out = []
      for (const el of document.querySelectorAll('.frame [data-pd-social], .frame img, .frame .sheet, .frame .board, .frame .chips, .frame .check')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        const over = Math.max(f.left - r.left, r.right - f.right, f.top - r.top, r.bottom - f.bottom)
        if (over > 6) out.push(`${el.tagName.toLowerCase()}.${el.className || el.dataset.pdSocial}: ${Math.round(over)}px "${el.textContent.trim().slice(0, 40)}"`)
      }
      const g = document.querySelector('.grow')
      if (g && g.scrollHeight > g.clientHeight + 4) out.push(`grow overflows by ${g.scrollHeight - g.clientHeight}px`)
      return out
    })
    const name = `${id}__${size}`
    await pg.screenshot({ path: `${OUT}/png/${name}.png` })
    if (pdf) {
      await pg.goto(`${base}?id=${id}&size=${size}&flat=1`)
      await pg.evaluate(() => document.fonts.ready)
      await pg.pdf({ path: `${OUT}/pdf/${name}.pdf`, width: `${w}px`, height: `${h}px`, printBackground: true, pageRanges: '1' })
    }
    report.push({ id, size, issues })
    if (issues.length) console.log('ISSUE', name, issues.join(' | '))
  }
}
writeFileSync(OUT + '/report.json', JSON.stringify({ manifest, report }, null, 1))
console.log('rendered', report.length)
await browser.close()

// Export the PNGs (avatars, app icons, favicons) from the SVGs in brand/logo.
//
//   node brand/tools/export_png.mjs
//
// Uses Playwright's Chromium, so the SVGs render exactly as browsers draw them.
// Set PLAYWRIGHT_MODULE if playwright isn't resolvable from here.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const brand = join(dirname(fileURLToPath(import.meta.url)), '..')
const palette = JSON.parse(readFileSync(join(brand, 'palette.json'), 'utf8'))
const svg = (name) => readFileSync(join(brand, 'logo', name), 'utf8')
const PAPER = palette.paper.hex, INK = palette.ink.hex

// [file, size, background, svg, share of the canvas the art fills]
const jobs = [
  ['avatar/call-sheet-avatar-ink.png', 1080, INK, svg('call-sheet-stamp-reverse.svg'), 0.74],
  ['avatar/call-sheet-avatar-paper.png', 1080, PAPER, svg('call-sheet-stamp.svg'), 0.74],
  ['avatar/call-sheet-avatar-tile.png', 1080, PAPER, svg('call-sheet-symbol.svg'), 0.78],
  ['icons/apple-touch-icon.png', 180, INK, svg('call-sheet-stamp-reverse.svg'), 0.8],
  ['icons/icon-192.png', 192, INK, svg('call-sheet-stamp-reverse.svg'), 0.8],
  ['icons/icon-512.png', 512, INK, svg('call-sheet-stamp-reverse.svg'), 0.8],
  ['icons/favicon-32.png', 32, 'transparent', svg('call-sheet-symbol.svg'), 1],
  ['icons/favicon-16.png', 16, 'transparent', svg('call-sheet-symbol.svg'), 1],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [file, size, bg, art, share] of jobs) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<!doctype html><style>html,body{margin:0;width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center}svg{width:${size * share}px;height:${size * share}px;object-fit:contain}</style>${art}`)
  mkdirSync(join(brand, dirname(file)), { recursive: true })
  writeFileSync(join(brand, file), await page.screenshot({ omitBackground: bg === 'transparent' }))
}
await browser.close()
console.log(JSON.stringify({ written: jobs.length }))

/*
 * Call Sheet — pitch.dog
 *
 * Every page works without this script.  It adds the site theme and mobile
 * menu, live countdowns, filtering, and "My call sheet": a shortlist saved
 * in this browser's localStorage only.  Nothing typed or saved is sent
 * anywhere.
 */

const root = document.documentElement
const BASE = '/call-sheet/'
const STORE = 'pitchdog-call-sheet'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const STATUSES = [
  ['shortlist', 'Shortlisted'],
  ['checking', 'Checking'],
  ['preparing', 'Preparing'],
  ['applied', 'Applied'],
  ['watching', 'Watching'],
  ['no', 'Not for me'],
]

// ------------------------------------------------------------------ shell

const THEMES = ['auto', 'light', 'dark']
const darkQuery = matchMedia('(prefers-color-scheme: dark)')
function storedTheme () {
  try {
    const value = localStorage.getItem('pitchdog-theme')
    if (THEMES.includes(value)) return value
  } catch {}
  return 'auto'
}
function setTheme (theme, remember = true) {
  const resolved = theme === 'auto' ? (darkQuery.matches ? 'dark' : 'light') : theme
  root.dataset.theme = theme
  root.dataset.resolvedTheme = resolved
  const label = theme[0].toUpperCase() + theme.slice(1)
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
  document.querySelector('#theme-label')?.replaceChildren(label)
  document.querySelector('#theme-icon use')?.setAttribute('href', `/assets/phosphor-sprite.svg#ph-${theme === 'auto' ? 'circle-half' : theme === 'light' ? 'sun' : 'moon'}`)
  document.querySelector('#theme-button')?.setAttribute('aria-label', `Theme: ${label}. Activate to switch to ${next[0].toUpperCase() + next.slice(1)}.`)
  const color = document.querySelector('#theme-color')
  if (color) color.content = resolved === 'dark' ? '#0e0d0b' : '#f3efe6'
  if (remember) try { localStorage.setItem('pitchdog-theme', theme) } catch {}
}
root.classList.add('js')
setTheme(storedTheme(), false)
document.querySelector('#theme-button')?.addEventListener('click', () => {
  const current = root.dataset.theme || 'auto'
  setTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length])
})
darkQuery.addEventListener('change', () => { if ((root.dataset.theme || 'auto') === 'auto') setTheme('auto', false) })

const menuToggle = document.querySelector('#mobile-menu-toggle')
const menu = document.querySelector('#mobile-menu')
if (menuToggle && menu) {
  const setMenu = open => {
    menuToggle.setAttribute('aria-expanded', String(open))
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    menu.setAttribute('aria-hidden', String(!open))
    menu.inert = !open
    // The page behind the open menu is out of reach, so Tab stays in the menu.
    for (const el of document.querySelectorAll('main, .footer, .pd-whatsapp-fab, .cs-sheetbar')) el.inert = open
    document.body.classList.toggle('mobile-menu-open', open)
    if (open) requestAnimationFrame(() => menu.querySelector('a')?.focus())
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'))
  menu.querySelectorAll('[data-mobile-menu-close], a').forEach(el => el.addEventListener('click', () => setMenu(false)))
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); menuToggle.focus() }
  })
}

// ------------------------------------------------------------------ dates

const pad = n => String(n).padStart(2, '0')
const todayISO = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` })()
const toDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const daysUntil = iso => Math.round((toDate(iso) - toDate(todayISO)) / 86400000)
const shortDate = (iso, withYear = false) => {
  const d = toDate(iso)
  const year = d.getUTCFullYear() !== toDate(todayISO).getUTCFullYear() || withYear
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}${year ? ' ' + d.getUTCFullYear() : ''}`
}
const longDate = iso => { const d = toDate(iso); return `${d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` }

// The next closing date: once one round passes, the page moves to the next.
function nextRound (rounds, fallback) {
  const list = (rounds || '').split(' ').filter(Boolean)
  return list.find(d => d >= todayISO) || list[list.length - 1] || fallback || ''
}

// A cut-off in the organiser's zone as an instant, so it can be shown in the visitor's.
function zoneOffset (ms, tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(ms)).map(p => [p.type, p.value]))
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second) - ms
}
function instantOf (iso, time, tz) {
  if (!iso || !/^\d{2}:\d{2}$/.test(time || '') || !tz) return null
  try {
    const [y, m, d] = iso.split('-').map(Number)
    const [hh, mm] = time.split(':').map(Number)
    const wall = Date.UTC(y, m - 1, d, hh, mm)
    const first = wall - zoneOffset(wall, tz)
    return new Date(wall - zoneOffset(first, tz))
  } catch { return null }
}
// Mirrors FRIENDLY_ZONES in tools/build_site.py.
const ZONES = {
  'America/Los_Angeles': 'Pacific Time (US)',
  'America/Denver': 'Mountain Time (US)',
  'America/Chicago': 'Central Time (US)',
  'America/New_York': 'Eastern Time (US)',
  'America/Toronto': 'Eastern Time (Toronto)',
  'Europe/London': 'UK time',
  'Europe/Paris': 'Central European Time',
  'Europe/Berlin': 'Central European Time',
  'Europe/Helsinki': 'Finnish time',
  'Australia/Sydney': 'Sydney time',
  'Pacific/Auckland': 'New Zealand time',
}
const zoneName = tz => ZONES[tz] || (tz.startsWith('Etc/') ? tz.slice(4) : tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') + ' time' : tz)
const hereZone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' } })()

function leftText (closes) {
  const days = daysUntil(closes)
  if (days < 0) return { text: 'Closed', cls: 'is-closed' }
  if (days === 0) return { text: 'Closes today', cls: 'is-today' }
  if (days === 1) return { text: '1 day left', cls: 'is-soon' }
  if (days <= 7) return { text: `${days} days left`, cls: 'is-soon' }
  if (days < 100) return { text: `${days} days left`, cls: '' }
  return { text: `${Math.round(days / 30.4)} months left`, cls: '' }
}

// Whether a call is accepting applications on the visitor's own date.
function liveState ({ closes, opens, state }) {
  if (state === 'closed_or_historical') return 'closed'
  if (!closes) return state === 'watch_or_rolling' ? 'rolling' : 'tbc'
  if (closes < todayISO) return 'closed'
  if (opens && opens > todayISO) return 'later'
  if (state === 'announced_not_open' && !opens) return 'later'
  if (state === 'watch_or_rolling') return 'watch'
  return 'open'
}

// ---------------------------------------------------------------- places

const REGIONS = {
  EU: 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE',
  EUROPE: 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE AL AD AM AZ BA CH FO GB GE GI IS LI MC MD ME MK NO RS SM TR UA VA XK',
  NORDIC: 'DK FI IS NO SE FO GL AX',
  LATAM: 'AR BO BR CL CO CR CU DO EC SV GT HN HT MX NI PA PY PE PR UY VE BZ GY SR GF',
  CENTRAL_AMERICA: 'BZ CR SV GT HN NI PA',
  CARIBBEAN: 'AG AI AW BB BL BQ BS CU CW DM DO GD GP HT JM KN KY LC MF MQ MS PR SX TC TT VC VG VI',
  IBERO_AMERICA: 'AR BO BR CL CO CR CU DO EC SV GT HN MX NI PA PY PE PR UY VE ES PT AD',
  AFRICA: 'DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW EH RE YT SH',
  MENA: 'DZ BH EG IR IQ IL JO KW LB LY MA MR OM PS QA SA SD SY TN AE YE',
  ASIA: 'AF AM AZ BH BD BT BN KH CN CY GE HK IN ID IR IQ IL JP JO KZ KW KG LA LB MO MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE',
  SOUTH_ASIA: 'AF BD BT IN MV NP PK LK',
  SOUTHEAST_ASIA: 'BN KH ID LA MY MM PH SG TH TL VN',
  PACIFIC: 'AU NZ FJ PG SB VU NC PF WS TO KI TV NR FM MH PW CK NU AS GU MP WF TK',
}
const REGION_SETS = Object.fromEntries(Object.entries(REGIONS).map(([k, v]) => [k, new Set(v.split(' '))]))
const COUNTRY_CODES = ('AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CU CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ')
let regionNames = null
try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }) } catch {}
const countryName = code => (code === 'XK' ? 'Kosovo' : (regionNames?.of(code) || code))

// 'yes' when nothing we hold rules the place out, 'maybe' when the rule is
// unclear or only partly listed, 'no' when the published rule excludes it.
function placeMatch (where, code) {
  if (!code) return where.scope === 'unclear' ? 'maybe' : 'yes'
  if ((where.excludes || []).includes(code)) return 'no'
  if (where.scope === 'worldwide') return 'yes'
  if (where.scope === 'unclear') return 'maybe'
  const listed = (where.countries || []).includes(code) || (where.regions || []).some(r => REGION_SETS[r]?.has(code))
  // Outside every listed country and region is outside the call; the hidden
  // ones are a click away ("Show them anyway").
  return listed ? 'yes' : 'no'
}

// ------------------------------------------------------------------ store

function readSheet () {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || '{}')
    if (!data || !data.items || typeof data.items !== 'object' || Array.isArray(data.items)) return { v: 1, items: {} }
    // Keep only entries that look like ours, with a usable date.
    const items = {}
    for (const [slug, item] of Object.entries(data.items)) {
      if (!/^[a-z0-9-]+$/.test(slug) || !item || typeof item !== 'object') continue
      items[slug] = { ...item, closes: /^\d{4}-\d{2}-\d{2}$/.test(item.closes || '') ? item.closes : null }
    }
    return { v: 1, items }
  } catch { return { v: 1, items: {} } }
}
function writeSheet (sheet) {
  try { localStorage.setItem(STORE, JSON.stringify(sheet)); return true } catch { return false }
}
let sheet = readSheet()
const saved = slug => Boolean(sheet.items[slug])

function snapshotFromRow (row) {
  const dd = row.querySelectorAll('.cs-facts dd')
  return {
    title: row.dataset.title,
    closes: row.dataset.closes || null,
    opens: row.dataset.opens || null,
    state: row.dataset.state,
    time: row.dataset.time || null,
    tz: row.dataset.tz || null,
    official: row.dataset.official || '',
    organiser: row.querySelector('.cs-org')?.textContent.trim() || '',
    who: dd[0]?.textContent.trim() || '',
    get: dd[1]?.textContent.trim() || '',
    fee: dd[2]?.textContent.trim() || '',
  }
}
function snapshotFromPage (main) {
  const facts = {}
  main.querySelectorAll('.cs-sheetgrid > div').forEach(cell => { facts[cell.querySelector('dt').textContent.trim()] = cell.querySelector('dd').textContent.trim() })
  return {
    title: main.dataset.title,
    closes: main.dataset.closes || null,
    opens: main.querySelector('[data-countdown]')?.dataset.opens || null,
    state: main.querySelector('[data-countdown]')?.dataset.state || '',
    time: main.querySelector('[data-countdown]')?.dataset.time || null,
    tz: main.querySelector('[data-countdown]')?.dataset.tz || null,
    organiser: main.querySelector('.cs-callorg')?.textContent.trim() || '',
    who: facts['Who can apply'] || '',
    get: facts['You get'] || '',
    fee: facts['Entry fee'] || '',
    official: main.dataset.official || '',
  }
}

const listRows = [...document.querySelectorAll('.cs-call')]
for (const row of listRows) {
  const closes = nextRound(row.dataset.rounds, row.dataset.closes)
  if (!closes || closes === row.dataset.closes) continue
  // A later round: the cut-off time we hold belonged to the one that passed.
  Object.assign(row.dataset, { closes, time: '', tz: '' })
  const when = row.querySelector('time.cs-date')
  if (when) {
    const d = toDate(closes)
    when.setAttribute('datetime', closes)
    when.querySelector('.cs-day').textContent = d.getUTCDate()
    when.querySelector('.cs-month').textContent = MONTHS[d.getUTCMonth()].slice(0, 3) + (d.getUTCFullYear() !== toDate(todayISO).getUTCFullYear() ? ' ' + d.getUTCFullYear() : '')
  }
}
const rowBySlug = new Map(listRows.map(row => [row.dataset.slug, row]))
const callPage = document.querySelector('.cs-callpage')

function toggleSave (slug) {
  if (saved(slug)) {
    delete sheet.items[slug]
  } else {
    const row = rowBySlug.get(slug)
    const snap = row ? snapshotFromRow(row) : (callPage?.dataset.call === slug ? snapshotFromPage(callPage) : { title: slug })
    sheet.items[slug] = { ...snap, status: 'shortlist', added: todayISO }
  }
  if (!writeSheet(sheet)) {
    // Storage is blocked (private mode, a full disk): don't pretend it saved.
    sheet = readSheet()
    syncSaveButtons(slug)
    renderSheet()
    notice('Your browser is blocking storage here (a private window often does), so that call wasn’t saved.')
    return
  }
  syncSaveButtons(slug)
  renderSheet()
  const bar = document.querySelector('[data-sheetbar]')
  if (bar && saved(slug)) { bar.classList.remove('is-bump'); void bar.offsetWidth; bar.classList.add('is-bump') }
  if (filters?.only.includes('saved')) applyFilters()
}

function syncSaveButtons (only) {
  document.querySelectorAll('[data-save]').forEach(button => {
    if (only && button.dataset.save !== only) return
    const on = saved(button.dataset.save)
    button.setAttribute('aria-pressed', String(on))
    const text = button.querySelector('.cs-save-text')
    if (text) text.textContent = on ? 'Saved' : 'Save'
    if (only && on) { button.classList.remove('is-popping'); void button.offsetWidth; button.classList.add('is-popping') }
  })
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-save]')
  if (button) { event.preventDefault(); toggleSave(button.dataset.save) }
})

// Refresh stored snapshots from the current list, so saved calls pick up rechecked dates.
let refreshed = false
// A deadline the organiser moved is flagged on the sheet for a while; a round that simply
// passed, so the next one took over, is not a change.
function remember (item, fresh, rounds) {
  const moved = item.closes && fresh.closes && item.closes !== fresh.closes && !rounds.includes(item.closes)
  return { ...item, ...fresh, ...(moved ? { was: item.closes, movedOn: todayISO } : {}) }
}
for (const [slug, item] of Object.entries(sheet.items)) {
  const row = rowBySlug.get(slug)
  if (row) { sheet.items[slug] = remember(item, snapshotFromRow(row), (row.dataset.rounds || '').split(' ')); refreshed = true }
}
if (callPage && sheet.items[callPage.dataset.call]) {
  const rounds = (callPage.querySelector('[data-countdown]')?.dataset.rounds || '').split(' ')
  sheet.items[callPage.dataset.call] = remember(sheet.items[callPage.dataset.call], snapshotFromPage(callPage), rounds)
  refreshed = true
}
if (refreshed) writeSheet(sheet)

// ------------------------------------------------------------- my sheet UI

const dialog = document.querySelector('#cs-sheet')
const sheetStatus = document.querySelector('[data-sheet-status]')
function notice (text) {
  let box = document.querySelector('.cs-notice')
  if (!box) {
    box = Object.assign(document.createElement('p'), { className: 'cs-notice' })
    box.setAttribute('role', 'alert')
    box.setAttribute('data-pd-type', 'body.small')
    document.body.append(box)
  }
  box.textContent = text
  clearTimeout(notice.t)
  notice.t = setTimeout(() => box.remove(), 7000)
}
const say = text => { if (sheetStatus) { sheetStatus.textContent = text; clearTimeout(say.t); say.t = setTimeout(() => { sheetStatus.textContent = '' }, 4000) } }

function sortedItems () {
  return Object.entries(sheet.items).sort(([, a], [, b]) => (a.closes || '9999').localeCompare(b.closes || '9999') || String(a.title).localeCompare(String(b.title)))
}

function renderSheet () {
  const items = sortedItems()
  const bar = document.querySelector('[data-sheetbar]')
  if (bar) {
    bar.hidden = items.length === 0
    document.body.classList.toggle('has-sheetbar', items.length > 0)
    bar.querySelector('[data-sheet-count]').textContent = `${items.length} ${items.length === 1 ? 'call' : 'calls'} saved`
    const next = items.map(([, i]) => i.closes).filter(c => c && c >= todayISO).sort()[0]
    bar.querySelector('[data-sheet-next]').textContent = next ? `Next closes ${daysUntil(next) === 0 ? 'today' : daysUntil(next) === 1 ? 'tomorrow' : 'in ' + daysUntil(next) + ' days'}` : 'No upcoming deadlines'
  }
  const list = document.querySelector('[data-sheet-list]')
  if (!list) return
  document.querySelector('[data-sheet-empty]').hidden = items.length > 0
  document.querySelectorAll('[data-sheet-ics], [data-sheet-print], [data-sheet-share], [data-sheet-clear]').forEach(b => { b.disabled = items.length === 0 })
  const el = (tag, props = {}, ...children) => { const node = Object.assign(document.createElement(tag), props); node.append(...children); return node }
  list.replaceChildren(...items.map(([slug, item]) => {
    const title = item.title || slug
    const d = item.closes ? toDate(item.closes) : null
    const left = item.closes ? leftText(item.closes) : null
    const date = el('span', { className: 'cs-date' },
      el('span', { className: 'cs-day', textContent: d ? d.getUTCDate() : '—' }),
      el('span', { className: 'cs-month', textContent: d ? MONTHS[d.getUTCMonth()].slice(0, 3) : 'No date' }))
    const link = el('a', { href: `${BASE}${encodeURIComponent(slug)}/`, textContent: title })
    link.setAttribute('data-pd-type', 'label')
    const org = el('span', { className: 'cs-org', textContent: item.organiser || '' })
    org.setAttribute('data-pd-type', 'body.small')
    const status = el('select', {}, ...STATUSES.map(([v, t]) => el('option', { value: v, textContent: t, selected: item.status === v })))
    status.dataset.status = slug
    status.setAttribute('aria-label', `Status of ${title}`)
    const meta = el('span', { className: 'cs-sheet-meta' }, link, org)
    if (left) meta.append(el('span', { className: `cs-left ${left.cls}`, textContent: left.text }))
    if (item.was && item.movedOn && -daysUntil(item.movedOn) < 45) meta.append(el('span', { className: 'cs-sheet-flag', textContent: `Date changed: was ${shortDate(item.was)}` }))
    else if (newSince.has(slug)) meta.append(el('span', { className: 'cs-sheet-flag', textContent: 'New on the list' }))
    meta.append(status)
    const remove = el('button', { className: 'cs-sheet-remove', type: 'button', innerHTML: '<svg class="cs-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#cs-close"></use></svg>' })
    remove.dataset.remove = slug
    remove.setAttribute('aria-label', `Remove ${title} from my call sheet`)
    return el('li', { className: 'cs-sheet-item' }, date, meta, remove)
  }))
}

document.addEventListener('change', event => {
  const select = event.target.closest('[data-status]')
  if (select && sheet.items[select.dataset.status]) {
    sheet.items[select.dataset.status].status = select.value
    writeSheet(sheet)
  }
})
document.addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]')
  if (remove) {
    const items = [...document.querySelectorAll('[data-remove]')]
    const next = items[items.indexOf(remove) + 1] || items[items.indexOf(remove) - 1]
    const nextSlug = next?.dataset.remove
    toggleSave(remove.dataset.remove)
    // Keep focus in the drawer: on the next call's remove button, or the close button.
    const target = (nextSlug && [...document.querySelectorAll('[data-remove]')].find(b => b.dataset.remove === nextSlug)) || dialog?.querySelector('[data-close-sheet]')
    target?.focus()
  }
  if (event.target.closest('[data-open-sheet]')) openSheet()
  if (event.target.closest('[data-close-sheet]')) dialog?.close()
})
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
function openSheet () {
  renderSheet()
  if (dialog && !dialog.open) dialog.showModal()
}

// Calendar file: one marker per deadline, with reminders a week and a day before.  A cut-off
// with a known time and zone becomes a timed hour ending at it, so it lands right wherever
// the calendar is; otherwise it's an all-day marker on the organiser's date.
function icsFor (entries) {
  const utc = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const stamp = utc(new Date())
  const esc = text => String(text || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => '\\' + m)
  // Lines fold at 75 octets, not characters: accented titles are longer in UTF-8.
  const bytes = ch => new TextEncoder().encode(ch).length
  const fold = line => {
    const out = []
    let cur = ''
    let size = 0
    for (const ch of line) {
      if (size + bytes(ch) > (out.length ? 74 : 75)) { out.push(cur); cur = ''; size = 0 }
      cur += ch
      size += bytes(ch)
    }
    return [...out, cur].join('\r\n ')
  }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//pitch.dog//Call Sheet//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Call Sheet deadlines']
  for (const [slug, item] of entries) {
    if (!item.closes) continue
    const start = item.closes.replace(/-/g, '')
    const end = new Date(toDate(item.closes).getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '')
    const at = instantOf(item.closes, item.time, item.tz)
    const page = `${location.origin}${BASE}${slug}/`
    const cutoff = at ? `It closes at ${item.time}, ${zoneName(item.tz)}.` : 'Check the exact cut-off time and time zone on the official page before you plan around this date.'
    lines.push('BEGIN:VEVENT', `UID:${slug}-${start}@pitch.dog`, `DTSTAMP:${stamp}`,
      ...(at ? [`DTSTART:${utc(new Date(at.getTime() - 3600000))}`, `DTEND:${utc(at)}`] : [`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`]),
      fold(`SUMMARY:${esc('Deadline: ' + item.title)}`),
      fold(`DESCRIPTION:${esc(`${cutoff}\n\nCall Sheet: ${page}${item.official ? '\nOfficial page: ' + item.official : ''}`)}`),
      fold(`URL:${page}`), 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', fold(`DESCRIPTION:${esc('A week to go: ' + item.title)}`), 'TRIGGER:-P7D', 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', fold(`DESCRIPTION:${esc('Closes tomorrow: ' + item.title)}`), 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(line => line.includes('\r\n') ? line : fold(line)).join('\r\n') + '\r\n'
}
function download (name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.append(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
document.querySelector('[data-sheet-ics]')?.addEventListener('click', () => {
  const entries = sortedItems().filter(([, i]) => i.closes && i.closes >= todayISO)
  if (!entries.length) return say('None of your saved calls has an upcoming deadline yet.')
  download('call-sheet-deadlines.ics', icsFor(entries), 'text/calendar')
  say(`${entries.length} ${entries.length === 1 ? 'deadline' : 'deadlines'} ready for your calendar.`)
})
document.querySelector('[data-ics]')?.addEventListener('click', () => {
  const slug = callPage.dataset.call
  download(`${slug}.ics`, icsFor([[slug, snapshotFromPage(callPage)]]), 'text/calendar')
})

document.querySelector('[data-sheet-share]')?.addEventListener('click', async () => {
  const url = `${location.origin}${BASE}?sheet=${sortedItems().map(([slug]) => slug).join(',')}`
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ title: 'My call sheet', url })
    else { await navigator.clipboard.writeText(url); say('Link copied. Anyone with it sees the same calls, never your notes or statuses.') }
  } catch { prompt('Copy this link:', url) }
})

const clearButton = document.querySelector('[data-sheet-clear]')
clearButton?.addEventListener('click', () => {
  if (clearButton.dataset.confirm !== '1') {
    clearButton.dataset.confirm = '1'
    clearButton.textContent = 'Sure? Clear all'
    setTimeout(() => { clearButton.dataset.confirm = ''; clearButton.textContent = 'Clear' }, 4000)
    return
  }
  sheet = { v: 1, items: {} }
  writeSheet(sheet)
  clearButton.dataset.confirm = ''
  clearButton.textContent = 'Clear'
  syncSaveButtons()
  renderSheet()
  if (filters?.only.includes('saved')) applyFilters()
  say('Cleared.')
})

document.querySelector('[data-sheet-print]')?.addEventListener('click', () => {
  const holder = document.querySelector('[data-print]')
  const items = sortedItems()
  const label = Object.fromEntries(STATUSES)
  const cell = text => { const td = document.createElement('td'); td.textContent = text || ''; return td }
  const table = document.createElement('table')
  table.innerHTML = '<thead><tr><th>Closes</th><th>Call</th><th>Who can apply</th><th>You get</th><th>Entry fee</th><th>Status</th></tr></thead><tbody></tbody>'
  for (const [slug, item] of items) {
    const tr = document.createElement('tr')
    const call = cell(item.title)
    const link = document.createElement('div'); link.className = 'cs-print-url'; link.textContent = `pitch.dog${BASE}${slug}/`
    call.append(link)
    tr.append(cell(item.closes ? shortDate(item.closes, true) : '—'), call, cell(item.who), cell(item.get), cell(item.fee), cell(label[item.status] || ''))
    table.tBodies[0].append(tr)
  }
  const h1 = document.createElement('h1'); h1.textContent = 'Call sheet.'
  const meta = document.createElement('p'); meta.className = 'cs-print-meta'
  meta.innerHTML = `<span>Printed ${shortDate(todayISO, true)}</span><span>${items.length} ${items.length === 1 ? 'call' : 'calls'}</span><span>pitch.dog/call-sheet</span>`
  const foot = document.createElement('p'); foot.className = 'cs-print-foot'
  foot.textContent = 'A research snapshot, not legal advice. Check every deadline, fee and rule on the official page before you apply.'
  holder.replaceChildren(h1, meta, table, foot)
  dialog?.close()
  document.body.classList.add('cs-printing')
  const done = () => { document.body.classList.remove('cs-printing'); removeEventListener('afterprint', done) }
  addEventListener('afterprint', done)
  print()
  setTimeout(done, 1500)
})

// --------------------------------------------------------- since last time

// Which calls are new since this browser last opened the list.  The list a visit saw is kept,
// and after a few hours away it becomes the one to compare with; nothing leaves the browser.
const SEEN = 'pitchdog-call-sheet-seen'
const newSince = new Set()
let lastVisit = null
// Only the full list counts as a visit; a ready-made list shows a few calls, not the sheet.
if (listRows.length && document.querySelector('#cs-groups')) {
  const now = Date.now()
  const current = listRows.map(row => row.dataset.slug)
  let seen = null
  try { seen = JSON.parse(localStorage.getItem(SEEN) || 'null') } catch {}
  const valid = list => Array.isArray(list) && list.every(x => typeof x === 'string')
  if (!seen || typeof seen.at !== 'number' || !valid(seen.slugs)) seen = { at: now, slugs: current }
  else if (now - seen.at > 6 * 3600000) seen = { at: now, slugs: current, prev: { at: seen.at, slugs: seen.slugs } }
  if (seen.prev && typeof seen.prev.at === 'number' && valid(seen.prev.slugs)) {
    const before = new Set(seen.prev.slugs)
    for (const slug of current) if (!before.has(slug)) newSince.add(slug)
    lastVisit = new Date(seen.prev.at)
  }
  try { localStorage.setItem(SEEN, JSON.stringify(seen)) } catch {}
}

// ------------------------------------------------------------ list page

let filters = null
const form = document.querySelector('#cs-filters')
const groupsHost = document.querySelector('#cs-groups')

function bucketFor (row, live) {
  const closes = row.dataset.closes
  if (live === 'closed') return { key: 'z', title: 'Closed for this round', closed: true }
  if (!closes) return { key: 'y', title: 'No fixed date yet' }
  const days = daysUntil(closes)
  if (days <= 7) return { key: '0', title: days === 0 ? 'Closes today' : 'In the next 7 days' }
  const d = toDate(closes)
  const now = toDate(todayISO)
  const sameMonth = d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()
  const title = sameMonth ? `Later in ${MONTHS[d.getUTCMonth()]}` : MONTHS[d.getUTCMonth()] + (d.getUTCFullYear() !== now.getUTCFullYear() ? ' ' + d.getUTCFullYear() : '')
  return { key: '1' + closes.slice(0, 7), title }
}

if (form && groupsHost && listRows.length) {
  const select = form.querySelector('#cs-from')
  const countries = COUNTRY_CODES.map(code => [code, countryName(code)]).sort((a, b) => a[1].localeCompare(b[1]))
  for (const [code, name] of countries) select.append(new Option(name, code))

  // A compact "More filters" switch for small screens.
  const more = document.createElement('button')
  more.type = 'button'
  more.className = 'button button--small cs-more-filters'
  more.innerHTML = '<svg class="cs-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#cs-sliders"></use></svg><span>More filters</span>'
  more.setAttribute('aria-expanded', 'false')
  more.setAttribute('aria-controls', 'cs-filter-more')
  form.querySelector('.cs-filter-more').before(more)
  more.addEventListener('click', () => {
    const open = !form.classList.contains('is-expanded')
    form.classList.toggle('is-expanded', open)
    more.setAttribute('aria-expanded', String(open))
    more.querySelector('span').textContent = open ? 'Fewer filters' : 'More filters'
  })

  const facets = ['format', 'stage', 'kind', 'only']
  const params = new URLSearchParams(location.search)
  // Only values the form offers: a hand-edited link can't produce "Filtered: , .".
  const offered = facet => new Set([...form.querySelectorAll(`input[name="${facet}"]`)].map(box => box.value))
  const listParam = facet => (params.get(facet) || '').split(',').filter(v => offered(facet).has(v))
  const sharedSlugs = (params.get('sheet') || '').split(',').filter(Boolean)
  filters = {
    q: (params.get('q') || '').slice(0, 80),
    from: (params.get('from') || '').toUpperCase(),
    format: listParam('format'),
    stage: listParam('stage'),
    kind: listParam('kind'),
    only: listParam('only'),
    all: params.get('all') === '1',
    shared: sharedSlugs.filter(slug => rowBySlug.has(slug)),
  }
  // "New since my last visit" means nothing to a browser with no last visit (a shared link).
  if (!newSince.size) filters.only = filters.only.filter(v => v !== 'new')
  const missingShared = sharedSlugs.length - filters.shared.length
  form.q.value = filters.q
  if (COUNTRY_CODES.includes(filters.from)) select.value = filters.from
  else filters.from = ''
  for (const facet of facets) form.querySelectorAll(`input[name="${facet}"]`).forEach(box => { box.checked = filters[facet].includes(box.value) })
  if (filters.stage.length || filters.q) { form.classList.add('is-expanded'); more.setAttribute('aria-expanded', 'true'); more.querySelector('span').textContent = 'Fewer filters' }

  // Fuzzy enough for typos: a query word matches a word in the call within one edit.
  const near = (a, b) => {
    if (Math.abs(a.length - b.length) > 1) return false
    let i = 0; let j = 0; let edits = 0
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue }
      if (++edits > 1) return false
      if (a.length > b.length) i++
      else if (b.length > a.length) j++
      else { i++; j++ }
    }
    return edits + (a.length - i) + (b.length - j) <= 1
  }
  const fold = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const words = new Map(listRows.map(row => [row, fold(row.dataset.search).split(' ').filter(Boolean)]))
  // Country names and everyday aliases, so "Kenya" or "UK" in the search box sets the place.
  const ALIASES = { uk: 'GB', britain: 'GB', 'great britain': 'GB', england: 'GB', scotland: 'GB', wales: 'GB', 'northern ireland': 'GB', us: 'US', usa: 'US', america: 'US', 'united states of america': 'US', uae: 'AE', 'south korea': 'KR', korea: 'KR', holland: 'NL', 'czech republic': 'CZ', turkey: 'TR', 'ivory coast': 'CI', russia: 'RU', palestine: 'PS', kosovo: 'XK' }
  const placeWords = new Map([...countries.map(([code, name]) => [fold(name), code]), ...Object.entries(ALIASES)])
  function matchesQuery (row, query) {
    if (!query) return true
    // A search that is just a place ("Kenya", "UK") finds what's open to people based there.
    const place = queryPlace(query)
    if (place) return placeMatch(JSON.parse(row.dataset.where), place) !== 'no'
    const text = ` ${fold(row.dataset.search)} `
    const own = words.get(row)
    return fold(query).split(' ').filter(Boolean).every(q => {
      if (q === 'free' && row.dataset.fee === 'free') return true
      // Short words match whole words only: "us" shouldn't find "focus".
      if (q.length <= 3 ? own.some(w => w === q || (q.length === 3 && w.startsWith(q))) : text.includes(q)) return true
      return q.length >= 4 && own.some(w => near(q, w))
    })
  }
  function queryPlace (query) {
    const code = placeWords.get(fold(query))
    return code && COUNTRY_CODES.includes(code) ? code : null
  }
  const anyOf = (wanted, have) => !wanted.length || have.includes('any') || wanted.some(w => have.includes(w))

  const shown = new Map()
  const groupCache = new Map()
  const countEl = document.querySelector('[data-count]')
  const noteEl = document.querySelector('[data-count-note]')
  const clear = document.querySelector('[data-clear]')
  const empty = document.querySelector('[data-empty]')
  const excludedEl = document.querySelector('[data-excluded]')
  const filterJump = document.querySelector('[data-filter-jump]')
  const see = document.querySelector('[data-see]')
  const startAgain = document.querySelector('[data-clear-finder]')
  startAgain?.addEventListener('click', () => clear.click())
  // Screen readers hear the result count once typing settles, not every keystroke.
  const announcer = Object.assign(document.createElement('p'), { className: 'sr-only' })
  announcer.setAttribute('aria-live', 'polite')
  document.querySelector('.cs-results-head').append(announcer)
  const announce = text => { clearTimeout(announce.t); announce.t = setTimeout(() => { announcer.textContent = text }, 600) }

  const sharedBanner = filters.shared.length ? (() => {
    const box = document.createElement('div')
    box.className = 'cs-shared'
    box.setAttribute('role', 'status')
    const gone = missingShared ? ` ${missingShared} more ${missingShared === 1 ? 'isn’t' : 'aren’t'} on Call Sheet any more.` : ''
    box.innerHTML = `<p data-pd-type="body.default"><strong>Someone shared ${filters.shared.length} ${filters.shared.length === 1 ? 'call' : 'calls'} with you.</strong> Showing just those.${gone}</p><div class="button-row"><button class="button button--ink button--small" type="button" data-adopt>Add to my call sheet</button><button class="button button--small" type="button" data-show-all>Show every call</button></div>`
    document.querySelector('.cs-results-head').after(box)
    box.querySelector('[data-adopt]').addEventListener('click', () => {
      for (const slug of filters.shared) if (!saved(slug)) toggleSave(slug)
      box.querySelector('[data-adopt]').replaceWith(Object.assign(document.createElement('span'), { textContent: 'Added.' }))
    })
    box.querySelector('[data-show-all]').addEventListener('click', () => { filters.shared = []; box.remove(); applyFilters() })
    return box
  })() : null

  function rowState (row) {
    const live = liveState({ closes: row.dataset.closes, opens: row.dataset.opens, state: row.dataset.state })
    const where = JSON.parse(row.dataset.where)
    return { live, where, place: placeMatch(where, filters.from) }
  }

  function decorate (row, { live, where, place }) {
    const fresh = row.querySelector('[data-badge-new]')
    if (fresh) fresh.hidden = !newSince.has(row.dataset.slug) || live === 'closed'
    const left = row.querySelector('[data-left]')
    if (row.dataset.closes && left) {
      const l = leftText(row.dataset.closes)
      left.textContent = l.text
      left.className = `cs-left ${l.cls}`
    }
    const badge = row.querySelector('[data-badge-state]')
    const states = {
      open: ['Open now', 'cs-badge--open'],
      later: [row.dataset.opens && row.dataset.opens > todayISO ? `Opens ${shortDate(row.dataset.opens)}` : 'Not open yet', 'cs-badge--later'],
      watch: ['Check it’s open', 'cs-badge--check'],
      rolling: ['Rolling or watch', 'cs-badge--later'],
      tbc: ['Dates to come', 'cs-badge--later'],
      closed: ['Closed', 'cs-badge--closed'],
    }
    const [text, cls] = states[live]
    badge.textContent = text
    badge.className = `cs-badge ${cls}`
    badge.hidden = false
    // An early or fast-track cut-off still ahead of the final one.
    const tierBadge = row.querySelector('[data-badge-tier]')
    const tier = (row.dataset.tiers || '').split(' ').find(d => d && d >= todayISO && d < row.dataset.closes)
    if (tierBadge) {
      tierBadge.hidden = !tier || live === 'closed'
      if (tier) tierBadge.textContent = `Early deadline ${shortDate(tier)}`
    }
    const placeBadge = row.querySelector('[data-badge-place]')
    let placeText = ''
    let placeCls = ''
    if (filters.from) {
      const name = countryName(filters.from)
      if (place === 'yes') placeText = where.scope === 'worldwide' ? (where.identity ? 'Open in any country' : 'Open worldwide') : where.subnational ? `${where.subnational} only` : `Open to ${name}`
      else if (place === 'maybe') { placeText = 'Check who can apply'; placeCls = 'cs-badge--check' }
      else { placeText = `Not open to ${name}`; placeCls = 'cs-badge--closed' }
    } else if (where.scope === 'worldwide' && !(where.excludes || []).length && !where.identity) placeText = 'Open worldwide'
    else if (where.scope === 'unclear') { placeText = 'Check who can apply'; placeCls = 'cs-badge--check' }
    placeBadge.textContent = placeText
    placeBadge.className = `cs-badge cs-badge--place ${placeCls}`
    placeBadge.hidden = !placeText
  }

  function groupFor (bucket) {
    if (groupCache.has(bucket.key)) return groupCache.get(bucket.key)
    const el = document.createElement(bucket.closed ? 'details' : 'section')
    el.className = `cs-group${bucket.closed ? ' cs-group--closed' : ''}`
    el.dataset.group = bucket.key
    const head = document.createElement(bucket.closed ? 'summary' : 'header')
    if (!bucket.closed) head.className = 'cs-group-head'
    head.innerHTML = '<h3 class="cs-group-title" data-pd-type="title.card"></h3><span class="cs-group-count" data-pd-type="metadata"></span>'
    head.querySelector('h3').textContent = bucket.title
    const list = document.createElement('ol')
    list.className = 'cs-list'
    el.append(head, list)
    const entry = { el, list, count: head.querySelector('.cs-group-count'), title: head.querySelector('h3') }
    groupCache.set(bucket.key, entry)
    return entry
  }

  function applyFilters ({ write = true } = {}) {
    const rows = []
    let excluded = 0
    for (const row of listRows) {
      const info = rowState(row)
      const savedOnly = filters.only.includes('saved')
      const base = (filters.shared.length ? filters.shared.includes(row.dataset.slug) : true) &&
        matchesQuery(row, filters.q) &&
        anyOf(filters.format, row.dataset.formats.split(' ')) &&
        anyOf(filters.stage, row.dataset.stages.split(' ')) &&
        anyOf(filters.kind, row.dataset.kinds.split(' ')) &&
        (!filters.only.includes('open') || info.live === 'open') &&
        (!filters.only.includes('free') || row.dataset.fee === 'free') &&
        (!savedOnly || saved(row.dataset.slug)) &&
        (!filters.only.includes('new') || newSince.has(row.dataset.slug))
      decorate(row, info)
      if (!base) continue
      if (info.place === 'no' && !filters.all) { excluded++; continue }
      rows.push([row, info])
    }
    rows.sort(([a], [b]) => (a.dataset.closes || '9999').localeCompare(b.dataset.closes || '9999') || a.dataset.title.localeCompare(b.dataset.title))
    const used = new Map()
    for (const [row, info] of rows) {
      const bucket = bucketFor(row, info.live)
      const group = groupFor(bucket)
      group.title.textContent = bucket.title
      if (!used.has(bucket.key)) used.set(bucket.key, { group, rows: [] })
      used.get(bucket.key).rows.push(row)
    }
    const ordered = [...used.entries()].sort(([a], [b]) => a.localeCompare(b))
    groupsHost.replaceChildren(...ordered.map(([, { group, rows: members }]) => {
      group.list.replaceChildren(...members)
      group.count.textContent = members.length
      return group.el
    }))
    const visible = rows.filter(([, info]) => info.live !== 'closed').length
    const closedCount = rows.length - visible
    countEl.textContent = String(visible)
    countEl.parentElement.lastChild.textContent = ` ${visible === 1 ? 'call' : 'calls'}, soonest first`
    const active = []
    if (filters.q) active.push(queryPlace(filters.q) ? `open to people based in ${countryName(queryPlace(filters.q))}` : `“${filters.q.length > 40 ? filters.q.slice(0, 40) + '…' : filters.q}”`)
    if (filters.from) active.push(`based in ${countryName(filters.from)}`)
    for (const facet of ['format', 'stage', 'kind']) for (const v of filters[facet]) active.push(form.querySelector(`input[name="${facet}"][value="${v}"]`)?.nextElementSibling.textContent.toLowerCase())
    for (const v of filters.only) active.push(form.querySelector(`input[name="only"][value="${v}"]`)?.nextElementSibling.textContent.toLowerCase())
    noteEl.textContent = (filters.shared.length ? 'A shared call sheet. ' : '') + (active.length ? `Filtered: ${active.join(', ')}.` : filters.shared.length ? '' : 'Every call we track.') + (closedCount ? ` Plus ${closedCount} closed for this round.` : '')
    clear.hidden = !active.length
    empty.hidden = rows.length > 0
    if (filterJump) filterJump.querySelector('span').textContent = active.length ? `Filters (${active.length})` : 'Filters'
    if (see) {
      see.querySelector('[data-see-text]').textContent = visible ? `See ${visible} ${visible === 1 ? 'call' : 'calls'}` : 'Nothing fits yet'
      see.classList.toggle('is-zero', visible === 0)
      startAgain.hidden = !active.length
    }
    if (write) announce(`${visible} ${visible === 1 ? 'call' : 'calls'} open or coming up${active.length ? `, filtered by ${active.join(', ')}` : ''}.`)
    if (filters.from && (excluded || filters.all)) {
      excludedEl.hidden = false
      excludedEl.innerHTML = filters.all
        ? `<span>Showing calls that don’t take applicants based in ${countryName(filters.from)} too.</span><button class="button button--small" type="button" data-toggle-all>Hide them again</button>`
        : `<span>${excluded} more ${excluded === 1 ? 'call doesn’t' : 'calls don’t'} take applicants based in ${countryName(filters.from)}.</span><button class="button button--small" type="button" data-toggle-all>Show them anyway</button>`
    } else excludedEl.hidden = true
    if (write) writeUrl()
  }

  function writeUrl () {
    const p = new URLSearchParams()
    if (filters.q) p.set('q', filters.q)
    if (filters.from) p.set('from', filters.from)
    for (const facet of facets) if (filters[facet].length) p.set(facet, filters[facet].join(','))
    if (filters.all) p.set('all', '1')
    if (filters.shared.length) p.set('sheet', filters.shared.join(','))
    const query = p.toString()
    history.replaceState(null, '', `${location.pathname}${query ? '?' + query : ''}${location.hash}`)
  }

  let timer
  form.addEventListener('input', event => {
    const t = event.target
    if (t.name === 'q') { filters.q = t.value.trim(); clearTimeout(timer); timer = setTimeout(applyFilters, 120); return }
    if (t.name === 'from') { filters.from = t.value; filters.all = false }
    if (facets.includes(t.name)) filters[t.name] = [...form.querySelectorAll(`input[name="${t.name}"]:checked`)].map(b => b.value)
    applyFilters()
  })
  form.addEventListener('submit', event => event.preventDefault())
  document.querySelector('[data-clear-empty]')?.addEventListener('click', () => clear.click())
  clear.addEventListener('click', () => {
    Object.assign(filters, { q: '', from: '', format: [], stage: [], kind: [], only: [], all: false })
    form.reset()
    applyFilters()
    form.q.focus()
  })
  excludedEl.addEventListener('click', event => {
    if (event.target.closest('[data-toggle-all]')) { filters.all = !filters.all; applyFilters() }
  })

  // The board under the title, recounted for the visitor's date.
  const board = { open: 0, week: 0, next: null, free: 0 }
  for (const row of listRows) {
    const live = liveState({ closes: row.dataset.closes, opens: row.dataset.opens, state: row.dataset.state })
    if (live === 'open') board.open++
    if (live === 'open' && row.dataset.fee === 'free') board.free++
    if (row.dataset.closes && live !== 'closed' && daysUntil(row.dataset.closes) <= 7) board.week++
    if (row.dataset.closes && row.dataset.closes >= todayISO && (!board.next || row.dataset.closes < board.next)) board.next = row.dataset.closes
  }
  document.querySelector('[data-board="open"]').textContent = board.open
    document.querySelector('[data-board="next"]').textContent = board.next ? shortDate(board.next) : '—'
  const freeBoard = document.querySelector('[data-board="free"]')
  if (freeBoard) freeBoard.textContent = board.free

  // The WhatsApp button sits over the save column; tuck it away while the list is on screen.
  const results = document.querySelector('#calls')
  if (results && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => document.body.classList.toggle('fab-tucked', entry.isIntersecting), { rootMargin: '0px 0px -15% 0px' }).observe(results)
  }

  // An old snapshot says so, rather than passing off stale dates as current.
  const age = -daysUntil(document.body.dataset.asOf || todayISO)
  if (age > 45) {
    const stale = document.createElement('p')
    stale.className = 'cs-stale'
    stale.setAttribute('data-pd-type', 'body.small')
    stale.textContent = `We last checked this list on ${shortDate(document.body.dataset.asOf, true)}, ${Math.round(age / 30.4)} ${Math.round(age / 30.4) === 1 ? 'month' : 'months'} ago. Calls that have closed move to the bottom on their own, but new rounds and changed dates won’t show until we check again. The official page always wins.`
    document.querySelector('.cs-results-head').after(stale)
  }

  // Back again: say what's new, and offer just those.
  if (newSince.size && lastVisit) {
    const chip = form.querySelector('[data-new-chip]')
    chip.hidden = false
    chip.querySelector('span').textContent = `New since ${shortDate(lastVisit.toISOString().slice(0, 10))} (${newSince.size})`
    const box = document.createElement('div')
    box.className = 'cs-welcome'
    box.setAttribute('role', 'status')
    box.innerHTML = `<p data-pd-type="body.default"><strong>Welcome back.</strong> ${newSince.size} ${newSince.size === 1 ? 'call is' : 'calls are'} new since you were last here, on ${shortDate(lastVisit.toISOString().slice(0, 10))}.</p><button class="button button--small" type="button" data-only-new>Show just the new ones</button>`
    box.querySelector('[data-only-new]').addEventListener('click', () => {
      form.querySelector('input[name="only"][value="new"]').checked = true
      filters.only = [...new Set([...filters.only, 'new'])]
      applyFilters()
      document.querySelector('#calls').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
    document.querySelector('.cs-stage-actions')?.after(box)
  }

  applyFilters({ write: false })
  if (sharedBanner) {
    // A shared call that has since closed still shows, in its group, opened.
    groupsHost.querySelector('details.cs-group--closed')?.setAttribute('open', '')
    sharedBanner.scrollIntoView?.({ block: 'center' })
  }
}

// ------------------------------------------------------------- call page

if (callPage) {
  const box = callPage.querySelector('[data-countdown]')
  const text = box?.querySelector('[data-countdown-text]')
  if (box && text) {
    const closes = nextRound(box.dataset.rounds, box.dataset.closes)
    const moved = closes !== box.dataset.closes
    if (moved) {
      // The round on the page has passed and the call has another: show that one.
      Object.assign(box.dataset, { closes, time: '', tz: '' })
      callPage.dataset.closes = closes
    }
    const { opens, time, tz } = box.dataset
    const at = instantOf(closes, time, tz)
    const live = at && at < new Date() ? 'closed' : liveState(box.dataset)
    if (moved) box.querySelector('[data-countdown-when]').textContent = `${longDate(closes)}${live === 'closed' ? '' : '. The earlier round has closed'}.`
    if (live === 'closed') {
      // Nothing left to put in a calendar.
      callPage.querySelector('[data-ics]')?.remove()
      callPage.dataset.closed = 'true'
    }
    if (live === 'closed' && closes) { text.textContent = `Closed on ${shortDate(closes, true)}`; box.classList.add('is-closed') }
    else if (live === 'later' && opens && opens > todayISO) { text.textContent = `Opens in ${daysUntil(opens)} ${daysUntil(opens) === 1 ? 'day' : 'days'}, ${shortDate(opens)}`; box.classList.add('is-later') }
    else if (closes) {
      const days = daysUntil(closes)
      const hours = at ? Math.floor((at - new Date()) / 3600000) : null
      text.textContent = hours !== null && hours < 36 ? (hours < 1 ? 'Closes within the hour' : `Closes in ${hours} ${hours === 1 ? 'hour' : 'hours'}`)
        : days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `Closes in ${days} days`
      if (days <= 7) box.classList.add('is-soon')
      if (live === 'watch') text.textContent += ', if it’s open'
    }
    // The same cut-off on the visitor's clock, when their zone differs from the organiser's.
    const local = box.querySelector('[data-local]')
    if (at && local && live !== 'closed' && hereZone && zoneOffset(at.getTime(), hereZone) !== zoneOffset(at.getTime(), tz)) {
      const when = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: hereZone }).format(at)
      local.textContent = `That’s ${when.replace(' at ', ', ')} where you are (${zoneName(hereZone)}).`
      local.hidden = false
    }
  }
  let next = false
  for (const item of callPage.querySelectorAll('.cs-timeline-item')) {
    if (item.dataset.date < todayISO) item.classList.add('is-past')
    else if (!next) { item.classList.add('is-next'); next = true }
  }
  // The WhatsApp button sits over the action buttons on a phone; tuck it while they're on screen.
  const actions = callPage.querySelector('.cs-callactions')
  if (actions && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => document.body.classList.toggle('fab-tucked', entry.isIntersecting)).observe(actions)
  }
  const back = callPage.querySelector('[data-back]')
  back?.addEventListener('click', event => {
    try {
      const from = new URL(document.referrer)
      if (from.origin === location.origin && from.pathname === BASE && history.length > 1) { event.preventDefault(); history.back() }
    } catch {}
  })
  const check = callPage.querySelector('[data-selfcheck]')
  if (check) {
    const result = check.querySelector('[data-selfcheck-result]')
    const total = check.querySelectorAll('.cs-checklist li').length
    check.addEventListener('change', () => {
      const answers = [...check.querySelectorAll('input:checked')].map(i => i.value)
      const no = answers.filter(a => a === 'no').length
      const unsure = answers.filter(a => a === 'unsure').length
      if (no) result.textContent = `${no === 1 ? 'One answer rules' : `${no} answers rule`} this out as written. Read the official rules before you spend more time on it.`
      else if (answers.length < total) result.textContent = `${total - answers.length} still to answer.`
      else if (unsure) result.textContent = `Nothing rules you out yet. ${unsure} to confirm on the official page.`
      else result.textContent = 'Nothing here rules you out. Now check the details on the official page.'
    })
  }
}

// Calendar feeds: Google Calendar wants the https link pasted, not a webcal tap.
document.querySelector('[data-copy-feed]')?.addEventListener('click', async event => {
  const url = document.querySelector('[data-feed]')?.dataset.feed
  if (!url) return
  try { await navigator.clipboard.writeText(url); event.target.textContent = 'link copied' } catch { prompt('Copy this link:', url) }
})

// What to bring: ticks stay in this browser, per call.
const BRING = 'pitchdog-call-sheet-bring'
const bringList = callPage?.querySelector('.cs-bring')
if (bringList) {
  const slug = callPage.dataset.call
  let ticks = {}
  try { ticks = JSON.parse(localStorage.getItem(BRING) || '{}') || {} } catch {}
  const boxes = [...bringList.querySelectorAll('[data-bring]')]
  const mine = new Set(Array.isArray(ticks[slug]) ? ticks[slug] : [])
  const progress = callPage.querySelector('[data-bring-progress]')
  const show = () => { const n = boxes.filter(b => b.checked).length; progress.textContent = n ? (n === boxes.length ? 'All ready.' : `${n} of ${boxes.length} ready.`) : '' }
  for (const box of boxes) box.checked = mine.has(Number(box.dataset.bring))
  show()
  bringList.addEventListener('change', () => {
    const on = boxes.filter(b => b.checked).map(b => Number(b.dataset.bring))
    if (on.length) ticks[slug] = on
    else delete ticks[slug]
    try { localStorage.setItem(BRING, JSON.stringify(ticks)) } catch { notice('Your browser is blocking storage here, so ticks won’t be kept.') }
    show()
  })
}

// How long ago a page was checked, once that starts to matter.
for (const el of document.querySelectorAll('[data-age]')) {
  const days = -daysUntil(el.dataset.age)
  if (days < 21) continue
  el.textContent = days < 63 ? `, ${Math.round(days / 7)} weeks ago` : `, ${Math.round(days / 30.4)} months ago`
  el.closest('.hero-locator, .cs-slip')?.classList.add('is-stale')
}

syncSaveButtons()
renderSheet()

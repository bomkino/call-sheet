#!/usr/bin/env python3
"""Still Time: the weekly Call Sheet post, one per key market.

Reads data/calls.json, picks up to three opportunities per week and region that still
leave enough time to apply properly, and writes social/posts/v2/weekly.js with the picks
embedded and the post definitions (P(id, {...}) for every week x region).

  python3 social/posts/make_weekly.py            # write v2/weekly.js
  python3 social/posts/make_weekly.py --explain  # also print every pool and every exclusion

The rules (from the owner):
- Lead time is counted from the Monday the post goes out to the EFFECTIVE deadline: the
  earliest date that matters. A prerequisite step (questionnaire, registration, step 1)
  counts as the deadline when it comes first.
- Minimum lead time by what the application needs:
    14 days  enter a finished film or a script
    21 days  a lab, fellowship, pitch forum or fund that wants a synopsis, statement, video,
             treatment or sample
    35 days  anything that wants a budget, financing plan, production company or other
             production paperwork (and public-funder labs)
    42 days  major public funds (Telefilm, Screen Australia, UK Global Screen Fund, Bell, CMF...)
- Excluded: not open on the posting day (unless it opens within 7 days: then "opens ..."),
  invite-only, closed, rolling or undated, an earlier step already passed, not open to the
  region (where.countries has it, or where.scope is worldwide), city- or state-restricted,
  identity-restricted unless the row says who it's for, deadlines we couldn't confirm, and
  anything whose reward isn't published.
"""
import json, re, sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data' / 'calls.json'
OUT = Path(__file__).resolve().parent / 'v2' / 'weekly.js'

AS_OF = date(2026, 10, 17)
WEEKS = [date(2026, 10, 19) + timedelta(weeks=k) for k in range(5)]
HORIZON = 63            # days: "coming up" means within nine weeks of the post
PER_POST = 3

REGIONS = {  # key: (country code, who we're talking to, ground colour)
    'us': ('US', 'US', 'var(--blue)'),
    'uk': ('GB', 'UK', 'var(--green)'),
    'ca': ('CA', 'Canadian', 'var(--salmon)'),
    'au': ('AU', 'Australian', 'var(--yellow)'),
}

# National and supranational screen agencies: the big public funds.
MAJOR = re.compile(r'^(Telefilm|Screen Australia|UK Global Screen Fund|Bell Fund|CMF|NZFC|NZ On Air|CNC|'
                   r'Creative Europe|Eurimages|FFA|Austrian Film Institute|Finnish Film Foundation|IDFA Bertha)')
PAPER = re.compile(r'budget|financ|cash ?flow|production package|company|corporate|rights chain|'
                   r'distribution plan|production schedule')
MATERIAL = re.compile(r'synopsis|statement|video|treatment|sample|pitch|dossier|proposal|deck|teaser|footage|bio')
MONEY = re.compile(r'(USD|CAD|AUD|NZD|GBP|EUR|SGD|£|\$|€)\s?\d')


def d(s):
    return date.fromisoformat(s) if s else None


def need(c):
    """Minimum lead time in days for what this application asks for, and why."""
    items = [b['item'] for b in c['bring'] if not b['item'].lower().startswith('if selected')]
    bring = ' '.join(items).lower()
    kinds = set(c['kinds'])
    major = bool(MAJOR.match(c['title']))
    if bucket(c) == 'enter':
        return 14, 'a finished film or a script'
    if major and 'lab' not in kinds:
        return 42, 'major public fund'
    if PAPER.search(bring) or c['where']['test'] == 'company':
        return 35, 'budget, financing or company paperwork'
    if major:
        return 35, 'public-funder programme'
    if kinds & {'lab', 'market', 'grant', 'other_finance'} or MATERIAL.search(bring):
        return 21, 'written or video application'
    return 14, 'a finished film or a script'


def bucket(c):
    k = set(c['kinds'])
    if 'festival' in k:
        return 'enter'
    if 'competition' in k and set(c['stages']) <= {'writing'} and 'lab' not in k:
        return 'enter'
    if 'lab' in k:
        return 'lab'                             # labs and fellowships, even with a grant attached
    if k & {'grant', 'other_finance'}:
        return 'fund'
    return 'lab'


def effective(c):
    """(effective deadline, label of the step that sets it, earliest prerequisite already missed)"""
    closes = d(c['closes'])
    pre = [(d(x['date']), x['label']) for x in c['dates'] if x['role'] == 'prerequisite' and x['date']]
    eff, step = closes, None
    for when, label in pre:
        if eff is None or when < eff:
            eff, step = when, label
    return eff, step, pre


def check(c, monday, code):
    """None if c can go in this region's post for this Monday, else the reason it can't."""
    w = c['where']
    if c['state'] in ('closed_or_historical', 'legacy_snapshot'):
        return 'closed'
    if c['state'] == 'watch_or_rolling':
        return 'rolling, invite-only or can close without notice'
    eff, step, pre = effective(c)
    if eff is None:
        return 'no date'
    if any(when < monday for when, _ in pre):
        return 'an earlier step has already passed'
    if re.search(r'invited applicants only|only applicants invited|invite-only|by invitation only',
                 (c['caution'] or '') + ' ' + ' '.join(x['label'] or '' for x in c['dates']), re.I):
        return 'invite-only'
    opens = d(c['opens'])
    if c['state'] == 'announced_not_open' and opens is None:
        return 'not open, no opening date'
    if opens and opens > monday and (opens - monday).days > 7:
        return f'opens {opens} (more than a week away)'
    if not (w['scope'] == 'worldwide' or code in w['countries']) or code in (w.get('excludes') or []):
        return 'not open to the region'
    if w['subnational']:
        return f"only for {w['subnational']}"
    if w['identity'] and c['slug'] not in FOR:
        return f"identity-restricted ({w['identity']}) and no 'for' line written"
    if re.search(r"couldn't load|could not load", c['caution'] or '', re.I):
        return "deadline unconfirmed (we couldn't load the official page)"
    if (c['get'] or '').lower().startswith('not published'):
        return 'reward not published'
    lead = (eff - monday).days
    minimum, why = need(c)
    if lead < minimum:
        return f'{lead} days left, needs {minimum} ({why})'
    if lead > HORIZON:
        return f'{lead} days away (beyond the {HORIZON}-day horizon)'
    return None


def score(c, code, monday, history, same_week):
    s = 0.0
    if code in c['where']['countries']:
        s += 30                                  # made for this market
    if MONEY.search(c['get'] or ''):
        s += 15                                  # real money, stated
    if c['fee']['state'] == 'free':
        s += 5
    if c['where']['identity']:
        s -= 25                                  # narrower audience
    eff, _, _ = effective(c)
    s -= ((eff - monday).days - need(c)[0]) * 0.25   # sooner is more topical
    s -= 40 * (c['slug'] in history.get(monday - timedelta(weeks=1), set()))
    s -= 15 * (c['slug'] in history.get(monday - timedelta(weeks=2), set()))
    s -= 12 * same_week.count(c['slug'])         # the other markets' posts this week
    return s


def pick(pool, code, monday, history, same_week):
    """Up to three, a grant, a lab and something to enter where possible. Fresh first: nothing this
    market saw last week, and nothing two other markets already have this week. Those limits relax
    only when the pool runs short."""
    ranked = sorted(pool, key=lambda c: -score(c, code, monday, history, same_week))
    last = history.get(monday - timedelta(weeks=1), set())
    tiers = [[c for c in ranked if c['slug'] not in last and same_week.count(c['slug']) < 2],
             [c for c in ranked if c['slug'] not in last],
             ranked]
    chosen = []
    for tier in tiers:
        seen = {bucket(c) for c in chosen}
        for c in tier:                           # the best of each kind not yet in the post
            if c not in chosen and bucket(c) not in seen and len(chosen) < PER_POST:
                chosen.append(c); seen.add(bucket(c))
        for c in tier:                           # then the best of the rest
            if c not in chosen and len(chosen) < PER_POST:
                chosen.append(c)
    return sorted(chosen, key=lambda c: effective(c)[0])

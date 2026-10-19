#!/usr/bin/env python3
"""Still Time: the weekly Call Sheet post, one per key market.

Reads data/calls.json, picks up to three opportunities per week and region that still
leave enough time to apply properly, and writes social/posts/v2/weekly.js with the picks
embedded and the post definitions (P(id, {...}) for every week x region).

  python3 social/posts/make_weekly.py            # write v2/weekly.js
  python3 social/posts/make_weekly.py --explain  # also print every pool and every exclusion
  python3 social/posts/make_weekly.py --dry      # print the picks, write nothing

The rules (from the owner):
- Lead time is counted from the Monday the post goes out to the EFFECTIVE deadline: the
  earliest date that matters. A prerequisite step (questionnaire, registration, step 1)
  counts as the deadline when it comes first.
- Minimum lead time by what the application needs:
    14 days  enter a finished film or a script
    21 days  a lab, fellowship, pitch forum or fund that wants a synopsis, statement, video,
             treatment or sample
    35 days  anything that wants a budget, financing plan, production company or other
             production paperwork
    42 days  major public funds (Telefilm, Screen Australia, UK Global Screen Fund, Bell, CMF...),
             whatever the programme: the owner names the funders
  When more than one row applies, the longest wins.
- Excluded: not open on the posting day (unless it opens within 7 days: then "opens ..."),
  invite-only, closed, rolling or undated, an earlier step already passed, not open to the
  region (where.countries has it, or where.scope is worldwide), city- or state-restricted
  (where.subnational, or a state or province named in who it's for), identity-restricted unless
  the row says who it's for, deadlines we couldn't confirm or never rechecked, and anything
  whose reward isn't published. A deadline at "midnight, start or end of day not stated"
  counts as the day before.

The picks: up to three per post, a grant, a lab and something to enter where possible, from
three different organisers, mixing film forms, preferring real money or real support and the
market's own opportunities, and not repeating what that market saw last week.

The design: a production call sheet for the week, on the market's revision-colour ground. See
the JS at the bottom.
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

REGIONS = {  # key: (country code, the place, its revision-colour ground and that colour's name)
    'us': ('US', 'the US', 'var(--blue)', 'blue'),
    'uk': ('GB', 'the UK', 'var(--green)', 'green'),
    'ca': ('CA', 'Canada', 'var(--salmon)', 'salmon'),
    'au': ('AU', 'Australia', 'var(--goldenrod)', 'goldenrod'),
}

# National and supranational screen agencies: the big public funds.
MAJOR = re.compile(r'^(Telefilm|Screen Australia|UK Global Screen Fund|Bell Fund|CMF|Canada Media Fund|Canada Council|'
                   r'BFI|Indigenous Screen Office|NZFC|NZ On Air|CNC|Creative Europe|Eurimages|FFA|'
                   r'Austrian Film Institute|Finnish Film Foundation|IDFA Bertha)')
# A state, province or territory named in who an opportunity is for makes it subnational, even when
# where.subnational is empty (Sundance's Graton Fellowship is for artists from California-based tribes).
STATES = re.compile(r'\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|'
                    r'Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|'
                    r'Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|'
                    r'New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|'
                    r'South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|'
                    r'Wisconsin|Wyoming|Ontario|Quebec|Québec|British Columbia|Alberta|Manitoba|Saskatchewan|'
                    r'Nova Scotia|New Brunswick|Newfoundland|Yukon|Nunavut|Northwest Territories|Prince Edward Island|'
                    r'New South Wales|Victoria|Queensland|Tasmania|Western Australia|South Australia|'
                    r'Northern Territory|Scotland|Wales|Northern Ireland|London)\b')
PAPER = re.compile(r'budget|financ|cash ?flow|production package|company|corporate|rights chain|'
                   r'distribution plan|production schedule')
MATERIAL = re.compile(r'synopsis|statement|video|treatment|sample|pitch|dossier|proposal|deck|teaser|footage|bio')
MONEY = re.compile(r'(USD|CAD|AUD|NZD|GBP|EUR|SGD|£|\$|€)\s?\d')


def d(s):
    return date.fromisoformat(s) if s else None


def major(c):
    return bool(MAJOR.match(c['title']) or MAJOR.match(c['organiser'] or ''))


def need(c):
    """Minimum lead time in days for what this application asks for, and why. When more than one
    row of the owner's table applies, the longest one wins."""
    items = [b['item'] for b in c['bring'] if not b['item'].lower().startswith('if selected')]
    bring = ' '.join(items).lower()
    kinds = set(c['kinds'])
    if major(c):
        return 42, 'major public fund'           # the owner names the funders, whatever the programme
    if bucket(c) == 'enter':
        return 14, 'a finished film or a script'
    if PAPER.search(bring) or c['where']['test'] == 'company':
        return 35, 'budget, financing or company paperwork'
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
    for x in c['dates']:                         # "midnight, start or end of day not stated": the earlier one
        if x['role'] == 'application_submission_deadline' and x['date'] == c['closes'] and \
                'start or end of day not stated' in (x['label'] or ''):
            closes -= timedelta(days=1)
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
    if w['identity'] and STATES.search(w['identity']):
        return f"only for {w['identity']}"
    if w['identity'] and c['slug'] not in FOR:
        return f"identity-restricted ({w['identity']}) and no 'for' line written"
    if (c.get('recheck') or {}).get('status') not in ('confirmed', 'changed'):
        return 'deadline not rechecked against the official page'
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


SUPPORT = re.compile(r'mentor|residenc|workshop|pitch|meetings|tutoring|screening|coaching', re.I)
SHAKY = re.compile(r'not juried|confirm before relying', re.I)


def org(c):
    """Who runs it, loosely: one post never carries two opportunities from the same house."""
    words = (c['organiser'] or c['title']).replace('—', ' ').split()
    return ' '.join(words[:2] if words[0].lower() == 'the' else words[:1]).lower()


def score(c, code, monday, history, same_week):
    s = 0.0
    if code in c['where']['countries']:
        s += 30                                  # made for this market
    if MONEY.search(c['get'] or '') and not SHAKY.search(c['caution'] or ''):
        s += 15                                  # real money, stated and dependable
    elif SUPPORT.search(c['get'] or ''):
        s += 6                                   # real support: mentoring, a residency, a pitch
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
    """Up to three: a grant, a lab and something to enter where possible, from three different houses
    and, where it can, for different kinds of film. Fresh first: nothing this market saw last week,
    and nothing two other markets already have this week. Those limits relax only when the pool
    runs short."""
    last = history.get(monday - timedelta(weeks=1), set())
    tiers = [[c for c in pool if c['slug'] not in last and same_week.count(c['slug']) < 2],
             [c for c in pool if c['slug'] not in last],
             pool]
    chosen = []

    def fits(c):
        return c not in chosen and org(c) not in {org(x) for x in chosen}

    def value(c):                                # a film form already in the post counts against
        shared = set(c['formats']) & {f for x in chosen for f in x['formats']}
        return score(c, code, monday, history, same_week) - 5 * len(shared)

    for tier in tiers:
        for per_kind in (True, False):           # the best of each kind not yet in, then the best of the rest
            while len(chosen) < PER_POST:
                kinds = {bucket(x) for x in chosen}
                cands = [c for c in tier if fits(c) and not (per_kind and bucket(c) in kinds)]
                if not cands:
                    break
                chosen.append(max(cands, key=value))
    return sorted(chosen, key=lambda c: effective(c)[0])


# ---------------------------------------------------------------- the words
# One plain line of what you get, and one of what the application needs, per opportunity. Every fact
# comes from that opportunity's get / bring / who / caution / fee in data/calls.json, as of 17 Oct.
# FOR: who an identity-restricted opportunity is for, shown in its row. NOTE: the catch worth knowing
# before you start (a fee if you're selected, a step that comes first), in the row's own facts.
COPY = {
    'atlanta-film-festival-screenplay-2027': ('Atlanta Film Festival Screenplay Competition',
        'Cash prizes of $250–500, plus travel and two nights’ lodging', 'Needs a script in English, written without AI tools.'),
    'atx-tv-festival-pitch-competition-2027': ('ATX TV Festival Pitch Competition',
        'Ten finalists pitch live and get a year of mentoring', 'Needs your pilot’s first 10 pages and a 90-second video.'),
    'bell-fund-production-major-production-funder': ('Bell Fund, Major Production Funder',
        'Up to CAD 150,000–250,000 for production, non-repayable', 'Needs a Canadian company, a licence deal, a budget and a finance plan.'),
    'canada-council-creating-knowing-and-sharing-short-term-projects': ('Canada Council Short-Term Projects',
        'Project funding for up to a year; no amount published', 'Needs an activity proposal and a budget.'),
    'carole-dorothy-joyce-student-grant-2026': ('Carole Dorothy Joyce Student Grant',
        '$3,000 plus donated services and products', 'Needs a synopsis, a budget and a fundraising plan.'),
    'cfa-x-imgn-grant-2026': ('CFA x IMGN Grant',
        'USD 4,500 for one narrative or documentary project', 'Needs a budget and a production book with a script breakdown.'),
    'cinestory-tv-retreat-and-fellowship-2027': ('CineStory TV Fellowship',
        'The Fellow gets USD 3,000, a year’s mentoring and a free retreat', 'Needs a pilot script in English, with your name off it.'),
    'doc-edge-pitch': ('Doc Edge Pitch',
        'A pitch at Doc Edge 2027, with mentoring and two industry passes', 'Needs a teaser and images they can download.'),
    'eurodoc-annual-programme': ('EURODOC Annual Programme',
        'Three residential weeks in Europe and meetings with decision makers', 'Needs a feature doc behind you, a 15-page dossier and finance material.'),
    'ficci66-festival-films': ('FICCI 66 film competition',
        'Prizes from a pool of up to USD 100,000', 'Needs a 2026 film, unseen in Colombia, with English subtitles.'),
    'hot-docs-deal-maker': ('Hot Docs Deal Maker',
        'Three days of one-on-one meetings with matched decision makers', 'Needs a pitch deck and footage or visuals.'),
    'hot-docs-festival-films': ('Hot Docs Festival',
        'A festival screening, and a shot at jury and audience awards', 'Needs a documentary finished after 1 January 2026.'),
    'hot-docs-forum': ('Hot Docs Forum',
        'A pitch to a round table of international commissioners and funders', 'Needs an independent production company and footage.'),
    'le-groupe-ouest-selection-annuelle': ('Le Groupe Ouest Annual Selection',
        'Three writing residencies in Brittany, board and lodging covered', 'Needs working French, a 3-page synopsis and a 5-minute spoken video.'),
    'michael-collyer-memorial-fellowship-2027': ('Michael Collyer Fellowship',
        'USD 10,000 and a year of mentoring by a prominent screenwriter', 'Needs a finished feature script, hosted on the Black List.'),
    'screen-australia-narrative-content-production-december': ('Screen Australia Narrative Production',
        'Drama production funding, up to AUD 500,000 for Creative First features', 'Needs a full production package: rights, budget, finance and distribution.'),
    'screen-australia-x-actf-kids-ip-incubator': ('Screen Australia × ACTF Kids IP Incubator',
        'AUD 20,000 per team, mentoring and a Melbourne workshop', 'Needs a 3-minute pitch video, a writer on the team and the webinar watched.'),
    'sedona-screenplay-competition-2027': ('Sedona Screenplay Competition',
        'Category winners get a VIP pass, hotel nights and a table read', 'Needs a script in English.'),
    'series-mania-co-pro-pitching-sessions': ('Series Mania Co-Pro Pitching',
        'A pitch in Lille; the best project wins up to €50,000', 'Needs a production company and a 10-page English template.'),
    'series-mania-writers-campus': ('Series Mania Writers Campus',
        'Mentoring, a four-day workshop in Lille and a pitch at the Forum', 'Needs an English project dossier of up to 10 pages.'),
    'seriesfest-pilots-in-progress-season-13': ('SeriesFest Pilots in Progress',
        'Your pilot’s rough cut screened to an audience, for feedback', 'Needs a pilot rough cut, a series deck and a one-sheet.'),
    'seriesfest-pitch-a-thon-season-13': ('SeriesFest Pitch-A-Thon!',
        'A live five-minute pitch with panel feedback, after a pitch workshop', 'Needs a pilot script, a 3–5-minute pitch video and a deck.'),
    'sofia-meetings-features': ('Sofia Meetings, features',
        'A pitch to co-producers, sales agents and distributors', 'Needs a script or treatment, a finance plan and CVs.'),
    'sofia-meetings-tv-series': ('Sofia Meetings, TV series',
        'A pitch to co-producers, with industry awards', 'Needs a pitch, a pilot outline, a bible, a budget and finance.'),
    'sundance-graton-fellowship-2027': ('Sundance Graton Fellowship',
        '$25,000 each for two fellows, plus a year of support', 'Needs an application and your tribal affiliation documents.'),
    'sundance-sloan-episodic-science-grant-2027': ('Sundance Sloan Episodic Science Grant',
        'USD 17,000 and craft support for one series about science', 'Needs a finished pilot, short bios and two 250-word statements.'),
    'the-film-fund-fall-narrative-contest-2026': ('The Film Fund Fall Narrative Contest',
        'Up to $10,000 for a short, paid back against your costs', 'Needs one sentence: your idea and how you’d spend the money.'),
    'torinofilmlab-comedylab': ('TorinoFilmLab ComedyLab',
        'Three residential modules to develop a comedy feature', 'Needs a synopsis, a 5-page treatment, five scenes and a video.'),
    'torinofilmlab-green-narratives': ('TorinoFilmLab Green Narratives',
        'Three online modules of group script tutoring', 'Needs a 15–20-page treatment, a synopsis and a 2-minute video.'),
    'torinofilmlab-serieslab': ('TorinoFilmLab SeriesLab',
        'Six months, three residential workshops and an industry pitch', 'Needs a writer–producer team and a series dossier.'),
    'tribeca-at-and-t-untold-stories-2027': ('Tribeca AT&T Untold Stories',
        'USD 1.2m to make the winning feature', 'Needs a registered script, a $1.2m budget and 5 minutes of past work.'),
    'visions-du-reel-vdrpitching': ('Visions du Réel Pitching',
        'A pitch in Nyon, and a shot at a €20,000 award', 'Needs a feature doc in development, a budget and a finance plan.'),
}
FOR = {
    'canada-council-creating-knowing-and-sharing-short-term-projects': 'For First Nations, Inuit and Métis artists',
    'carole-dorothy-joyce-student-grant-2026': 'For students',
    'michael-collyer-memorial-fellowship-2027': 'For writers aged 18 to 25',
    'sundance-graton-fellowship-2027': 'For artists from California-based tribes',
    'tribeca-at-and-t-untold-stories-2027': 'For writers or directors from underrepresented communities',
}
NOTE = {
    'atx-tv-festival-pitch-competition-2027': 'Fee-waiver requests by 16 Nov. Entries close 14 Dec, or sooner if it fills.',
    'cinestory-tv-retreat-and-fellowship-2027': 'Only the Fellow goes free; invited finalists pay $2,800.',
    'hot-docs-deal-maker': 'If you’re picked, everyone pitching buys an industry pass.',
    'hot-docs-forum': 'If you’re picked, everyone pitching buys an industry pass.',
    'michael-collyer-memorial-fellowship-2027': 'Black List hosting is paid, unless you get a fee waiver.',
    'series-mania-writers-campus': 'Free to apply; €1,090 in tuition if you’re picked.',
    'sofia-meetings-features': 'Free to apply, by email.',
    'sofia-meetings-tv-series': 'Free to apply, by email.',
    'the-film-fund-fall-narrative-contest-2026': 'The amount depends on how many people enter.',
    'torinofilmlab-comedylab': '€3,000 if you’re picked.',
    'torinofilmlab-green-narratives': '€2,000 if you’re picked; some half-fee scholarships.',
    'torinofilmlab-serieslab': '€3,500 per team if you’re picked; some half-fee scholarships.',
    'visions-du-reel-vdrpitching': 'CHF 360 if you’re picked, and a trip to Nyon.',
}

WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
MON = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split()
STICKY = 'Start this week, not the night before.'
CTA = 'Comment Call Sheet and we will send you the link!'


def dm(x, year=False):
    return f'{x.day} {MON[x.month - 1]}' + (f' {x.year}' if year else '')


def weeks(days):
    """Lead time in weeks, rounded down to the half week, so we never overstate it."""
    h = days * 2 // 7
    return (f'{h // 2}' if h % 2 == 0 else (f'{h // 2}½' if h > 1 else '½')) + (' week' if h == 2 else ' weeks')


def cheaper(c, monday, eff):
    """The next fee step, if entering costs less before it: 'Cheaper by Sat 31 Oct.'"""
    steps = sorted(d(x['date']) for x in c['dates'] if x['role'] == 'application_fee_tier_cutoff' and x['date'])
    nxt = [x for x in steps if monday <= x < eff]
    return f'Cheaper by {nxt[0]:%a} {dm(nxt[0])}.' if nxt else None


def long_day(x):
    return f'{x:%A} {x.day} {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][x.month - 1]}'


def build(calls, explain=False):
    posts, skipped, history = [], [], {}
    for monday in WEEKS:
        same_week = []
        for key, (code, place, ground, rev) in REGIONS.items():
            pool = []
            for c in calls:
                why = check(c, monday, code)
                if why is None:
                    pool.append(c)
                elif explain and c['state'] not in ('closed_or_historical', 'legacy_snapshot') and (c['closes'] or '') >= monday.isoformat():
                    print(f'  - {monday} {key} {c["slug"]}: {why}')
            chosen = pick(pool, code, monday, history.get(key, {}), same_week)
            same_week += [c['slug'] for c in chosen]
            history.setdefault(key, {})[monday] = {c['slug'] for c in chosen}
            pid = f'week-{monday:%m%d}-{key}'
            if explain:
                print(f'{pid}: pool of {len(pool)} -> {[c["slug"] for c in chosen]}')
            if len(chosen) < 2:
                skipped.append((pid, len(pool)))
                continue
            rows = []
            for c in chosen:
                if c['slug'] not in COPY:
                    sys.exit(f'No copy written for {c["slug"]}: add it to COPY before posting.')
                name, get, needs = COPY[c['slug']]
                eff, step, _ = effective(c)
                opens = d(c['opens'])
                lead = (eff - monday).days
                note = NOTE.get(c['slug']) or (f'Opens {opens:%a} {dm(opens)}.' if opens and opens > monday else None)
                rows.append({'slug': c['slug'], 'name': name, 'get': get, 'needs': needs, 'for': FOR.get(c['slug']),
                             'note': note, 'fee': cheaper(c, monday, eff),
                             'date': eff.isoformat(), 'wd': f'{eff:%a}', 'lead': lead, 'weeks': weeks(lead),
                             'min': need(c)[0], 'why': need(c)[1], 'step': step, 'closes': c['closes'], 'kind': bucket(c)})
            count = WORDS[len(rows)].capitalize()
            sub = f'{count} funding opportunities open to filmmakers in {place}, with time to apply properly.'
            alt = (f'Still Time, the week of {dm(monday, True)}. Still time. {sub} '
                   + ' '.join(f'{i + 1}. {r["name"]}: {"first step due" if r["step"] else "closes"} {long_day(date.fromisoformat(r["date"]))}. '
                              f'{r["get"]}.{(" " + r["for"] + ".") if r["for"] else ""} {r["needs"]}{(" " + r["note"]) if r["note"] else ""}'
                              for i, r in enumerate(rows))
                   + f' The {WORDS[len(rows)]} are typed on a production call sheet taped to a {rev} page, soonest deadline circled'
                   + f' in red marker, with an empty “Ready?” box beside each. A sticky note on the sheet says: {STICKY} {CTA}')
            posts.append({'id': pid, 'week': monday.isoformat(), 'region': key, 'place': place, 'g': ground, 'rev': rev, 'count': count,
                          'sub': sub, 'rows': rows, 'alt': alt})
    return posts, skipped


JS = r"""// weekly: "Still Time", the weekly Call Sheet post for each key market (the US, the UK, Canada, Australia).
// GENERATED by social/posts/make_weekly.py from data/calls.json (as of 17 Oct 2026). Edit the script, not this file.
// The series image: a production call sheet for the week, printed with "Still time." as its title and
// taped down across the market's revision-colour page. The soonest deadline is circled in red marker, each
// row has an empty "Ready?" box, a sticky note says what to do about it, and the team's ask sits in the
// sheet's notes box. Same sheet every Monday; the colour says where.
{
  const WEEKLY = __DATA__

  document.head.insertAdjacentHTML('beforeend', `<style>
    .wk-stage { position: relative; display: flex; flex-direction: column; margin: 0 -13cqi 0 -3.4cqi; padding-bottom: var(--hang, 3.4cqi); }
    .wk-sheet { position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; background: var(--sheet); color: var(--ink); --pd-type-ink: var(--ink);
      padding: 0 15.6cqi var(--pb, 0) 5cqi; box-shadow: var(--lift); transform: rotate(var(--rot, -1.6deg)); transform-origin: 0 0; }
    .wk-under { position: absolute; inset: 0 0 var(--hang, 3.4cqi) 0; background: var(--sheet); transform: rotate(var(--rot2, .6deg)) translate(-.6cqi, 1.4cqi); transform-origin: 0 0; box-shadow: 0 1px 1px rgb(21 19 15 / .1), 0 1.6cqi 2.6cqi -1cqi rgb(21 19 15 / .32); }
    .wk-title { position: relative; padding: var(--tp, 5.4cqi) 0 1.8cqi; border-bottom: 3px solid var(--ink); }
    .wk-strip { display: flex; justify-content: space-between; align-items: baseline; gap: 2cqi; margin-top: 2cqi; }
    .wk-big { font-size: var(--big, 17cqi); line-height: .8; letter-spacing: -.05em; margin-left: -.05em; white-space: nowrap; }
    .wk-grid { display: grid; grid-template-columns: var(--dc, 15.4cqi) 1fr 5.4cqi; column-gap: 2.2cqi; }
    .wk-cols { padding: 1.1cqi 0 .9cqi; border-bottom: 1.5px solid var(--rule-strong); }
    .wk-cols > :last-child { justify-self: center; }
    .wk-row { padding: var(--rp, 1.7cqi) 0; border-bottom: 1.5px solid var(--rule); align-items: start; }
    .wk-row:last-child { border-bottom: 0; }
    .wk-due { display: grid; justify-items: start; gap: .2cqi; }
    .wk-due .wk-n { font-size: var(--dn, 8.6cqi); line-height: .86; }
    .wk-due .circ > svg.loop { left: -30%; top: -16%; width: 160%; height: 128%; }
    .wk-step { display: inline-block; margin-top: .5cqi; padding: .35em .5em .25em; background: #f8dad0; color: #9e2f1a; --pd-type-ink: #9e2f1a; }
    .wk-what > * + * { margin-top: .35cqi; }
    .wk-what .wk-k { color: var(--marker-text); }
    .wk-for { display: inline-block; padding: .4em .6em .3em; background: #f4e5bd; color: #6b5214; --pd-type-ink: #6b5214; }
    .wk-note { color: var(--toner); --pd-type-ink: var(--toner); }
    .wk-box { justify-self: center; width: 5cqi; height: 5cqi; margin-top: .4cqi; border: .45cqi solid rgb(21 19 15 / .5); border-radius: .5cqi; }
    .wk-notes { margin-top: auto; border-top: 3px solid var(--ink); padding: 1.4cqi 0 var(--np, 3.2cqi); position: relative; }
    .wk-notes .circ > svg.loop { left: -6%; top: -16%; width: 112%; height: 136%; }
    .wk-sticky { position: absolute; z-index: 4; right: var(--sr, -1cqi); bottom: var(--sb, -3cqi); width: var(--sw, 30cqi); padding: 2.4cqi 2.6cqi 3.2cqi; background: var(--stk, #f4df77);
      transform: rotate(var(--srot, 4deg)); box-shadow: 0 1px 1px rgb(21 19 15 / .14), 0 1.6cqi 2.2cqi -1cqi rgb(21 19 15 / .45); }
    .wk-sticky::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2.4cqi; background: rgb(21 19 15 / .045); }
    .wk-ul { position: relative; }
    .wk-ul > svg { position: absolute; left: -4%; bottom: -.2em; width: 108%; height: .42em; overflow: visible; }
    .wk-ul path { fill: none; stroke: var(--marker); stroke-width: 3.2; stroke-linecap: round; }
    .wk-ring { position: absolute; z-index: 1; width: 23cqi; height: 23cqi; overflow: visible; pointer-events: none; }
    .wk-ring circle { fill: none; stroke: rgb(120 82 40 / .16); }
  </style>`)

  const day = (iso) => new Date(iso + 'T12:00:00Z')
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dm = (iso) => { const d = day(iso); return `${d.getUTCDate()} ${MON3[d.getUTCMonth()]}` }
  const STICKY = { us: '#f4df77', uk: '#f4df77', ca: '#f4df77', au: '#f3b5c8' }
  const ul = `<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6 C 24 3, 52 8, 74 4 S 94 5, 98 3"/></svg>`
  const ring = (style) => `<svg class="wk-ring" viewBox="0 0 100 100" style="${style}" aria-hidden="true"><circle cx="50" cy="50" r="40" stroke-width="4.5"/><circle cx="51" cy="49" r="43" stroke-width="1.1" stroke-dasharray="40 9 70 14 30 6"/></svg>`

  function row (r, i, o) {
    const d = day(r.date), n = sp('headline', String(d.getUTCDate()), 'class="wk-n"')
    // A row whose date is a first step always says what the step is and when entries close.
    const note = [o.notes || r.step ? r.note : null, o.fees ? r.fee : null].filter(Boolean).join(' ')
    return `<div class="wk-grid wk-row"><div class="wk-due">${i === 0 ? circ(n, 'round') : n}${sp('metadata', `${MON3[d.getUTCMonth()]} · ${r.wd}`, 'class="soft"')}${r.step ? sp('metadata', 'First step', 'class="wk-step"') : o.weeks ? sp('metadata', r.weeks, 'class="soft"') : ''}</div>
      <div class="wk-what">${S('label', r.name)}${r.for ? `<div>${sp('metadata', r.for, 'class="wk-for"')}</div>` : ''}${S('body', r.get)}
        ${o.needs ? S('body', r.needs.replace(/^Needs /, '<span class="wk-k">Needs</span> '), 'class="soft"') : ''}
        ${note ? S('metadata', note, 'class="wk-note"') : ''}</div>
      <span class="wk-box"></span></div>`
  }

  const sheet = (p, o) => `<div class="wk-under"></div><div class="wk-sheet">
      <div class="wk-title">${S('display', 'Still time.', 'class="wk-big"')}<div class="wk-strip">${S('subhead', `For filmmakers in ${p.place}.`)}${sp('metadata', `Week of ${dm(p.week)}`, 'class="soft" style="white-space:nowrap"')}</div>${ring(o.ring)}</div>
      <div class="wk-grid wk-cols">${sp('metadata', 'Due', 'class="soft"')}${sp('metadata', 'Opportunity', 'class="soft"')}${sp('metadata', 'Ready?', 'class="soft"')}</div>
      <div><div class="wk-rows" data-z="${o.z}" style="zoom:${o.z}">${p.rows.map((r, i) => row(r, i, o)).join('')}</div></div>
      <div class="wk-notes">${sp('metadata', 'Notes', 'class="soft"')}${S('subhead', `Comment ${circ('Call&nbsp;Sheet', 'long')} and we will send you the link!`, `style="margin-top:.8cqi;max-inline-size:${o.cw}"`)}
        <div class="wk-sticky" style="--stk:${STICKY[p.region]};${o.sticky}">${S(o.sr, `Start <span class="wk-ul">this week${ul}</span>, not the night before.`)}</div></div>
      </div>
      ${tape('left:3cqi;top:-1.6cqi;transform:rotate(-8deg)')}${tape('right:5cqi;top:-1.2cqi;transform:rotate(5deg);width:11cqi')}`

  // Safety net: if a week's rows run long, shrink the rows (never the title or the ask) until the sheet
  // fits its page, and no further than 72%. Runs again once the fonts are in.
  const fit = () => document.querySelectorAll('.wk-sheet').forEach(sh => {
    const rows = sh.querySelector('.wk-rows'); let z = +rows.dataset.z; rows.style.zoom = z
    const cs = getComputedStyle(sh), room = sh.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    const used = () => [...sh.children].reduce((h, el) => h + el.offsetHeight, 0)   // in-flow blocks only; the sticky may hang off
    while (used() > room + 1 && z > .72) { z -= .01; rows.style.zoom = z }
  })
  addEventListener('load', fit); document.fonts.ready.then(() => setTimeout(fit, 0))

  const LAYOUT = {
    portrait: { big: '17.6cqi', z: .9, needs: false, notes: false, fees: false, weeks: true, cw: '11em', sr: 'subhead', ring: 'right:-6cqi;top:-3cqi', sticky: '--sw:36cqi;--sb:-5.4cqi' },
    square: { big: '15cqi', z: .82, needs: false, notes: false, fees: false, weeks: false, cw: '11em', sr: 'subhead', ring: 'right:-6cqi;top:-5cqi', sticky: '--sw:34cqi;--sb:-4.4cqi', tp: '4cqi' },
    story: { big: '19cqi', z: .94, needs: true, notes: true, fees: false, weeks: true, cw: '11em', sr: 'subhead', ring: 'right:-5cqi;top:-2cqi', sticky: '--sw:36cqi;--sb:-1cqi' },
  }

  for (const p of WEEKLY) {
    P(p.id, { name: `Still Time · ${p.region.toUpperCase()} · week of ${dm(p.week)}`, g: p.g, sizes: ['1080x1350', '1080x1080', '1080x1920'], alt: p.alt,
      render (sz, c) {
        const o = LAYOUT[c]
        // On the story the sheet runs off the bottom of the screen; its words stop above the 320px the app covers.
        const story = c === 'story' ? ';margin-bottom:calc(-320px - 6cqb);--hang:0px;--pb:calc(320px + 6cqb + 4.6cqi)' : `;margin-bottom:${c === 'square' ? 1.4 : 2}cqb`
        return { frame: `<div class="grow wk-stage" style="--big:${o.big}${o.tp ? `;--tp:${o.tp}` : ''}${story}">${sheet(p, o)}</div>${foot()}`, art: '' }
      } })
  }
}
"""


def main():
    explain = '--explain' in sys.argv
    calls = json.load(open(DATA))['calls']
    posts, skipped = build(calls, explain)
    if '--dry' not in sys.argv:
        OUT.write_text(JS.replace('__DATA__', json.dumps(posts, ensure_ascii=False, indent=1)))
        print(f'wrote {OUT.relative_to(ROOT)}: {len(posts)} posts')
    for pid, n in skipped:
        print(f'SKIPPED {pid}: only {n} qualified')
    print('\n| Week | Market | Opportunity | Effective deadline | Lead | Minimum |\n|---|---|---|---|---|---|')
    for p in posts:
        for r in p['rows']:
            step = f" ({r['step']})" if r['step'] else ''
            print(f"| {p['week']} | {p['region'].upper()} | {r['name']} | {r['date']}{step} | {r['lead']} d | {r['min']} d, {r['why']} |")


if __name__ == '__main__':
    main()

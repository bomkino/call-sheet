#!/usr/bin/env python3
"""Checks for Call Sheet's public data and built pages.

    python3 -m unittest discover -s tools -p 'test*.py'

Runs against data/ in this repository and a fresh build in a temporary folder,
so it needs no network and no private foundation checkout.
"""
from __future__ import annotations

import html.parser
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
REPO = TOOLS.parent
sys.path.insert(0, str(TOOLS))
import build_site  # noqa: E402

CALLS = json.loads((REPO / "data/calls.json").read_text(encoding="utf-8"))["calls"]
OVERLAY = json.loads((REPO / "data/overlay.json").read_text(encoding="utf-8"))


class Links(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[str] = []
        self.ids: list[str] = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src"):
            if attrs.get(key):
                self.refs.append(attrs[key])
        if attrs.get("id"):
            self.ids.append(attrs["id"])


class DataTests(unittest.TestCase):
    def test_every_route_is_reviewed_and_valid(self):
        regions = set(OVERLAY["regions"])
        kinds = set(build_site.KIND_LABELS)
        for entry in OVERLAY["entries"]:
            where = entry["where"]
            self.assertIn(where["scope"], {"worldwide", "listed", "unclear"}, entry["id"])
            self.assertTrue(set(where["regions"]) <= regions, entry["id"])
            self.assertTrue(set(entry["kinds"]) <= kinds and entry["kinds"], entry["id"])
            self.assertLessEqual(len(entry["who_line"]), 90, entry["id"])
            self.assertLessEqual(len(entry["get_line"]), 100, entry["id"])
            for code in where["countries"] + where["excludes"]:
                self.assertIn(code, build_site.COUNTRY_NAMES, entry["id"])

    def test_slugs_unique_and_url_safe(self):
        slugs = [c["slug"] for c in CALLS]
        self.assertEqual(len(slugs), len(set(slugs)))
        self.assertTrue(all(re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", s) for s in slugs))

    def test_twins_are_merged(self):
        merged = {m for c in CALLS for m in c.get("merged_ids", [])}
        ids = {c["id"] for c in CALLS}
        self.assertTrue(merged)
        self.assertFalse(merged & ids)

    def test_unknown_never_reads_free(self):
        for call in CALLS:
            fee = call["fee"]
            if fee["summary"] == "Free to enter":
                # Optional add-ons (feedback, fiscal sponsorship) aren't the price of entering.
                application = [i for i in fee["items"] if i["stage"] == "application" and i["state"] != "optional"]
                self.assertTrue(application, call["id"])
                self.assertTrue(all(i["state"] == "free_or_explicit_zero" for i in application), call["id"])
            for item in fee["items"]:
                if item["state"] == "unknown_or_conditional":
                    self.assertNotEqual(item["amount"], "$0", call["id"])

    def test_dates_are_typed_and_windows_follow_them(self):
        import export_public_data
        roles = set(export_public_data.ROLE_LABELS)
        for call in CALLS:
            for d in call["dates"]:
                self.assertIn(d["role"], roles, call["id"])
                self.assertRegex(d["date"], r"^\d{4}-\d{2}-\d{2}$")
            if call["closes"]:
                self.assertIn(call["closes"], {d["date"] for d in call["dates"] if d["role"] in ("application_submission_deadline", "application_fee_tier_cutoff")}, call["id"])

    def test_cut_off_times_are_clean(self):
        from zoneinfo import ZoneInfo
        for call in CALLS:
            for d in call["dates"]:
                if d["time"]:
                    self.assertRegex(d["time"], r"^([01]\d|2[0-3]):[0-5]\d$", call["id"])
                if d["timezone"]:
                    ZoneInfo(d["timezone"])  # raises for anything that isn't an IANA zone

    def test_one_zone_countries_are_one_zone(self):
        from zoneinfo import ZoneInfo
        for country, (zone, place) in build_site.ONE_ZONE_COUNTRIES.items():
            ZoneInfo(zone)
            self.assertTrue(place, country)
        # Several clocks, so no "end of the day there" to estimate from.
        for country in ("US", "United States", "Canada", "Australia", "Brazil", "Mexico", "Russia", "Indonesia", "European Union"):
            self.assertNotIn(country, build_site.ONE_ZONE_COUNTRIES)

    def test_time_guesses_never_invent_a_cut_off(self):
        guess = build_site.time_guess
        self.assertEqual(guess({"organiser_country": "France"}, {"time": None, "timezone": None}), ("end", "Europe/Paris", "France"))
        self.assertEqual(guess({"organiser_country": "United Kingdom"}, {}), ("end", "Europe/London", "the UK"))
        self.assertEqual(guess({"organiser_country": "New Zealand"}, {"time": "13:00", "timezone": None}), ("zone", "Pacific/Auckland", "New Zealand"))
        for country in ("US", "Canada", "Australia", "Mexico", None, "Jersey / UK"):
            self.assertEqual(guess({"organiser_country": country}, {}), ("end", "", ""), country)
        # A zone the organiser gave beats the country's; a full cut-off or office hours need no guess.
        self.assertEqual(guess({"organiser_country": None}, {"timezone": "Europe/Paris"}), ("end", "Europe/Paris", "Central European Time"))
        self.assertEqual(guess({"organiser_country": "France"}, {"timezone": "Europe/Paris"}), ("end", "Europe/Paris", "France"))
        self.assertEqual(guess({"organiser_country": "France"}, {"time": "16:00", "timezone": "Europe/Paris"}), ("", "", ""))
        self.assertEqual(guess({"organiser_country": "France"}, {"timezone": "Europe/Paris", "time_note": "09:00–17:00"}), ("", "", ""))

    def test_identity_lines_keep_their_capitals(self):
        # First words that are proper nouns, so "Only for" keeps the capital.  A new capitalised
        # first word belongs here or in build_site.PLAIN_STARTS.
        proper = {"African", "Australian", "First", "Indigenous"}
        for call in CALLS:
            identity = call["where"].get("identity")
            if not identity:
                continue
            first = identity.split(" ", 1)[0]
            self.assertTrue(first[0].islower() or first in proper or first.lower() in build_site.PLAIN_STARTS, (call["id"], identity))
            if first in proper:
                self.assertEqual(build_site.mid_sentence(identity), identity, call["id"])
        self.assertEqual(build_site.mid_sentence("Women and nonbinary writers"), "women and nonbinary writers")
        for kept in ("LGBTQ+ stories", "US residents", "First Nations, Inuit and Métis", "Indigenous women", "African directors"):
            self.assertEqual(build_site.mid_sentence(kept), kept)

    def test_every_call_links_somewhere_official(self):
        for call in CALLS:
            self.assertTrue(call["official_url"] and call["official_url"].startswith("https://"), call["id"])


class BuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix="call-sheet-build-")
        cls.out = Path(cls.tmp.name) / "call-sheet"
        build_site.main(["--out", str(cls.out)])
        cls.pages = sorted(cls.out.rglob("index.html"))

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_one_page_per_call_plus_the_list(self):
        self.assertEqual(len(self.pages), len(CALLS) + len(build_site.TOPICS) + 1)

    def test_topic_pages_list_what_they_say(self):
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        sitemap = (self.out / "sitemap.xml").read_text(encoding="utf-8")
        for topic in build_site.TOPICS:
            source = (self.out / topic["slug"] / "index.html").read_text(encoding="utf-8")
            members = build_site.topic_members(topic, CALLS, as_of)
            rows = re.findall(r'<li class="cs-call"[^>]*data-slug="([^"]+)"', source)
            self.assertEqual(rows, [c["slug"] for c in members], topic["slug"])
            self.assertIn(f"{len(members)} calls that haven’t closed", source, topic["slug"])
            ld = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', source).group(1))
            self.assertEqual(ld["@graph"][1]["numberOfItems"], len(members), topic["slug"])
            self.assertEqual(f"/call-sheet/{topic['slug']}/<" in sitemap, len(members) >= 5, topic["slug"])

    def test_regions_match_the_finder(self):
        script = (REPO / "site/call-sheet.js").read_text(encoding="utf-8")
        block = re.search(r"const REGIONS = \{(.*?)\n\}", script, re.S).group(1)
        regions = dict(re.findall(r"(\w+): '([^']*)'", block))
        self.assertEqual(regions, build_site.REGION_CODES)

    def test_internal_links_resolve(self):
        for page in self.pages:
            parser = Links()
            parser.feed(page.read_text(encoding="utf-8"))
            for ref in parser.refs:
                if not ref.startswith("/call-sheet/"):
                    continue
                path = ref.split("#")[0].split("?")[0][len("/call-sheet/"):]
                target = self.out / path
                if path == "" or path.endswith("/"):
                    target = target / "index.html"
                self.assertTrue(target.exists(), (page, ref))
            self.assertEqual(len(parser.ids), len(set(parser.ids)), page)

    def test_no_placeholder_text(self):
        for page in self.pages:
            text = re.sub(r"<script.*?</script>", "", page.read_text(encoding="utf-8"), flags=re.S)
            visible = re.sub(r"<[^>]+>", " ", text)
            for bad in (" None ", ">None<", " null ", "undefined", "nan "):
                self.assertNotIn(bad, visible, (page, bad))

    def test_pages_carry_the_site_shell(self):
        for page in (self.out / "index.html", self.pages[0]):
            source = page.read_text(encoding="utf-8")
            for needle in ('class="pd-nav-more"', 'href="/call-sheet/" aria-current="page"', "pitchdog-system-v13.1.1.min.css", 'data-analytics-replay="off"', '<link rel="canonical"', "<h1"):
                self.assertIn(needle, source, (page, needle))

    def test_rows_carry_every_round(self):
        source = (self.out / "index.html").read_text(encoding="utf-8")
        for call in CALLS:
            row = re.search(r'<li class="cs-call"[^>]*data-slug="%s"[^>]*>' % re.escape(call["slug"]), source).group(0)
            rounds = re.search(r'data-rounds="([^"]*)"', row).group(1).split()
            if call["closes"]:
                self.assertIn(call["closes"], rounds, call["id"])
            self.assertEqual(rounds, sorted(rounds), call["id"])

    def test_rows_carry_the_cut_off_time_and_zone(self):
        source = (self.out / "index.html").read_text(encoding="utf-8")
        timed = 0
        for call in CALLS:
            row = re.search(r'<li class="cs-call"[^>]*data-slug="%s"[^>]*>' % re.escape(call["slug"]), source).group(0)
            deadline = build_site.deadline_on(call, call["closes"])
            self.assertIn(f'data-time="{deadline.get("time") or ""}"', row, call["id"])
            self.assertIn(f'data-tz="{deadline.get("timezone") or ""}"', row, call["id"])
            timed += bool(deadline.get("time") and deadline.get("timezone"))
        self.assertTrue(timed)

    def test_estimates_only_where_the_organiser_has_one_clock(self):
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        seen = {"end": 0, "none": 0}
        for call in CALLS:
            source = (self.out / call["slug"] / "index.html").read_text(encoding="utf-8")
            untimed, zone, place = re.search(r'data-untimed="([^"]*)" data-guess-tz="([^"]*)" data-guess-place="([^"]*)"', source).groups()
            deadline = build_site.deadline_on(call, call["closes"])
            if not call["closes"] or build_site.closed_at(call, as_of) or (deadline.get("time") and deadline.get("timezone")):
                self.assertEqual((untimed, zone), ("", ""), call["id"])
                continue
            if zone:
                self.assertTrue(place, call["id"])
                self.assertTrue(deadline.get("timezone") == zone or build_site.ONE_ZONE_COUNTRIES[call["organiser_country"]][0] == zone, call["id"])
                seen["end"] += untimed == "end"
            elif untimed:
                self.assertNotIn(call.get("organiser_country"), build_site.ONE_ZONE_COUNTRIES, call["id"])
                seen["none"] += 1
        self.assertTrue(seen["end"] and seen["none"], seen)

    def test_local_times_need_the_script(self):
        pages = [self.out / "index.html"] + [self.out / t["slug"] / "index.html" for t in build_site.TOPICS]
        for page in pages:
            source = page.read_text(encoding="utf-8")
            self.assertEqual(len(re.findall(r'<div class="cs-zone" data-zone-picker data-requires-js>', source)), 1, page)
            visible = re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", "", source, flags=re.S))
            for words in ("your time", "No time given"):
                self.assertNotIn(words, visible, page)

    def test_counts_close_at_the_exact_cut_off(self):
        # A last round with a time and zone carries its UTC instant, so a visitor ahead of the
        # organiser (Sydney, say) still counts it until the cut-off; date-only rounds stay dates.
        import datetime as dt
        from zoneinfo import ZoneInfo
        source = (self.out / "index.html").read_text(encoding="utf-8")
        ends = [e for m in re.findall(r'data-ends="([^"]*)"', source) for e in m.split()]
        timed = [e for e in ends if "@" in e]
        self.assertTrue(timed and len(timed) < len(ends))
        for end in ends:
            self.assertRegex(end, r"^\d{4}-\d{2}-\d{2}(@\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z)?$")
        c21 = {"dates": [{"date": "2026-10-19", "role": "application_submission_deadline", "time": "23:59", "timezone": "Etc/GMT"}]}
        self.assertEqual(build_site.end_mark(c21), "2026-10-19@2026-10-19T23:59Z")
        denver = {"dates": [{"date": "2026-11-03", "role": "application_submission_deadline", "time": "16:30", "timezone": "America/Denver"}]}
        self.assertEqual(build_site.end_mark(denver), "2026-11-03@2026-11-03T23:30Z")
        self.assertEqual(build_site.end_mark({"dates": [{"date": "2026-11-09", "role": "application_submission_deadline", "time": "13:00", "timezone": None}]}), "2026-11-09")
        for call in CALLS:
            if build_site.rounds(call) and "@" in build_site.end_mark(call):
                last = build_site.rounds(call)[-1]
                d = build_site.deadline_on(call, last)
                want = dt.datetime.fromisoformat(f"{last}T{d['time']}").replace(tzinfo=ZoneInfo(d["timezone"])).astimezone(dt.timezone.utc)
                self.assertEqual(build_site.end_mark(call).split("@")[1], want.strftime("%Y-%m-%dT%H:%MZ"), call["id"])

    def test_zone_names_match_the_script(self):
        script = (REPO / "site/call-sheet.js").read_text(encoding="utf-8")
        block = re.search(r"const ZONES = \{(.*?)\n\}", script, re.S).group(1)
        self.assertEqual(dict(re.findall(r"'([^']+)': '([^']+)'", block)), build_site.FRIENDLY_ZONES)

    def test_closed_calls_are_not_indexed(self):
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        sitemap = (self.out / "sitemap.xml").read_text(encoding="utf-8")
        for call in CALLS:
            source = (self.out / call["slug"] / "index.html").read_text(encoding="utf-8")
            closed = build_site.closed_at(call, as_of)
            self.assertEqual('content="noindex, follow"' in source, closed, call["id"])
            self.assertEqual(f"/call-sheet/{call['slug']}/<" in sitemap, not closed, call["id"])
            if closed:
                self.assertNotIn("data-ics", source.split('<div class="cs-sheetbar"')[0], call["id"])

    def test_shared_assets_resolve(self):
        for page in (self.out / "index.html", self.pages[0], self.out / "404.html"):
            source = page.read_text(encoding="utf-8")
            for ref in re.findall(r'content="https://pitch\.dog(/call-sheet/assets/[^"]+)"', source) + re.findall(r'(?:href|src)="(/call-sheet/assets/[^"]+)"', source):
                self.assertTrue((self.out / ref[len("/call-sheet/"):]).is_file(), (page, ref))

    def test_identity_lines_read_right_on_the_page(self):
        import html
        source = (self.out / "index.html").read_text(encoding="utf-8")
        for call in CALLS:
            identity = call["where"].get("identity")
            if identity:
                self.assertIn(f"Only for {html.escape(build_site.mid_sentence(identity), quote=True)}</p>", source, call["id"])
        for broken in ("Only for australian", "Only for first Nations", "Only for indigenous", "Only for african", "Only for comedy scripts only"):
            self.assertNotIn(broken, source)

    def test_call_descriptions_keep_who_as_written(self):
        import html
        for call in CALLS:
            source = (self.out / call["slug"] / "index.html").read_text(encoding="utf-8")
            description = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', source).group(1))
            self.assertLessEqual(len(description), 158, call["id"])
            if "Who can apply: " in description:
                tail = description.split("Who can apply: ", 1)[1].removesuffix("…")
                self.assertTrue((call["who"] + ".").startswith(tail), (call["id"], description))

    def test_titles_and_descriptions_fit_search_results(self):
        import html
        for page in [self.out / "index.html"] + [self.out / t["slug"] / "index.html" for t in build_site.TOPICS]:
            source = page.read_text(encoding="utf-8")
            title = html.unescape(re.search(r"<title>(.*?)</title>", source).group(1))
            self.assertLessEqual(len(title), 60, (page, title))
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        for topic in build_site.TOPICS:
            source = (self.out / topic["slug"] / "index.html").read_text(encoding="utf-8")
            description = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', source).group(1))
            self.assertFalse(description.endswith("…"), (topic["slug"], description))
            self.assertTrue(description.startswith(f"{len(build_site.topic_members(topic, CALLS, as_of))} "), topic["slug"])

    def test_pitch_copy_claims_only_what_the_data_shows(self):
        source = (self.out / "index.html").read_text(encoding="utf-8")
        for claim in ("Most ask for a pitch deck", "Most of these calls ask"):
            self.assertNotIn(claim, source)
        self.assertIn("Applying to one? If it asks for a deck, a treatment or a pitch, we make those.", source)
        self.assertIn("Some of these calls ask for a deck, a treatment or a pitch.", source)
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        self.assertTrue(any(build_site.asks_for(c) for c in CALLS if not build_site.closed_at(c, as_of)))

    def test_free_board_counts_the_free_list(self):
        source = (self.out / "index.html").read_text(encoding="utf-8")
        board = re.search(r'data-board="free">(\d+)<', source).group(1)
        chip = re.search(r'href="/call-sheet/free-to-enter/"><span[^>]*>Free to enter</span><span class="cs-lists-n"[^>]*>(\d+)<', source).group(1)
        self.assertEqual(board, chip)

    def test_list_counts_carry_closing_dates(self):
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        source = (self.out / "index.html").read_text(encoding="utf-8")
        for topic in build_site.TOPICS:
            members = build_site.topic_members(topic, CALLS, as_of)
            ends, n = re.search(r'href="/call-sheet/%s/"><span[^>]*>[^<]*</span><span class="cs-lists-n"[^>]*data-ends="([^"]*)">(\d+)<' % topic["slug"], source).groups()
            self.assertEqual(int(n), len(members), topic["slug"])
            self.assertEqual([e.split("@")[0] for e in ends.split()], [build_site.rounds(c)[-1] for c in members if build_site.rounds(c)], topic["slug"])
            self.assertEqual(ends.split(), [build_site.end_mark(c) for c in members if build_site.rounds(c)], topic["slug"])

    def test_edition_window_names_later_calls(self):
        as_of = json.loads((self.out / "BUILD.json").read_text(encoding="utf-8"))["data_as_of"]
        edition = json.loads((REPO / "data/edition.json").read_text(encoding="utf-8"))
        later = [c for c in CALLS if c["closes"] and c["closes"][:7] > edition["covers"]["to"] and not build_site.closed_at(c, as_of)]
        source = (self.out / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("This edition covers calls closing", source)
        self.assertIn("This edition is built around calls closing", source)
        if later:
            self.assertEqual(source.count(f"plus {len(later)} later"), 2)

    def test_no_python_reprs_in_data(self):
        for call in CALLS:
            for item in call["bring"]:
                self.assertNotRegex(item["item"], r"^\s*\[['\"]", call["id"])


if __name__ == "__main__":
    unittest.main()

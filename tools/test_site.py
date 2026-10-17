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
                application = [i for i in fee["items"] if i["stage"] == "application"]
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
        self.assertEqual(len(self.pages), len(CALLS) + 1)

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

    def test_closed_calls_are_not_indexed(self):
        for call in CALLS:
            source = (self.out / call["slug"] / "index.html").read_text(encoding="utf-8")
            noindex = 'content="noindex, follow"' in source
            self.assertEqual(noindex, call["state"] == "closed_or_historical", call["id"])


if __name__ == "__main__":
    unittest.main()

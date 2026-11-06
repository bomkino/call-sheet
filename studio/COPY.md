# Words and truth

Call Sheet's whole promise is that it's accurate, so every word on screen has to be true on the day it's posted.

## Voice

Plain, warm, specific and a little funny. Write like a filmmaker telling a friend about something that would have saved them a bad week, not like an ad.

- **Say what it is, who it's for and what to do next.** One idea per frame.
- **Lead with the pain** people actually have:
  - "Found the perfect opportunity the day after it closed?";
  - the rule that rules you out on page 9;
  - whose 16:00?;
  - "not published" isn't free.
- **Don't write AI prose.** Cut "unlock", "seamless", "game-changer", "dive in" and "elevate", rule-of-three lists for rhythm, and every line ending on the same two-beat turn. If it could be about any product, rewrite it.
- **Never use he or she for Manali**, who presents the Reels: use they/them.
- **Use the house voice.** The `pitchdog-writing` skill holds pitch.dog's voice. Use it for any copy longer than a label.

## Words we use

- **Opportunities, never "calls".** Listings are opportunities: grants, labs, fellowships, festivals, pitch forums, markets. "Call Sheet" is the product's name and stays.
- **The line:** **Find film and TV grants, labs and festivals before they close.** Use it word for word on end cards.
- **The shortlist:** "My shortlist", not "saved calls".
- **Fees:** "Not published", never "free", when the organiser hasn't published a fee. Free means the official page says free.
- **Dates:** "Closes 30 Nov" for dates. Add a time with its city when one is given: "4pm Paris", "11:59pm Pacific".

## Calls to action

| Where | What it says |
| --- | --- |
| Instagram, TikTok, Facebook, Threads, LinkedIn posts and Reels | **"Comment Call Sheet and we will send you the link!"** No web address in the post, the caption or on screen |
| YouTube, long-form films, the end card of the explainer | `pitch.dog/call-sheet` on screen is fine, and the description can link it |
| pitch.dog's own offer | "Applying for one? We make the decks that go with it. The list stays free either way." Book a call goes to `cal.com/pitch.dog/wood` |

## Truth

1. **Where facts come from.** Every name, amount, date, closing time, fee, eligibility rule and "what to send" comes from `../data/calls.json`. When a script and the data disagree, the data wins: fix the script and note it.
2. **Counts.** Read counts from the data at build time, with the date they were true: listed, live, limited to certain countries, no published fee, websites. Never hard-code a number you didn't just compute. Say how many, never "every grant in the world". "180+" is fine while there are 186.
3. **Leave time to apply.** Only name an opportunity if the gap between the posting day and its deadline is at least the minimum below (`social/posts/make_weekly.py` has the rule). Aim for three days more than the minimum.

   | The opportunity | Minimum days to its deadline |
   | --- | --- |
   | Festival or script contest | 14 |
   | Lab or fellowship, or anything wanting written or video material | 21 |
   | Anything wanting a budget or a company | 35 |
   | Major public funds | 42 |
4. **Who can apply, exactly.** "In the US" isn't the same as "US citizens and permanent residents" or "legal residents of the 50 states or DC". When there's room, show the exact rule.
5. **Check before posting.** Check every dated piece against the opportunity's official page on the day it's posted. Pieces with a date in them go stale, so record a "post by" date for each.
6. **Illustrations.** These must look like illustrations: greyed lines with one plain sentence, or a joke card like "The perfect fund". Never imitate a real organiser's document or branding.
7. **Time zones.** Convert with IANA zones and say whose time it is. The pain is "whose 16:00?", so never leave a time ambiguous.

## Audience

Independent filmmakers and TV makers, mainly in the US, UK, Canada and Australia. When choosing examples, prefer opportunities those viewers can actually apply to, and say when one is open worldwide.

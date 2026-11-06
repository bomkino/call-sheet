# Start here (for the team)

How to make Call Sheet videos with Claude in the cloud.

## Once

1. **Merge the studio into `main`** (the pull request that adds `studio/`), so every new session finds it.
2. **Use the environment `call-sheet-studio`.** It already exists in your Claude environments, with `bomkino/call-sheet`, `bomkino/pitchdog-type-system` and `bomkino/pitchdog-cloudflare-sites` attached. Its setup script runs `studio/setup.sh`, so each session starts with both Remotion projects, Chrome, the Python tools and the scores ready, in about a minute.
3. **Network.** It has full, unrestricted web access, so a session can open organisers' official pages, the live site and any tool it needs. If a session needs an API key (a voice or music service, say), it will ask for it through a secure form; never paste keys into the chat.

## Every time

Start a session on `call-sheet-studio` and ask for what you want in plain words. The `call-sheet-video` skill and `studio/CLAUDE.md` load the house look, the copy rules and the formats. `PROMPTS.md` has ready-made prompts, and `IDEAS.md` has a menu of what to make.

Good asks name:
- where it runs and the frames (9:16, 4:5, 16:9);
- the length;
- the one thing it says;
- the opportunity, if it's about one;
- the posting date, so the facts and lead times can be checked.

Ask to see three stills first when it's a new kind of piece.

## Keep it getting better

- **Feedback goes in the log.** When you love or hate something, say so in the session. Claude adds it to `LOG.md`, and every later session reads it.
- **Each month,** after the data update:
  - re-render the stings in the new edition colour;
  - make that month's edition film;
  - recheck any dated videos ("The data has been updated. Recheck every dated insert…" in `PROMPTS.md`).
- **When the starter kit improves** (`bomkino/remotion-starter-kit`), ask a session to port the improvement into `studio/`.

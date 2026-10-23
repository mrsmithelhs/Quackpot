# Quackpot — Design Document

**Status:** first draft, 2026-10-23. Working title. Numbers are first guesses and must be checked by
simulation before they are trusted — see [Tuning](#tuning).

## What it is

A small browser gacha game about collecting rubber ducks, wrapped in a satirical **life metagame**:
the player has a job, rent, and food to pay for, and the game keeps finding reasons for them to
spend. At the end, **the game confesses** — a receipt shows what the player spent, what the real
odds were, and which manipulation techniques were used on them, and when.

**Audience and use:** high school Video Game Design students. Played for about five minutes in class,
then discussed. The goal is critical analysis of microtransaction-based games as a subject worthy of
serious attention in the games industry — not a lecture about it, but an experience of it followed
by an honest accounting.

**Design thesis:** *The game manipulates you, then shows you exactly how.* The Receipt is the point;
the game only has to be compelling enough to make the Receipt land.

## Hard constraints

These are not tuning choices. Any change to them is an owner decision.

1. **No real money,** no payment links, no real currency conversion beyond the fictional prices shown.
2. **No accounts, no tracking, no analytics, no network calls.** Save data lives in the browser only.
3. **No student data.** Nothing is collected, submitted, or stored outside the player's own browser.
4. **The game ends.** A session is about 15 in-game days, roughly five minutes. It must never be
   designed to keep a student playing past the lesson.
5. **Uninstall is always visible,** and it is the best ending.
6. **No real companies, games, people, or brands.** The publisher, products, and streamers are
   fictional.
7. **Static site only** — plain HTML, CSS, and JavaScript served from GitHub Pages. No build step
   unless a later decision adds one.

## The five-minute experience

1. **Day 1.** You get a free welcome pull and a gift of gems. You pull a duck. It's cute.
2. **The Pond Race.** Each in-game day ends with a race. Faster ducks place higher and win gems.
3. **The hook.** Gems buy pulls, pulls buy faster ducks, faster ducks win more gems. Then a new
   banner arrives with ducks that are faster than yours.
4. **The squeeze.** Gems run short. You have dollars from your job. Bundles are right there.
5. **The life.** Rent is due Friday. Lunch costs money. A limited banner ends in 2 hours.
6. **The end.** You complete the collection, run out of everything, or press Uninstall — and the
   Receipt appears.

## Core loop

| Piece | Behavior |
|---|---|
| **Gems** | Premium currency. Earned slowly from races and logins; bought quickly with dollars |
| **Pull** | 160 gems for one duck; 1,600 for a ten-pull |
| **Rarity** | Common 80% · Rare 18% · Legendary 2% |
| **Pity** | Legendary guaranteed by pull 50; chance rises from pull 35 onward ("soft pity") |
| **Banner** | Featured legendary duck, limited time — about 3 in-game days |
| **Duck stats** | Speed, by rarity. Each new banner's ducks are about 15% faster than the last (power creep) |
| **Pond Race** | Once per day. Your best duck races a field; placement pays gems |
| **Duplicates** | Convert to "Down" — a secondary currency that buys almost nothing useful |

## Manipulation catalog

Every technique below is real and common in the industry. Each one is **implemented visibly** in the
game and **named on the Receipt** when it fired. This catalog is the discussion guide.

| Technique | In Quackpot | What the Receipt says |
|---|---|---|
| **Currency obfuscation** | Gems, not dollars. Bundles in odd sizes (60, 330, 1,090, 2,240, 3,880, 8,080) against a 160-gem pull, so there are always leftovers | "You bought 4,170 gems. 90 are still sitting unused." |
| **Fear of missing out** | Banner countdown timers, "last chance" banners | "Day 4: the banner timer was under 1 hour when you bought the $49.99 bundle." |
| **Sunk cost via pity** | Pity counter shown prominently: "only 12 pulls from a guaranteed legendary!" | "You spent $38 chasing pity on a banner that ended 2 days later." |
| **Near misses** | Legendary-colored glow that resolves into a rare | "17 of your pulls glowed gold. 2 were legendary." |
| **Power creep** | New ducks outrace old legendaries | "Your Day 2 legendary placed 6th by Day 9." |
| **Loss aversion** | Daily login streak with escalating rewards | "You opened the game on 15 of 15 days." |
| **Anchoring** | One-time starter pack at "400% value," then normal prices | "The starter pack made $49.99 look reasonable." |
| **Hidden odds** | Odds are disclosed, but in a menu inside a menu | "You opened the odds page 0 times. Legendary odds: 2%." |

## Life metagame

**Time:** one in-game day is about 20 seconds of real time. Fifteen days is about five minutes.

**Money:** a daily wage arrives each morning. Food costs money each day; rent is due every seventh
day.

**The escalation ladder.** When money runs short, the game offers options, each a little worse and a
little more absurd. None is ever required; all are always tempting.

| Step | Option | Consequence |
|---|---|---|
| 1 | Skip lunch | Health meter drops |
| 2 | Extra shift | More wages; sleep meter drops, race reflexes "feel" slower |
| 3 | Sell the couch, then the TV | One-time cash; the apartment background empties |
| 4 | Credit card | Instant money; interest appears on the weekly statement |
| 5 | Payday loan | More instant money; worse interest |
| 6 | Borrow from Mom | Increasingly worried voicemails |
| 7 | **Start a streaming channel** | Followers grow only when you stream **big spends**. A sketchy "discount gem" site offers a sponsorship |

The tone is **absurd but real**: every step is a heightened version of something that happens, and
nothing mocks a real person.

## Endings

| Ending | How you get it |
|---|---|
| **Completed the Collection** | Every duck owned — and the apartment is gone |
| **Influencer** | 40,000 followers, deep in debt |
| **Running on Empty** | Health or money hits zero |
| **Day 15** | Time runs out; the most common ending |
| **Uninstall** | Press the button that was there the whole time. The best ending, and it says so |

## The Receipt

The end screen for every ending:

- Total spent, in dollars, including interest owed
- Hours "played" in game time, and pulls made
- **Real odds next to what the animations implied**
- **A timeline of which manipulation technique fired, and on which day**
- What the player sold, borrowed, and skipped
- Two or three discussion prompts

## Assets

The hard part is images. The plan keeps the asset count small:

- **Layered ducks.** One base duck sprite, recolored by palette swap, plus hat and accessory layers.
  About 8 colors, 8 hats, and 6 accessories — roughly 20 small images — yields hundreds of distinct
  ducks. Rarity can be signaled by layer (legendaries get crowns, capes, glow).
- **Sound effects from jsfxr,** generated and exported by hand. No licensing questions.
- **Backgrounds and banner art from Gemini** image generation, pixel-art style, to match the course's
  pixel-art instruction.
- Every asset is original or generated for this project. Nothing from a real game.

## Technology

- Static HTML, CSS, and vanilla JavaScript, served by **GitHub Pages** from this repository.
- State in `localStorage`, wrapped so the game still runs when storage is unavailable.
- Random numbers through one seedable function, so tests and simulations can reproduce a run.
- No network requests of any kind.

## Tuning

Before the numbers are trusted, **simulate them.** The CourseVGD random-draw archetypes showed why:
a first-guess number can make one choice always correct, and then there is no decision. Here the
risk is different — the economy has to pressure the player within five minutes, without forcing any
particular path. A simple headless simulation of the economy should check:

- How many pulls a free-to-play player gets in 15 days
- How often pity is reached, and when
- When money first runs short with no spending
- That every escalation step is reachable without being forced

## Scope

**v1:** pulls with rarity and pity, the Pond Race, one in-game week of wages and expenses, three
manipulation techniques (currency obfuscation, banner timers, pity), and the Receipt.

**v2:** the full manipulation catalog, the escalation ladder, the streaming channel, all five endings.

## Classroom use

Play for five minutes with no introduction beyond "it's a duck game." Then put the Receipt on screen
and discuss. Candidate questions:

- When did you first spend money? What were you feeling right before?
- Which technique on your Receipt surprised you most?
- Who benefits when "luck" is something you can buy?
- Is this game different from games you play outside class? How?

## Open questions

- Final title.
- Whether a teacher view should summarize the class's Receipts — which would conflict with the "no
  data collected" constraint, so probably not.
- How much of the metagame lands in five minutes, versus a longer optional play.

# avenCITY — Game Mechanics (Living Document)

> **Status: DRAFT v0.1 — for discussion.** Nothing here is final. Sections marked
> 💬 are open questions; sections marked 🧪 are brainstorm menus where we pick,
> not keep, everything. Parameters live in one tuning table at the bottom so we
> can rebalance without rewriting prose.

## 0. Design pillars

Every mechanic must serve at least one of these, or it gets cut:

1. **Go all in, risk-free.** The game lets founders do the thing real life
   punishes: bet everything on an idea. Failure costs game time, never real money.
2. **Attention is the capital.** In a post-AGI world, execution is cheap —
   conviction and attention are scarce. HEARTS model that: everyone gets the
   same 24 a day; wealth comes from *allocating* them well, not from having more.
3. **Exit the rat race.** The win condition is Kiyosaki's: passive income ≥ cost
   of living. You stop working for coins; your streams work for you.
4. **Everything visible on the map.** Progress is physical: an idea becomes a
   product becomes a dome you can point at. No abstract portfolio screens as
   the primary view — the city IS the ledger.
5. **Simplest thing that simulates.** Minecraft-simple recipes, one market,
   few numbers. Depth from combination, not from parameter count.

---

## 1. Time

| Unit | Real time | Notes |
| --- | --- | --- |
| Game day | **1 minute** | The heartbeat. All accruals tick daily. |
| Game week | 7 min | Default validation window. |
| Season | ~91 days ≈ 1.5 h | Modifier layer (post-MVP). |
| Game year | 365 days ≈ 6 h | "Year 24" on the board = ~6 days of real elapsed play. |

Offline time still ticks (the city lives), but see 💬 Q1.

## 2. Currencies

Two currencies, deliberately asymmetric — one is *attention*, one is *money*:

### HEARTS ♥ — the investment currency
- Every player receives **24 HEARTS per game day**. Equal for everyone, always.
  A universal basic income of attention.
- **Non-tradeable.** Hearts cannot be bought, sold, or gifted. This is the
  anti-plutocracy rule: you cannot buy conviction, only earn it.
- Hearts are spent by **pledging them to sparks** (votes in IDEA phase are
  pledges too — see below). Pledged hearts are *escrowed*, not burned.
- **Hearts expire after 7 game days** if unspent (use it or lose it). This
  forces circulation and makes attention genuinely scarce — you cannot hoard
  conviction for a year and dump it.
- Recommendation: unmet daily needs (see §5) reduce tomorrow's heart income
  (e.g., −6 per unmet need). Being broke literally costs you attention — that
  IS the rat race, mechanized. 💬 Q2

### COINS $ — the economy currency
- Earned: wages (labor), sales of goods, **dividends from sparks you backed**.
- Spent: daily needs, resource inputs, upkeep/burn, dome construction.
- Fully tradeable; this is the number on the city board ("Capital $ 248,750").

The loop in one sentence: **work → coins keep you alive; hearts → sparks →
income streams; when streams cover life, you're free — and freedom scales.**

---

## 3. AVENS — the agent CEOs

**Every spark is run by an Aven: an AI agent CEO.** The player never
micro-manages production — the player is the *visionary and capital allocator*;
the Aven executes.

- **You instruct, your Aven runs.** The core interaction of the whole game is:
  *tell your Aven what you want* — "found a bread spark", "hold our POWER
  stock until the price passes 2× base", "start the dome raise". The Aven
  handles the operational loop: buying inputs, crafting, selling, paying burn,
  reporting back.
- **Division of labor (the design line):** decisions that shape *what and why*
  belong to the player (recipe choice, pivot, pricing posture, when to raise,
  when to build); everything *how and when-exactly* belongs to the Aven. If a
  mechanic tempts the player to click a production button, it's on the wrong
  side of the line.
- **MVP execution:** the Aven is a policy automaton with a small instruction
  set (directives like `produce`, `sell above X`, `stockpile`, `start raise`) —
  surfaced in UI as if you were messaging your CEO. **Post-MVP:** free-text
  natural-language instruction backed by a real agent — the point where
  avenCITY becomes a literal demo of owning your own AI founder (the avenCEO
  thesis: your Aven, your company). 💬 Q7
- **Reporting:** the Aven files a daily one-line report per spark (produced X,
  sold Y at Z, treasury T). The game's "inbox" is your CEOs writing to you.

## 4. The SPARK lifecycle

A **SPARK is a business idea** owned by a founder. Three phases:

```
IDEA ──(validation goal met)──▶ PRODUCT ──(traction met)──▶ DOME
  │                                │
  └── goal missed → hearts refunded └── burn-out → back to IDEA (one retry) or dissolve
```

### 4.1 IDEA — validation ("would you invest?")

The founder pitches the spark: name, sector, and **which recipe it will
produce** (every spark must point at a real node in the resource tree, §6 —
no vaporware).

- Supporters back the idea by pledging hearts. **A vote IS a pledge**: 1 vote
  = 1+ hearts, blocked/reserved (escrowed) from the supporter's balance.
- **Goal:** reach **G hearts within T days** (MVP default: **240 ♥ in 7 days**
  — i.e., ~10 people's full daily attention, or 34 ♥/day sustained).
- **Success:** escrow converts — the spark is *funded*. Pledged hearts convert
  into **SEED COINS** for the spark's treasury (1 ♥ → 10 $ at MVP rate) and
  into **backer shares** (pro-rata).
- **Failure:** every heart returns to its pledger (minus nothing — failed
  validation must be cheap, or nobody experiments).
- Founders must pledge into their own spark (skin in the game, min 24 ♥ —
  one full day of their attention).

**Ownership (MVP):** dividends split **50% founder / 50% backers pro-rata**.
Simple, no cap tables, no dilution — revisit post-MVP. 💬 Q3

### 4.2 PRODUCT — build & traction

The funded spark now has a treasury (seed coins) and must prove it can
produce and sell. It operates from the shared **Workshop** (a commons
building — no dome yet, no hex claimed).

Stage gates (all must pass, in order):

1. **PROTOTYPE** — produce the first unit of the spark's recipe (buy inputs
   at market, craft once).
2. **LAUNCH** — sell the first 10 units at market.
3. **TRACTION** — sustain positive net income for 7 consecutive days
   (revenue − input costs − burn > 0).

**Burn rate:** the spark pays **24 $/day upkeep** while in PRODUCT (workshop
rent). Treasury at 0 → spark collapses: one free restart back at IDEA phase
(the pivot), second collapse dissolves it. Failure is survivable but not free.

🧪 **Brainstorm menu for deepening PRODUCT (pick 1–2 later, not all):**

- **(a) Iteration levels** — each additional production cycle can invest coins
  into quality QL1→QL5; higher QL sells at price × 1.2^QL. Simple compounding
  craft loop.
- **(b) First-customer contracts** — NPC districts post fixed-price contracts
  ("Northgate buys 50 BREAD at 14 $"), guaranteed demand but below open-market
  peak. Teaches B2B vs. open market.
- **(c) Hiring** — spend coins to add worker slots: each worker = +1 production
  cycle/day. Turns treasury into throughput.
- **(d) The pivot** — once per PRODUCT phase, swap the recipe while keeping
  treasury and backers. Cheap in code, huge in founder-realism.
- **(e) Co-founder slot** — a second player can join mid-PRODUCT for a share,
  bringing their hearts/labor. Social glue.
- **My recommendation for MVP:** gates + burn only (zero extras) — then add
  **(b) contracts** first, because it gives the market guaranteed baseline
  demand, which also stabilizes prices (§7).

### 4.3 DOME — real estate unlocked

The dome is the moment a business becomes **land**. When a product outgrows
the shared workshop (TRACTION passed), the spark may unlock a **new hexagon
on the map** — the city literally grows one hex per successful company — and
raise a dome on it (construction costs coins + materials; the expense is big
enough that it usually needs a second heart-raise, which is naturally a
"Series A").

**Two dome types:**

- **FACTORY dome** — production real estate. Runs the spark's recipe
  **automatically every day** (the Aven operates it): capacity = LV multiplier
  (LV.1 ×1 → LV.5 ×16, doubling per level).
- **LIVING dome** — residential real estate. Houses citizens; its income is
  **rent**: the SHELTER need (§5) of its residents flows to the dome's owners
  instead of vanishing into the city sink. Real estate becomes a first-class
  income-stream type — the classic Kiyosaki asset class, on the map. Citizens
  without a private landlord rent from the city commons at the same price.

**Domes accumulate actual resources.** Output goes into the dome's **stockpile**
first, not straight to market. The Aven sells according to your instruction —
dump daily, hold above a price threshold, or stockpile for a construction
project. Market timing becomes real gameplay, and a dome's stored wealth is
physical: walk past Avenhall and its granaries are actually full.

- Net profit each day is distributed: **50% founder / 50% backers** (dividends
  — this is the "income stream" on the board), or retained by founder vote to
  fund the next level.
- Dome levels require coins + materials + a fresh heart-raise each time —
  every growth round is a new "would you still invest?" moment. Avenhall at
  LV.5 has answered that question five times.
- Domes appear on the map, get an ink pill (`AVENHALL · LV. 5`), and can
  connect **routes** (post-MVP: adjacency/route bonuses multiply connected
  domes' output — the "Connect & compound" pillar).
- **Hex scarcity:** the map starts small; hexes exist only when unlocked by
  successful sparks. Land is therefore provably scarce — every hex on the map
  is a company that made it. 💬 Q8

---

## 5. Citizens & the rat race

Every player is a citizen with **daily needs**, paid in coins at market prices:

| Need | Satisfied by | MVP daily cost (approx) |
| --- | --- | --- |
| FOOD | 1 × BREAD | ~12 $ |
| ENERGY | 1 × POWER | ~12 $ |
| SHELTER | rent — paid to a LIVING dome's owners if housed there, else to the city commons (sink) | 12 $ flat |

- Total cost of living ≈ **36 $/day** at baseline prices.
- **Labor:** once per day a player may take the WORK action → **48 $** wage
  (sold to the city's AGI economy — always available, never scales). Work →
  needs → work: the rat race. It covers life with a little left over, never
  more.
- **Unmet need:** −6 ♥ from tomorrow's heart income per unmet need (poverty
  taxes attention). 💬 Q2
- **FREEDOM (the Kiyosaki exit):** when **passive income (dividends) ≥ cost
  of living for 7 consecutive days**, the citizen is *free* — the WORK action
  is no longer needed. Freedom is a visible status (crest/badge) and the
  first real win condition. Free players scale: more hearts available for new
  sparks, more sparks, more streams. The endgame is a city where everyone owns
  streams — measured by the **Freedom Rate** (% of citizens free), which could
  be THE city-level score. 💬 Q4

---

## 6. Resources & recipes (Minecraft-simple)

**MVP tree: 6 raws, 4 intermediates, 3 needs-goods, 1 construction good.**
Small enough to memorize, deep enough to specialize.

```
RAW (harvested)        INTERMEDIATE              GOODS (satisfy needs / build)
─────────────         ─────────────              ────────────────────────────
GRAIN ─┐
WATER ─┼─▶ FLOUR (2 GRAIN)      ─┐
SUN   ─┼─▶ POWER (2 SUN)         ├─▶ BREAD = FLOUR + WATER + POWER   [FOOD]
ORE   ─┼─▶ METAL (2 ORE + POWER) │        POWER                       [ENERGY]
WOOD  ─┤                         └─▶ TOOLS = METAL + WOOD             [productivity, post-MVP]
CLAY  ─┴─▶ BRICK (2 CLAY + POWER) ──▶ construction: DOME = 20 BRICK + 10 WOOD + 5 METAL
```

- **Raws** flow into the market from *extractor commons* (city-owned NPC
  supply at slowly rising cost) — so the market never fully starves — and from
  sparks that choose raw extraction as their business.
- **Every spark = one node.** Specialization is forced; supply chains emerge
  because no one can do everything. A BREAD spark *must* buy FLOUR, WATER,
  POWER from someone.
- Recipes are 1-step, 2–3 inputs, no machines/tech-tree in MVP. Depth comes
  later via TOOLS (productivity multipliers) and QL (🧪 4.2a).

## 7. The market (simplest price engine that breathes)

One **global market** (no per-district markets in MVP), one price per resource,
recomputed once per game day:

```
price(r, tomorrow) = clamp( basePrice(r) × (demand(r) / supply(r))^k ,
                            0.5 × base, 3 × base )
```

- `demand` = units bought today + standing NPC baseline demand (the AGI city
  consumes a floor amount of every good — the coin faucet).
- `supply` = units offered today (domes, workshop sales, extractor commons).
- `k = 0.5` damping so prices move noticeably but don't whipsaw in one day.
- Everything trades instantly at today's price (no order book, no spread).
  Players see today's price + 7-day sparkline; that's enough to feel scarcity,
  glut, and opportunity ("POWER is at 2.4× base — someone should found an
  energy spark" — which is exactly the signal that births new sparks).

**Coin faucet / sink balance (keeps inflation honest):**
- Faucets: NPC baseline demand, WORK wages.
- Sinks: SHELTER rent, workshop burn, dome construction, extractor commons
  purchases.

---

## 8. What the MVP is NOT (explicit cuts)

Routes & adjacency bonuses · seasons/weather · districts as gameplay units ·
happiness as a stat (folded into needs) · TOOLS & quality levels · secondary
market for shares · co-founders · guilds/alliances · land scarcity/auctions ·
any real-money bridge. All post-MVP candidates, none load-bearing for the loop.

**The MVP loop that must feel good by itself:**
receive 24 ♥ → back a spark (or pitch one and instruct your Aven) → watch
validation succeed/refund → your Aven produces & sells at living prices →
its daily report lands, dividends arrive → cost of living covered → FREEDOM
badge → found the next spark bigger.

---

## 9. Tuning table (single source of truth)

| Parameter | MVP value | Rationale |
| --- | --- | --- |
| Game day | 1 min | fast heartbeat, 6h/year |
| Hearts per day | 24 ♥ | 1 per "hour" of attention |
| Heart expiry | 7 days | forces circulation |
| Founder min self-pledge | 24 ♥ | skin in the game |
| IDEA goal (default) | 240 ♥ | ~10 people·day of conviction |
| IDEA window | 7 days (7 min) | one game week |
| Heart → seed conversion | 1 ♥ = 10 $ | 240 ♥ ⇒ 2,400 $ seed |
| Dividend split | 50/50 founder/backers | brutally simple |
| Workshop burn | 24 $/day | forces urgency in PRODUCT |
| LAUNCH gate | 10 units sold | first real customers |
| TRACTION gate | 7 days net-positive | sustained, not spike |
| WORK wage | 48 $/day | covers living + ~1/3 margin |
| Cost of living | ~36 $/day | 3 needs × ~12 $ |
| Unmet need penalty | −6 ♥ next day | poverty taxes attention |
| FREEDOM condition | dividends ≥ living, 7 days | the Kiyosaki exit |
| Dome cost (LV.1) | 20 BRICK + 10 WOOD + 5 METAL + 2,000 $ | second raise territory |
| Dome LV multiplier | ×1/2/4/8/16 | doubling, LV.5 = Avenhall |
| Price exponent k | 0.5 | damped but alive |
| Price clamp | 0.5×–3× base | no death spirals |

---

## 10. 💬 Open questions (the discussion queue)

1. **Offline fairness.** Days tick while you're away — do absent players'
   hearts just expire (harsh but honest), or accrue into a small capped
   "attention bank" (kinder, less pressure to be always-on)?
2. **Needs → hearts feedback.** I've proposed unmet needs cut tomorrow's
   hearts (−6 ♥ each). Elegant (poverty = attention tax, the rat race made
   mechanical) but potentially a downward spiral for struggling players. Keep,
   soften (floor at 12 ♥/day), or cut?
3. **Backer share model.** Flat 50/50 pro-rata forever is simple, but early
   believers take more risk than growth-round backers for the same price. Do
   we want an early-bird multiplier (e.g., IDEA-phase hearts count ×2 in the
   share split), or is that MVP-overkill?
4. **The city-level win.** Is **Freedom Rate** (% citizens out of the rat
   race) the score that decides "best players win real angel investment" — or
   is it founder-centric (your sparks' total income streams)? This choice
   defines whether top players are *founders* or *city-builders*.
5. **Hearts naming/theming.** 24/day reads as hours-of-attention. Do we lean
   into that explicitly ("you invest your TIME")? It sharpens pillar 2 but
   "HEARTS" is warmer and reads as conviction/love. (Currently: HEARTS.)
6. **PRODUCT phase depth.** Which of the 🧪 menu (4.2) do we pull into v1
   after the bare MVP proves the loop — my vote is (b) NPC contracts, then
   (d) the pivot.
7. **Aven instruction depth at MVP.** Directive buttons dressed as chat
   (deterministic, cheap, testable) vs. real free-text agent from day one
   (magical, on-thesis, but LLM cost per player per spark and harder to
   balance). My vote: directives-as-chat in MVP, real agent as THE v2
   headline feature.
8. **Hex pricing.** A new hex is unlocked *by* a spark reaching DOME — but is
   the land then owned free-and-clear by that spark, or does the city auction
   it and the spark merely holds first right? Free-and-clear is simpler and
   rewards the builder; auctions create a land market (and a city treasury)
   but need more rules. My vote for MVP: free-and-clear, land market later.

---

*Living document — edit freely, argue in the open questions, move settled
things up into the spec and renumber the queue.*

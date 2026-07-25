# avenCITY — Living Concept Paper

> **Status: DRAFT v0.2 — for discussion.** v0.1's IDEA→PRODUCT→DOME phases,
> dual currency and open market are **collapsed and gone**. This version is
> radically simpler: hexes, one currency, fixed prices, JSON recipes.
> 💬 marks open questions. All numbers live in the tuning table (§9).
> Canonical copy of this paper also renders on the site at `/concept`.

## 0. Design pillars

1. **The map is the whole UI.** Hexagons on a map — that's the game. No
   dashboards as primary surfaces; every mechanic must be visible as a hex,
   a dome, or a number on one.
2. **One currency: HEARTS.** Everyone receives the same 24 per game day.
   Attention is the capital of the post-AGI world.
3. **Everything pre-configured.** Recipes, prices, build costs, upgrades — all
   static JSON. No player-driven markets, no price discovery. Depth comes from
   *composition* (Minecraft-style recipes), not from simulation complexity.
4. **You instruct, your Aven runs.** Players make what/why decisions; Aven
   agent-CEOs execute all operations.
5. **Own the streams, exit the rat race.** Invest hearts → hold SPARKminds →
   dividends cover your needs → freedom. The Kiyosaki loop, hex by hex.

---

## 1. The board

The city is a **hex map**. Every hex is a parcel in one of three states:

```
WILD ──(spark funded + built)──▶ DOME ──(upgrades)──▶ DOME LV.2–5
```

- **WILD** — undeveloped nature. Buildable if adjacent to the city.
- **DOME** — developed, one of three types (§2), producing every day.
- The city grows **one funded spark at a time** — every dome on the map is a
  business somebody believed in. The map IS the cap table of the city.

## 2. Dome types

| Type | What it is | What it produces |
| --- | --- | --- |
| **LIVING** | Housing with integrated permaculture — gardens are part of the architecture | **Always FOOD** (permaculture co-location) + houses N citizens (rent) |
| **FACTORY** | Production hall running exactly **one recipe** | The recipe's output resource |
| **VENUE** | Community building — stadium, theatre, bathhouse, academy | **JOY** (the culture resource) + adjacency bonus to neighbouring domes 💬 Q3 |

Design intent: LIVING domes make the city self-feeding by construction —
food is never a separate industry vertical someone forgot to build. VENUEs
make community a first-class investment, not decoration.

## 3. SPARKS & SPARKminds

A **SPARK** is a proposal to develop a hex: *which hex, which dome type,
which recipe* (factories), pitched by a founder and run by their Aven.

**The funding flow (one step, no phases):**

```
founder pitches SPARK on a WILD hex
        │
        ▼
players invest HEARTS  ──────────────▶  investors receive SPARKminds
        │                               (pro-rata shares of this dome)
        ▼
HEARTS go into the CITY TREASURY  (global pool, city currency)
        │
        ▼
goal G reached within T days?
   ├── NO  → all hearts refunded, spark dissolves
   └── YES → treasury pays the build cost (fixed, from prices.json)
             → dome rises on the hex → production starts next day
```

- **SPARKminds** are the share token: 1 invested ♥ = 1 SPARKmind of that
  spark. They entitle the holder to a pro-rata slice of the dome's daily
  net income, forever. (Founder's skin-in-the-game minimum: 24 ♥.)
- **The City Treasury** is where invested hearts pool. It is the city's
  currency reserve: it pays construction and upgrade costs into the economy
  (buying materials from factory domes at fixed prices — so big builds are
  demand for the city's own industry). 💬 Q4 governance
- Dividends: a dome's daily revenue minus upkeep, split pro-rata across all
  its SPARKminds. Founder holds their invested share like everyone else —
  plus a founder bonus 💬 Q2.

## 4. HEARTS — the one currency

- **24 ♥ per player per game day** (1 game day = 1 real minute). Universal,
  equal, non-tradeable as income — you can only *invest* or *spend* them.
- Everything is denominated in hearts: prices, build costs, dividends, needs.
- **Faucet:** the daily 24 per citizen. **Sinks:** dome upkeep (burned) and
  unspent-heart expiry after 7 days 💬 Q5. Everything else circulates.

## 5. The recipe engine (universal, JSON-configured)

One engine, everything is data. Three config files define the whole economy:

```jsonc
// resources.json — the tree
{ "id": "FLOUR", "tier": 1 }

// recipes.json — universal shape: inputs → output, at a rate
{
  "id": "bake_bread",
  "inputs": { "FLOUR": 2, "WATER": 1 },
  "output": { "BREAD": 1 },
  "minutesPerBatch": 1,          // in game-days
  "domeType": "FACTORY"
}

// prices.json — fixed, no market
{ "BREAD": 6, "FLOUR": 2, "WATER": 1, "GRAIN": 1 }
```

**MVP resource tree (small enough to memorize):**

```
BASE (tier 0)      TIER 1                    TIER 2 (needs / build)
SUN                POWER   = 2·SUN           BREAD = 2·FLOUR + WATER      [FOOD need]
WATER              FLOUR   = 2·GRAIN         PANEL = METAL + POWER        [build material]
GRAIN (LIVING)     METAL   = 2·ORE + POWER   JOY   = produced by VENUEs   [JOY need]
ORE                BRICK   = 2·CLAY + POWER
WOOD               
CLAY               
```

- Base resources flow in from WILD hexes worked by the city commons (fixed
  trickle) and from domes whose recipes output them.
- Selling is instant at the fixed price — the "market" is just the price
  sheet. Buyers are: citizens (needs), domes (recipe inputs), the treasury
  (construction). If demand exceeds supply, orders queue — scarcity shows as
  *waiting time*, not price spikes. 💬 Q6

## 6. Upgrades — the verticals

Every dome can level LV.1 → LV.5 along **independent vertical tracks**
(pre-configured in `upgrades.json`, costs paid from the dome's treasury or a
fresh SPARKmind raise):

| Vertical | Effect per level |
| --- | --- |
| **SPEED** | +1 batch per day |
| **EFFICIENCY** | −10% recipe inputs (cheaper production) |
| **SCALE** | +capacity (workers/residents/audience) |
| **RESILIENCE** 🧪 | later: weather/season resistance |

Upgrade raises re-open the spark for investment: new hearts in → new
SPARKminds issued → existing holders diluted pro-rata. Every upgrade is a
fresh "would you still invest?" moment. 💬 Q2 dilution

## 7. Citizens & the rat race

- Daily needs, paid in hearts at fixed prices: **FOOD** (1 BREAD = 6 ♥),
  **HOME** (rent to a LIVING dome = 6 ♥), **JOY** (1 JOY = 4 ♥, post-MVP).
- Cost of living ≈ **12–16 ♥/day** against 24 ♥ income: the default citizen
  has ~8–12 ♥/day of investable attention. The rat race is gentle by design —
  the pressure is opportunity cost, not starvation. 💬 Q1
- **WORK action** (once/day): your Aven labors in the commons → +12 ♥. The
  crutch for over-invested days; never scales.
- **FREEDOM:** dividends ≥ cost of living for 7 consecutive days → the
  freedom crest. The city's score: **Freedom Rate** — % of citizens free.

## 8. Avens — unchanged from v0.1

You instruct, your Aven runs: founding pitches, production, selling, queueing
upgrades — all executed by your agent-CEO, reported daily. MVP: directive
presets styled as chat. v2: free-text agents (the avenCEO thesis, in-game).

---

## 9. Tuning table (single source of truth)

| Parameter | v0.2 value | Notes |
| --- | --- | --- |
| Game day | 1 real minute | |
| Heart income | 24 ♥/day | universal, equal |
| Heart expiry | 7 days 💬 Q5 | keeps attention scarce |
| Cost of living | 12 ♥/day MVP (FOOD 6 + HOME 6) | JOY adds 4 later |
| WORK action | +12 ♥/day | fallback, never scales |
| Spark goal (default) | 240 ♥ in 7 days | ~10 committed backers |
| SPARKmind ratio | 1 ♥ = 1 SPARKmind | dilution via new raises |
| Founder min stake | 24 ♥ | skin in the game |
| Build cost LV.1 | 120 ♥ equivalent in materials | paid by treasury |
| Dome upkeep | 6 ♥/day, burned | the inflation sink |
| Upgrade cost | 60 ♥ × current LV, per vertical | from dome treasury or raise |
| FREEDOM condition | dividends ≥ living for 7 days | crest + score |
| LIVING dome | houses 6 citizens, outputs 8 FOOD/day | permaculture baked in |

## 10. 💬 Open questions

1. **How harsh is the rat race?** v0.2 keeps ~50% of daily hearts free to
   invest. Gentler = more experimentation; harsher = more drama. Where's the
   dial?
2. **Founder economics.** Flat pro-rata + minimum stake, or a founder bonus
   (e.g., 10% carried interest before the pro-rata split)? And does dilution
   on upgrade raises need an early-backer multiplier?
3. **VENUE mechanics.** Adjacency bonus (+X% to neighbouring domes), a JOY
   need citizens buy, or both? Simplest that makes community investable?
4. **Treasury governance.** MVP: treasury auto-pays any funded spark's build.
   Later: does the city vote on what gets built (hearts as votes — the same
   token doing politics)?
5. **Heart expiry.** Keep 7-day expiry (forces circulation) or let the
   treasury be the only sink? Expiry punishes absence — see offline question.
6. **Scarcity as queues.** With fixed prices, shortages become waiting lists
   (like real supply chains) instead of price spikes. Is queue-position
   gameplay fun, or do we need scarcity rationing rules?
7. **Offline.** Days tick while away. Aven keeps producing (fine) — but
   hearts accrue? Cap the buffer at 3 days (72 ♥)?

---

*Living document — v0.2. Argue in §10; promote settled answers into the spec.*

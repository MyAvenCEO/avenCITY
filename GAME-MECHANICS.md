# avenCITY — Living Concept Paper

> **Status: DRAFT v0.3 — for discussion.** Changes from v0.2: hexes carry
> **biomes**; **open market pricing is back** (only the composition layer is
> pre-configured); the first **10 base resources** and the survival-start
> spark sequence are specified; heart expiry replaced by **7% demurrage**;
> time rebased to **1 game day = 1 real hour**.
> 💬 marks open questions. All numbers live in the tuning table (§9).
> This paper also renders on the site at `/concept`.

## 0. Design pillars

1. **The map is the whole UI.** Hexagons on a map — that's the game.
2. **One currency: HEARTS** — minted equally for everyone, melting slowly
   (demurrage). Attention is the capital; it cannot be hoarded.
3. **Composition is configured, prices are discovered.** Recipes — what goes
   in, what comes out, what a factory can make — are static JSON. What things
   *cost* emerges from players on an open market.
4. **You instruct, your Aven runs.** Players decide what/why; Aven agent-CEOs
   execute everything operational.
5. **Own the streams, exit the rat race.** Hearts → SPARKminds → dividends →
   freedom.

---

## 1. Time

**One real day = 24 game days.** (1 game day = 1 real hour.)

| Unit | Real time | Notes |
| --- | --- | --- |
| **Game day** | **1 hour** | The heartbeat. 24 ♥ minted per day — 1 per game hour (2.5 real min). |
| Game week | 7 h | Default spark funding window. |
| Game year | 365 days ≈ 15 real days | A season ≈ 4 real days. |

The rhythm this buys: checking in once or twice a real day is enough to
invest your accrued hearts before demurrage eats them — daily spending
pressure without minute-level FOMO.

## 2. The board — hexes & biomes

The city is a hex map. **Every hex is composed of 1 or 2 biomes**, and biomes
carry the natural resources. Five biomes cover all ten base resources:

| Biome | Natural resources |
| --- | --- |
| RIVER | WATER · CLAY |
| FOREST | WOOD · HERBS |
| MOUNTAIN | STONE · ORE |
| MEADOW | GRAIN · FIBER |
| DUNES | SAND · SUN |

- A 2-biome hex (e.g. RIVER + FOREST) offers up to four resources — hex
  value is its biome combination. Location genuinely matters: you cannot
  found a waterworks on a dune.
- Extraction requires a dome on a hex with the matching biome; output rates
  are biome-configured (JSON).

```
WILD (biomes visible) ──(spark funded + built)──▶ DOME ──(upgrades)──▶ LV.2–5
```

## 3. Dome types (unchanged from v0.2)

| Type | What it is | What it produces |
| --- | --- | --- |
| **LIVING** | Housing with integrated permaculture | GRAIN + HERBS daily (biome-boosted) + houses citizens (rent) |
| **FACTORY** | Extraction or production, exactly **one recipe** | The recipe's output |
| **VENUE** | Stadium, theatre, bathhouse, academy | JOY + neighbourhood bonus 💬 |

## 4. SPARKS & SPARKminds (unchanged from v0.2)

A spark proposes: *which hex, which dome, which recipe.* Investors' hearts
mint **SPARKminds 1:1** (pro-rata dividend shares, forever); the hearts pool
in the **City Treasury**, which pays construction by buying materials from
the city's own factories at market price. Goal missed → full refund.
Founder minimum stake: 24 ♥. Upgrade raises issue new SPARKminds (dilution).

**Dividends stream in real time.** A dome's net income doesn't arrive as a
daily batch — it drips into SPARKmind holders' wallets continuously, and the
stream scales with the spark's level (production multiplies per LV, so the
stream does too). Watching your hearts tick upward *live* is the core
dopamine of ownership — the income-stream panel from the reference board,
made literal.

## 5. HEARTS — minting & demurrage

- **Minting:** 24 ♥ per citizen per game day, dripped 1 ♥/game-hour.
- **Demurrage: 7% per game day** on *held* balances — hearts melt while idle
  (Gesell's rusting money). Invested hearts (SPARKminds) don't melt — that's
  the whole point: **the only way to store attention is to invest it.**
- Consequence: an idle wallet converges to ~343 ♥ (24 ÷ 0.07) no matter how
  long you hoard — there is a natural ceiling on cash, none on ownership.
- 💬 Q5: is demurrage alone enough spending pressure, or do we also pause
  minting above a wallet cap (e.g. 72 ♥ = 3 days)?
- Sinks that fully burn hearts: demurrage + dome upkeep. Everything else
  circulates (needs → dome owners, investments → treasury → factories).

## 6. Resources, recipes & the open market

### 6.1 The first 10 base resources

**WATER · WOOD · STONE · ORE · SAND · CLAY · GRAIN · FIBER · HERBS · SUN** —
each anchored to a biome (§2). These are the whole tier-0 economy at launch.

### 6.2 The recipe layer (pre-configured JSON)

Only composition is fixed: inputs → outputs, rates, and which dome runs it.

```jsonc
// recipes.json — the universal shape
{ "id": "mill_flour",  "dome": "FACTORY", "inputs": { "GRAIN": 2 },                 "output": { "FLOUR": 1 } }
{ "id": "bake_bread",  "dome": "FACTORY", "inputs": { "FLOUR": 1, "WATER": 1, "WOOD": 1 }, "output": { "BREAD": 2 } }
{ "id": "saw_planks",  "dome": "FACTORY", "inputs": { "WOOD": 2 },                  "output": { "PLANK": 1 } }
{ "id": "fire_bricks", "dome": "FACTORY", "inputs": { "CLAY": 2, "WOOD": 1 },       "output": { "BRICK": 1 } }
{ "id": "melt_glass",  "dome": "FACTORY", "inputs": { "SAND": 2, "WOOD": 1 },       "output": { "GLASS": 1 } }
{ "id": "forge_tools", "dome": "FACTORY", "inputs": { "ORE": 1, "WOOD": 1 },        "output": { "TOOL": 1 } }
{ "id": "weave_cloth", "dome": "FACTORY", "inputs": { "FIBER": 2 },                 "output": { "CLOTH": 1 } }
{ "id": "extract",     "dome": "FACTORY", "inputs": {},  "biome": "required",       "output": "per biome table" }
```

### 6.3 The open market (prices discovered, lightly damped)

Fixed prices are gone. One global market; each resource has a floating price:

```
price(r, tomorrow) = clamp( price(r, today) × (demand / supply)^0.5 ,
                            0.5×base , 3×base )
```

- `base` (in `market.json`) only seeds day 0 and anchors the clamps.
- Demand/supply measured over the last game day; damping exponent 0.5 keeps
  moves felt-but-not-whipsawing. Players see today's price + a 7-day
  sparkline. High prices ARE the founding signal: "GLASS at 2.6× — someone
  should spark a glassworks."

### 6.4 The survival start (the first sparks)

The opening arc: a small commons, ~7 wild hexes revealed, and needs that
must be met from zero. The natural founding sequence — each one a real
spark, funded by the first citizens' hearts:

| # | Spark | Hex needs | Produces | Why first |
| --- | --- | --- | --- | --- |
| 1 | **The Well** | RIVER | WATER | Citizens drink daily |
| 2 | **First Hearth** (LIVING) | MEADOW | GRAIN + HERBS, houses 6 | Food source + homes + rent |
| 3 | **Forestry** | FOREST | WOOD | Fuel + construction |
| 4 | **The Mill** | any | FLOUR = 2 GRAIN | First composition step |
| 5 | **The Bakery** | any | BREAD = FLOUR+WATER+WOOD | Closes the FOOD loop |
| 6 | **Sawmill / Kiln / Glassworks** | FOREST / RIVER / DUNES | PLANK · BRICK · GLASS | Unlocks building more domes |

Dome construction costs are material recipes too (e.g. LV.1 dome =
8 PLANK + 6 BRICK + 4 GLASS) — so the construction chain (#6) is what turns
a survival camp into a growing city. **The tutorial IS the economy
bootstrapping itself.**

### 6.5 Upgrade verticals

Every dome levels LV.1 → LV.5 along three independent tracks (configured in
`upgrades.json`; paid from the dome treasury or a fresh SPARKmind raise —
each raise dilutes, each is a new "would you still invest?"):

| Vertical | Effect per level | The business lever |
| --- | --- | --- |
| **SPEED** | +1 batch per game day | throughput |
| **EFFICIENCY** | −10% recipe inputs | cheaper production |
| **MARGIN** | +10% revenue per unit (quality/brand premium) | profit per unit |

Level also multiplies the dividend stream (§4) — upgrades are literally
investments in the income stream's flow rate.

## 7. Citizens & the rat race

**There are zero wages in this world.** Post-AGI: nobody sells labor,
there is nothing to be employed *as*. Income is exactly two things — your
minted 24 ♥/day (the attention UBI) and **dividend streams from SPARKminds
you hold**. The rat race isn't about working; it's the gap between
*consuming your UBI* and *owning enough streams that the UBI becomes pure
investment capital*.

Daily needs at market prices: **WATER** (1), **FOOD** (1 BREAD), **HOME**
(rent to a LIVING dome). At seed prices ~12 ♥/day against 24 ♥ income —
about half your attention is survival, half is investable.
**FREEDOM:** dividend streams ≥ cost of living for 7 straight days — your
needs are owned, your whole UBI is free capital. City score: **Freedom
Rate**.

## 8. Avens (unchanged)

You instruct, your Aven runs — founding, producing, market orders, upgrade
queues — reported daily. MVP: directive presets styled as chat; v2:
free-text agents.

---

## 9. Tuning table (single source of truth)

| Parameter | v0.3 value | Notes |
| --- | --- | --- |
| Game day | **1 real hour** | year ≈ 15 real days |
| Heart income | 24 ♥/day (1/game-hour) | universal, equal |
| **Demurrage** | **7% per game day** on held hearts | idle ceiling ≈ 343 ♥ |
| Wallet mint-cap | 💬 Q5 (proposal: none, demurrage only) | |
| Cost of living | ~12 ♥/day at seed prices | WATER+BREAD+rent |
| Wages | **none — zero labor market** | income = UBI + dividends only |
| Dividends | stream in real time, × level multiplier | the live income stream |
| Upgrade verticals | SPEED · EFFICIENCY · MARGIN, LV.1–5 each | 60 ♥ × current LV per step |
| Spark goal (default) | 240 ♥ in 7 days (7 h real) | ~10 committed backers |
| SPARKminds | 1 ♥ = 1 SPARKmind | dilution via new raises |
| Founder min stake | 24 ♥ | skin in the game |
| Dome build (LV.1) | 8 PLANK + 6 BRICK + 4 GLASS | bought at market by treasury |
| Dome upkeep | 6 ♥/day, burned | second burn sink |
| Market damping | exponent 0.5, clamp 0.5×–3× base | daily repricing |
| LIVING dome | houses 6 · 8 GRAIN + 2 HERBS/day | permaculture baked in |
| FREEDOM | dividends ≥ living, 7 days | crest + score |

## 10. 💬 Open questions

1. **Rat-race dial.** ~50% of daily hearts free to invest — right for launch?
2. **Founder economics.** Flat pro-rata (founder earns only what they stake)
   or a founder bonus (e.g. 10–20% carry before the split)? Decides whether
   people play to *found* or to *back*.
3. **VENUE mechanics.** Adjacency bonus, a JOY need, or both?
4. **Treasury governance.** Auto-pay any funded spark vs. city votes.
5. **Demurrage vs. mint-cap.** Is 7%/day melt enough pressure, or also pause
   minting above a wallet cap? (Two knobs doing one job smells like one too
   many.)
6. **Biome balance.** 5 biomes × 2 resources is clean — but should some hexes
   be resource-poor on purpose (pure real-estate plays for LIVING/VENUE)?
7. **Offline.** At 1 h/day, a working person misses ~8 game days overnight
   (~192 ♥ minted, melting at 7%). Acceptable as-is, or does the Aven need a
   standing "auto-invest my hearts into X" directive? (My take: the standing
   directive IS the elegant fix — and very on-thesis.)

---

*Living document — v0.3. Argue in §10; promote settled answers into the spec.*

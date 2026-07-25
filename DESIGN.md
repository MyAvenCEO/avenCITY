# avenCITY — Corporate Identity

**The Founder's Atlas.**

avenCITY is a city-building investment game: a founder's simulator for the
post-AGI world. Go all in on your idea where the risk is simulated and the
lessons are real — found districts, ignite sparks, connect routes, and watch
income streams pay you back hour after hour.

The identity is the game board itself: a hand-drawn atlas. Warm paper, engraved
ink, olive domes, amber trade routes — art-directed like an editorial magazine
spread, not a SaaS dashboard.

Live reference: [`/style`](src/routes/style/+page.svelte) renders every token and
component. The reference game board (Year 24 save) is the north star for what
the identity must feel like in play.

## Where things live

| File | Holds |
| --- | --- |
| [`src/lib/styles/tokens.css`](src/lib/styles/tokens.css) | The `@theme` block — colour, type scale, geometry, motion, panel shadows. Source of truth. |
| [`src/lib/styles/fonts.css`](src/lib/styles/fonts.css) | Self-hosted `@font-face` declarations. |
| [`src/lib/styles/base.css`](src/lib/styles/base.css) | Base element styles and the `.panel` / `.plate` / `.well` / `.pill-ink` / `.chip` / `.btn*` primitives. |
| [`src/lib/brand.ts`](src/lib/brand.ts) | Copy + game constants — tagline, pitch, resources, sparks, income streams, districts. |

## Voice of the copy

The game speaks to founders: **go all in — the risk stays in the game.** Copy is
about the play loop (found your venture, ignite sparks, connect and compound)
and the payoff (income streams, city value). It is about the game city only —
no story-universe references. The single bridge to reality is the prize: the
best players win real-world angel investment and strategic co-founding support,
incorporation included.

Every number shown is a real figure from the reference save (Capital $ 248,750,
total income $ 4,290 /h, Avenhall LV. 5). Game figures always render in the
mono; update them in `brand.ts`, never inline.

## Colour

Light by design — the board is paper, not a screen. The palette is the map's:

| Family | Tokens | Role |
| --- | --- | --- |
| Paper | `paper` `paper-bright` `paper-deep` | The board. Page, panels, recessed wells — three steps of one warm stock. |
| Ink | `ink` `ink-soft` `ink-faint` `hairline` | The engraving. Words, figures, primary buttons, district pills, and the 1px rules that structure everything. |
| Moss | `moss-deep` `moss` `moss-faint` | What you build — dome glass and gardens. Districts, growth, agriculture. |
| Amber | `amber-deep` `amber` `amber-faint` | What moves — trade routes, energy, the season sun. **The accent**: active states, links, ornaments. |
| Gold | `gold` | What you earn — yields, ratings, the crest. |
| Water | `water` | The map's edge. Calm tinted backgrounds. |
| Status | `ok` `warn` `fail` | State only — income up, warnings, failures. Never decorative. |

Rules:

- **No pure black, no pure white.** Ink on paper is `#29271F` on `#F1ECDF`.
- **`ink-faint` is meta only** — captions, labels, 12px+. Never body copy.
- A new colour must plausibly exist on this map, or it doesn't exist.

## Type

Three voices, never swapped:

- **Playfair Display** (`font-display`) — the atlas voice. High-contrast serif
  for the wordmark and display headlines; *italic* carries the counter-phrase
  inside a headline ("The risk stays in the game."). Medium weight — the serif
  brings the contrast, never boldness.
- **Chillax** (`font-sans`) — the body voice. Soft geometric sans for paragraphs
  and UI copy.
- **Azeret Mono** (`font-mono`) — the ledger voice. Tracked-out uppercase labels
  and **every game figure** (`$ 4,290 /h`). Never body copy, never headlines.

Scale: `text-hero` (one per page) · `text-display` · `text-title` · `text-lead` ·
`text-body` · `text-meta` · `text-label`. Labels are always uppercase, mono,
tracked to `0.16em`.

## Paper & panels

Structure comes from **hairlines, not shadows**. The shadow exists only to lift
a panel a hair off the board — if you can point at it, it's too big.

| Class | Use |
| --- | --- |
| `.panel` | The default container. Brighter paper, one hairline, whisper of lift. |
| `.plate` | Hero scale — the map, a framed figure. Larger radius, more lift. |
| `.well` | Recessed paper inside a panel — totals, costs, create-actions. |
| `.pill-ink` | Dark ink capsule with paper text — place-names (`AVENHALL · LV. 5`). |
| `.chip` | Hairlined paper capsule — resource readouts, live state. |

Buttons: `.btn-primary` is the ink stamp (one per view); `.btn-line` is a
hairlined capsule that stays quiet next to it. The `.pulse-dot` (amber) marks
income ticking right now.

## Editorial ornaments

The magazine layer on top of the atlas — used sparingly, one or two per spread:

- **Inline glyph** — a small amber `✦` set inside a headline at `0.55em`,
  the fashion-editorial trick.
- **Sparkles** — lone `✦` marks placed at composition corners. Ink or amber.
- **Route-lines** — thin (1–1.5px) amber SVG curves flowing through a section,
  echoing the trade routes on the map. Desktop only; decorative, never load-bearing.
- **The arch plate** — imagery is framed in an arch (`rounded-t-full`) with a
  hairline border, like a botanical plate in an old atlas, and captioned with a
  `.pill-ink` place-name. Renders get a slight sepia
  (`sepia(0.14) saturate(0.9)`) so they sit on the paper instead of on top of it.

## Light only, by design

The board is paper; there is no dark variant. `color-scheme: light` is declared
so form controls and scrollbars follow rather than the browser guessing.

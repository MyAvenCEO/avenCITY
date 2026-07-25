# avenCITY — Corporate Identity

**Liquid glass on living nature.**

Maia City is glass domes standing in a jungle. The identity is exactly that, and
nothing else: a living photograph as the ground layer, and everything we say
floating on glass above it.

The glass is not a decorative filter — it is the brand's argument. You can put a
built thing on top of a living thing without hiding it. Every panel is
translucent so the jungle keeps showing through whatever we build on it. The
moment a surface goes opaque, that argument dies.

Live reference: [`/style`](src/routes/style/+page.svelte) renders every token and
component against the real photograph. Read it in the browser, not on paper — a
glass system cannot be judged as a static swatch sheet.

## Where things live

| File | Holds |
| --- | --- |
| [`src/lib/styles/tokens.css`](src/lib/styles/tokens.css) | The `@theme` block — colour, type scale, geometry, motion, and the glass recipe. Source of truth. |
| [`src/lib/styles/fonts.css`](src/lib/styles/fonts.css) | Self-hosted `@font-face` declarations. |
| [`src/lib/styles/base.css`](src/lib/styles/base.css) | Base element styles and the `.glass*` / `.btn*` / `.chip` / `.label` primitives. |
| [`src/lib/brand.ts`](src/lib/brand.ts) | Copy constants — day number, recap stanza, creed, dome specs. |

## Colour

**The palette is sampled, not invented.** These values were pulled by decoding
`src/lib/assets/images/maia-city-dome.jpg` and averaging real regions: the sky
(`#7DA1C5`), the deep water (`#0A3E3B`, `#167877`), the masonry, the foliage.
That is why the glass sits so naturally on the photograph — the UI is wearing the
photograph's own colours. If a new brand colour is ever needed, sample it from a
render. Do not pick it from a colour wheel.

| Family | Tokens | Role |
| --- | --- | --- |
| Paradise | `paradise-deep` `paradise` `paradise-bright` | The water — **the primary brand colour**. Every primary action, link and live state. |
| Ground | `deep` `deep-soft` `surface` | Deep water-ink. The page floor. Cool and near-black so photographs sit on it untinted. |
| Foliage | `moss` `frond` | **Supporting accent only.** Never a background, never a scrim. |
| Bamboo & stone | `stone` `bamboo` `bamboo-bright` | The built warmth. The human register: quotes, secondary marks. |
| Sky & bone | `sky` `bone` `chalk` `chalk-muted` `chalk-faint` | The light. Text and pale surfaces. |
| Status | `ok` `warn` `fail` | State only. Never decorative. |

Three rules:

- **Paradise is the primary.** The water is the most recognisable thing in the
  renders and the one colour that is unmistakably *this* city.
- **Green is a supporting actor, not the ground.** An earlier pass made jungle
  green the page floor, the scrims *and* the glass tint at once; everything went
  murky and the photographs drowned. The green you see should come from the
  photograph itself, never from the UI tinting it. Glass tints are neutral white.
- **No pure black, no pure white.** Nothing outdoors is `#000` or `#FFF`.
  Text is `chalk` (`#FBF8F1`); the floor is `deep` (`#071C22`).

`chalk-faint` is for meta only — captions, timestamps, 12px and up. Its contrast
is tuned for incidental text and it must never carry body copy.

## Type

Two voices, and they never swap. Chillax says *this is a place*; Azeret Mono says
*these are its measurements*. Mixing them collapses the identity.

- **Chillax** — the organic voice. Soft geometric sans, rounded terminals.
  Headlines, wordmark, body. Display runs **Light (300)** with tight negative
  tracking; **Bold (700)** is reserved for the wordmark and the one line in a
  heading that carries the claim. Heavy weights at hero size are off-brand.
- **Azeret Mono** — the technical voice. Small uppercase labels, eyebrows, spec
  figures, meta. The engineering annotation on the blueprint. Never body copy,
  never headlines.

Scale: `text-hero` (one per page) · `text-display` · `text-title` · `text-lead` ·
`text-body` · `text-meta` · `text-label`. Display sizes are fluid; reading sizes
are fixed so the rhythm never wobbles between breakpoints.

Labels are always uppercase, mono, tracked to `0.16em`.

## Glass

A convincing pane needs **four layers together**. Drop any one and it becomes a
grey box — this is what most "glassmorphism" gets wrong:

1. **Tint** — a barely-there wash so text has something to sit on.
2. **Blur** — `backdrop-filter`, plus `saturate()` so the jungle stays vivid
   behind it instead of going muddy grey.
3. **Hairline** — a light 1px border. Glass has an edge.
4. **Highlight** — an inset top gleam, the light catching the top curve.

| Class | Use |
| --- | --- |
| `.glass` | The default pane. Cards and most content. |
| `.glass-lens` | Hero scale — deeper blur, stronger edge, bigger lift. **One per viewport**, or the depth hierarchy flattens. |
| `.glass-shade` | Darker tint for when text must win over a bright patch of photograph. Still translucent. |

### Two hard-won layout rules

- **The card must not eat the city.** Hero panes are capped (`max-w-xl`) and sit
  in one column so the dome stays visible in its own right. A glass panel
  covering the whole photograph is just a dark box.
- **Scrims are diagonal, not flat.** Heaviest where the copy sits, clearing to
  almost nothing over the subject. That buys white-text contrast without dimming
  the thing worth looking at.

### Browser caveat

Chromium fails to repaint text inside `backdrop-filter` panes scrolling over a
`position: fixed` backdrop — panes render as empty boxes. Promoting the backdrop
to its own compositing layer (`transform-gpu will-change-transform`) fixes it.
See the fixed layers in [`src/routes/style/+page.svelte`](src/routes/style/+page.svelte).

## Components

- **Buttons** — `.btn-primary` is paradise: the water is the call to action. One
  primary per view. `.btn-glass` carries everything secondary so it never
  competes.
- **Chips** — `.chip` is a `.label` wearing glass. The `.pulse-dot` marks
  something happening *right now*: a day in progress, MAIA writing.
- **Wordmark** — `aven` light and lowercase, `CITY` bold and uppercase. The
  weight jump inside one word is the whole mark.

## Dark only, by design

This is a jungle photograph, not a document. There is no light variant;
`color-scheme: dark` is declared so form controls and scrollbars follow rather
than the browser guessing.

## Voice

Outward-facing copy follows the avenMAIA brand voice, not this file. Two
constraints that touch the UI directly:

- **The recap stanza is verbatim, every time** — it is the daily ritual and the
  zero-background reader's on-ramp. It lives in `brand.ts`; vary nothing but the
  day number.
- **The creed belongs to Samuel.** It is always quoted and attributed, never
  narrated by MAIA as her own settled belief.

Numbers are hyper-specific and real. The dome figures (150 m, 10.920 struts,
5.461 nodes, 7.280 panels) come from the Mediterranean Solarpunk Geodesic Dome
spec sheet. Do not round them for tidiness — the precision is the point.

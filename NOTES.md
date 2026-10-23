# Code notes

Source files carry no comments, so the built userscript ships without any. Everything that
would have been a comment lives here, per file. Keep it in step with the code.

## build.mjs

Bundles `src/` into a single Tampermonkey userscript.

- `npm run build` builds once; `npm run watch` rebuilds on any change to `src/` or `ROUTE.md`.
- `package.json` `version` is the single source of truth for `@version`: `src/meta.txt` is the
  header template and `{{version}}` is substituted into it.
- `parseRoute` turns `ROUTE.md` into `{ steps: [{ id, name, tier, note }], never: [id] }`.
  Numbered items are the route; bulleted items under a heading containing "Never" are the
  never-buy list. It runs at build time rather than at runtime so a typo in an upgrade name,
  or an upgrade listed twice, fails the build instead of silently dropping a step.
- The `route` plugin makes `import { steps, never } from "virtual:route"` resolve to that parsed
  object. Its path is the bare `ROUTE.md` so no absolute path from the build machine can end up
  in the bundle.
- The `clean` plugin is why `write` is false: esbuild hands the output back instead of writing
  it, and the plugin strips what esbuild itself adds — the `// src/file.js` marker it prints
  before each module, and the `/* @__PURE__ */` annotations it puts in front of calls such as
  `new Set()` — then prepends the header and writes the file. esbuild already drops comments
  from the JS source; it has no option to drop these two. The header is added after cleaning,
  so the strip can never touch its `//` lines.

## src/meta.txt

The userscript header. The only `//` lines that ship; Tampermonkey needs them.

## src/upgrades.js

The basket's 24 upgrades as Torn renders them (see `fixtures/basket-open.html`), six per tier,
tiers I to IV in order, so an upgrade's id is its position in the flattened list. Each tier's
`cls` is the class Torn puts on that tier's slide and buttons — `hhocking` is Torn's own
spelling. Imported by both the runtime and `build.mjs`, which validates `ROUTE.md` against it,
so it must stay free of DOM access.

Each upgrade also carries `cost`, `desc` and `flavor`, and each tier its `unlocksAt` basket
level, all from [IceBlueFire's Halloween guide](https://www.torn.com/forums.php#/p=threads&f=61&t=16192843&b=0&a=0).
`desc` and `flavor` mirror the `.update-desc` and `.update-flavor` lines of Torn's confirmation
box. The guide calls the last tier IV upgrade "Summon Cthulhu"; Torn's page says "Summon Him",
which is the name kept here. A cost seen in the confirmation box (`hbr_costs`) wins over the
catalog's.

`findUpgrade(ref)` accepts a name in any case or punctuation, or an id as `#7` / `7`.

## src/basket.js

Reads the open basket panel (`div.use-halloween-basket`) into a plain state object. Pure DOM
reads; nothing here writes to the page.

`readBasket(root)` returns:

| Field | Meaning |
|---|---|
| `treats` | treats held (`.available-treats .halloween-text`) |
| `collected`, `goal` | the "353 / 500 Treats Collected" pair |
| `lockedTiers` | `Set` of tier labels whose slide has `disabled` |
| `upgrades` | `Map` id -> `{ id, name, tier, unlocked, selected, locked, el }` |
| `pending` | `{ id, cost }` while the confirmation box is open, else `null` |

The confirmation box only exists while an upgrade is clicked, and it is the one place the page
states a cost, which is why `pending` exists.

## src/storage.js

GM storage with a `localStorage` fallback, keys prefixed `hbr_` like the other scripts'
prefixes. A write that fails (storage unavailable) is ignored: costs are just not remembered, and the
exchange lock falls back to locked on the next paint.

Torn only states a cost in the confirmation box after an upgrade is clicked, so `rememberCost`
keeps each one seen, as `hbr_costs = { [upgradeId]: treats }`, and `knownCosts` reads them
back. The entry point lays them over `CATALOG_COSTS` from `upgrades.js`, so the status line,
`nextStep` and the info card all see the guide's cost until Torn states one, and a price Torn
changes is picked up on the first click without a new release.

`exchangeLocked` / `setExchangeLocked` keep the exchange lock as `hbr_exchange_locked`,
locked unless the user unticks it.

## src/route.js

`nextStep(route, state, costs)` decides which step to recommend.

- `route` is the ordered `steps` from `ROUTE.md`, each `{ id, name, tier, note }`.
- `state` is what `readBasket` returned.
- `costs` maps upgrade id -> treats: the catalog's costs, overridden by any seen in the
  confirmation box.
- It returns `{ index, step, reason }`, or `null` once every step is unlocked. `reason` is
  `ready` (buy it now), `short` (its known cost is more than the treats held) or `locked` (its
  tier is still locked).

A step bought out of order simply counts as done: the recommendation is the first step not yet
bought. A locked or unaffordable next step is reported rather than skipped, because the route's
order is the point — buying past it spends treats it is saving for (step 7 -> 8 is a whole
event of saving). A step with no cost at all (not in the catalog, never seen) is assumed
affordable.

`progress` counts how many route steps are unlocked.

## src/overlay.js

Paints the route onto the basket: a step number on each route upgrade, a ring on the next one,
a ✕ on never-buy upgrades, and a status line under the treats bar. It only adds nodes and
classes of its own and `clear` removes exactly those.

Every status line ends with a link to the Halloween guide forum thread (`GUIDE_URL`), set by
`setStatus`. It opens in a new tab so the basket stays open. It is a plain link the user
clicks; the script itself never follows it or fetches anything.

Locked upgrades get an info card: hovering (or tapping) one shows its catalog description,
cost, the basket level that unlocks its tier, its place in the route and how far short the
treats held are. Torn only sends an upgrade's description when it is clicked, and a locked
tier's buttons are `disabled`, so the card is built from the catalog and Torn's buttons are
left alone. Firefox delivers no mouse events to a disabled button or its children, so each
locked button gets a transparent `.hbr-hit` sibling at the same absolute position in its slide
that takes the hover and the tap. The hits are appended after all of the slide's buttons, never
between them: Torn places each button on the wheel by its `:nth-child` position, and a hit
inserted next to each button (1.0.6) pushed five of the six off their spots. A tap stops
propagation, so Torn's handlers and the slider never see it. There is one `.hbr-card` per panel, filled and positioned under the hovered
upgrade, clamped to the panel's width, and hidden with the `hidden` attribute, which the
`MutationObserver` does not watch. `hideCards` hides every card on any click outside a hit.

`centreWheel` fixes an off-centre wheel in narrow windows. Torn's slider gives every slide a
fixed inline width (420px) and centres the wheel inside it, but in a narrow window the
slider's visible `.flex-viewport` is narrower (384px at a 757px window), so the wheel sat
half the difference (18px) right of centre. It sets `--hbr-wheel-shift` on the panel to
`(viewport - slide) / 2` and the stylesheet moves each `.updates-grid-slide` by that via
`left`; when the two widths match the shift is 0. CSS alone cannot do it: making the viewport
a size container for `cqw` units collapses it, because it is a flex item sized by its content.

`addExchangeLock` puts a "Lock exchange" checkbox after Torn's Exchange all treats button
(`.exchange-action .exchange-btn`), outside the wheel, so no `:nth-child` placement is
affected. It is positioned absolutely and takes no space in the row: `.exchange-action` is a
flex row justified to the end, and as a flex item (first draft of 1.1.0) the checkbox pushed
the button 109px left, over the wheel's lower-right icon. While it is ticked the panel carries `hbr-exchange-locked`: the stylesheet fades the
button and turns off its pointer events, and `blockExchange`, a capture-phase click listener on
the document, cancels any click that still reaches the button (keyboard Enter or Space) before
Torn's own handlers see it. Torn sets and clears the button's `disabled` attribute itself, so
the lock never touches it and Torn's state is left as it was. The checkbox's clicks stop at
its label. The choice is stored as `hbr_exchange_locked` and defaults to locked.

`isPainted` is true while what `paint` added is still in the DOM. Torn re-renders the panel
wholesale after an upgrade, which drops our nodes, and that is how the entry point notices.
It also checks for the lock checkbox when an exchange button is present, so a re-render of
just that row repaints too.

## src/index.js

Entry point. Torn renders the basket panel into the item row when "Use" is clicked and
re-renders it after every upgrade, so this watches the page with a `MutationObserver` and
repaints when the panel's content changes, batched to one update per animation frame.

A `ResizeObserver` watches each painted panel's viewport and slides and re-runs
`centreWheel` when either width changes (window resize, or the slider re-measuring), since
neither changes the DOM tree the `MutationObserver` watches. Observing an element twice is a
no-op, so `watchSize` can run on every paint.

A document click listener calls `hideCards`, so tapping anywhere else closes an info card.
`blockExchange` is registered on the document in the capture phase, so it runs before any
handler Torn has on the panel.

`signature` covers everything that changes what would be drawn (treats, locked tiers, each
upgrade's unlocked/locked state, costs). Our own nodes are not part of it, so painting
never re-triggers a paint; a repaint happens only when the signature changed or our nodes are
gone.

## src/styles.css

- The badge is centred in the 60px upgrade circle. Torn shows the upgrade's name in that same
  spot on the selected upgrade, so the badge fades out there and on hover.
- Torn pulls `.updates-grid` up under the treats bar with `margin-top: -35px`. The status
  note's 41px bottom margin pays that back so the wheel's top circle starts below the note
  instead of over it.
- `.updates-grid-slide` takes `left: var(--hbr-wheel-shift, 0px)`, the shift `centreWheel`
  sets; Torn already makes that element `position: relative`.
- `.hbr-hit` is a transparent circle over a locked button. It sets `pointer-events: auto`
  because it lives inside Torn's disabled slide, and `z-index: 4` to sit above the badge.
- `.hbr-card` is positioned by script and has `pointer-events: none`, so it never steals the
  hover from the hit under the cursor. Its `[hidden]` rule is explicit so that no page
  style setting `display` on it can show a hidden card.
- `.hbr-exchange-locked .exchange-btn` fades the exchange button and sets
  `pointer-events: none`.
- `.exchange-action` becomes `position: relative` so `.hbr-lock` can sit absolutely in its
  bottom-right corner, inside the row's 15px bottom padding, right under the button. Above the
  button there is only about 15px before the wheel's tier IV icons, and in the row itself it
  would move the button, so the padding is the one free spot. The checkbox and font are sized
  to fit that 15px.
- `.hbr-guide` only sets colour and underline on the status note's link.

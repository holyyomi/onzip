## Overview

Airbnb is the canonical example of a generous, photography-led consumer marketplace. The base canvas is **pure white** (`{colors.canvas}` — #ffffff) with deep near-black ink (`{colors.ink}` — #222222) for headlines and body, and a single voltage of **Rausch** (`{colors.primary}` — #ff385c) carrying every primary CTA, the search-button orb, the heart save state, and inline brand links. There is no secondary brand color in mainline marketing — the **Luxe purple** (`{colors.luxe}` — #460479) and **Plus magenta** (`{colors.plus}` — #92174d) tokens are sub-brand accents that only appear inside Airbnb Luxe / Plus contexts.

Type runs **Airbnb Cereal VF** (a custom variable font Airbnb licenses), with **Circular** as the historic in-house fallback and a system stack underneath. Cereal sits at modest weights — display headlines render at 22–28px in weight 500–600, not the heavy 700+ weights that financial or enterprise systems lean on. The hero h1 ("Inspiration for future getaways") on the homepage is just 28px / 700, which would feel small on a typical SaaS page; here it works because the layout leans on photography (city collage, property cards) for visual weight rather than typographic muscle.

The shape language is **soft**. Buttons are 8px radius (`{rounded.sm}`), property cards are ~14px (`{rounded.md}`), the search bar is fully pill-shaped (`{rounded.full}`), wishlist hearts and search orbs are circles (`{rounded.full}`), and category strip rounded corners run at 32px (`{rounded.xl}`). There is essentially no hard corner anywhere except the body grid itself — every interactive element is rounded.

**Key Characteristics:**
- Single accent color: `{colors.primary}` (#ff385c — "Rausch") carries every primary CTA, the search orb, the heart save state, and the brand wordmark. Used scarcely — most pages are 90% white + ink with one or two Rausch moments.
- Custom variable type: `Airbnb Cereal VF`. Display weights sit at 500–700, body at 400. Modest weight is intentional — the system trusts photography for visual heft.
- Three-product top nav: Homes, Experiences, Services — each with a hand-illustrated 32px icon and "NEW" badges (`{component.new-tag}`) on the two newer products. Active tab uses an underline rule (`{component.product-tab-active}`).
- Pill-shaped global search bar: white surface, fully rounded (`{rounded.full}`), divided by 1px hairlines into Where / When / Who segments, terminated by a circular Rausch search orb (`{component.search-orb}`).
- Property cards are photo-first: aspect-ratio rectangles with `{rounded.md}` corner clipping, swipeable image carousel, "Guest favorite" floating badge top-left, heart icon top-right, then 4–5 lines of meta beneath.
- Editorial dropdowns (footer, language picker) are clean text columns over the white canvas — no card surface, no shadow.
- The design system caps elevation at one shadow tier (`box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`) — used on hover-floated cards and search/account dropdowns.
- 8px base spacing system, with major sections at `{spacing.section}` (64px) — generous but not airy enough to feel editorial-magazine; the marketplace density wants more cards per scroll.

## Colors

### Brand & Accent
- **Rausch** (`{colors.primary}` — #ff385c): The single brand color. Used for primary CTA backgrounds (Reserve, Continue), the search orb, the heart save state on property cards, and inline brand links. The most recognizable color in consumer travel.
- **Rausch Active** (`{colors.primary-active}` — #e00b41): The press / pointer-down variant — slightly more saturated. Used on `{component.button-primary-active}`.
- **Rausch Disabled** (`{colors.primary-disabled}` — #ffd1da): A pale tint used on disabled CTAs.
- **Luxe Purple** (`{colors.luxe}` — #460479): Sub-brand accent for Airbnb Luxe. Only appears inside Luxe-branded surfaces — never in mainline marketing.
- **Plus Magenta** (`{colors.plus}` — #92174d): Sub-brand accent for Airbnb Plus. Same scoping as Luxe — sub-product only.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): The default page floor for every public page. Airbnb does not have a dark mode on the public web.
- **Surface Soft** (`{colors.surface-soft}` — #f7f7f7): The lightest fill — used on disabled fields, sub-nav hover backgrounds, and the inline search filter band.
- **Surface Strong** (`{colors.surface-strong}` — #f2f2f2): Slightly heavier fill — circular icon-button surface (e.g., the breadcrumb back-arrow and listing toolbar buttons).

### Hairlines & Borders
- **Hairline** (`{colors.hairline}` — #dddddd): The default 1px border tone — search bar dividers, table separators, footer column splitters, card 1px borders.
- **Hairline Soft** (`{colors.hairline-soft}` — #ebebeb): A lighter divider used on long-scrolling editorial body separators.
- **Border Strong** (`{colors.border-strong}` — #c1c1c1): A heavier stroke used on disabled outline buttons and form input outlines after focus.

### Text
- **Ink** (`{colors.ink}` — #222222): The dominant text color on light surfaces. Display headlines, body paragraphs, primary nav links, and most inline link text. Never pure black.
- **Body** (`{colors.body}` — #3f3f3f): A secondary running-text color used inside long-form review and amenity copy where ink would feel too heavy.
- **Muted** (`{colors.muted}` — #6a6a6a): Sub-titles inside city link blocks ("Cottage rentals", "Villa rentals"), inactive product-tab labels, footer category sub-labels, "View all" links.
- **Muted Soft** (`{colors.muted-soft}` — #929292): Disabled link text. Used very sparingly.
- **Star Rating** (`{colors.star-rating}` — #222222): The same ink token — Airbnb's star icon and "4.81" rating numbers all render in ink rather than a yellow/gold color, which is a deliberate brand choice (yellow stars feel cheap in travel context).
- **On Primary** (`{colors.on-primary}` — #ffffff): White text on Rausch CTAs.

### Semantic
- **Error** (`{colors.primary-error-text}` — #c13515): Inline error text for form validation. Distinct from Rausch — slightly darker, more saturated red.
- **Error Hover** (`{colors.primary-error-text-hover}` — #b32505): Darkens on link hover.
- **Legal Link Blue** (`{colors.legal-link}` — #428bff): Inline links inside legal copy (Privacy, Terms). Only used inside the legal sub-band.

### Scrim
- **Scrim** (`{colors.scrim}` — #000000 at 50% opacity): The global modal backdrop tone — date picker, login dialog, language picker. Stored as the base hex; opacity is applied at render time.

## Typography

### Font Family
The system runs **Airbnb Cereal VF** for everything — display, body, navigation, captions, microcopy. Fallbacks walk `Circular, -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`. **Circular** is the historic in-house typeface still kept as the first non-variable fallback; system stacks back it up.

There is no separate display family. The variable font carries the entire scale.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.rating-display}` | 64px | 700 | 1.1 | -1px | Listing detail rating display ("4.81") |
| `{typography.display-xl}` | 28px | 700 | 1.43 | 0 | Homepage h1 ("Inspiration for future getaways") |
| `{typography.display-lg}` | 22px | 500 | 1.18 | -0.44px | Listing detail h1 ("Close to Fethiye Aliyah Bali Beach…") |
| `{typography.display-md}` | 21px | 700 | 1.43 | 0 | Section heads inside listing detail ("What this place offers") |
| `{typography.display-sm}` | 20px | 600 | 1.20 | -0.18px | Sub-section titles ("Things to know") |
| `{typography.title-md}` | 16px | 600 | 1.25 | 0 | City link block titles ("Wilmington", "Athens") |
| `{typography.title-sm}` | 16px | 500 | 1.25 | 0 | Footer column heads ("Support", "Hosting", "Airbnb") |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default running-text inside listing copy |
| `{typography.body-sm}` | 14px | 400 | 1.43 | 0 | Card meta lines, dates, prices, distance text |
| `{typography.caption}` | 14px | 500 | 1.29 | 0 | Search field segment labels ("Where", "When", "Who") |
| `{typography.caption-sm}` | 13px | 400 | 1.23 | 0 | Footer legal line ("© 2026 Airbnb, Inc.") |
| `{typography.badge}` | 11px | 600 | 1.18 | 0 | "Guest favorite" floating badge text |
| `{typography.micro-label}` | 12px | 700 | 1.33 | 0 | Card amenity micro-labels ("Inline 6") |
| `{typography.uppercase-tag}` | 8px | 700 | 1.25 | 0.32px (uppercase) | "NEW" badge on product nav tabs |
| `{typography.button-md}` | 16px | 500 | 1.25 | 0 | Primary CTA button labels |
| `{typography.button-sm}` | 14px | 500 | 1.29 | 0 | Pill button labels (category strip) |
| `{typography.link}` | 14px | 400 | 1.43 | 0 | Inline body links |
| `{typography.nav-link}` | 16px | 600 | 1.25 | 0 | Top product-nav labels (Homes, Experiences, Services) |

### Principles
Display weights stay modest. The homepage h1 at 28px / 700 is deliberately small — it tucks under the search bar so photography and the city-link grid carry visual hierarchy. The listing-detail h1 at 22px / 500 is even quieter; the listing photo banner does the work above it.

The single typographically loud moment in the entire system is the **rating display** (`{typography.rating-display}` — 64px / 700) on listing pages. That is the only place the system trusts type alone to carry hierarchy — rating numbers are a peak trust signal, so they get the loudest treatment.

### Note on Font Substitutes
If Airbnb Cereal VF and Circular are unavailable, **Inter** is the closest open-source substitute. Adjust display headlines down by ~2% in line-height to match Cereal's slightly tighter cap height; otherwise the proportions transfer cleanly.

## Layout

### Spacing System
- **Base unit:** 4px (with 2px micro-step).
- **Tokens:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px.
- **Section padding (vertical):** `{spacing.section}` (64px) for major page bands; tighter than typical SaaS marketing (80–96px) because marketplace pages need higher card density per scroll.
- **Card internal padding:** `{spacing.lg}` (24px) for `{component.host-card}` and `{component.reservation-card}`; `{spacing.base}` (16px) for property-card meta block; `{spacing.sm}` (8px) for caption / date-row gutters.
- **Gutters:** `{spacing.base}` (16px) between cards in the homepage city grid; `{spacing.lg}` (24px) inside footer column gutters; `{spacing.xs}` (4px) on dense category-strip dividers.

### Grid & Container
- **Max content width:** ~1280px centered on the homepage and editorial pages. Listing detail pages cap closer to 1080px to keep the photo banner and reservation rail readable.
- **City link grid (homepage footer):** 6-column grid at desktop with each cell housing a city name in `{typography.title-md}` and a category sub-label in `{typography.body-sm}` muted.
- **Listing detail:** 2-column with photo / amenity body on the left (~64% width) and a sticky reservation card (`{component.reservation-card}`) on the right (~32%).
- **Footer:** 3-column link list (Support / Hosting / Airbnb) at desktop, collapsing to 1-column on mobile.

### Whitespace Philosophy
The system gives editorial bands 64px of vertical breathing room but compresses card grids — property and city-link cards sit just 16px apart. The contrast is intentional: the page reads as "open hero, dense marketplace below," reinforcing the marketplace nature without overwhelming the visitor at the fold.

## Elevation

The system has essentially **one shadow tier** plus the flat baseline.

- **Flat (no shadow):** Body, hero, footer, all editorial bands — 95% of surfaces.
- **Card hover float:** `box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0` — applied to property cards on pointer hover, the search bar at rest, and the dropdown menus (account menu, language picker, date picker). This is the single shadow definition in the entire system.
- **Modal scrim:** `{colors.scrim}` rendered at 50% opacity — the global modal backdrop. Used on date pickers, login dialogs, language picker.

There are no progressive elevation tiers — the system either has the one shadow or none. Depth comes from photography, the white-on-white surface separation, and rounded-corner clipping rather than from layered shadows.

## Components

### Buttons

**`button-primary`** — Rausch fill, white text, 8px radius, 14×24px padding, 48px height, weight 500. The most common CTA across the system: "Reserve", "Continue", "Search", account-flow primaries.

**`button-primary-active`** — The press state. Background flips to `{colors.primary-active}`. No transform, no shadow change.

**`button-primary-disabled`** — Pale Rausch tint at #ffd1da with white text. Cursor not-allowed.

**`button-secondary`** — White fill with ink text and a 1px ink outline. 8px radius. Used for "Save", "Cancel", and inverse CTAs over Rausch surfaces.

**`button-tertiary-text`** — Plain ink text, no surface, no border. Underlined on hover. Used for "Show more" type links and modal close labels.

**`button-pill-rausch`** — A pill-shaped Rausch CTA used on featured cells (e.g., "Become a host" sub-CTA) — 9999px radius, 10×20px padding, 14px label.

### Search Surface

**`search-bar-pill`** — The signature global search bar. White fill, 9999px radius, 64px height, 1px hairline 1px-shadow border. Internally divided by vertical hairline rules into `{component.search-field-segment}` cells (Where / When / Who). Each segment holds an uppercase caption label above a placeholder line in `{typography.caption}`.

**`search-orb`** — The circular Rausch orb terminating the right edge of the search bar. 48×48px, fully rounded, white magnifying-glass icon centered. The hottest single color moment on the homepage.

### Top Navigation

**`top-nav`** — White surface, 80px height, 1px bottom hairline. The Airbnb wordmark sits flush left, the three product tabs (Homes / Experiences / Services) sit in the dead center, and account utilities (host link, language globe, account menu) sit flush right.

**`product-tab-active`** — Ink label in `{typography.nav-link}`, 32px hand-illustrated icon, 2px ink underline rule beneath the icon-label pair.

**`product-tab-inactive`** — Muted label, illustrated icon, no underline. Becomes active on click.

**`new-tag`** — A tiny rounded-pill badge (`{rounded.full}`) anchored top-right of an icon, carrying the uppercase "NEW" label in `{typography.uppercase-tag}` (8px / 700 with 0.32px tracking, uppercase). Used on Experiences and Services to signal recency.

### Listing Cards

**`property-card`** — A photo-first card. 1:1 aspect-ratio image with `{rounded.md}` corner clipping, image carousel dots overlay, "Guest favorite" floating badge top-left (`{component.guest-favorite-badge}`), and a heart icon top-right (`{component.icon-button-circle}` in default outlined state, Rausch-filled when saved). Beneath the image: 4–5 lines of meta — title (`{typography.title-md}`), distance / dates (`{typography.body-sm}` muted), and price ("$X night") right-aligned.

**`property-card-photo`** — The photo plate itself, separated as a token because some surfaces (wishlist, search results) reuse just the photo without the meta block.

**`experience-card`** — A taller-aspect card (4:5) for experience listings. Same `{rounded.md}` clipping, floating "NEW" badge top-left, heart top-right, and a single-line title beneath.

**`guest-favorite-badge`** — White rounded pill (`{rounded.full}`) at 11px / 600 weight. Sits over the photo with the system's only shadow tier applied for elevation.

### Listing Detail

**`rating-display-card`** — The signature listing-detail moment. A 64px / 700 rating number ("4.81") flanked left and right by tiny laurel-wreath SVG ornaments. Beneath the rating: "Guest favorite" tagline and a row of ink stat columns. The largest typographic weight in the whole system.

**`amenity-row`** — A 1-column list of amenity icons + ink labels in `{typography.body-md}`. 12px row padding, no border between rows; section is closed by a 1px hairline divider above and below.

**`reviews-card`** — A 2-column grid of review excerpts. Each column holds an author row (avatar, name, date) above a 3-line excerpt with "Show more" tertiary link.

**`host-card`** — A white card with `{rounded.md}` rounding and 24px padding holding a host avatar, name, "Superhost" badge, response-rate stat, and a "Contact host" `{component.button-secondary}`.

**`reservation-card`** — The sticky right-rail card on listing detail pages. White surface, `{rounded.md}` rounding, 1px hairline border, 1px shadow tier elevation, 24px padding. Contains: nightly price (`{typography.display-md}` ink), date-range selector, guest-count stepper, "Reserve" primary CTA full-width, and a fee breakdown stack beneath in `{typography.body-sm}`.

### Date Picker

**`date-picker-day`** — A 40×40px circular cell carrying the day number in `{typography.body-sm}`. Default state is transparent fill, ink text.

**`date-picker-day-selected`** — Ink fill, white text, full circle (`{rounded.full}`). Range states between two selected days carry a `{colors.surface-soft}` lozenge background that connects them.

### Forms

**`text-input`** — White surface, 1px hairline outline, `{rounded.sm}` 8px radius, 56px height, 14×12px padding. Stacked label above (in `{typography.caption}` muted), placeholder text in `{typography.body-md}` muted. On focus, the border thickens to 2px ink and the border color flips to `{colors.ink}` — no glow, no ring.

### Footer

**`footer-light`** — White surface (matches the page canvas — Airbnb has no contrast footer), 48×80px padding. Three columns of link blocks (Support / Hosting / Airbnb), separated by generous 24px gutters. Each column heads with a `{typography.title-sm}` ink label and stacks `{component.footer-link}` rows in `{typography.body-sm}` ink.

**`legal-band`** — A bottom strip beneath the footer columns carrying the copyright line, language picker (globe icon + "English (US)" link), currency picker, and social icons (Facebook, X, Instagram). All text in muted `{colors.muted}` at `{typography.caption-sm}`.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 744px | Top nav collapses to logo + hamburger; product tabs hide behind a sheet; search bar collapses to a single tappable pill; property cards stack 1-up; city grid 1-column; listing detail collapses reservation card to a sticky bottom bar. |
| Tablet | 744–1128px | Top nav keeps product tabs but search bar narrows; property cards 2-up; city grid 2–3 column; reservation card stays sticky right-rail at narrower width. |
| Desktop | 1128–1440px | Full top nav with three product tabs centered; search bar at full pill width with all 3 segments visible; property cards 4-up; city grid 6-column; listing detail 2-column with reservation rail. |
| Wide | > 1440px | Content width caps at 1440px on listing/search pages and ~1280px on editorial; gutters absorb the rest. |

### Touch Targets
- Primary CTAs at minimum 48×48px (above WCAG AAA).
- Search orb is 48×48px circular — the most-tapped element on the page.
- Heart save button is 32×32px circular — borderline for AAA but compensated by a generous 12px padding inside the photo card.
- Date-picker day cells are 40×40px circular.

### Collapsing Strategy
- Top product tabs collapse into a hamburger sheet below 744px.
- Search bar's 3 segments collapse into a single-tap entry that opens a full-screen search overlay on mobile.
- Property and city-link grids drop column counts cleanly at each breakpoint — never reflow rows; always reduce columns.
- Reservation card on listing detail switches from sticky right-rail to a sticky bottom bar on mobile, carrying just the "Reserve" CTA + nightly price summary.

## Known Gaps

- **Hover state colors:** intentionally not documented per the global no-hover policy — Airbnb's actual `:hover` styling for property cards is a subtle elevation lift, but precise extraction is unreliable.
- **Loading states / skeleton screens:** not visible on the extracted surfaces.
- **Map view styling:** the search-results map uses Mapbox-tinted tiles with custom Rausch markers; not captured here.
- **Form input error states:** error text color (`{colors.primary-error-text}`) is documented, but the full input outline + helper-text combination on validation failure was not visible in the captured surfaces.
- **Sub-brand palettes:** Luxe (`{colors.luxe}`) and Plus (`{colors.plus}`) are documented as tokens, but their full sub-system (typography overrides, surface treatment) lives on separate sub-domains and is not captured here.



## Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator (iPhone 17 Pro, accessories grid) introduces a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The environment page leans darker and more editorial. Across all five surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.

## Colors

> **Source pages analyzed:** homepage, environment, store, iPhone 17 Pro buy page, accessories index. The color system is identical across all five surfaces; only the surface-mode mix differs.

### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs ("Learn more", "Buy"), and the focus ring root. This is Apple's quiet but universal "click me" signal. Press state shifts to a slightly darker variant via the active scale transform rather than a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): A marginally brighter sibling of Action Blue, reserved for the keyboard focus ring on buttons (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): A brighter blue used on dark surfaces for in-copy links and inline callouts, where Action Blue would disappear against the tile background.

### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): The dominant canvas. Content, utility cards, store tiles, configurator grids.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): The signature Apple off-white. Used for alternating light tiles, footer region, and the default page canvas in store utility sections. Just different enough from white to create rhythm.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): A near-white used as the fill for secondary "ghost" buttons — lighter than the parchment canvas so the button still reads as a button against `{colors.canvas-parchment}`.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): The primary dark-tile surface on the homepage product grid.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): A micro-step lighter — used where a dark tile sits directly above or below Tile 1 to create the faintest separation.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): A micro-step darker — used at the bottom of the stack and in embedded video/player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — video player backgrounds, edge-to-edge photographic overlays, the global nav bar background.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7): The base hex of the translucent gray chip used over photography for circular control buttons. In production, applied at ~64% alpha as `rgba(210, 210, 215, 0.64)`.

### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): The voice of every headline, every body paragraph, and the dark utility button's fill. Chosen instead of pure black to keep the page feeling photographic rather than printed.
- **Body** (`{colors.body}` — #1d1d1f): Same hex as ink — Apple uses one near-black tone for all text on light surfaces.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles and on the global nav bar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on the white Pearl Button surface — slightly softer than pure black.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled button text and legal fine-print.

### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0): The "border" tone on secondary buttons — functions as a ring shadow rather than a hard line. In production, often applied as `rgba(0, 0, 0, 0.04)`.
- **Hairline** (`{colors.hairline}` — #e0e0e0): The 1px hairline border on store utility cards and configurator chips.

### Brand Gradient
**No decorative gradients.** Atmospheric depth on product photography (the iPhone 17 Pro camera plate, the Apple Watch bands, AirPods reflections) is inherent to the imagery, not a CSS gradient overlay. The environment page's hero uses photographic atmosphere (mountain vista at dawn) but no gradient tokens are defined. Apple is the rare luxury-brand site with zero gradient-based design tokens.

## Typography

### Font Family
- **Display**: `SF Pro Display, system-ui, -apple-system, sans-serif` — Apple's proprietary display face, optimized for sizes ≥ 19px. Defines the voice of every headline.
- **Body / UI**: `SF Pro Text, system-ui, -apple-system, sans-serif` — the text-optimized variant used for body copy, captions, buttons, and links below 20px.
- **OpenType features**: `font-variant-numeric: numerator` is enabled on numeric links (pricing tables, spec sheets). Display sizes rely on tight tracking rather than contextual ligatures.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.28px | Hero headline; the signature "Apple tight" tracking |
| `{typography.display-lg}` | 40px | 600 | 1.10 | 0 | Tile headlines atop every product tile |
| `{typography.display-md}` | 34px | 600 | 1.47 | -0.374px | Section heads (SF Pro Text at display proportions) |
| `{typography.lead}` | 28px | 400 | 1.14 | 0.196px | Product tile subcopy |
| `{typography.lead-airy}` | 24px | 300 | 1.5 | 0 | Environment-page lead paragraphs (the rare weight 300) |
| `{typography.tagline}` | 21px | 600 | 1.19 | 0.231px | Sub-tile tagline; sub-nav category name |
| `{typography.body-strong}` | 17px | 600 | 1.24 | -0.374px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `{typography.dense-link}` | 17px | 400 | 2.41 | 0 | Footer / store utility link lists (relaxed leading) |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.224px | Secondary captions, button text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.224px | Emphasized captions |
| `{typography.button-large}` | 18px | 300 | 1.0 | 0 | Store hero CTAs (the rare weight 300) |
| `{typography.button-utility}` | 14px | 400 | 1.29 | -0.224px | Utility/nav button labels |
| `{typography.fine-print}` | 12px | 400 | 1.0 | -0.12px | Fine-print, footer body |
| `{typography.micro-legal}` | 10px | 400 | 1.3 | -0.08px | Micro legal disclaimers |
| `{typography.nav-link}` | 12px | 400 | 1.0 | -0.12px | Global nav menu items |

### Principles

- **Negative letter-spacing at display sizes.** Every headline at 17px and up carries a slight tracking tighten (`-0.12 → -0.374px`). This produces the iconic "Apple tight" headline cadence. Never used at 12px or below.
- **Body copy at 17px, not 16px.** Apple breaks the SaaS convention and runs paragraph text at 17px. The extra pixel gives the page an unmistakable "reading, not scanning" pace.
- **Weight 300 is real and rare.** Used deliberately on a handful of large-size reads (`{typography.button-large}` at 18px/300 and `{typography.lead-airy}` at 24px/300). It's not an accident — it's a light-atmosphere cue reserved for moments where the content should feel airy.
- **Weight 600, not 700, for headlines.** Apple's headlines sit at weight 600. Weight 700 is used sparingly for `{typography.tagline}` (21px) when a touch more assertion is needed.
- **Line-height is context-specific.** Display sizes use 1.07–1.19 (tight). Body uses 1.47. Utility link stacks in the footer/store use an unusually relaxed 2.41 (`{typography.dense-link}`). The 2.41 is not a bug — it's how the footer's dense link columns breathe.
- **Weight 500 is deliberately absent.** The ladder is 300 / 400 / 600 / 700. Mid-weight readings always use 600.

### Note on Font Substitutes
SF Pro is Apple's proprietary system font. When building off-system:

- Use `system-ui, -apple-system, BlinkMacSystemFont` as the first stack entry — on macOS/iOS/Safari this resolves to the real SF Pro.
- For non-Apple platforms, **Inter** (Google Fonts, variable) is the closest open-source equivalent. Inter at weight 600 with `font-feature-settings: "ss03"` approximates SF Pro's rounded "a" character.
- Nudge `letter-spacing` down by `-0.01em` on display sizes to re-create the Apple tight feel; Inter's default tracking runs slightly wider than SF Pro.
- For body text, tighten line-height by `0.03` (from 1.47 → 1.44) when substituting Inter — Inter's taller x-height needs less leading.

## Layout

### Spacing System
- **Base unit:** 8px. Sub-base values (2, 4, 5, 6, 7) are used for tight typographic adjustments; structural layout snaps to 8/12/16/20/24.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 17px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section vertical padding:** `{spacing.section}` (80px) inside a product tile; tiles stack edge-to-edge with 0 gap (the color change provides the break).
- **Card padding:** `{spacing.lg}` (24px) inside utility grid cards.
- **Button padding:** 8–11px vertical, 15–22px horizontal.
- **Universal rhythm constants:** the 17px body line-height multiplier (~25px line) and 21px tagline size show up on every analyzed page.

### Grid & Container
- **Max content width:** ~980px on text-heavy sections (environment), ~1440px on product grids (store, accessories), full-bleed for product tiles (homepage).
- **Column patterns:** 3 to 5 column utility card grid on store/accessories; 2-column side-by-side tiles on homepage occasional sections; single-column centered stack on product tile heroes.
- **Gutters:** 20–24px between cards in a utility grid.

### Whitespace Philosophy
Apple's whitespace is the product's pedestal. Every tile begins with at least 64px of air above its headline and 48–64px below. Product renders are never crowded; the nearest content to a product image is at least 40px away. The footer is the only area that breaks this — there, Apple goes deliberately dense to make the full information architecture visible at a glance.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and the iPhone buy floating sticky bar |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product renders resting on a surface (the only true "shadow" in the system) |

**Shadow philosophy.** Apple uses **exactly one** drop-shadow, and it is applied to photographic product imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars. The single shadow is about giving the product weight, not about UI hierarchy.

### Decorative Depth
- **Atmospheric imagery** on the environment page (photographic vista) supplies mood; no CSS gradient involved.
- **Edge-to-edge tile alternation** creates rhythm without borders or shadows — the color change itself is the divider.
- **Backdrop-filter blur** on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` creates a "floating over content" effect that's functional, not decorative.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed product tiles (no corner rounding) |
| `{rounded.xs}` | 5px | Inline links when styled as subtle chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons (Sign In, Bag), inline card imagery |
| `{rounded.md}` | 11px | White Pearl Button capsules |
| `{rounded.lg}` | 18px | Store utility cards, accessories grid cards |
| `{rounded.pill}` | 9999px | Primary blue pill CTAs, sub-nav buy button, configurator option chips, search input — the signature Apple pill |
| `{rounded.full}` | 9999px / 50% | Circular control chips floating over photography |

### Photography Geometry
- **Hero imagery**: full-bleed, 21:9 or taller on the homepage; 16:9 on environment and shop pages. Product renders are photographic-realistic, often shot on a tinted surface that becomes the tile background.
- **Product renders**: PNG/WebP with transparency; rest on a surface tile and pick up the system shadow.
- **Accessory grid**: square 1:1 crops at `{rounded.lg}` (18px) radius, light neutral backgrounds, product centered with 20–40px internal padding.
- **No rounded imagery in hero tiles** — images are full-bleed rectangular. Rounding (`{rounded.sm}`, `{rounded.lg}`) appears only on inline card imagery.
- Lazy-loading via responsive `srcset` and `sizes` across all breakpoints; CDN-optimized WebP.

## Components

### Top Navigation

**`global-nav`** — Persistent, ultra-thin black nav bar pinned to the top of every page. Background `{colors.surface-black}`, height 44px, text `{colors.on-dark}` in `{typography.nav-link}` (12px / 400 / -0.12px tracking). Links are quiet, spaced ~20px apart, running edge-to-edge across the top. Right-aligned cluster: Search, Bag icons — always visible. On mobile, collapses to hamburger at ~834px and the Apple logo centers.

**`sub-nav-frosted`** — Surface-specific nav that sticks below the global nav. Background `{colors.canvas-parchment}` at 80% opacity with backdrop-filter blur, creating a frosted-glass effect. Height 52px. Content on left: product category name ("iPhone", "Store", "Accessories") in `{typography.tagline}` (21px / 600). Content right: inline nav links in `{typography.button-utility}` (14px), ending in a persistent `{component.button-primary}` ("Buy") or a utility link.

### Buttons

**`button-primary`** — The signature Apple action. Background `{colors.primary}` (Action Blue #0066cc), text `{colors.on-primary}` in `{typography.body}` (SF Pro Text 17px / 400), rounded `{rounded.pill}` (full pill — capsule-shaped), padding 11px × 22px. The full-pill radius IS the brand action signal.
- Active state: `{component.button-primary-active}` — `transform: scale(0.95)` (the system-wide micro-interaction).
- Focus state: `{component.button-primary-focus}` — 2px solid `{colors.primary-focus}` outline.

**`button-secondary-pill`** — Used as the second CTA when two blue pills appear together ("Learn more" / "Buy"). Background transparent, text `{colors.primary}`, 1px solid `{colors.primary}` border, rounded `{rounded.pill}`, padding 11px × 22px. Reads as a "ghost pill."

**`button-dark-utility`** — Global nav actions (Sign In, Bag, language selector). Background `{colors.ink}` (#1d1d1f), text `{colors.on-dark}` in `{typography.button-utility}` (14px / 400 / -0.224px tracking), rounded `{rounded.sm}` (8px), padding 8px × 15px. Active state shrinks via `transform: scale(0.95)`.

**`button-pearl-capsule`** — Product-card secondary button. Background `{colors.surface-pearl}` (#fafafc), text `{colors.ink-muted-80}` in `{typography.caption}` (14px), 3px solid `{colors.divider-soft}` border (functions as a soft ring rather than a visible line), rounded `{rounded.md}` (11px), padding 8px × 14px.

**`button-store-hero`** — A larger primary CTA used on store hero surfaces. Same Action Blue + Paper White as `{component.button-primary}`, but with `{typography.button-large}` (18px / 300 — note the rare weight 300) and slightly more padding (14px × 28px). Used sparingly on the store landing.

**`button-icon-circular`** — Floats over photography. 44 × 44px, background `{colors.surface-chip-translucent}` at ~64% alpha, icon in `{colors.ink}`, rounded `{rounded.full}`. Used for carousel controls, close buttons, and in-image controls (product image thumbnails on the iPhone buy page).

**`text-link`** — Inline body links in `{colors.primary}` (Action Blue). Underlined or non-underlined per context.

**`text-link-on-dark`** — Inline body links on dark tiles in `{colors.primary-on-dark}` (Sky Link Blue #2997ff) — Action Blue would disappear against `{colors.surface-tile-1}`.

### Cards & Containers

**`product-tile-light`** — Full-bleed light tile. Background `{colors.canvas}` (white), text `{colors.ink}`, rounded `{rounded.none}` (0 — tiles touch edges), vertical padding `{spacing.section}` (80px). Centered stack: product name in `{typography.display-lg}` (40px / 600) → one-line tagline in `{typography.lead}` (28px / 400) → two `{component.button-primary}` CTAs ("Learn more" / "Buy") → product render resting on the surface with the system shadow.

**`product-tile-parchment`** — Same as `{component.product-tile-light}` but on `{colors.canvas-parchment}` (#f5f5f7). Used to break two consecutive white tiles.

**`product-tile-dark`** — Full-bleed dark tile. Background `{colors.surface-tile-1}` (#272729), text `{colors.on-dark}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Same content stack as the light tile but with `{component.text-link-on-dark}` for inline copy and `{component.button-primary}` (Action Blue still works on the dark surface). Used on the homepage product grid as the alternating dark band.

**`product-tile-dark-2`** — Variant on `{colors.surface-tile-2}` (#2a2a2c). Used where a dark tile sits directly above or below `{component.product-tile-dark}` to create the faintest separation through micro-step lightness change.

**`product-tile-dark-3`** — Variant on `{colors.surface-tile-3}` (#252527). Used at the bottom of the stack and in embedded video/player frames.

**`store-utility-card`** — Used in store grid and accessories grid. Background `{colors.canvas}` (white), 1px solid `{colors.hairline}` border, rounded `{rounded.lg}` (18px), padding `{spacing.lg}` (24px). Top: product image (1:1 crop with `{rounded.sm}` (8px) inner image radius). Below: product name in `{typography.body-strong}` (17px / 600), price in `{typography.body}` (17px / 400), and a `{component.text-link}` ("Buy" or "Learn more"). No shadow by default; product render itself carries the system product-shadow.

**`configurator-option-chip`** — Pill-shaped tappable cell used in the iPhone 17 Pro buy page. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.caption}`, rounded `{rounded.pill}`, padding 12px × 16px. Contains a small product thumbnail + label + price delta. Arranged in a grid of 4–5 options per row.

**`configurator-option-chip-selected`** — Selected state. Border upgrades to 2px solid `{colors.primary-focus}`. Same shape, same content.

**`environment-quote-card`** — A photographic-canvas hero specific to the environment page. Dark photographic backdrop (mountain vista at dawn) with `{colors.surface-tile-1}` as the fallback color, centered white-text headline in `{typography.display-lg}` (40px), small green "Apple 2030" pictographic logo above the headline, single `{component.button-primary}` below. Padding `{spacing.section}` (80px).

**`floating-sticky-bar`** — Floats at the bottom of the viewport on the iPhone 17 Pro buy page during scroll. Background `{colors.canvas-parchment}` at 80% opacity with `backdrop-filter: blur(N)`, height 64px, padding 12px × 32px. Left: running price total in `{typography.body}`. Right: `{component.button-primary}` ("Add to Bag").

### Inputs & Forms

**`search-input`** — The accessories search input. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.body}` (17px), 1px solid `rgba(0, 0, 0, 0.08)` border, rounded `{rounded.pill}` (full pill — search is also pill-shaped, matching the CTA grammar), padding 12px × 20px, height 44px. Leading icon: search glyph at 14px, muted tint.

Error and validation states were not surfaced in the analyzed pages.

### Footer

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (17px / 400 / 2.41 line-height — the relaxed leading is what makes the dense columns scannable). Column headings in `{typography.caption-strong}` (14px / 600). Legal row at the very bottom in `{typography.fine-print}` (12px / 400) with `{colors.ink-muted-48}` text. Vertical padding 64px.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines in `{typography.hero-display}` or `{typography.display-lg}` with negative letter-spacing (`-0.28 → -0.374px`) to get the signature "Apple tight" cadence.
- Run body copy at `{typography.body}` (17px / 400 / 1.47 / -0.374px) — not 16px. The extra pixel defines the brand's reading pace.
- Alternate `{component.product-tile-light}` (or parchment) and `{component.product-tile-dark}` for full-bleed section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for the primary blue CTA and any other element that should read as an "action" (configurator chips, search input, sticky bar CTA).
- Apply the single product-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to product renders resting on a surface — never on cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button — it's the system-wide micro-interaction.
- Keep the global nav `{colors.surface-black}` (true black) — it's the only place pure black appears on most pages.

### Don't
- Don't introduce a second accent color; every "click me" signal is `{colors.primary}` (Action Blue).
- Don't add shadows to cards, buttons, or text — shadow is reserved for product imagery.
- Don't use gradients as decorative backgrounds; atmosphere comes from photography.
- Don't set body copy at weight 500 — Apple's ladder is 300 / 400 / 600 / 700, with 500 deliberately absent. Body is always 400; strong inline is 600; display is 600.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge; the color change is the divider.
- Don't tighten line-height below 1.47 for body copy — the editorial leading is part of the brand.
- Don't mix radii grammars — use `{rounded.sm}` for compact utility, `{rounded.lg}` for utility cards, `{rounded.pill}` for pills, and nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's the dark-tile-only variant. Action Blue is for light surfaces.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Single-column tiles; sub-nav collapses to category name + primary CTA only; hero typography drops to 28px |
| Phone | 420–640px | Single-column stack; product renders scale to 80% of tile width; hero h1 drops to 34px |
| Large phone | 641–735px | Tiles transition to tighter padding (48px vertical vs 80px); fine-print wraps |
| Tablet portrait | 736–833px | Global nav collapses to hamburger; sub-nav hides category chips, keeps primary CTA |
| Tablet landscape | 834–1023px | Global nav returns fully expanded; 3-column utility grids become 2-column |
| Small desktop | 1024–1068px | Product tiles use 2/3 width with margin gutters; hero h1 stays at 40px |
| Desktop | 1069–1440px | Full layout; 4–5 column store grids; 1440px content max |
| Wide desktop | ≥ 1441px | Content locks at 1440px, margins absorb extra width |

The structural breakpoints that matter for agents: 1440px (content lock), 1068px (small-desktop), 833px (tablet landscape switch), 734px (tablet portrait), 640px (phone), 480px (small phone).

### Touch Targets
- Minimum 44 × 44px. `{component.button-primary}` lands at ~44 × 100px (with the full-pill radius making the visible hit area more generous than the label suggests).
- `{component.button-icon-circular}` is exactly 44 × 44px.
- Global nav utility links are smaller (~32 × 80px) — they deliberately sit at a tighter target because they're precision desktop actions, and the mobile hamburger replaces them at ≤ 833px.

### Collapsing Strategy
- **Global nav**: full horizontal link row on desktop → collapses to Apple logo + hamburger + bag icon at 834px and below.
- **Sub-nav**: category name + inline links + primary CTA → category name + primary CTA only at mobile; inline links move into a hamburger tray.
- **Product tiles**: stack from 2-column to 1-column at 834px; vertical padding tightens from 80px → 48px at small-phone.
- **Utility grids** (store, accessories): 5-col → 4-col (1440px) → 3-col (1068px) → 2-col (834px) → 1-col (640px).
- **Hero typography**: `{typography.hero-display}` (56px) → `{typography.display-lg}` (40px) at 1068px → 34px at 640px → 28px at 419px.

### Image Behavior
- All product imagery uses responsive `srcset` with breakpoint-matched crops.
- Hero photography may switch art direction at mobile (e.g., the environment page's vista crops to a taller aspect ratio on mobile, framing the subject differently).
- Product renders maintain their 1:1 or 4:3 aspect ratios across breakpoints; only scale changes.
- Lazy-loading is default; the above-fold hero loads eagerly.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.product-tile-dark}`, `{component.search-input}`).
2. Variants of an existing component (`-active`, `-focus`, `-2`, `-3`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay SF Pro Display 600 with negative letter-spacing. Body stays SF Pro Text 400 at 17px. The boundary is unbreakable.
6. The single drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) is reserved for product photography only.
7. When in doubt about emphasis: alternate surface (light → dark tile) before adding chrome.

## Known Gaps

- Form validation and error states were not surfaced on the analyzed pages; only the neutral search input is documented.
- The homepage's embedded video/player frame uses `{colors.surface-black}`; interior player controls are not documented (they're a platform widget, not a web-design token).
- Some component imagery is dynamic (rotating product hero) and its specific copy varies per surface — component specs name the structure, not the rotating content.
- Dark-mode counterparts for store and accessories utility cards were not surfaced on the analyzed pages; the system documented is the daytime/light-dominant variant Apple ships by default.
- Atmospheric photography (environment page mountain vista) is a content asset, not a design token; the documented `{component.environment-quote-card}` describes the structural surface only.
- The exact backdrop-filter blur radius on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` is platform-dependent; production CSS uses `saturate(180%) blur(20px)` as a typical baseline but the value isn't formalized as a token.

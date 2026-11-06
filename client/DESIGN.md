# ReelsVault: UI Design Spec

ReelsVault organizes Instagram Reels and YouTube Shorts: save a link, put it in a category, search it later.
This file is the handoff for rebuilding the redesigned UI in the app. The design was made as phone-sized screens (390 x 844) in a Claude Design canvas.

**Direction:** a loud, playful entertainment-app look. Neon "stickers" on a deep violet-black ground, thick outlines, hard offset shadows (no blur), chunky wide headings. Dark theme is the default; a light theme is toggled from the dashboard header.

Rebuild screens one at a time, starting with the Dashboard, and reuse the tokens and components below rather than re-deriving values.

---

## 1. Design tokens

### Themes (swap these; everything else references them)

| Token | Dark | Light | Used for |
|---|---|---|---|
| `bg` | `#130F22` | `#F6F2FF` | Screen background |
| `dots` | `#2B2250` | `#DCD2F4` | Dot pattern on background |
| `surf` | `#221B3D` | `#FFFFFF` | Cards, inputs, sheets, icon buttons |
| `line` | `#4B3C85` | `#B9AEE0` | Quiet borders, dividers |
| `fg` | `#F7F3FF` | `#14102A` | Primary text and icons |
| `mut` | `#B9B0D6` | `#554A7A` | Secondary text, placeholders, chevrons |
| `outline` | `#F7F3FF` | `#14102A` | Strong 2px outlines (thumbnails, primary buttons, sheets) |
| `scrim` | `rgba(19,15,34,0.86)` | `rgba(246,242,255,0.88)` | Dim layer behind sheets and the + menu |
| `pinkText` | `#FF4D8D` | `#D81B64` | Pink used as text (the "Vault" in the wordmark, Log out) |

### Fixed colours (same in both themes)

| Name | Hex | Role |
|---|---|---|
| Accent (lime) | `#C8F53C` | Every category chip and badge, active toggle, primary buttons, logo. User-tweakable (alternatives: `#3DDCFF`, `#FFD43B`, `#B79CFF`) |
| Pink | `#FF4D8D` | + button, hard shadows on primary buttons and the logo badge, decorative circle |
| Cyan | `#3DDCFF` | Decorative accents, Settings group shadow |
| Yellow | `#FFD43B` | Sun icon, Add Category menu pill, sparkle decorations |
| Ink | `#14102A` | Text and icons placed on any bright fill (lime, pink, cyan, yellow). Always dark, never theme-dependent |

Text on bright fills is always Ink. Never put white text on lime, cyan, yellow or pink.

### Category colour
**Dashboard:** all categories share ONE colour, the accent (lime `#C8F53C`), same as the "All" chip. No per-category colours. It is used on: category chips (active state), the category badge on a card, and list-row category pills. Categories are told apart by name and emoji only.

### Typography
- **Display:** Unbounded (weights 600, 800). Wordmark, screen titles, section headings.
- **Body/UI:** DM Sans (weights 500, 700).
- Both are Google Fonts.

| Style | Font | Size / weight | Notes |
|---|---|---|---|
| Hero heading | Unbounded 800 | 34 / line 1.1 | letter-spacing -0.03em (Welcome, Login) |
| Wordmark | Unbounded 800 | 21 (18 on inner screens) | "Reels" in `fg`, "Vault" in `pinkText` |
| Screen title | Unbounded 800 | 20-22 | Settings, Manage Categories, sheet titles |
| Section heading | Unbounded 800 | 16 | "All reels" on dashboard |
| Body | DM Sans 500 | 15-16 | |
| Label / button | DM Sans 700 | 14-17 | |
| Caption | DM Sans 500/700 | 11-13 | Card category name, counts |
| Section eyebrow | DM Sans 700 | 13, letter-spacing 0.12em, uppercase | Settings group labels |

### Shape, borders, shadows
- **Radii:** pills `999`; buttons/inputs `16-18`; cards `16` (grid) / `24` (list, settings groups); bottom sheet top corners `32`; thumbnails inside list rows `16`.
- **Borders:** always 2px. Strong = `outline`; quiet = `line`.
- **Hard shadows (no blur, no spread):** `offsetX offsetY 0 colour`.
  - Dashboard reel cards: no hard shadow (flat, calm)
  - Primary buttons, active chips, logo badge: `3-4 3-4 0` pink (`#FF4D8D`)
  - + button: `5 5 0` accent
  - Settings groups, Manage list, text inputs on login: `4-5 4-5 0` accent / cyan / pink
- **Spacing:** screen side padding 20 (28 on login/welcome); gaps are mostly 10, 12, 14, 16, 22.
- **Touch targets:** minimum 44 x 44.

### Background texture
- **Other screens (Welcome, Login, Settings, sheets):** solid `bg` plus a dot pattern (`dots` colour, 1.5px dots on a 22px grid), a soft pink circle partly off the top-right corner, and small sparkles. Decorative only.
- **Dashboard (calmer):** solid `bg` only, no dot pattern and no sparkles. Just the soft pink circle in the top-right corner (230 x 230, `top:-80 right:-70`, `#FF4D8D`, 22% opacity), behind the header.

---

## 2. Components

### Icon button (round)
46 x 46, circle, `surf` fill, 2px `line` border, `fg` icon. Used for: theme toggle, settings (⋮), back arrow.

### Theme toggle
Icon button in the dashboard header, left of the ⋮ button. Dark mode shows a yellow sun (tap to go light); light mode shows a moon (tap to go dark).

### Search field
Height 48, radius 16, `surf` fill, 2px `line` border, search icon (`mut`) then text input. Placeholder "Search all reels".

### Grid/List segmented toggle
Container with 2px `line` border, `surf` fill, 3px inner padding. Two 44 x 40 buttons. Active button: accent fill with Ink icon. Inactive: transparent with `fg` icon.

### Category chip ("sticker")
Height 44, pill, padding 0 18, DM Sans 700 / 15, icon (emoji) then name. Horizontally scrollable row, gap 10.
- **Inactive:** `surf` fill, 2px `line` border, `fg` text.
- **Active (dashboard):** accent fill, Ink text, transparent 2px border, no shadow, no lift.
- Every chip, including "All" (✦ glyph), uses the same accent colour when active.
- In the Add Reel / Add Category sheets chips keep the earlier sticker look (2px `outline` border, `3 3 0` pink shadow when selected).
- "+ New Category" (in Add Reel): transparent, 2px *dashed* `mut` border.

### Reel card (grid)
Three columns, 12px column gap, 20px row gap, all cards the same size, top-aligned (`align-items: start`), no rotation or stagger.
- Thumbnail: aspect 9:16, radius 18, **2px `outline` border** (white in dark theme, black in light theme), no shadow.
- Top-left: 26px round category badge (accent fill, category emoji, Ink).
- **No play button on the thumbnail.**
- Below: title (13/700, max 2 lines, ellipsis) and category name (11/500, `mut`). Card is one tappable element.

### Reel row (list)
Full-width card, radius 24, 2px `line` border, `surf` fill, padding 10. Left: 68 x 88 thumbnail (radius 16, **2px `outline` border**, no shadow). Middle: title (15/700, 2 lines) and a row with a category pill (accent fill, Ink text, 12/700) plus the source name in `mut`. Right: chevron in `mut`.

### + button (FAB) and add menu
66px circle, pink fill, 2px `outline` border, Ink plus icon, `5 5 0` accent shadow, bottom-right (20px from right, 30px from bottom). When open it rotates 45 degrees (becomes an x), a `scrim` covers the screen, and two pills appear stacked above it, right-aligned:
- **Add Category:** yellow pill, Ink text, dark circular icon.
- **Add Reel:** accent pill, Ink text, dark circular icon.
Each pill: height 56, radius 999, 2px `outline`, `4 4 0` pink shadow.

### Text input
Height 56-58, radius 18, padding 0 18, DM Sans 500 / 16. Standard: 2px `line` border, `bg` fill. Login inputs: 2px `outline` border, `surf` fill, `4 4 0` accent shadow. Label above: DM Sans 700 / 14.

### Primary button
Height 56-58, radius 18, accent fill, Ink text 17/700, 2px `outline` border, `4 4 0` pink shadow.
**Disabled:** `bg`/`surf` fill, 2px `line` border, `mut` text, no shadow. Used for Save Reel (needs a link), Create Category (needs a name), and the round login arrows (need valid input).
**Secondary** (Welcome > Login): transparent, 2px `outline`, `fg` text.

### Round arrow button (login)
68px circle, bottom-right (28px from right and bottom 48). Enabled: accent fill, 2px `outline`, `4 4 0` pink shadow, Ink arrow. Disabled: `surf` fill, 2px `line`, `mut` arrow.

### Bottom sheet
Anchored to the bottom, radius `32 32 0 0`, `surf` fill, 2px `outline` border (none at bottom), padding `12 24 40`, a coloured hard bar above its top edge (accent for Add Reel, pink for Add Category). Drag handle 48 x 5 in `line`. Title row: Unbounded 22 plus a 44px round close button. Behind it: the dashboard dimmed by `scrim`.

### Settings group
Card with radius 24, 2px `outline`, `surf` fill, hard shadow (accent / cyan / pink per group), rows separated by 2px `line` dividers. Each row: 46px rounded-square icon tile in a bright colour (lime, cyan, yellow, pink; Log out uses `fg` with `bg` icon), title 16/700, subtitle 14 `mut`, chevron. Log out row has no subtitle; its label uses `pinkText`.

### Manage-categories row
Drag handle (three lines, `mut`), 46px colour tile with the category emoji, name (17/700), pencil edit button, and a delete (x) button in `pinkText`. Both buttons are 44 x 44. Rows live in one hard-shadowed card (accent).

---

## 3. Screens

Canvas order: top row, then bottom row.

1. **Dashboard** (home)
   - Header: the same logo badge as Welcome (40px, radius 13, accent fill, 2px `outline` border, `3 3 0` pink shadow, rotated -7 degrees, 18px play triangle), wordmark (Unbounded 800 / 21) with the line "Your reel stash", theme toggle, settings (⋮) button. Soft pink circle behind the header (see Background texture).
   - Search field + grid/list toggle.
   - Horizontally scrolling category chips: All, then user categories.
   - Section heading ("All reels" or the selected category's name) with the reel count on the right.
   - Reels as a 3-column grid, or as rows in list mode. Scrolls under the pinned header; bottom padding 130 so the + button never covers content.
   - + button and add menu.
   - Empty state: dashed card, "Nothing here yet" and a hint.
   - Behaviour: chip filters by category; search filters by title; grid/list toggles layout; theme toggle switches theme.
   - Links: ⋮ opens Settings; Add Category / Add Reel items open those sheets.

2. **Welcome**
   Fanned collage of three tilted preview cards (-9, +2, +9 degrees; pink, accent and cyan hard shadows; 2px `outline` border). They show **graffiti-style placeholder art, not real reel thumbnails** (the app has no reel access before sign-in): pink-to-purple card with a lime "WOW" tag, paint drips and a yellow sun; blue-to-cyan card with a yellow lightning bolt and a pink "POP" tag; lime-to-yellow card with a pink smiley and a cyan "LOL" tag. All are Unbounded 800 text with a thick Ink outline over halftone dots or hatching, drawn as SVG, wordmark, hero heading "Save it. Sort it. Find it.", one line of body copy, a primary "Sign up" button and a secondary "Login" button. Login goes to Login (email). Sign up has no screen yet.

3. **Login: email**
   Back arrow + wordmark, heading "Welcome back", "Enter your email address to log in." Email field. Round arrow enables once the field looks like an email, then goes to Login (password).

4. **Login: password**
   Heading "Enter your password", a pill showing the email being used, password field with Show/Hide, "Forgot password?" link (underlined with a pink line). Round arrow enables once a password is typed, then goes to the Dashboard.

5. **Add Reel** (bottom sheet)
   Fields: Category (chips, one selected, plus "+ New Category" which opens Add Category), Link ("Paste the reel / short link"), Title ("e.g. 5-minute pasta recipe"). "Save Reel" is disabled until the link is filled. Close (x) returns to the dashboard.

6. **Add Category** (bottom sheet)
   "Choose Icon": 6-column grid of emoji tiles (36 icons) in a scrollable box with a `bg` background; selected tile has accent fill, 2px `outline`, pink hard shadow. "Category Name" field ("e.g. Work, Inspiration, Recipes"). "Create Category" is disabled until a name is entered.

   Icon set (in order): tag, folder, palette, football, popcorn, headphones, gamepad, lightbulb, burger, briefcase, car, airplane, sparkles, box, pin, target, laptop, pizza, books, shopping bags, music note, clapperboard, weightlifter, fire, camera, microphone, trophy, gem, rocket, coffee, gift, lightning, cyclist, sailboat, basketball, watermelon.

7. **Settings**
   Back arrow + "Settings". Three groups: PROFILE (Name, Email, Password), CATEGORIES (Manage Category, which opens Manage Categories), ACCOUNT (Log out, which goes to Welcome). Name and email values come from the user's account.

8. **Manage Categories**
   Back arrow + "Manage Categories". Helper text: "Touch and drag the handle to reorder categories. Position changes will update on your Dashboard." One card of rows (see component). Deleting the last category shows a dashed empty state.

### Navigation map
Welcome > Login (email) > Login (password) > Dashboard.
Dashboard > Settings > Manage Categories (back goes up one level).
Dashboard + menu > Add Reel / Add Category. Add Reel "+ New Category" > Add Category. Close returns.

---

## 4. Data shown in the designs

Titles and categories are sample data from the existing app: "do what makes you happy", "Isme meri kya galti thi", "test", "Day 14 | 63 horror days challenge", "Har baar mai fas jaata hu", "Reel2". Categories: Try 1 (tag icon), gh (burger icon), Try2 (folder icon). Thumbnails are the user's own saved reels. Source label is "Instagram" for these; YouTube Shorts should get its own label.

A reel record needs: id, title, link, source (Instagram / YouTube Shorts), category id, thumbnail. A category needs: id, name, icon (emoji), order. (No colour field: the dashboard uses the single accent colour.)

---

## 5. Implementation notes

- **Hard shadows:** the offset, blur-free shadows are the signature of this design. CSS `box-shadow: 4px 4px 0 colour` works directly on the web. In React Native, `shadowRadius: 0` with `shadowOffset` works on iOS; Android's `elevation` cannot do this, so draw the shadow as a separate absolutely-positioned View (same size and radius as the card, offset by the shadow amount, filled with the shadow colour) behind the card.
- **Dot pattern:** an SVG pattern or a tiled image as a full-screen background layer.
- **Theme:** store the dark/light choice and pass the token set through context or a theme provider; no screen should hard-code a theme colour except the fixed colours and Ink above.
- **Emoji:** category icons are real emoji chosen by the user; all interface icons (search, grid, list, plus, close, arrows, chevrons, sun/moon, play, lock, mail) are line icons at 2.4-3.2 stroke with round caps.
- **Accessibility:** every icon-only button needs a label (back, close, settings, theme, view toggles, edit, delete). Keep all targets at least 44 x 44.
- **Prototype limits:** saving a reel or creating a category in the prototype only navigates; wire these to real storage. Reordering in Manage Categories is drawn but not draggable in the prototype.

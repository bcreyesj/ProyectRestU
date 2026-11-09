---
name: Restaurante Admin
description: A high-contrast, neo-brutalist operations console for a restaurant manager.
colors:
  navy: "#0f172a"
  navy-raised: "#1e293b"
  nav-active: "#2563eb"
  nav-label: "#475569"
  nav-icon-muted: "#475569"
  nav-foot-muted: "#475569"
  nav-soft-white: "#0f172a"
  ink: "#0f172a"
  ink-strong: "#0f172a"
  ink-deep: "#0f172a"
  muted: "#334155"
  line: "#0f172a"
  surface: "#ffffff"
  surface-hover: "#f1f5f9"
  canvas: "#f8fafc"
  blue: "#1d4ed8"
  blue-hover: "#1e40af"
  blue-soft: "#dbeafe"
  blue-light: "#93c5fd"
  blue-focus: "#93b4fb"
  blue-border-hover: "#b9c9de"
  blue-border-active: "#bac8d9"
  control-border: "#d5deea"
  table-border: "#dbe3ed"
  occupancy-track: "#e9eef5"
  green: "#047857"
  green-soft: "#d1fae5"
  green-deep: "#065f46"
  amber: "#92400e"
  amber-soft: "#fef3c7"
  amber-callout: "#fffbeb"
  amber-border: "#f1d59c"
  red: "#b91c1c"
  red-soft: "#fee2e2"
  violet: "#6d28d9"
  violet-soft: "#f5f3ff"
typography:
  display:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-.04em"
  body:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 800
rounded:
  xs: "0"
  sm: "4px"
  control: "4px"
  md: "4px"
  lg: "4px"
  xl: "4px"
  dialog: "4px"
  xxl: "4px"
  track: "99px"
  pill: "999px"
spacing:
  compact: "8px"
  base: "16px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
    textColor: "{colors.surface}"
  report-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0"
---

# Design System: Restaurante Admin

## Overview

**Creative North Star: "The decisive operations board"**

The manager scans SQL-backed sales, dining-room occupancy, popular dishes, payments, and inventory from a crisp, high-contrast work surface, then opens the matching supported action. A white navigation rail, hard two-pixel ink borders, square corners, and offset slab shadows give the entire console a confident neo-brutalist character. Cobalt blue marks the active destination and interactive actions; emerald, amber, and red remain reserved for healthy, attention, and unavailable states.

The UI reports the data the database actually provides. It does not suggest trends when the views contain no date comparison, fabricate user identity where the application has no authentication, or fill disconnected states with sample values.

**Key Characteristics:**
- A 270px fixed white navigation rail with a 2px ink divider and a responsive drawer on smaller screens.
- A persistent utility header for section-scoped search, SQL connection state, current local date/time, refresh, and local-administration context.
- Four factual KPIs use large 38px numerals; 15px table copy and generous row padding keep records legible.
- Two-pixel ink outlines and solid offset shadows frame panels and actions, with a tactile press state on buttons.
- One SVG line-icon language and consistent state colors carry across navigation, metrics, and actions.

## Colors

### Primary and structure
- **Deep Navy** (`#0f172a`): Fixed navigation surface.
- **Active Cobalt** (`#2563eb`): Active navigation row and interactive emphasis.
- **Slate Support** (`#475569`): Inactive navigation icons, group labels, and secondary rail copy.
- **Action Blue** (`#1d4ed8`): Primary buttons, focus accents, and interactive links; hover shifts to `#1e40af`.
- **Cool Canvas** (`#f8fafc`): Main page background.
- **White Surface** (`#ffffff`): Tables, dialogs, metrics, and report panels.

### Operational states
- **Emerald** (`#047857` on `#d1fae5`): Healthy or available states.
- **Amber** (`#92400e` on `#fef3c7`): Low stock and attention states.
- **Red** (`#b91c1c` on `#fee2e2`): Occupied and unavailable states.
- **Violet** (`#6d28d9` on `#f5f3ff`): Occupancy report icon, not an alert.

### Neutrals
- **Ink** (`#0f172a`): Headings, primary values, outlines, and controls.
- **Supporting Ink** (`#334155`): Supporting text and labels.
- **Divider** (`#0f172a`): Strong component outlines; pale slate remains for subtle row separators.
- **Hover Surface** (`#f1f5f9`): Search field, table hover, and quiet controls.
- **Control and Row Lines** (`#d5deea`, `#d7e0eb`, `#dbe3ed`, `#b9c9de`, `#bac8d9`): Inputs, row dividers, and hover borders.
- **Navigation Ink** (`#8d9bb0`, `#8694a8`, `#c3ccda`, `#e9eef5`): Secondary labels, muted controls, and text on the navy rail.
- **Blue Detail** (`#93c5fd`, `#93b4fb`): Active-nav icon and interactive focus border.
- **Inventory Track** (`#e9eef5`): Background behind the occupancy bar.
- **Connection Callout** (`#fffbeb` with `#f1d59c`): Local SQL Server warning surface and border.
- **Success Toast Ink** (`#065f46`): Text on a pale emerald confirmation surface.

**The State-Color Rule.** Blue means act; emerald means available; amber means review; red means unavailable or occupied. Color is paired with text, never used as the only signal.

## Typography

**Family:** Inter with Segoe UI, Roboto, and Arial system fallbacks.  
**Character:** A familiar UI sans keeps navigation, dense records, and form labels consistent.

### Scale
- **Page title:** 30px / 800, 1.2 line-height, -0.04em tracking; 21px at narrow mobile width.
- **Metric value:** 38px / 800; 19px on narrow mobile.
- **Panel title:** 13px / 700.
- **Dialog title:** 18px / 700.
- **Body:** 15px / 400, 1.5 line-height.
- **Table headings:** 12px / 800, uppercase, .06em tracking. Desktop cells use 15px text and 18px × 24px padding.
- **Compact scale:** 9px badges; 10px meta labels; 11px navigation and support copy; 12px controls; 13px panel titles; 14px body; 15px operation headings; 18px dialog titles; 19px mobile metrics; 21px compact page titles; 23px metrics; 24px page titles.

## Layout

At desktop widths, a 270px fixed sidebar and 84px sticky header frame the work area. The 46px-high global search anchors the utility row. Content is capped at 1580px with 34px horizontal padding. Four KPI summaries sit above sales and occupancy, followed by popular dishes, payment methods, and low-stock inventory.

At 1240px, page padding and metric spacing tighten. At 1020px, the sidebar narrows and KPI content stacks within each tile. At 820px, the sidebar becomes a scrim-backed drawer and report columns stack. At 560px, the header search occupies its own row, KPI cards use a compact two-column layout, and tables scroll horizontally instead of collapsing their data.

**The Fact-First Rule.** KPIs use current values and database-backed context. The supplied views contain no date filter or historical comparison, so the interface does not invent percentage-change claims.

## Elevation and Shapes

- **Resting surface:** `0 4px 0 0 #0f172a` on white cards and panels.
- **Panel emphasis:** `0 6px 0 0 #0f172a` on metric hover and interactive hover.
- **Dialog focus:** `0 8px 0 0 #0f172a` with a darkened, blurred backdrop.
- **Drawer:** `8px 0 0 #0f172a`.
- Buttons, controls, report panels, tables, and dialogs use crisp 2px ink borders and 4px corners; buttons press down 2px and lose their shadow.

## Components

### Navigation and utilities
- The white sidebar uses local SVG line symbols, dark inactive labels, and a cobalt active row with an ink outline and slab shadow.
- The connection widget uses a pale slate fill, dark text, and the same two-pixel ink frame as the report panels.
- Search filters only rows in the current section; `Ctrl/⌘ K` focuses it.
- The status indicator includes text and a colored dot. The profile area is labeled as local administration because no app authentication is defined.

### Metrics and reports
- Metric icons sit in muted blue, emerald, violet, or amber containers; values remain plain text.
- Sales bars use a unified blue fill, a darker blue for the highest seller, crisp navy outlines, exact bold currency labels, and centered waiter names; the matching legend marks the leader the same way. Semantic tables preserve all queried rows.
- Payment reports use a centered 220px donut with a bold, width-constrained total, clearly weighted legend values, and 2px ink outlines around each colored segment; the donut scales down on narrow phones.
- Availability and occupancy badges use explicit labels and paired state colors.
- Empty states distinguish missing data from errors.

### Forms and feedback
- Database actions use the native `<dialog>` element to preserve focus and escape the panel overflow context.
- Inputs have explicit labels, visible blue focus rings, and inline validation errors.
- Submitting disables conflicting controls and displays a spinner; successful actions use a live toast.

## Motion and accessibility

Most interactions use short 180ms state transitions. The refresh icon and submit button animate only while work is in progress. Reduced-motion preferences are respected. Keyboard focus remains visible; live connection and toast states are announced; data tables retain horizontal overflow at narrow widths.

## Do's and Don'ts

### Do
- Show current database values and distinguish empty, loading, disconnected, and error states.
- Keep actions aligned with the supplied stored procedures.
- Preserve table detail when a chart is reduced for scanability.
- Use text with semantic color for status.

### Don't
- Invent KPI trends, user identity, or sample data.
- Use amber for primary actions.
- Hide table overflow by shrinking data labels beyond readability.
- Expose this local administration server to a public network; it has no user authentication.

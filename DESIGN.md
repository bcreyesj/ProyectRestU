---
name: Restaurante Admin
description: A clear, data-first operations console for a restaurant manager.
colors:
  navy: "#0f172a"
  navy-raised: "#1e293b"
  nav-active: "#1e3a5f"
  nav-label: "#8d9bb0"
  nav-icon-muted: "#c3ccda"
  nav-foot-muted: "#8694a8"
  nav-soft-white: "#e9eef5"
  ink: "#172033"
  ink-strong: "#253247"
  ink-deep: "#29364b"
  muted: "#64748b"
  line: "#e2e8f0"
  surface: "#ffffff"
  surface-hover: "#f8fafc"
  canvas: "#f1f5f9"
  blue: "#2563eb"
  blue-hover: "#1d4ed8"
  blue-soft: "#eff6ff"
  blue-light: "#93c5fd"
  blue-focus: "#93b4fb"
  blue-border-hover: "#b9c9de"
  blue-border-active: "#bac8d9"
  control-border: "#d5deea"
  table-border: "#dbe3ed"
  occupancy-track: "#e9eef5"
  green: "#047857"
  green-soft: "#ecfdf5"
  green-deep: "#065f46"
  amber: "#92400e"
  amber-soft: "#fef3c7"
  amber-callout: "#fffbeb"
  amber-border: "#f1d59c"
  red: "#b91c1c"
  red-soft: "#fef2f2"
  violet: "#6d28d9"
  violet-soft: "#f5f3ff"
typography:
  display:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.035em"
  body:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 650
rounded:
  xs: "5px"
  sm: "8px"
  control: "9px"
  md: "10px"
  lg: "11px"
  xl: "12px"
  dialog: "14px"
  xxl: "16px"
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
    padding: "0 14px"
    height: "40px"
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

**Creative North Star: "The restaurant operations console"**

The manager scans SQL-backed sales, dining-room occupancy, popular dishes, payments, and inventory from one quiet work surface, then opens the matching supported action. A deep navy rail anchors navigation while a cool slate canvas and white data panels keep dense records legible. Blue identifies interactive actions; emerald, amber, and red are reserved for healthy, attention, and unavailable states.

The UI reports the data the database actually provides. It does not suggest trends when the views contain no date comparison, fabricate user identity where the application has no authentication, or fill disconnected states with sample values.

**Key Characteristics:**
- Fixed dark navigation with a compact, responsive drawer on smaller screens.
- A persistent utility header for section-scoped search, SQL connection state, current local date/time, refresh, and local-administration context.
- Four factual KPIs lead into reports; data tables remain the complete source of detail.
- One SVG line-icon language and consistent state colors carry across navigation, metrics, and actions.

## Colors

### Primary and structure
- **Deep Navy** (`#0f172a`): Fixed navigation surface.
- **Raised Navy** (`#1e293b`): Brand mark and active navigation field.
- **Action Blue** (`#2563eb`): Primary buttons, focus accents, and interactive links; hover shifts to `#1d4ed8`.
- **Cool Canvas** (`#f1f5f9`): Main page background.
- **White Surface** (`#ffffff`): Tables, dialogs, metrics, and report panels.

### Operational states
- **Emerald** (`#047857` on `#ecfdf5`): Healthy or available states.
- **Amber** (`#92400e` on `#fef3c7`): Low stock and attention states.
- **Red** (`#b91c1c` on `#fef2f2`): Occupied and unavailable states.
- **Violet** (`#6d28d9` on `#f5f3ff`): Occupancy report icon, not an alert.

### Neutrals
- **Ink** (`#172033`): Headings and primary values.
- **Strong Ink** (`#253247`, `#29364b`): Secondary headings and emphasized row names.
- **Muted** (`#64748b`): Supporting text and labels.
- **Divider** (`#e2e8f0`): Panel borders, table separators, and control outlines.
- **Hover Surface** (`#f8fafc`): Search field, table hover, and quiet controls.
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
- **Page title:** 24px / 700, 1.25 line-height, -0.035em tracking; 21px at narrow mobile width.
- **Metric value:** 23px / 700; 19px on narrow mobile.
- **Panel title:** 13px / 700.
- **Dialog title:** 18px / 700.
- **Body:** 14px / 400, 1.5 line-height.
- **Table and control labels:** 10–12px / 550–700; table headings are uppercase with restrained tracking.
- **Compact scale:** 9px badges; 10px meta labels; 11px navigation and support copy; 12px controls; 13px panel titles; 14px body; 15px operation headings; 18px dialog titles; 19px mobile metrics; 21px compact page titles; 23px metrics; 24px page titles.

## Layout

At desktop widths, a 256px fixed sidebar and 72px sticky header frame the work area. Content is capped at 1580px with 34px horizontal padding. Four compact KPI summaries sit above sales and occupancy, followed by popular dishes, payment methods, and low-stock inventory.

At 1240px, page padding and metric spacing tighten. At 1020px, the sidebar narrows and KPI content stacks within each tile. At 820px, the sidebar becomes a scrim-backed drawer and report columns stack. At 560px, the header search occupies its own row, KPI cards use a compact two-column layout, and tables scroll horizontally instead of collapsing their data.

**The Fact-First Rule.** KPIs use current values and database-backed context. The supplied views contain no date filter or historical comparison, so the interface does not invent percentage-change claims.

## Elevation and Shapes

- **Quiet surface:** `0 1px 2px rgb(15 23 42 / 5%)` on bordered white panels.
- **Panel emphasis:** `0 4px 14px rgb(15 23 42 / 4%)` on metric hover.
- **Dialog focus:** `0 24px 70px rgb(15 23 42 / 24%)` with a blurred, darkened backdrop.
- **Drawer:** `12px 0 32px rgb(15 23 42 / 20%)`.
- Buttons and controls use 8–9px corners; report panels 12px; dialogs 14–16px.

## Components

### Navigation and utilities
- The sidebar uses local SVG line symbols, labeled buttons, and a distinct active row.
- Search filters only rows in the current section; `Ctrl/⌘ K` focuses it.
- The status indicator includes text and a colored dot. The profile area is labeled as local administration because no app authentication is defined.

### Metrics and reports
- Metric icons sit in muted blue, emerald, violet, or amber containers; values remain plain text.
- Canvas charts summarize; semantic tables preserve all queried rows.
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

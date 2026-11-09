---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/styles.css","public/app.js"]
---

# Restaurante administration dashboard

## Scope and visitor mode

The root page is an Operate surface for a restaurant's owner or manager.

## Audience and task

The manager reviews current report data and navigates to the matching catalog, customer, order/payment, or inventory operation.

## Content and constraints

Use the five SQL Server report views and the stored procedures provided in `BDRes.txt`. Do not show demo values as live data. The schema has no report date filters, customer update/delete procedures, order-line entry procedure, or automatic order total calculation.

## Chosen direction

A clean neo-brutalist operations board: white navigation with dark labels and cobalt active state, a near-white slate workspace, and white report surfaces with crisp 2px ink outlines and offset slab shadows. Emerald/amber/red remain text-paired operational states. A persistent 84px desktop utility header filters the active section and shows database state, local date/time, refresh, and local-administration context. The first screen leads with four truthful KPIs in 38px numerals and then the five supplied report views. Desktop tables use 12px tracked uppercase headers and 15px cells with generous padding. Search filters only rows in the current section. Responsive behavior changes the rail into a drawer, stacks report columns, and keeps compact mobile type.

## Memorable moment

The manager can scan sales, occupied tables, popular dishes, payment methods, and low-stock warnings together, then jump directly to a supported database operation.

## Open decisions

The required SQL Server login and listener configuration depend on the local installation. Amounts are currently formatted as MXN based on the `rfc_cliente` field in the supplied schema; confirm or change the currency if needed. The report views have no date filters or historical comparisons, so percentage-change claims are intentionally omitted.

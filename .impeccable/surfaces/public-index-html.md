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

A clean operations console: deep navy navigation, a cool slate workspace, white report surfaces, blue primary actions, and emerald/amber/red text-paired statuses. A persistent utility header filters the active section and shows the database state, current local date/time, refresh, and local-administration context. The first screen leads with four truthful KPIs and then the five supplied report views. Search filters only rows in the current section. Responsive behavior narrows the rail, changes it into a drawer, and stacks report columns on mobile.

## Memorable moment

The manager can scan sales, occupied tables, popular dishes, payment methods, and low-stock warnings together, then jump directly to a supported database operation.

## Open decisions

The required SQL Server login and listener configuration depend on the local installation. Amounts are currently formatted as MXN based on the `rfc_cliente` field in the supplied schema; confirm or change the currency if needed. The report views have no date filters or historical comparisons, so percentage-change claims are intentionally omitted.

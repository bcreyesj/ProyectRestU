# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Restaurant owners or managers who need to review operations and update restaurant data.

## Product Purpose

Provide a browser-based administration dashboard for reviewing SQL Server restaurant reports and performing supported operations through the database's stored procedures.

## Positioning

The dashboard combines the five reports and eight requested database operations from the supplied restaurant schema in one Spanish-language administration surface.

## Operating Context

The manager uses the panel to review sales, popular dishes, low stock, payment methods, and dining-area occupancy, then manages dishes, customers, orders, payments, and inventory.

## Capabilities and Constraints

- The backend connects to a local SQL Server database named `restaurante`, using Windows integrated authentication by default and optional SQL credentials.
- Report data comes from `vw_ReporteVentasPorMesero`, `vw_PlatillosMasVendidos`, `vw_ReporteStockBajo`, `vw_ReporteIngresosPorMetodoPago`, and `vw_OcupacionPorArea`.
- Mutations must use the supplied stored procedures: `sp_CrearPlatillo`, `sp_ObtenerPlatillosPorCategoria`, `sp_ActualizarPrecioPlatillo`, `sp_EliminarPlatillo`, `sp_RegistrarCliente`, `sp_AbrirOrden`, `sp_ProcesarPagoTransaccion`, and `sp_ReabastecerIngrediente`.
- The supplied schema does not define authentication or authorization behavior for this web application.
- Amounts are currently formatted as MXN based on the `rfc_cliente` field in the supplied schema; this is an implementation assumption to confirm if the restaurant uses another currency.

## Evidence on Hand

The supplied `BDRes.txt` SQL Server script defines the restaurant database schema, views, and stored procedures. No product logo, production data export, or brand guide was supplied.

## Product Principles

- Show database-backed operational facts without presenting sample values as live data.
- Keep each write aligned to the stored procedures that define the supported operation.
- Make report and form states understandable to a manager at a glance.

## Accessibility & Inclusion

Use semantic controls, visible keyboard focus, and responsive layouts.

const express = require("express");
const { getPool, sql } = require("../db");

const router = express.Router();

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function route(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requiredText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw httpError(400, `${label} es obligatorio y debe tener máximo ${maxLength} caracteres.`);
  }
  return value.trim();
}

function positiveInt(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw httpError(400, `${label} debe ser un número entero mayor que cero.`);
  }
  return number;
}

function positiveAmount(value, label, allowZero = false) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number === 0)) {
    throw httpError(400, `${label} debe ser ${allowZero ? "un número igual o mayor que cero" : "mayor que cero"}.`);
  }
  return number;
}

router.get("/health", route(async (req, res) => {
  const pool = await getPool();
  await pool.request().query("SELECT 1 AS connected");
  res.json({ status: "ok", database: process.env.DB_NAME || "restaurante" });
}));

router.get("/reports", route(async (req, res) => {
  const pool = await getPool();
  const [sales, topDishes, lowStock, paymentMethods, occupancy] = await Promise.all([
    pool.request().query("SELECT * FROM dbo.vw_ReporteVentasPorMesero ORDER BY Total_Vendido DESC"),
    pool.request().query("SELECT * FROM dbo.vw_PlatillosMasVendidos ORDER BY Total_Unidades_Vendidas DESC"),
    pool.request().query("SELECT * FROM dbo.vw_ReporteStockBajo ORDER BY nombre"),
    pool.request().query("SELECT * FROM dbo.vw_ReporteIngresosPorMetodoPago ORDER BY Total_Ingresado DESC"),
    pool.request().query("SELECT * FROM dbo.vw_OcupacionPorArea ORDER BY Area")
  ]);
  res.json({
    salesByWaiter: sales.recordset,
    topDishes: topDishes.recordset,
    lowStock: lowStock.recordset,
    paymentsByMethod: paymentMethods.recordset,
    occupancyByArea: occupancy.recordset
  });
}));

router.get("/lookups", route(async (req, res) => {
  const pool = await getPool();
  const [categories, waiters, tables, paymentMethods, openOrders, ingredients] = await Promise.all([
    pool.request().query("SELECT id_categoria, nombre FROM dbo.categorias_menu ORDER BY nombre"),
    pool.request().query(`
      SELECT e.id_empleado, e.nombre, r.nombre AS rol
      FROM dbo.empleados e
      INNER JOIN dbo.roles r ON r.id_rol = e.id_rol
      WHERE LOWER(r.nombre) IN ('mesero', 'mesera')
      ORDER BY e.nombre
    `),
    pool.request().query(`
      SELECT id_mesa, numero_mesa, capacidad
      FROM dbo.mesas
      WHERE estado = 'Disponible'
      ORDER BY numero_mesa
    `),
    pool.request().query("SELECT id_metodo, nombre FROM dbo.metodos_pago ORDER BY nombre"),
    pool.request().query(`
      SELECT id_orden, id_mesa, estado
      FROM dbo.ordenes
      WHERE estado IN ('En Proceso', 'Servida')
      ORDER BY fecha_hora DESC
    `),
    pool.request().query(`
      SELECT id_ingrediente, nombre, unidad_medida
      FROM dbo.ingredientes
      ORDER BY nombre
    `)
  ]);
  res.json({
    categories: categories.recordset,
    employees: waiters.recordset,
    availableTables: tables.recordset,
    paymentMethods: paymentMethods.recordset,
    openOrders: openOrders.recordset,
    ingredients: ingredients.recordset
  });
}));

router.get("/customers", route(async (req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id_cliente, nombre, telefono, email
    FROM dbo.clientes
    ORDER BY nombre
  `);
  res.json(result.recordset);
}));

router.get("/inventory", route(async (req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id_ingrediente, nombre, stock_actual, stock_minimo, unidad_medida
    FROM dbo.ingredientes
    ORDER BY nombre
  `);
  res.json(result.recordset);
}));

router.get("/dishes", route(async (req, res) => {
  const categoryId = positiveInt(req.query.categoryId, "La categoría");
  const pool = await getPool();
  const result = await pool.request()
    .input("id_categoria", sql.Int, categoryId)
    .execute("dbo.sp_ObtenerPlatillosPorCategoria");
  res.json(result.recordset);
}));

router.post("/dishes", route(async (req, res) => {
  const nombre = requiredText(req.body.nombre, "El nombre", 100);
  const descripcion = req.body.descripcion == null || req.body.descripcion === ""
    ? null
    : requiredText(req.body.descripcion, "La descripción", 255);
  const precio = positiveAmount(req.body.precio, "El precio", true);
  const idCategoria = positiveInt(req.body.id_categoria, "La categoría");
  const pool = await getPool();
  await pool.request()
    .input("nombre", sql.VarChar(100), nombre)
    .input("descripcion", sql.VarChar(255), descripcion)
    .input("precio", sql.Decimal(10, 2), precio)
    .input("id_categoria", sql.Int, idCategoria)
    .execute("dbo.sp_CrearPlatillo");
  res.status(201).json({ message: "Platillo creado." });
}));

router.patch("/dishes/:id/price", route(async (req, res) => {
  const idPlatillo = positiveInt(req.params.id, "El platillo");
  const nuevoPrecio = positiveAmount(req.body.nuevo_precio, "El precio", true);
  const pool = await getPool();
  await pool.request()
    .input("id_platillo", sql.Int, idPlatillo)
    .input("nuevo_precio", sql.Decimal(10, 2), nuevoPrecio)
    .execute("dbo.sp_ActualizarPrecioPlatillo");
  res.json({ message: "Precio actualizado." });
}));

router.delete("/dishes/:id", route(async (req, res) => {
  const idPlatillo = positiveInt(req.params.id, "El platillo");
  const pool = await getPool();
  await pool.request()
    .input("id_platillo", sql.Int, idPlatillo)
    .execute("dbo.sp_EliminarPlatillo");
  res.json({ message: "Platillo eliminado." });
}));

router.post("/customers", route(async (req, res) => {
  const nombre = requiredText(req.body.nombre, "El nombre", 100);
  const telefono = req.body.telefono ? requiredText(req.body.telefono, "El teléfono", 20) : null;
  const email = req.body.email ? requiredText(req.body.email, "El correo", 100) : null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, "Escribe un correo electrónico válido.");
  }
  const pool = await getPool();
  await pool.request()
    .input("nombre", sql.VarChar(100), nombre)
    .input("telefono", sql.VarChar(20), telefono)
    .input("email", sql.VarChar(100), email)
    .execute("dbo.sp_RegistrarCliente");
  res.status(201).json({ message: "Cliente registrado." });
}));

router.post("/orders", route(async (req, res) => {
  const idMesa = positiveInt(req.body.id_mesa, "La mesa");
  const idMesero = positiveInt(req.body.id_mesero, "El mesero");
  const pool = await getPool();
  await pool.request()
    .input("id_mesa", sql.Int, idMesa)
    .input("id_mesero", sql.Int, idMesero)
    .execute("dbo.sp_AbrirOrden");
  res.status(201).json({ message: "Orden abierta." });
}));

router.post("/payments", route(async (req, res) => {
  const idOrden = positiveInt(req.body.id_orden, "La orden");
  const idMetodo = positiveInt(req.body.id_metodo, "El método de pago");
  const monto = positiveAmount(req.body.monto, "El monto");
  const pool = await getPool();
  await pool.request()
    .input("id_orden", sql.Int, idOrden)
    .input("id_metodo", sql.Int, idMetodo)
    .input("monto", sql.Decimal(10, 2), monto)
    .execute("dbo.sp_ProcesarPagoTransaccion");
  res.status(201).json({ message: "Pago procesado y orden cerrada." });
}));

router.post("/inventory/restock", route(async (req, res) => {
  const idIngrediente = positiveInt(req.body.id_ingrediente, "El ingrediente");
  const cantidad = positiveAmount(req.body.cantidad, "La cantidad");
  const pool = await getPool();
  await pool.request()
    .input("id_ingrediente", sql.Int, idIngrediente)
    .input("cantidad", sql.Decimal(10, 2), cantidad)
    .execute("dbo.sp_ReabastecerIngrediente");
  res.json({ message: "Inventario actualizado." });
}));

router.use((req, res) => res.status(404).json({ error: "Ruta API no encontrada." }));

module.exports = router;

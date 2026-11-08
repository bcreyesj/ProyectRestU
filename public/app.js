const state = {
  reports: null,
  lookups: null,
  dishes: [],
  customers: [],
  inventory: [],
  editingDishPrice: null,
  currentSection: "inicio"
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const chartColors = ["#2563eb", "#059669", "#f59e0b", "#8b5cf6", "#db2777", "#0f766e"];
const sectionTitles = {
  inicio: "Resumen",
  platillos: "Platillos",
  clientes: "Clientes",
  ordenes: "Órdenes y pagos",
  inventario: "Inventario"
};

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.detail ? ` ${payload.detail}` : "";
    throw new Error(`${payload.error || `Error ${response.status}.`}${detail}`);
  }
  return payload;
}

function showToast(message, isError = false) {
  const toast = $("#toast-message");
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

function setConnection(online, message = "") {
  const pill = $("#connection-pill");
  pill.classList.toggle("is-online", online);
  pill.classList.toggle("is-offline", !online);
  pill.lastElementChild.textContent = online ? "SQL Server conectado" : "Sin conexión";
  $(".db-dot").classList.toggle("is-online", online);
  $("#sidebar-connection").textContent = online ? "SQL Server conectado" : "Conexión no disponible";
  const alert = $("#connection-alert");
  alert.hidden = online;
  if (message) $("#connection-message").textContent = message;
}

async function loadData() {
  const refresh = $("#refresh-button");
  refresh.disabled = true;
  refresh.classList.add("is-loading");
  try {
    const [reports, lookups, customers, inventory] = await Promise.all([
      api("/api/reports"),
      api("/api/lookups"),
      api("/api/customers"),
      api("/api/inventory")
    ]);
    state.reports = reports;
    state.lookups = lookups;
    state.customers = customers;
    state.inventory = inventory;
    setConnection(true);
    renderReports();
    renderCustomers();
    renderInventory();
    renderOperationAvailability();
    populateCategoryFilter();
    applySectionSearch();
    $("#last-updated").textContent = `Datos actualizados ${new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    if (state.currentSection === "platillos" && $("#category-filter").value) await loadDishes();
  } catch (error) {
    setConnection(false, "No se pudieron leer los reportes y catálogos. Comprueba que SQL Server esté activo, que las variables DB_* del archivo .env sean correctas y que el usuario tenga permisos; después, reintenta.");
    if (!state.lookups) {
      const categoryFilter = $("#category-filter");
      categoryFilter.innerHTML = '<option value="">Sin conexión con SQL Server</option>';
      categoryFilter.disabled = true;
      $("#dishes-body").innerHTML = '<tr><td class="empty-cell" colspan="5">Conecta SQL Server para consultar o administrar el menú.</td></tr>';
    }
    if (!state.reports) {
      $("#sales-empty").textContent = "Conecta SQL Server para consultar las ventas.";
      $("#sales-empty").hidden = false;
      clearCanvas($("#sales-chart"));
      $("#occupancy-list").innerHTML = '<div class="empty-inline">No se pudieron consultar las áreas y mesas.</div>';
      $("#top-dishes-body").innerHTML = '<tr><td class="empty-cell" colspan="3">No se pudieron consultar los platillos más vendidos.</td></tr>';
      $("#payment-total").textContent = "—";
      $("#payment-legend").innerHTML = '<div class="empty-inline">No se pudieron consultar los pagos.</div>';
      clearCanvas($("#payment-chart"));
      $("#low-stock-body").innerHTML = '<tr><td class="empty-cell" colspan="4">No se pudo consultar el inventario.</td></tr>';
    }
    $("#last-updated").textContent = "No fue posible consultar los datos";
  } finally {
    refresh.disabled = false;
    refresh.classList.remove("is-loading");
  }
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
}

function renderReports() {
  if (!state.reports) return;
  const { salesByWaiter, topDishes, lowStock, paymentsByMethod, occupancyByArea } = state.reports;
  const orders = sum(salesByWaiter, "Total_Ordenes");
  const sold = sum(salesByWaiter, "Total_Vendido");
  const occupied = sum(occupancyByArea, "Mesas_Ocupadas");
  const totalTables = sum(occupancyByArea, "Total_Mesas");
  const occupancyPercent = totalTables ? Math.round((occupied / totalTables) * 100) : 0;
  const metricValues = [money.format(sold), number.format(orders), `${occupancyPercent}%`, number.format(lowStock.length)];
  $$("#metric-grid .metric-value").forEach((node, index) => { node.textContent = metricValues[index]; });

  renderSalesChart(salesByWaiter);
  renderOccupancy(occupancyByArea);
  renderTopDishes(topDishes);
  renderPaymentChart(paymentsByMethod);
  renderLowStock(lowStock);
  applySectionSearch();
}

function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function applySectionSearch() {
  const section = $(`#section-${state.currentSection}`);
  const query = $("#global-search").value.trim().toLocaleLowerCase("es-MX");
  if (!section) return;

  $$(".data-table", section).forEach((table) => {
    const body = $("tbody", table);
    if (!body) return;
    const rows = $$("tr", body).filter((row) => !row.classList.contains("search-empty-row") && !$(".empty-cell", row));
    let matches = 0;
    rows.forEach((row) => {
      const visible = !query || row.textContent.toLocaleLowerCase("es-MX").includes(query);
      row.hidden = !visible;
      if (visible) matches += 1;
    });

    let emptyRow = $(".search-empty-row", body);
    if (query && rows.length && matches === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement("tr");
        emptyRow.className = "search-empty-row";
        const cell = document.createElement("td");
        cell.className = "empty-cell";
        cell.colSpan = $("thead tr", table)?.children.length || 1;
        emptyRow.append(cell);
        body.append(emptyRow);
      }
      $("td", emptyRow).textContent = `No hay filas que coincidan con “${$("#global-search").value.trim()}”.`;
      emptyRow.hidden = false;
    } else if (emptyRow) {
      emptyRow.remove();
    }
  });
}

function renderSalesChart(rows) {
  const canvas = $("#sales-chart");
  const empty = $("#sales-empty");
  empty.hidden = rows.length > 0;
  $("#sales-legend").replaceChildren();
  $("#sales-details-summary").textContent = `Ver detalle de los ${number.format(rows.length)} meseros`;
  if (!rows.length) {
    clearCanvas(canvas);
    $("#sales-by-waiter-body").innerHTML = '<tr><td class="empty-cell" colspan="3">No hay ventas registradas.</td></tr>';
    return;
  }
  const chartLimit = canvas.getBoundingClientRect().width < 480 ? 4 : 6;
  const chartRows = rows.slice(0, chartLimit);
  const values = chartRows.map((row) => Number(row.Total_Vendido) || 0);
  drawBars(canvas, values, chartRows.map((row) => row.Mesero));
  chartRows.forEach((row, index) => {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-dot" style="background:${chartColors[index % chartColors.length]}"></span>${escapeHtml(row.Mesero)}`;
    $("#sales-legend").append(item);
  });
  $("#sales-by-waiter-body").innerHTML = rows.map((row) => `
    <tr><td>${escapeHtml(row.Mesero)}</td><td>${number.format(row.Total_Ordenes)}</td><td>${money.format(Number(row.Total_Vendido) || 0)}</td></tr>
  `).join("");
}

function renderOccupancy(rows) {
  const container = $("#occupancy-list");
  if (!rows.length) {
    container.innerHTML = '<div class="empty-inline">No hay áreas con mesas registradas.</div>';
    return;
  }
  container.innerHTML = rows.map((row) => {
    const occupied = Number(row.Mesas_Ocupadas) || 0;
    const total = Number(row.Total_Mesas) || 0;
    const percent = total ? Math.min(100, Math.round(occupied / total * 100)) : 0;
    const occupancyStatus = occupied ? `${number.format(occupied)} ocupadas` : "Sin mesas ocupadas";
    return `<div class="occupancy-row"><div class="occupancy-top"><strong>${escapeHtml(row.Area)}</strong><span><span class="occupancy-badge ${occupied ? "is-occupied" : "is-available"}">${occupancyStatus}</span>${number.format(total)} mesas · ${percent}%</span></div><div class="occupancy-track" role="progressbar" aria-label="Ocupación de ${escapeHtml(row.Area)}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="occupancy-fill" style="width:${percent}%"></div></div></div>`;
  }).join("");
}

function renderTopDishes(rows) {
  const body = $("#top-dishes-body");
  if (!rows.length) {
    body.innerHTML = '<tr><td class="empty-cell" colspan="3">Aún no hay ventas de platillos.</td></tr>';
    return;
  }
  body.innerHTML = rows.slice(0, 7).map((row) => `
    <tr><td>${escapeHtml(row.Platillo)}</td><td>${number.format(row.Total_Unidades_Vendidas)}</td><td>${money.format(Number(row.Total_Recaudado) || 0)}</td></tr>
  `).join("");
}

function renderLowStock(rows) {
  const body = $("#low-stock-body");
  if (!rows.length) {
    body.innerHTML = '<tr><td class="empty-cell" colspan="4">No hay alertas de inventario.</td></tr>';
    return;
  }
  body.innerHTML = rows.slice(0, 6).map((row) => `
    <tr><td>${escapeHtml(row.nombre)}</td><td>${number.format(row.stock_actual)} ${escapeHtml(row.unidad_medida)}</td><td>${number.format(row.stock_minimo)} ${escapeHtml(row.unidad_medida)}</td><td><span class="stock-badge">Stock bajo</span></td></tr>
  `).join("");
}

function renderPaymentChart(rows) {
  const canvas = $("#payment-chart");
  const total = sum(rows, "Total_Ingresado");
  $("#payment-total").textContent = money.format(total);
  const legend = $("#payment-legend");
  if (!rows.length || !total) {
    clearCanvas(canvas);
    legend.innerHTML = '<div class="empty-inline">Sin datos de pago.</div>';
    return;
  }
  drawDonut(canvas, rows.map((row) => Number(row.Total_Ingresado) || 0));
  legend.innerHTML = rows.map((row, index) => `
    <div class="legend-item"><span class="legend-dot" style="background:${chartColors[index % chartColors.length]}"></span><span>${escapeHtml(row.Metodo)}</span><span class="legend-value">${money.format(Number(row.Total_Ingresado) || 0)}</span></div>
  `).join("");
}

function prepareCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  return { context, width: rect.width, height: rect.height };
}

function clearCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
}

function drawBars(canvas, values, labels) {
  const { context: ctx, width, height } = prepareCanvas(canvas);
  const pad = { top: 16, right: 12, bottom: 40, left: 48 };
  const chartWidth = Math.max(0, width - pad.left - pad.right);
  const chartHeight = Math.max(0, height - pad.top - pad.bottom);
  const max = Math.max(...values, 1);
  const ticks = 4;
  ctx.font = "10px Segoe UI, Arial, sans-serif";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= ticks; i += 1) {
    const y = pad.top + chartHeight - (chartHeight * i / ticks);
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.fillText(shortMoney(max * i / ticks), pad.left - 7, y);
  }
  const step = chartWidth / Math.max(values.length, 1);
  const barWidth = Math.min(44, step * .55);
  values.forEach((value, index) => {
    const barHeight = Math.max(2, chartHeight * value / max);
    const x = pad.left + step * index + (step - barWidth) / 2;
    const y = pad.top + chartHeight - barHeight;
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
    else ctx.rect(x, y, barWidth, barHeight);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(shortLabel(labels[index], 12), x + barWidth / 2, pad.top + chartHeight + 10);
  });
}

function drawDonut(canvas, values) {
  const { context: ctx, width, height } = prepareCanvas(canvas);
  const total = sum(values.map((value) => ({ value })), "value");
  const radius = Math.min(width, height) * .42;
  const lineWidth = Math.max(12, radius * .3);
  let start = -Math.PI / 2;
  values.forEach((value, index) => {
    const angle = total ? (value / total) * Math.PI * 2 : 0;
    ctx.beginPath();
    ctx.strokeStyle = chartColors[index % chartColors.length];
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "butt";
    ctx.arc(width / 2, height / 2, radius - lineWidth / 2, start, start + angle);
    ctx.stroke();
    start += angle;
  });
}

function shortMoney(value) {
  const amount = Number(value) || 0;
  if (amount >= 1000000) return `$${number.format(amount / 1000000)} M`;
  if (amount >= 1000) return `$${number.format(amount / 1000)} mil`;
  return `$${number.format(amount)}`;
}

function shortLabel(label, maxLength) {
  const value = String(label ?? "");
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function navigate(section) {
  if (!sectionTitles[section]) return;
  state.currentSection = section;
  $$(".page-section").forEach((page) => {
    const active = page.id === `section-${section}`;
    page.classList.toggle("active", active);
    page.hidden = !active;
  });
  $$(".nav-link").forEach((button) => {
    const active = button.dataset.section === section;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("#breadcrumb-current").textContent = sectionTitles[section];
  $("#sidebar").classList.remove("is-open");
  $("#sidebar-scrim").classList.remove("is-visible");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
  if (section === "inicio" && state.reports) renderReports();
  if (section === "platillos" && $("#category-filter").value) loadDishes();
  if (section === "clientes") loadCustomers();
  if (section === "inventario") loadInventory();
  applySectionSearch();
}

function populateCategoryFilter() {
  const select = $("#category-filter");
  const previous = select.value;
  const categories = state.lookups?.categories || [];
  select.disabled = categories.length === 0;
  select.innerHTML = categories.length
    ? categories.map((item) => `<option value="${Number(item.id_categoria)}">${escapeHtml(item.nombre)}</option>`).join("")
    : '<option value="">No hay categorías registradas</option>';
  if (categories.some((item) => String(item.id_categoria) === previous)) select.value = previous;
  if (select.value) loadDishes();
  else renderDishes([]);
}

async function loadDishes() {
  const categoryId = $("#category-filter").value;
  const body = $("#dishes-body");
  if (!categoryId) {
    renderDishes([]);
    return;
  }
  body.innerHTML = '<tr><td class="empty-cell" colspan="5">Consultando platillos…</td></tr>';
  try {
    state.dishes = await api(`/api/dishes?categoryId=${encodeURIComponent(categoryId)}`);
    renderDishes(state.dishes);
  } catch (error) {
    body.innerHTML = `<tr><td class="empty-cell" colspan="5">${escapeHtml(error.message)}</td></tr>`;
    applySectionSearch();
  }
}

function renderDishes(rows) {
  const body = $("#dishes-body");
  if (!rows.length) {
    body.innerHTML = '<tr><td class="empty-cell" colspan="5">No hay platillos en esta categoría.</td></tr>';
    applySectionSearch();
    return;
  }
  body.innerHTML = rows.map((dish) => `
    <tr>
      <td>${escapeHtml(dish.nombre)}</td>
      <td>${escapeHtml(dish.descripcion || "—")}</td>
      <td>${money.format(Number(dish.precio) || 0)}</td>
      <td><span class="${dish.disponible === false || dish.disponible === 0 ? "unavailable-badge" : "availability-badge"}">${dish.disponible === false || dish.disponible === 0 ? "No disponible" : "Disponible"}</span></td>
      <td><div class="row-actions"><button class="mini-button" type="button" data-action="edit-price" data-id="${Number(dish.id_platillo)}" data-name="${escapeHtml(dish.nombre)}" data-price="${Number(dish.precio)}">Precio</button><button class="mini-button danger" type="button" data-action="delete-dish" data-id="${Number(dish.id_platillo)}" data-name="${escapeHtml(dish.nombre)}">Eliminar</button></div></td>
    </tr>
  `).join("");
  applySectionSearch();
}

async function loadCustomers() {
  try {
    state.customers = await api("/api/customers");
    renderCustomers();
  } catch (error) {
    $("#customers-body").innerHTML = `<tr><td class="empty-cell" colspan="3">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderCustomers() {
  const body = $("#customers-body");
  if (!state.customers.length) {
    body.innerHTML = '<tr><td class="empty-cell" colspan="3">Todavía no hay clientes registrados.</td></tr>';
    applySectionSearch();
    return;
  }
  body.innerHTML = state.customers.map((customer) => `
    <tr><td>${escapeHtml(customer.nombre)}</td><td>${escapeHtml(customer.telefono || "—")}</td><td>${escapeHtml(customer.email || "—")}</td></tr>
  `).join("");
  applySectionSearch();
}

async function loadInventory() {
  try {
    state.inventory = await api("/api/inventory");
    renderInventory();
  } catch (error) {
    $("#inventory-body").innerHTML = `<tr><td class="empty-cell" colspan="5">${escapeHtml(error.message)}</td></tr>`;
    applySectionSearch();
  }
}

function renderInventory() {
  const body = $("#inventory-body");
  const low = state.inventory.filter((item) => Number(item.stock_actual) <= Number(item.stock_minimo));
  if (!state.inventory.length) {
    body.innerHTML = '<tr><td class="empty-cell" colspan="5">No hay ingredientes registrados.</td></tr>';
    applySectionSearch();
    return;
  }
  body.innerHTML = state.inventory.map((item) => {
    const hasMinimum = item.stock_minimo != null;
    const isLow = hasMinimum && Number(item.stock_actual) <= Number(item.stock_minimo);
    return `<tr><td>${escapeHtml(item.nombre)}</td><td>${number.format(item.stock_actual)} ${escapeHtml(item.unidad_medida)}</td><td>${hasMinimum ? `${number.format(item.stock_minimo)} ${escapeHtml(item.unidad_medida)}` : "—"}</td><td>${escapeHtml(item.unidad_medida)}</td><td><span class="${isLow ? "stock-badge" : "availability-badge"}">${isLow ? "Reabastecer" : "En nivel"}</span></td></tr>`;
  }).join("");
  const footnote = $("#section-inventario .data-footnote");
  footnote.textContent = `${number.format(low.length)} ingrediente${low.length === 1 ? "" : "s"} en o por debajo del mínimo. El procedimiento de reabastecimiento suma la cantidad indicada al stock actual.`;
  applySectionSearch();
}

function renderOperationAvailability() {
  const canOpenOrder = state.lookups.availableTables.length > 0 && state.lookups.employees.length > 0;
  const openButton = $("#open-order-button");
  openButton.disabled = !canOpenOrder;
  $("#order-guidance").textContent = canOpenOrder
    ? "Asigna una mesa disponible a un mesero."
    : "Se necesita al menos una mesa disponible y un mesero registrado.";

  const canPay = state.lookups.openOrders.length > 0;
  const paymentButton = $("#payment-button");
  paymentButton.disabled = !canPay;
  paymentButton.textContent = canPay ? "Registrar pago" : "Sin órdenes activas";
  $("#payment-guidance").textContent = canPay
    ? "Registra el monto y el método de pago de una orden activa."
    : "Abre una orden para habilitar el registro de pago.";
}

function field(name, label, type = "text", options = {}) {
  const hint = options.hint ? `<small class="field-hint">${escapeHtml(options.hint)}</small>` : "";
  const common = `class="field-control" id="field-${escapeHtml(name)}" name="${escapeHtml(name)}" ${options.required ? "required" : ""} ${options.min != null ? `min="${options.min}"` : ""} ${options.max != null ? `max="${options.max}"` : ""} ${options.step ? `step="${options.step}"` : ""} ${options.maxLength ? `maxlength="${options.maxLength}"` : ""}`;
  let control;
  if (type === "select") {
    const choices = options.items || [];
    control = `<select ${common}><option value="">Selecciona una opción</option>${choices.map((item) => `<option value="${Number(item.value)}">${escapeHtml(item.label)}</option>`).join("")}</select>`;
  } else if (type === "textarea") {
    control = `<textarea ${common} placeholder="${escapeHtml(options.placeholder || "")}"></textarea>`;
  } else {
    control = `<input ${common} type="${escapeHtml(type)}" value="${escapeHtml(options.value ?? "")}" placeholder="${escapeHtml(options.placeholder || "")}" ${options.autocomplete ? `autocomplete="${escapeHtml(options.autocomplete)}"` : ""}>`;
  }
  return `<div class="field-group"><label for="field-${escapeHtml(name)}">${escapeHtml(label)}${options.required ? " *" : ""}</label>${control}${hint}</div>`;
}

const formDefinitions = {
  "new-dish": {
    title: "Crear platillo",
    description: "Añade un platillo a una categoría del menú.",
    submitLabel: "Crear platillo",
    fields: () => [
      field("nombre", "Nombre", "text", { required: true, maxLength: 100 }),
      field("descripcion", "Descripción", "textarea", { maxLength: 255 }),
      field("precio", "Precio", "number", { required: true, min: 0, step: "0.01", placeholder: "0.00" }),
      field("id_categoria", "Categoría", "select", { required: true, items: (state.lookups?.categories || []).map((item) => ({ value: item.id_categoria, label: item.nombre })) })
    ],
    submit: (data) => api("/api/dishes", { method: "POST", body: JSON.stringify(data) })
  },
  "new-customer": {
    title: "Registrar cliente",
    description: "Guarda los datos de contacto del cliente.",
    submitLabel: "Registrar cliente",
    fields: () => [
      field("nombre", "Nombre completo", "text", { required: true, maxLength: 100, autocomplete: "name" }),
      field("telefono", "Teléfono", "tel", { maxLength: 20, autocomplete: "tel" }),
      field("email", "Correo electrónico", "email", { maxLength: 100, autocomplete: "email" })
    ],
    submit: (data) => api("/api/customers", { method: "POST", body: JSON.stringify(data) })
  },
  "edit-price": {
    title: "Actualizar precio",
    description: "El cambio se aplica directamente al platillo seleccionado.",
    submitLabel: "Guardar precio",
    fields: () => [
      field("nuevo_precio", `Nuevo precio · ${state.editingDishPrice?.name || "Platillo"}`, "number", {
        required: true,
        min: 0,
        step: "0.01",
        value: state.editingDishPrice?.price ?? ""
      })
    ],
    submit: (data) => api(`/api/dishes/${state.editingDishPrice.id}/price`, { method: "PATCH", body: JSON.stringify(data) })
  },
  "new-order": {
    title: "Abrir orden",
    description: "Selecciona la mesa disponible y el mesero responsable.",
    submitLabel: "Abrir orden",
    fields: () => [
      field("id_mesa", "Mesa disponible", "select", { required: true, items: (state.lookups?.availableTables || []).map((item) => ({ value: item.id_mesa, label: `Mesa ${item.numero_mesa} · ${item.capacidad} lugares` })) }),
      field("id_mesero", "Mesero", "select", { required: true, items: (state.lookups?.employees || []).map((item) => ({ value: item.id_empleado, label: item.rol ? `${item.nombre} · ${item.rol}` : item.nombre })) })
    ],
    submit: (data) => api("/api/orders", { method: "POST", body: JSON.stringify(data) })
  },
  "new-payment": {
    title: "Procesar pago",
    description: "El monto se registra tal como lo captura el administrador.",
    submitLabel: "Procesar pago",
    fields: () => [
      field("id_orden", "Orden activa", "select", { required: true, items: (state.lookups?.openOrders || []).map((item) => ({ value: item.id_orden, label: `Orden #${item.id_orden} · Mesa ${item.id_mesa} · ${item.estado}` })) }),
      field("id_metodo", "Método de pago", "select", { required: true, items: (state.lookups?.paymentMethods || []).map((item) => ({ value: item.id_metodo, label: item.nombre })) }),
      field("monto", "Monto", "number", { required: true, min: "0.01", step: "0.01", placeholder: "0.00", hint: "El esquema no calcula automáticamente el total de la cuenta." })
    ],
    submit: (data) => api("/api/payments", { method: "POST", body: JSON.stringify(data) })
  },
  restock: {
    title: "Reabastecer ingrediente",
    description: "La cantidad se sumará al stock actual.",
    submitLabel: "Actualizar inventario",
    fields: () => [
      field("id_ingrediente", "Ingrediente", "select", { required: true, items: (state.lookups?.ingredients || []).map((item) => ({ value: item.id_ingrediente, label: `${item.nombre} · ${item.unidad_medida}` })) }),
      field("cantidad", "Cantidad a agregar", "number", { required: true, min: "0.01", step: "0.01", placeholder: "0.00" })
    ],
    submit: (data) => api("/api/inventory/restock", { method: "POST", body: JSON.stringify(data) })
  }
};

function openForm(action) {
  const definition = formDefinitions[action];
  if (!definition) return;
  $("#dialog-title").textContent = definition.title;
  $("#dialog-description").textContent = definition.description;
  $("#dialog-fields").innerHTML = definition.fields().join("");
  $("#submit-label").textContent = definition.submitLabel;
  $("#form-submit").disabled = false;
  $("#form-submit").classList.remove("is-loading");
  $("#form-error").hidden = true;
  $("#form-error").textContent = "";
  $("#action-form").dataset.formAction = action;
  $("#form-dialog").showModal();
  $("#dialog-fields input, #dialog-fields select, #dialog-fields textarea")?.focus();
}

async function submitForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const action = form.dataset.formAction;
  const definition = formDefinitions[action];
  if (!definition) return;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const submitButton = $("#form-submit");
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  $("#submit-label").textContent = "Guardando…";
  $(".dialog-cancel").disabled = true;
  $(".dialog-close").disabled = true;
  $("#form-error").hidden = true;
  try {
    const result = await definition.submit(data);
    $("#form-dialog").close();
    showToast(result.message || "Cambios guardados.");
    await loadData();
    if (state.currentSection === "clientes") await loadCustomers();
    if (state.currentSection === "inventario") await loadInventory();
    if (state.currentSection === "platillos") await loadDishes();
  } catch (error) {
    $("#form-error").textContent = error.message;
    $("#form-error").hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    $("#submit-label").textContent = definition.submitLabel;
    $(".dialog-cancel").disabled = false;
    $(".dialog-close").disabled = false;
  }
}

function updateDishPrice(button) {
  state.editingDishPrice = {
    id: Number(button.dataset.id),
    name: button.dataset.name,
    price: Number(button.dataset.price)
  };
  openForm("edit-price");
}

async function deleteDish(button) {
  if (!window.confirm(`¿Eliminar el platillo "${button.dataset.name}"? Esta acción no se puede deshacer.`)) return;
  try {
    const result = await api(`/api/dishes/${Number(button.dataset.id)}`, { method: "DELETE" });
    showToast(result.message);
    await loadData();
    await loadDishes();
  } catch (error) {
    showToast(error.message, true);
  }
}

function wireEvents() {
  $$(".nav-link").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.section)));
  $$("[data-section-link]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.sectionLink)));
  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    if (actionButton.dataset.action === "edit-price") updateDishPrice(actionButton);
    else if (actionButton.dataset.action === "delete-dish") deleteDish(actionButton);
    else openForm(actionButton.dataset.action);
  });
  $("#category-filter").addEventListener("change", loadDishes);
  $("#global-search").addEventListener("input", applySectionSearch);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#global-search").focus();
    }
    if (event.key === "Escape") {
      $("#sidebar").classList.remove("is-open");
      $("#sidebar-scrim").classList.remove("is-visible");
      $("#menu-toggle").setAttribute("aria-expanded", "false");
    }
  });
  $("#refresh-button").addEventListener("click", loadData);
  $("#retry-button").addEventListener("click", loadData);
  $("#action-form").addEventListener("submit", submitForm);
  $(".dialog-close").addEventListener("click", () => $("#form-dialog").close());
  $(".dialog-cancel").addEventListener("click", () => $("#form-dialog").close());
  $("#form-dialog").addEventListener("click", (event) => {
    if (event.target === $("#form-dialog")) $("#form-dialog").close();
  });
  $("#menu-toggle").addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("is-open");
    $("#sidebar-scrim").classList.toggle("is-visible", open);
    $("#menu-toggle").setAttribute("aria-expanded", String(open));
  });
  $("#sidebar-scrim").addEventListener("click", () => {
    $("#sidebar").classList.remove("is-open");
    $("#sidebar-scrim").classList.remove("is-visible");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  });
  window.addEventListener("resize", () => {
    if (state.reports) renderReports();
  });
}

function updateDateTime() {
  $("#today-label").textContent = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

updateDateTime();
window.setInterval(updateDateTime, 60_000);
wireEvents();
loadData();

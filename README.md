# Panel de administración del restaurante

Panel web en español para consultar las cinco vistas de reportes de `restaurante` y ejecutar las operaciones disponibles mediante sus procedimientos almacenados. El backend usa Node.js y Express con `mssql`: autenticación integrada mediante `msnodesqlv8` en Windows o Tedious con credenciales SQL; la interfaz usa JavaScript vanilla y Bootstrap 5.

## Estructura

```text
DBRestaurante/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── db.js
│   └── routes/
│       └── api.js
├── .env.example
├── .gitignore
├── package.json
├── PRODUCT.md
├── README.md
└── server.js
```

## Requisitos

- Node.js 18 o posterior y npm.
- SQL Server local con la base `restaurante` creada y el script SQL proporcionado ejecutado.
- En Windows, el controlador ODBC de Microsoft para SQL Server debe estar instalado para usar la autenticación integrada.
- La cuenta de Windows que ejecuta Node debe tener permiso de lectura en las vistas/tablas usadas y permiso de ejecución en los procedimientos almacenados.

## Puesta en marcha

1. Instala las dependencias con `npm install`.
2. Copia `.env.example` a `.env`. La autenticación integrada de Windows es el modo predeterminado (`DB_AUTH=windows`), adecuado para una instancia local como la de la captura. La conexión usa `ODBC Driver 17 for SQL Server` y el usuario de Windows que inicia Node. Si tu instancia necesita TCP, establece `DB_PORT`; para una instancia distinta, ajusta `DB_SERVER`.
3. Inicia el panel con `npm start` o `npm run dev`.
4. Abre `http://127.0.0.1:3000`.

Para usar autenticación de SQL Server, establece `DB_AUTH=sql`, `DB_USER` y `DB_PASSWORD`. El panel no simula resultados: si SQL Server o la base no están disponibles, presenta un aviso de conexión y permite reintentar. `DB_ENCRYPT=false` y `DB_TRUST_SERVER_CERTIFICATE=true` son valores iniciales para un SQL Server local; ajústalos a la configuración de tu servidor. Los importes se muestran en MXN como supuesto inicial, dado que el esquema incluye el campo `rfc_cliente`; confirma esa moneda para el restaurante.

## API

| Método | Ruta | Operación |
|---|---|---|
| GET | `/api/health` | Comprueba conexión a SQL Server |
| GET | `/api/reports` | Lee las cinco vistas de reportes |
| GET | `/api/lookups` | Carga categorías, meseros, mesas, métodos de pago, órdenes activas e ingredientes |
| GET | `/api/dishes?categoryId=1` | Ejecuta `sp_ObtenerPlatillosPorCategoria` |
| POST | `/api/dishes` | Ejecuta `sp_CrearPlatillo` |
| PATCH | `/api/dishes/:id/price` | Ejecuta `sp_ActualizarPrecioPlatillo` |
| DELETE | `/api/dishes/:id` | Ejecuta `sp_EliminarPlatillo` |
| GET | `/api/customers` | Consulta el directorio de clientes |
| POST | `/api/customers` | Ejecuta `sp_RegistrarCliente` |
| POST | `/api/orders` | Ejecuta `sp_AbrirOrden` |
| POST | `/api/payments` | Ejecuta `sp_ProcesarPagoTransaccion` |
| GET | `/api/inventory` | Consulta existencias de ingredientes |
| POST | `/api/inventory/restock` | Ejecuta `sp_ReabastecerIngrediente` |

## Alcance del esquema

El archivo SQL permite registrar clientes, pero no define procedimientos para editar o eliminar clientes; por eso el panel ofrece su consulta y alta sin inventar operaciones. `sp_AbrirOrden` solo inserta la orden, no agrega platillos ni cambia el estado de la mesa. El total del pago debe capturarse porque el esquema no calcula automáticamente la cuenta al procesar ese procedimiento. Las vistas suministradas tampoco tienen filtro por fechas.

El servidor escucha solo en `127.0.0.1` y no incluye autenticación de usuarios. Está pensado para administración local; no lo expongas directamente a una red pública.

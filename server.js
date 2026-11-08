require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("node:path");
const apiRoutes = require("./src/routes/api");

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDirectory = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null
      }
    }
  })
);
app.use(express.json({ limit: "32kb" }));
app.use("/api", apiRoutes);
app.use(express.static(publicDirectory));
app.get("*", (req, res) => res.sendFile(path.join(publicDirectory, "index.html")));

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = status < 500 ? err.message : "Ocurrió un error al consultar o guardar los datos.";
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && status >= 500 ? { detail: err.message } : {})
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Panel Restaurante disponible en http://127.0.0.1:${port}`);
});

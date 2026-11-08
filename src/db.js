const useWindowsAuth = (process.env.DB_AUTH || "windows").toLowerCase() === "windows";
const sql = useWindowsAuth ? require("mssql/msnodesqlv8") : require("mssql");

let poolPromise;

function getPool() {
  if (!poolPromise) {
    const server = process.env.DB_SERVER || "localhost";
    const database = process.env.DB_NAME || "restaurante";
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
    if (!useWindowsAuth && (!process.env.DB_USER || !process.env.DB_PASSWORD)) {
      throw new Error("DB_USER y DB_PASSWORD son obligatorios cuando DB_AUTH=sql.");
    }

    const config = {
      server,
      database,
      ...(port ? { port } : {}),
      ...(useWindowsAuth ? { driver: "msnodesqlv8" } : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }),
      options: {
        ...(useWindowsAuth ? { trustedConnection: true } : {}),
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false"
      },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
      connectionTimeout: 15000,
      requestTimeout: 30000
    };

    if (useWindowsAuth) {
      const driver = process.env.DB_ODBC_DRIVER || "ODBC Driver 17 for SQL Server";
      const serverAddress = `${server}${port ? `,${port}` : ""}`;
      config.connectionString = [
        `Driver={${driver}}`,
        `Server=${serverAddress}`,
        `Database=${database}`,
        "Trusted_Connection=Yes",
        `Encrypt=${config.options.encrypt ? "Yes" : "No"}`,
        `TrustServerCertificate=${config.options.trustServerCertificate ? "Yes" : "No"}`
      ].join(";");
    }

    poolPromise = sql.connect(config).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

module.exports = { getPool, sql };

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "interview_db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: process.env.NODE_ENV === "production",
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
};
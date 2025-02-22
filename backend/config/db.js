import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  user: "admin",
  password: "123456",
  host: process.env.DB_HOST || "localhost",
  port: "5432",
  database: "heyzap",
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Error connecting to database", err));

export default client;

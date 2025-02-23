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
  .then(() => {
    console.log("Connected to PostgreSQL database");

    const createQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      );`
    ];

    return Promise.all(createQueries.map((query) => client.query(query)));
  })
  .then(() => {
    console.log("Tables created successfully (if they did not exist).");
  })
  .catch((err) => {
    console.error("Error with database operations:", err);
  });

export default client;

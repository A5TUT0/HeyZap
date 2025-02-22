import pg from "pg";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const client = new pg.Client({
  user: "admin",
  password: "123456",
  host: process.env.DB_HOST || "localhost",
  port: "5432",
  database: "heyzap",
});

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // Para que Express pueda leer JSON

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) =>
    console.error("Error connecting to PostgreSQL database", err)
  );

// **Registro de Usuario**
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verifica si el usuario ya existe
    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya está registrado" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    const result = await client.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    // Generar Token JWT
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// **Login de Usuario**
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Error en el login", err);
    res.status(500).json({ error: "Error en el login" });
  }
});

// **Middleware para proteger rutas**
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer Token

  if (!token)
    return res
      .status(401)
      .json({ error: "Acceso denegado, token no proporcionado" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Token inválido" });
  }
};

// **Ruta protegida de ejemplo**
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Perfil de usuario", user: req.user });
});

server.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

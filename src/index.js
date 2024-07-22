require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { todosRoutes, authRoutes } = require("./routes");
const session = require("express-session");
const passport = require("passport");
const https = require("https");
const fs = require("fs");
const path = require("path");

const { db } = require("./db");

(async function initApp() {
  try {
    const app = express();
    const PORT = 3000;
    app.use(
      session({
        secret: "SESSION_SECRET",
        resave: false,
        saveUninitialized: false,
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(bodyParser.json());

    app.use("/auth", authRoutes);
    app.use(
      "/todo",
      passport.authenticate("google", { session: true }),
      todosRoutes
    );

    await db.batch(
      [
        `
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL
        );
      `,
        `
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          checked BOOLEAN,
          user_id VARCHAR(255) NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `,
      ],
      "write"
    );
    console.log("Tables Created!");
    const rs = await db.execute("SELECT * FROM todos");
    console.log("Todos", rs);

    // app.listen(PORT, () => {
    //   console.log(`Server is running on port ${PORT}`);
    // });

    // Read SSL certificate and key files
    const options = {
      key: fs.readFileSync(path.join(__dirname, "localhost-key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "localhost.pem")),
    };

    // Create HTTPS server
    const server = https.createServer(options, app);

    server.listen(PORT, () => {
      console.log(`App listening on https://localhost:${PORT}`);
    });
  } catch (e) {
    console.log("Error", e);
  }
})();

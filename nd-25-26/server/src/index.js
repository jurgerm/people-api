import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";
import postsRouter from "./routes/posts.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import userTutorialsRouter from "./routes/user-tutorials.js";
dotenv.config();

const main = async () => {
  try {
    const {MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PW, MYSQL_DB} = process.env;

    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PW,
      database: MYSQL_DB,
    });

    const createUsersTable = `CREATE TABLE IF NOT EXISTS nd2526_Users (
            id INTEGER AUTO_INCREMENT NOT NULL,
            email VARCHAR (50) NOT NULL,
            password CHAR (60) NOT NULL,
            reg_timestamp INTEGER,
            PRIMARY KEY (id),
            username VARCHAR (50) NOT NULL,
            UNIQUE (username)
        )`;

    const createTutorialsTable = `CREATE TABLE IF NOT EXISTS nd2526_Tutorials (
            id INTEGER AUTO_INCREMENT NOT NULL,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_private boolean not null default 0,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES nd2526_Users (id)
        )`;

    await connection.query(createUsersTable);

    await connection.query(createTutorialsTable);

    const app = express();

    app.mysql = connection;

    app.use(cors());

    app.use(express.json());

    app.use("/posts", postsRouter);

    app.use("/auth", authRouter);

    app.use("/users", usersRouter);

    app.use("/user-tutorials", userTutorialsRouter);

    app.listen(8080, () => {
      console.log("listening");
    });
  } catch (e) {
    console.log(e);
  }
};

main();

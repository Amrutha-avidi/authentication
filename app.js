const express = require("express");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//1.
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const selectRegisterQuery = `
  SELECT 
  * 
  FROM 
  user 
  WHERE username = '${username}';`;

  const dbUser = await db.get(selectRegisterQuery);
  if (dbUser === undefined) {
    const createUser = `
        INSERT INTO 
        user(username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        );`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const dbResponse = await db.run(createUserQuery);
      response.status(200);
      response.send(`User created successfully`);
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

module.exports = app;

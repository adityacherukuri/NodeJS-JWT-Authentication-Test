const express = require("express");
const app = express();
const path = require("path");

const jwt = require("jsonwebtoken");

const exjwt = require("express-jwt");

const bodyParser = require("body-parser");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = "my super secret key";

const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ["HS256"],
});

let users = [
  {
    id: 1,
    username: "Aditya",
    password: "123",
  },
  {
    id: 2,
    username: "John",
    password: "12345",
  },
  {
    id: 3,
    username: "Clark",
    password: "112233",
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  for (let user of users) {
    if (username === user.username && password === user.password) {
      let token = jwt.sign(
        { id: user.id, username: user.username },
        secretKey,
        { expiresIn: "180s" }
      );
      res.json({ success: true, err: null, token });
      break;
    } else {
      res.status(401).json({
        success: false,
        token: null,
        err: "Username or password is incorrect",
      });
    }
  }
});

app.get("/api/dashboard", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Secret content that only logged in people can see",
  });
});

app.get("/api/prices", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Price set to $10.99",
  });
});

app.get("/api/settings", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Settings page only for Logged in users..",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      officialError: err,
      err: "username or password is incorrect(2)",
    });
  } else {
    next(err);
  }
});

app.listen(3000, () => {
  console.log(`Server started on port ${PORT}`);
});

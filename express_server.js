const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('');
};

const users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.url;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  res.cookie('user_id', randomId);
  users[randomId] = { 
    id: randomId,
    email: req.body.email,
    password: req.body.password
  }
  console.log(users)
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    username: req.cookies["username"],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    console.log('404')
  }
});
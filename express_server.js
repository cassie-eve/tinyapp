// Requirements
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { generateRandomString, userExists, urlExists, getUserId, urlsForUser } = require("./helpers");

// Setup and Middleware
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const users = {};

const urlDatabase = {};

// Routes and endpoints
app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: users[userId],
  };
  if (!req.session["user_id"]) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(403).send("You need to be signed in to do this.");
  } else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session["user_id"],
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/login", (req, res) => {
  const id = getUserId(req.body.email, users);
  let user = {};
  for (let x in users) {
    if (users[x].email === req.body.email) {
      user = users[x];
    }
  }
  if (!user.email) {
    return res.status(403).send("This email address has not been registered.");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Incorrect email / password combination.");
  }
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("You do not have permission to delete this URL.");
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.url;
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to delete this URL.");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: users[userId],
  };
  if (!req.session["user_id"]) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: users[userId],
  };
  if (!req.session["user_id"]) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  const userEmail = req.body.email;
  const hashed = bcrypt.hashSync(req.body.password, 10);

  if (!userEmail || !hashed) {
    res.status(400).send("Invalid email password combination.");
  } else if (userExists(userEmail, users)) {
    res.status(400).send("This email already exists, please log in.");
  } else {
    req.session.user_id = randomId;
    users[randomId] = {
      id: randomId,
      email: userEmail,
      password: hashed,
    };
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: users[userId],
  };
  if (req.session["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  if (urlExists(req.params.id, urlDatabase) && urlDatabase[req.params.id].userId === req.session["user_id"]) {
    const templateVars = {
      id: req.params.id,
      user: users[userId],
      urlUserId: req.params.id.userId,
      longURL: urlDatabase[req.params.id].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Oops! This URL doesn't exist.");
  }
});

app.get("/u/:id", (req, res) => {
  if (!urlExists(req.params.id, urlDatabase)) {
    res.status(404).send("Oops! This URL doesn't exist.");
  } else if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    res.status(403).send("You do not have access to this URL.");
  } else {
    res.redirect(longURL);
  }
 });
 

// Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
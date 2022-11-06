const express = require("express");
var cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { generateRandomString, userExists, urlExists, getUserId, urlsForUser } = require("./helpers");

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(express.urlencoded({ extended: true }));

const users = {
  '0owvjr': {
    id: "0owvjr",
    email: 'cass@cass.ca',
    password: 'cass'
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "0owvjr"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "0owvjr"
  }
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

app.post("/urls", (req, res) => {
  if (!req.session['user_id']) {
    res.status(403).send("You need to be signed in to do this.");
  } else {
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userId: req.session['user_id']
    }
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const hashed = bcrypt.hashSync(req.body.password, 10);
  const id = getUserId(userEmail, users);
  for (let x in users) {
    if (users[x]['email'] === req.body.email && bcrypt.compareSync(users[x]['password'], hashed)) {
    req.session.user_id = id;
    res.redirect('/urls');
    } else if (!userExists(userEmail, users)) {
      res.status(403).send("This email address has not been registered.");
    } else {
      res.status(403).send("Incorrect email / password combination.");
    }
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session['user_id']) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("You do not have permission to delete this URL.");
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.url;
  console.log(urlDatabase[req.params.id])
  console.log(req.body.url)
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = { 
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = { 
    user: users[userId]
  };
  if (!req.session['user_id']) {
    res.render('urls_register', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = { 
    user: users[userId]
  };
  if (!req.session['user_id']) {
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const hashed = bcrypt.hashSync(userPass, 10);

  if (!userEmail || !hashed) {
    res.status(400).send("Invalid email password combination.");
  } else if (userExists(userEmail, users)) {
    res.status(400).send("This email already exists, please log in.");
  } else {
    req.session.user_id = randomId;
    users[randomId] = { 
      id: randomId,
      email: userEmail,
      password: hashed
    }
    res.redirect('/urls');
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = {
    user: users[userId]
  };
  if (req.session['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session['user_id'];
  const templateVars = { 
    id: req.params.id, 
    user: users[userId],
    urlUserId: req.params.id.userId,
    longURL: urlDatabase[req.params.id].longURL
  };
  if (urlExists(req.params.id, urlDatabase)) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Oops! This URL doesn't exist.");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL && urlExists(req.params.id, urlDatabase)) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Oops! This URL doesn't exist.");
  }
});

// Unable to delete URLs through curl that belong to you -cant scope cookies
// Cannot login with correct email password combination for new users
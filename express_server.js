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

function userExists(userEmail, userList) {
  for (const user in userList) {
    if (userList[user].email === userEmail) {
      return true;
    }
  }
  return false;
};

function urlExists(entered, urlList) {
  for (const url in urlList) {
    if (url === entered) {
      return true;
    }
  }
  return false;
};

function getUserId(userEmail, userList) {
  for (const user in userList) {
    if (userList[user].email === userEmail) {
      return userList[user].id;
    }
  }
  return false;
};

function urlsForUser(id, urlList) {
  const filteredUrls = {};
  
  for (let url in urlList) {
    if (urlList[url].userId === id) {
      filteredUrls[url] = urlList[url];
    }
  }
  return filteredUrls;
}

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(403).send("You need to be signed in to do this.");
  } else {
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const id = getUserId(userEmail, users);

  if (!userEmail || !userPass) {
    res.status(400).send("Please enter both an email address and password");
  } else if (!userExists(userEmail, users)) {
    res.status(403).send("This email address has not been registered.");
  } else if (users[id].password !== req.body.password) {
    res.status(403).send("Incorrect email / password combination.");
  } else {
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
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
  const userId = req.cookies['user_id'];
  const templateVars = { 
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { 
    user: users[userId]
  };
  if (!req.cookies['user_id']) {
    res.render('urls_register', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { 
    user: users[userId]
  };
  if (!req.cookies['user_id']) {
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!userEmail || !userPass) {
    res.status(400).send("Invalid email password combination.");
  } else if (userExists(userEmail, users)) {
    res.status(400).send("This email already exists, please log in.");
  } else {
    res.cookie('user_id', randomId);
    users[randomId] = { 
      id: randomId,
      email: userEmail,
      password: userPass
    }
    res.redirect('/urls');
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {
    user: users[userId]
  };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { 
    id: req.params.id, 
    user: users[userId],
    longURL: urlDatabase[req.params.id].longURL
  };
  if (urlExists(req.params.id, urlDatabase)) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Oops! This URL doesn't exist.");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL && urlExists(req.params.id, urlDatabase)) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Oops! This URL doesn't exist.");
  }
});

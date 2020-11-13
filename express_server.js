const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const {generateRandomString,deleteitem,validateEmail,logincheck,urlsForUser} = require("./script/app");
const PORT = 8080; // default port 8080

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const user = {};
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// Create URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_new",templateVars);
});
// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies[`user_id`];
  let belong = true;
  if (urlDatabase[req.params.shortURL] === undefined) return res.send(`invalid URL`);
  else if (urlDatabase[req.params.shortURL].userID !== id) {
    belong = false;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    belong,
  };
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  if (!req.cookies[`user_id`]) {
    return res.render("urls_index", {
      login: false,
      id: undefined});
  } else {
    const userurl = urlsForUser(urlDatabase,req.cookies[`user_id`]);
    const templateVars = {
      urls: userurl,
      login: true,
    };
    const match = logincheck(req,user);
    templateVars[`id`] = user[match];
    res.render("urls_index", templateVars);
  }
  
});
//login
app.get("/login",(req, res) => {
  const match = logincheck(req,user);
  res.render(`url_login`,{id :user[match]});
});
app.post("/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`Please enter an email and password`);
  }
  let userid = "";
  for (const id in user) {
    if (user[id].email === email) {
      userid = id;
    }
  }
  if (!userid) res.status(403).send(`invalid Email`);
  console.log(user[userid].password);
  if (bcrypt.compareSync(password, user[userid].password)) {
    res.cookie(`user_id`,userid,{});
    return res.redirect("/urls");
  } else {
    return res.status(403).send(`invalid password`);
  }
});
//registration
app.get("/register", (req, res) => {
  const templateVars = {};
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("url_registration",templateVars);
});
//
app.post("/register", (req, res) => {
  if (validateEmail(user,req.body.email)) {
    const id = generateRandomString();
    user[id] = {
      id : id,
      email : req.body.email,
      password :  bcrypt.hashSync(req.body.password, 10)
    };
    res.cookie(`user_id`,id,{});
    res.redirect("/urls");
  } else res.status(400).send('Invalid Email');
});
//logout
app.post("/logout", (req, res) => {
  res.clearCookie(`user_id`);
  res.redirect(`/urls`);
});
//new
app.post("/urls", (req, res) => {
  if (!logincheck(req,user)) {
    return res.redirect(`/login`);
  } else {
    const x = generateRandomString();
    urlDatabase[x] = {};
    urlDatabase[x].longURL = req.body.longURL;
    urlDatabase[x].userID = req.cookies[`user_id`];
    res.redirect(`urls/${x}`);
  }
});
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies[`user_id`]) {
    return res.redirect(`/urls`);
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  return res.redirect(`/urls`);
  
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies[`user_id`]) {
    return res.redirect(`/urls`);
  }
  deleteitem(req.params.shortURL,urlDatabase);
  res.redirect(`/urls`);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
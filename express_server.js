const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const {generateRandomString,deleteitem,validateEmail,logincheck} = require("./script/app");
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const user = {};
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_new",templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_index", templateVars);
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
  if (user[userid].password === password) {
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
      password : req.body.password
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
//
app.post("/urls", (req, res) => {
  const x = generateRandomString();
  urlDatabase[x] = req.body.longURL;
  res.redirect(`urls/${x}`);
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
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
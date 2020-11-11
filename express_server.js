const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const {generateRandomString,deleteitem} = require("./script/app");
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["UserName"]
  };
  res.render("urls_new",templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["UserName"]
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["UserName"]
  };
  res.render("urls_index", templateVars);
});

// Cookie
app.post("/login", (req, res) => {
  res.cookie(`UserName`,req.body.UserName,{});
  res.redirect(`/urls`);
});
//
//logout
app.post("/logout", (req, res) => {
  res.clearCookie(`UserName`);
  res.redirect(`/urls`);
});
//
app.post("/urls", (req, res) => {
  const x = generateRandomString();
  urlDatabase[x] = req.body.longURL;
  res.redirect(`urls/${x}`);
});
app.post("/urls/:id", (req, res) => {
  console.log(req.headers);
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
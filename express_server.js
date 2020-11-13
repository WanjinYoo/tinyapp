const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const app = express();
const {generateRandomString,deleteitem,validateEmail,logincheck,urlsForUser,getUserByEmail} = require("./script/helper");
const PORT = 8080; // default port 8080
const urlDatabase = {};
const user = {};
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [`1`]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
// Create URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  const match = logincheck(req,user);
  templateVars[`id`] = user[match];
  res.render("urls_new",templateVars);
});
// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  let belong = true;
  //Send an error if a user type in undefined url
  req.session.visits += 1;
  if (urlDatabase[req.params.shortURL] === undefined) return res.send(`invalid URL`);
  else if (urlDatabase[req.params.shortURL].userID !== id) {
    belong = false;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    time : urlDatabase[req.params.shortURL].time,
    visits : req.session.visits,
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
//Main page
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.render("urls_index", {
      login: false,
      id: undefined});
  } else {
    const userurl = urlsForUser(urlDatabase,req.session.user_id);
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
  const userid = getUserByEmail(email,user);
  if (!userid) res.status(403).send(`invalid Email`);
  if (bcrypt.compareSync(password, user[userid].password)) {
    req.session.user_id = userid;
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
app.post("/register", (req, res) => {
  if (validateEmail(user,req.body.email)) {
    const id = generateRandomString();
    user[id] = {
      id : id,
      email : req.body.email,
      password :  bcrypt.hashSync(req.body.password, 10)
    };
    
    req.session.user_id = id;
    res.redirect("/urls");
  } else res.status(400).send('Invalid Email');
});
//logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`/urls`);
});
//new
app.post("/urls", (req, res) => {
  if (!logincheck(req,user)) {
    return res.redirect(`/login`);
  } else {
    const x = generateRandomString();
    const date = new Date();
    date.setHours(-4);
    urlDatabase[x] = {};
    urlDatabase[x].longURL = req.body.longURL;
    urlDatabase[x].userID = req.session.user_id;
    urlDatabase[x].time = date.toLocaleString();
    console.log(urlDatabase[x].time);
    res.redirect(`urls/${x}`);
  }
});
// Edit
app.put("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.redirect(`/urls`);
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  return res.redirect(`/urls`);
  
});
//Delete
app.delete("/urls/:shortURL/delete", (req, res) => {

  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.redirect(`/urls`);
  }
  deleteitem(req.params.shortURL,urlDatabase);
  res.redirect(`/urls`);
});
//Check if the server is running properly
app.get("/", (req, res) => {
  if (!req.session.user_id) return res.redirect(`/login`);
  else {
    return res.redirect(`/urls`);
  }
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
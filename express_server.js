const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const app = express();
const { generateRandomString, deleteItem, validateEmail, loginCheck, urlsForUser, getUserByEmail } = require("./script/helper");
const PORT = 8080; // default port 8080
const urlDatabase = {};
const user = {};
const track = {};
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [`1`]
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
// Create URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  const loggedInId = loginCheck(req, user);
  if (!loggedInId) return res.send(`Please login to create new URLs`);
  templateVars[`id`] = user[loggedInId];
  res.render("urls_new", templateVars);
});
// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  if (!id) return res.send(`Please login to get access to this page`);
  let belong = true;
  //Send an error if a user type in undefined url
  if (!req.session[req.params.shortURL]) {
    req.session[req.params.shortURL] = 1;
  } else {
    req.session[req.params.shortURL] += 1;
  }


  if (urlDatabase[req.params.shortURL] === undefined) return res.send(`invalid URL`);
  else if (urlDatabase[req.params.shortURL].userID !== id) {
    belong = false;
  }
  let date = new Date();
  if (req.session.user_id) {
    if (!Object.keys(track).includes(req.params.shortURL)) {
      track[req.params.shortURL] = {};
      track[req.params.shortURL][`user`] = [];
      track[req.params.shortURL][`time`] = [];
    }
    track[req.params.shortURL][`user`].push(req.session.user_id);
    track[req.params.shortURL][`time`].push(date.toLocaleString());
  }
  // Use filter to find unique visits filter out duplicates
  const uniq = track[req.params.shortURL][`user`]
    .filter((item, index) => {
      return track[req.params.shortURL][`user`].indexOf(item) === index;
    })
    .length;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    time: urlDatabase[req.params.shortURL].time,
    visits: req.session[req.params.shortURL],
    timeStamp: track[req.params.shortURL][`time`],
    user: track[req.params.shortURL][`user`],
    uniqvisits: uniq,
    belong,
  };
  const loggedInId = loginCheck(req, user);
  templateVars[`id`] = user[loggedInId];
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
      id: undefined
    });
  } else {
    const userurl = urlsForUser(urlDatabase, req.session.user_id);
    const templateVars = {
      urls: userurl,
      login: true,
    };
    const loggedInId = loginCheck(req, user);
    templateVars[`id`] = user[loggedInId];
    res.render("urls_index", templateVars);
  }

});
//login
app.get("/login", (req, res) => {
  const loggedInId = loginCheck(req, user);
  res.render(`url_login`, { id: user[loggedInId] });
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`Please enter an email and password`);
  }
  const userid = getUserByEmail(email, user);
  if (!userid) res.status(403).send(`invalid information`);
  if (bcrypt.compareSync(password, user[userid].password)) {
    req.session.user_id = userid;
    return res.redirect("/urls");
  } else {
    return res.status(403).send(`invalid information`);
  }
});
//registration
app.get("/register", (req, res) => {
  const templateVars = {};
  const loggedInId = loginCheck(req, user);
  templateVars[`id`] = user[loggedInId];
  res.render("url_registration", templateVars);
});
app.post("/register", (req, res) => {
  if (validateEmail(user, req.body.email)) {
    const id = generateRandomString();
    if (!req.body.password) return res.status(400).send('Please Enter password');
    user[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
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
  if (!loginCheck(req, user)) {
    return res.redirect(`/login`);
  } else {
    const randomString = generateRandomString();
    let date = new Date();
    urlDatabase[randomString] = {};
    urlDatabase[randomString].longURL = req.body.longURL;
    urlDatabase[randomString].userID = req.session.user_id;
    urlDatabase[randomString].time = date.toLocaleString();
    res.redirect(`urls/${randomString}`);
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
  deleteItem(req.params.shortURL, urlDatabase);
  res.redirect(`/urls`);
});
app.get("/", (req, res) => {
  if (!req.session.user_id) return res.redirect(`/login`);
  else {
    return res.redirect(`/urls`);
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const generateRandomString = () => {
  let s = "";
  for (let i = 0; i < 6; i++) {
    let character = Math.floor(Math.random() * 25 + 65); // uppercase
    if (Math.floor(Math.random() * 2 + 1) === 1) {
      s += String.fromCharCode(character).toLowerCase();
    } else {
      s += String.fromCharCode(character);
    }
    
  }
  return s;
};
generateRandomString();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req);
  const templateVars = { shortURL: req.params.shortURL, longURL: req.originalUrl};
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
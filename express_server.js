const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");



app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const getRandomInt = function (max) {
  return Math.floor(Math.random() * max);
}

const generateRandomString = function(numDigits) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < numDigits; i++) {
    str += chars[getRandomInt(chars.length)];
  } 
  return str;
}

//Get 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"],
};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//get addition for edit 
app.get("/urls/:id/edit", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_edit", templateVars);
});

// url addition 
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body["longURL"];
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/urls/${shortUrl}/n`);
});


// url addition for edit
app.post("/urls/:id/edit", (req, res) => { //edit post all lowercase
  const longUrl = req.body.longURL
  const shortUrl = req.body.shortUrl
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/urls/${shortUrl}`);
});
//login request
app.post('/login', (req, res) => {

  const username = req.body.username;
  res.cookie('username', username);

  res.redirect('/urls');
});

//logout request
app.post('/logout', (req, res) => {

  const username = req.body.username;
  res.clearCookie('username', username);

  res.redirect('/urls');
});
//redirect "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = urlDatabase[shortUrl];
  
  (longUrl);
});

//delete
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




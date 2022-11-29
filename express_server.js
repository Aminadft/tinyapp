const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

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


app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// url addition 
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body["longURL"];
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/urls/${shortUrl}/n`);
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




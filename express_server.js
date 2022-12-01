const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; 
const morgan = require("morgan");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"))

const urlDatabase = {
  "b2xVn2": {
   "longURL": "http://www.lighthouselabs.ca",
   userID: "abc"},
  "9sm5xK":{
    "longURL": "http://google.com",
    userID: "abc"},
}

const usersDatabase = {
  abc: {
    id: 'abc',
    email: 'a@y.com',
    password: '1234'
  },
  aba: {
    id: 'aba',
    email: 'a@b.com',
    password: '1234'
  }
}

//Generate random short URL ID
const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};
//returns null if user does not exist, returns user object if found
const getUserByEmail = (email) => {
  let result = null
  for (let ids in usersDatabase){
    if (email === usersDatabase[ids].email) {
      result = usersDatabase[ids]
    } 
  }
  return result
}

const urlsForUser = (id) => {
  let obj = {}
 
   for (let ids in urlDatabase){
    console.log(urlDatabase[ids])
     if (id === urlDatabase[ids].userID){
       obj[ids] = urlDatabase[ids]
     }
   }
   return obj
 }
 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userUrls = urlsForUser(req.cookies.user_id)

  const templateVars = { 
    urls: userUrls,
    user: usersDatabase[req.cookies.user_id]
  };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.cookies.user_id]
  };

  // if user is logged in, redirect user
  if (req.cookies.user_id){
    return res.redirect('/urls')
  }

  res.render("user_register", templateVars)
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email)


  if (!email || !password) {
    return res
    .status(400)
    .send('Error: You did not enter your email/password to register')
  } 
  
  if (user !== null) {
    return res
    .status(400)
    .send('Error: Email already exist')
    
  } 

  // adding user info to userDatabase
  usersDatabase[id] = {id: id, email: email, password: password}

  // storing user_id in cookie
  res.cookie('user_id', id)
  res.redirect('/urls')
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.cookies.user_id]
  };

  // if user is logged in, redirect user
  if (req.cookies.user_id) {
    return res.redirect('/urls')
  }
  
  res.render("user_login", templateVars);
})

// where form is for creating new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.cookies.user_id]
  };

  if (!req.cookies.user_id){
    return res.redirect('/login')
  }

  res.render("urls_new", templateVars);
});

// submit form for new shortURL then get redirected to /urls/shortId path
app.post("/urls", (req, res) => {
  const shortId = generateRandomString();
  urlDatabase[shortId] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  if (!req.cookies.user_id){
    return res.send('Invalid entry. Proceed to login to create new short URL')
  }


  res.redirect(`/urls/${shortId}`);
});


app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

// edit shortURL with a different longURL
app.post('/urls/:id', (req, res) => {

  // Neeed think more
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  res.redirect("/urls/");
});


app.post('/login', (req,res) =>{
  const email = req.body.email
  const password = req.body.password

  let user = getUserByEmail(email)


  if (!user){
   return res.status(403).send('Error: Email does not exist, please try again!')
  }

  if (user.password !== password){
    return res.status(403).send('Error: Password is incorrect, please try again!')
  }

  // then set the cookie
  res.cookie('user_id', user.id)
  res.redirect('/urls/')
})

app.post('/logout', (req, res) =>{

  console.log('logout', req.body)

  res.clearCookie('user_id')
  res.redirect('/login')
})

// shortId path
app.get("/urls/:id", (req, res) => {
  const userUrls = urlsForUser(req.cookies.user_id)
  const id = req.params.id

  if (!req.cookies.user_id) {
    return res.send("You must be logged in to view this page.")
  }

  if (!urlDatabase[req.params.id]){
    return res.send("The Short URL ID does not exist! Please try again.")
  }

  if (userUrls[id] === undefined){
    return res.send("This short URL does not belong to you.")
  }

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.cookies.user_id]
   };

  res.render("urls_show", templateVars);
});

// if you click on shortId on the page, you then get redirected to the longURL 
app.get("/u/:id", (req, res) => {
  const userUrls = urlsForUser(req.cookies.user_id)
  const id = req.params.id

  if (!req.cookies.user_id) {
    return res.send("You must be logged in to view this page :(")
  }

  if (!urlDatabase[req.params.id]){
    return res.send("The Short URL ID does not exist! Please try again.")
  }

  if (userUrls[id] === undefined){
    return res.send("This short URL does not belong to you :(")
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
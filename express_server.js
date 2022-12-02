const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {getUserByEmail, generateRandomString} = require("./helpers.js");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(cookieSession({
  name: 'session',
  keys: ['blah', 'blahblah']
}));

// Cookie Options
maxAge: 24 * 60 * 60 * 1000; // 24 hours

const urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    userID: "abc"
  },
  "9sm5xK": {
    "longURL": "http://google.com",
    userID: "abc"
  },
};

const usersDatabase = {
  abc: {
    id: 'abc',
    email: 'a@y.com',
    //hashing password
    password: '$2a$10$XDO3myxYYyoAycIhPKVjIO3ULLdjRIm2Ytzl0fKgr8D2z6.uO0rPG'
  },
  aba: {
    id: 'aba',
    email: 'a@b.com',
    password: '$2a$10$XDO3myxYYyoAycIhPKVjIO3ULLdjRIm2Ytzl0fKgr8D2z6.uO0rPG'
  }
};


const urlsForUser = (id) => {
  let obj = {};

  for (let ids in urlDatabase) {
    console.log(urlDatabase[ids]);
    if (id === urlDatabase[ids].userID) {
      obj[ids] = urlDatabase[ids];
    }
  }
  return obj;
};


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
  const userUrls = urlsForUser(req.session.user_id);

  const templateVars = {
    urls: userUrls,
    user: usersDatabase[req.session.user_id]
  };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };

  // if user is logged in, redirect user
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  res.render("user_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);
  const hashedPassword = bcrypt.hashSync(password, 10);
  //registration requires entry of each of the items i.e email/pswd
  if (!email || !password) {
    return res
      .status(400)
      .send('Error/Invalid: Please enter your email/password to register');
  }
  // Prompt for existing email being used during registration
  if (user) {
    return res
      .status(400)
      .send('Registration not possible as this email already exists. Please login instead.');

  }

  // adding user info to userDatabase upon successful registration
  usersDatabase[id] = {
    id: id, email: email, password: hashedPassword
  };

  // storing user_id session
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };

  // redirect user when logs in
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  res.render("user_login", templateVars);
});

// where form is for creating new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  // login is prerequisite to view content
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

// submit form for new shortURL then get redirected to /urls/shortId path
app.post("/urls", (req, res) => {
  const shortId = generateRandomString();
  urlDatabase[shortId] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortId}`)
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const userUrls = urlsForUser(req.session.user_id);
  // shortUrl cannot be created if login not complete
  if (!req.session.user_id) {
    return res.send('Invalid entry. Proceed to login to create new short URL');
  }
  if (urlDatabase[id] === undefined) {
    return res.send("Opps, the URL you are trying to delete does not exist :(");
  }
  delete urlDatabase[id]
  res.redirect("/urls")

});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const userUrls = urlsForUser(req.session.user_id);

  //error message return
  if (urlDatabase[id] === undefined) {
    return res.send('This URL that you are accessing doesnt exist');
  }
  if (!req.session.user_id) {
    return res.send('Editing urls not possible as login required');
  }
  if (userUrls[id].userID !== userId) {
    return res.send('Editing not possible');
  }
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  };

  res.redirect("/urls/");
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);


  //cannot login without email and password entry
  if (!email || !password) {
    return res.status(400)
      .send('Cannot login. Email entered doesnt exist');
  }

  //check for user status in database
  if (!user) {
    return res.status(403).send('Error: Email does not exist, try again!');
  }
  const userId = user.id;
  const hashedPassword = usersDatabase[userId].password;
  const passwordWorks = bcrypt.compareSync(password, hashedPassword);
  // check for password input success
  if (!passwordWorks) {
    return res.status(403).send('Error: Password is incorrect, attempt back!');
  }

  //userID is generated when login attempt is succesful
  req.session.user_id = userId;
  res.redirect('/urls/');
});


// shortId path
app.get("/urls/:id", (req, res) => {
  
  if (!req.session.user_id) {
    return res.send("Staying logged in required to view this page.");
  }
  
  const userUrls = urlsForUser(req.session.user_id);
  const id = req.params.id;
  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL ID does not exist! try back.");
  }

  if (userUrls[id] === undefined) {
    return res.send("This short URL does not belong to you.");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

// if you click on shortId on the page, you then get redirected to the longURL 
app.get("/u/:id", (req, res) => {
 

  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL ID does not exist! try back.");
  }


  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {

  //   console.log('logout', req.body)
  req.session = null;
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
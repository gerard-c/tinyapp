const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

let loggedIn = false;

const generateRandomString = () => {
  // generates 6 "random" alphanumeric characters to function as a shortened URL
  let output = '';
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

const emailLookup = (targetEmail) => {
  for (const user in users) {
    if (users[user].email === targetEmail) {
      return true;
    }
  }
  return false;
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
};

app.get('/urls', (req, res) => {
  // content of urlDatabase to be displayed on /urls
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // route to page where user can input new URLs to be shortened
  if (!loggedIn) {
    return res.redirect('/login');
  }
  res.render('urls_new', { user: users[req.cookies['user_id']] });
});

app.get('/login', (req, res) => {
  if (loggedIn) {
    return res.redirect('urls');
  }
  res.render('urls_login', { user: users[req.cookies['user_id']] });
});

app.get('/register', (req, res) => {
  if (loggedIn) {
    return res.redirect('urls');
  }
  res.render('urls_register', { user: users[req.cookies['user_id']] });
});

app.get('/urls/:shortURL', (req, res) => {
  // content of /urls and urlDatabase to be used in separate pages of shortened URLs
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  // clicking on any of the shortURL links will redirect the user to the corresponding longURL in the urlDatabase object
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  loggedIn = false;
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  let userID = '';
  if (!emailLookup(req.body.email)) {
    return res.status(403).send('There is no user registered to that email address');
  }
  for (const user in users) {
    console.log(users[user].password, req.body.password);
    if (users[user].password === req.body.password) {
      userID = users[user].id;
      res.cookie('user_id', users[userID].id);
      loggedIn = true;
      return res.redirect('/urls');
    }
  }
  return res.status(403).send('Incorrect password');
});
  
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please enter an email and a password');
  }
  if (emailLookup(req.body.email)) {
    return res.status(400).send('That email is already in use');
  }
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', users[randomID].id);
  loggedIn = true;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // updates urlDatabase to include URL given in form, assigned to a random string as a shortened URL
  if (!loggedIn) {
    return res.redirect('/login');
  }
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/u/:shortURL', (req, res) => {
  // updates existing shortURL with new longURL specified in input field
  let longURL = req.body.newURL;
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  // when "edit" button on index is clicked, redirects to approprite shortURL page
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // routes to delete buttons on index page, causing properties to be deleted from urlDatabase
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Express listening on port ${PORT}!`);
});
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const generateRandomString = () => {
  // generates 6 "random" alphanumeric characters to function as a shortened URL
  let output = '';
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// app.post('/login', (req, res) => {
//   // saves input entry to cookies as 'username'
//   res.cookie('username', req.body.username);
//   res.redirect('/urls');
// });

// app.post('/logout', (req, res) => {
//   res.clearCookie('user_id');
//   res.redirect('/register');
// });

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please enter an email and a password');
  }
  const randomID = generateRandomString()
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', users[randomID]);
  console.log(users);
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  // content of urlDatabase to be displayed on /urls
  const templateVars = {
    user: users[req.cookies['user_id'].id],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // route to page where user can input new URLs to be shortened
  res.render('urls_new', { user: users[req.cookies['user_id'].id] });
});

app.get('/register', (req, res) => {
  res.render('urls_register', { user: users[req.cookies['user_id'].id] });
});

app.post('/urls', (req, res) => {
  // updates urlDatabase to include URL given in form, assigned to a random string as a shortened URL
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = longURL;
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

app.get('/urls/:shortURL', (req, res) => {
  // content of /urls and urlDatabase to be used in separate pages of shortened URLs
  const templateVars = {
    user: users[req.cookies['user_id'].id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  // clicking on any of the shortURL links will redirect the user to the corresponding longURL in the urlDatabase object
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
  console.log(users);
});
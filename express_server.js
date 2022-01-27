const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { urlDatabase, users } = require('./database');
const { emailLookup, generateRandomString, urlsForUser, back } = require('./functions');

const app = express();
const PORT = 8080; // default

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key1', 'secret-key2', 'secret-key3'] // placeholder keys
}));

app.set('view engine', 'ejs');

// *-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-* GET ROUTES  *-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*

app.get('/urls', (req, res) => {
  // content of urlDatabase to be displayed on /urls
  if (!req.session['user_id']) {
    return res.status(403).send('<a href="/login">Login</a> or <a href="/register">Register</a> to view URL index');
  }
  const userURLs = urlsForUser(urlDatabase, req.session['user_id']);
  const templateVars = {
    user: users[req.session['user_id']],
    urls: userURLs
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // route to page where user can input new URLs to be shortened
  if (!req.session['user_id']) {
    return res.status(403).send('<a href="/login">Login</a> or <a href="/register">Register</a> to shorten new URLs');
  }
  res.render('urls_new', { user: users[req.session['user_id']] });
});

app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('urls');
  }
  res.render('urls_login', { user: users[req.session['user_id']] });
});

app.get('/register', (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('urls');
  }
  res.render('urls_register', { user: users[req.session['user_id']] });
});

app.get('/urls/:shortURL', (req, res) => {
  // content of /urls and urlDatabase to be used in separate pages of shortened URLs
  for (const url in urlDatabase) {
    if (req.params.shortURL === url) {
      const templateVars = {
        user: users[req.session['user_id']],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL
      };
      return res.render('urls_show', templateVars);
    }
  }
  res.status(404).send('Specified page cannot be found');
});

app.get('/u/:shortURL', (req, res) => {
  // clicking on any of the shortURL links will redirect the user to the corresponding longURL in the urlDatabase object
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// *-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-* POST ROUTES *-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) { // error screen if either input is empty
    return res.status(400).send('Please enter an email and a password' + back('/login'));
  }

  if (!emailLookup(users, req.body.email)) {  // error screen if email not in database
    return res.status(403).send('There is no user registered to that email address' + back('/login'));
  }

  for (const user in users) {
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session['user_id'] = users[user].id;
      return res.redirect('/urls');
    }
  }
  return res.status(403).send('Incorrect password' + back('/login'));
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) { // error screen if either input is empty
    return res.status(400).send('Please enter an email and a password' + back('/register'));
  }

  if (emailLookup(users, req.body.email)) { // error screen if email already in database
    return res.status(400).send('That email is already in use' + back('/register'));
  }

  const randomID = generateRandomString();

// generates new user object using random string as an id, and contents of input fields for name and password
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10) // provided password is hashed for security
  };
  
  // automatically logs new user in by saving (encrypted) id string to cookies
  req.session['user_id'] = users[randomID].id;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // updates urlDatabase to include URL given in form, assigned to a random string as a shortened URL
  if (!req.session['user_id']) {
    return res.redirect('/login');
  }

  const shortURL = generateRandomString();
  let longURL = req.body.longURL;

  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session['user_id']
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post('/u/:shortURL', (req, res) => {
  // updates existing shortURL with new longURL specified in input field
  if (!Object.keys(urlsForUser(urlDatabase, req.session['user_id'])).includes(req.params.shortURL)) {
    return res.status(403).send('You do not have permission to edit this URL');
  }
  let longURL = req.body.newURL;
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  // when "edit" button on index is clicked, redirects to approprite shortURL page
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // routes to delete buttons on index page, causing properties to be deleted from urlDatabase
  if (!Object.keys(urlsForUser(urlDatabase, req.session['user_id'])).includes(req.params.shortURL)) {
    return res.status(403).send('You do not have permission to delete this URL' + back('/urls'));
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Express listening on port ${PORT}!`);
});
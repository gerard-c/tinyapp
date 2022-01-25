const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080; // default port for localhost

app.set('view engine', 'ejs');

const generateRandomString = () => {
  // function generates "random" series of alphanumeric characters to function as a shortened URL
  let output = '';
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';

  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls', (req, res) => {
  // content of urlDatabase to be displayed on /urls
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // route to page where user can input new URLs to be shortened
  res.render('urls_new');
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
  const shortURL = req.params.shortURL;
  let longURL = req.body.newURL
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  // content of /urls and urlDatabase to be used in separate pages of shortened URLs
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  // clicking on any of the shortURL links will redirect the user to the corresponding longURL in the urlDatabase object
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL', (req, res) => {
  // when edit button on index page is clicked, redirects to approprite shortURL page
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // routes to delete buttons on index page, causing properties to be deleted from urlDatabase
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`tinyApp listening on port ${PORT}!`);
});
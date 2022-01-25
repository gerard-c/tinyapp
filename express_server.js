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

app.get('/', (req, res) => {
  // displays message on homepage (designated by / as an empty path)
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  // displays JSON string with content of URL database on /urls.json
  res.json(urlDatabase);
});

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
  let _longURL = req.body.longURL;
  if (!_longURL.includes('http://')) {
    _longURL = 'http://' + _longURL;
  }
  urlDatabase[shortURL] = _longURL;
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

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  // HTML formatting to display Hello World with World in bold
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Example app listening on port ${PORT}!`);
});
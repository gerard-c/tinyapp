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
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  // updates urlDatabase to include URL given in form, assigned to a random string as a shortened URL
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);
  res.send('Ok');
});

app.get('/urls/:shortURL', (req, res) => {
  // content of /urls and urlDatabase to be used in separate pages of shortened URLs
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  // HTML formatting to display Hello World with World in bold
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Example app listening on port ${PORT}!`);
});
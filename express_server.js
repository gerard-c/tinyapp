const express = require('express');
const app = express();
const PORT = 8080; // default port for localhost

app.set('view engine', 'ejs');

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

app.get('/hello', (req, res) => {
  // HTML formatting to display Hello World with World in bold
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Example app listening on port ${PORT}!`);
});
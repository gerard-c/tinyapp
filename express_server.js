const express = require('express');
const app = express();
const PORT = 8080; // default port for localhost

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  // prints message to homepage (designated by / as an empty path)
  res.send('Hello!');
});

app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Example app listening on port ${PORT}!`);
});
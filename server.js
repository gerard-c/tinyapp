// NPM packages required by app
const express = require('express'); // handles http
const morgan = require('morgan'); //useful troubleshooting tool
const methodOverride = require('method-override'); // simulates methods beyond GET and POST
const bodyParser = require('body-parser'); // used to read body of http in detail
const cookieSession = require('cookie-session'); // cookie-handling which facilitates secure cookies
const bcrypt = require('bcryptjs'); // used to hash passwords for security

// separate files to handle data and functions, saving space in server file
const { urlDatabase, users } = require('./database'); // databases accessed by server
const { getUserByEmail, generateRandomString, urlsForUser, generateGoBackHtml } = require('./helpers'); // helper functions

const app = express(); // shorthand for express functions
const PORT = 8080; // default

// _method is used in HTML form actions to use otherwise unavailable methods
app.use(methodOverride('_method'));

app.use(morgan('short')); // tells morgan to print http requests in short form

app.use(bodyParser.urlencoded({ extended: true })); // enables body-parser to provide more detailed information

// enables cookie-session
app.use(cookieSession({
  name: 'session',  // default
  keys: ['secret-key1', 'secret-key2'] // placeholder keys
}));

// allows server to interact with logic on ejs templates
app.set('view engine', 'ejs');

let loggedIn = false;


// *-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-* GET ROUTES  *-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*


// ***** NOTE *****
// Most get routes pass user cookie data and the "loggedIn variable
// to their appropriate ejs templates in order to determine what is shown
// on the persistent header. More info on /views/partials/_header.ejs


// login page with email and password inputs
app.get('/login', (req, res) => {

  if (req.session['user_id'] || loggedIn) {
    return res.redirect('/urls');
  }

  res.render('urls_login', { user: users[req.session['user_id']], loggedIn : loggedIn });
});


// registration page with email and password inputs
app.get('/register', (req, res) => {

  if (req.session['user_id'] || loggedIn) {
    return res.redirect('/urls');
  }

  res.render('urls_register', { user: users[req.session['user_id']], loggedIn : loggedIn });
});


// user appropriate content of urlDatabase to be displayed on /urls
app.get('/urls', (req, res) => {

  if (!req.session['user_id'] || !loggedIn) {

    req.session['user_id'] = null;

    return res.status(403).send('<a href="/login">Login</a> or <a href="/register">Register</a> to view URL index');
  }

  // urls in database associated with user assigned to a variable
  const userURLs = urlsForUser(urlDatabase, req.session['user_id']);
  
  const templateVars = {
    user: users[req.session['user_id']],
    loggedIn : loggedIn,
    urls: userURLs
    
  };

  res.render('urls_index', templateVars);
});


// user may input new URLs to be shortened on /urls/new
app.get('/urls/new', (req, res) => {

  if (!req.session['user_id'] || !loggedIn) {

    req.session['user_id'] = null;

    return res.redirect('/login');
  }

  res.render('urls_new', { user: users[req.session['user_id']], loggedIn : loggedIn });
});


// unique page generated for each shortened URL
app.get('/urls/:id', (req, res) => {

  if (!req.session['user_id'] || !loggedIn) {

    req.session['user_id'] = null;

    return res.status(403).send('<a href="/login">Login</a> or <a href="/register">Register</a> to view shortened URLs');
  }

  // iterates through all URLs to access data related to specific shortURL
  for (const url in urlDatabase) {
    if (req.params.id === url) {
      const url = urlDatabase[req.params.id];

      const templateVars = {
        user: users[req.session['user_id']],
        loggedIn : loggedIn,
        shortURL: req.params.id,
        longURL: url.longURL,
        visitCount: url.visitCount,
      };

      return res.render('urls_show', templateVars);
    }
  }

  res.status(404).send('Specified page cannot be found');
});


// links to URL tied to specific shortURL
app.get('/u/:id', (req, res) => {

  // iterates through all URLs to access data related to specific shortURL
  for (const url in urlDatabase) {
    if (req.params.id === url) {

      // URL tied to shortURL assigned to variable
      const longURL = urlDatabase[url].longURL;

      // increments URLs visit count every time /u/:id is accessed
      urlDatabase[req.params.id].visitCount++;

      // clicking on any of the shortURL links will redirect the user to the corresponding longURL in the urlDatabase object
      // alternatively, being linked to /u/shortURL from elsewhere will immediately redirect to the related longURL
      return res.redirect(longURL);
    }
  }

  // error HTML is specified shortURL cannot be found in database
  res.status(404).send('Specified page cannot be found');
});


// *-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-* POST ROUTES *-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*


// post triggered by clicking logout button on header
app.post('/logout', (req, res) => {

  // clears user cookies and redirects user to login page
  req.session['user_id'] = null;
  loggedIn = false;
  res.redirect('/login');
});


// post triggered by clicking submit button on login page
app.post('/login', (req, res) => {

  if (!req.body.email || !req.body.password) { // error HTML if either input is empty
    return res.status(400).send('Please enter an email and a password' + generateGoBackHtml('/login'));
  }

  if (!getUserByEmail(users, req.body.email)) { // error HTML if email not in database
    return res.status(403).send('There is no user registered to that email address' + generateGoBackHtml('/login'));
  }

  for (const user in users) {

    // compares hashed password input to hashed password connected to relevant email in users database
    if (bcrypt.compareSync(req.body.password, users[user].password)) {

      // on match, logs in by setting (encrypted) user cookies and redirects to url index
      loggedIn = true;
      req.session['user_id'] = users[user].id;
      return res.redirect('/urls');
    }
  }

  // error HTML if matching password is not found
  return res.status(403).send('Incorrect password' + generateGoBackHtml('/login'));
});


// post triggered by clicking submit button on register page
app.post('/register', (req, res) => {

  if (!req.body.email || !req.body.password) { // error HTML if either input is empty
    return res.status(400).send('Please enter an email and a password' + generateGoBackHtml('/register'));
  }

  if (getUserByEmail(users, req.body.email)) { // error HTML if email already in database
    return res.status(400).send('That email is already in use' + generateGoBackHtml('/register'));
  }

  const randomID = generateRandomString(); // generates "random," "unique" ID for user

  // generates new user object using random string as an id, and contents of input fields for name and password
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10) // provided password is hashed for security
  };

  // automatically logs new user in by saving (encrypted) ID string to cookies
  loggedIn = true;
  req.session['user_id'] = users[randomID].id;
  res.redirect('/urls');
});


// post triggered by clicking submit on urls/new page
app.post('/urls', (req, res) => {

  if (!req.body.longURL) { // error HTML if input is empty
    return res.status(400).send('Please enter a URL to be shortened' + generateGoBackHtml('/urls/new'));
  }

  const shortURL = generateRandomString(); // generates "random," "unique" ID for shortened URL
  let longURL = req.body.longURL; // URL from input

  // checks if provided URL starts with "http://" and adds it to string if absent
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }

  // URL added to database under random ID generated earlier
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session['user_id'], // user ID saved to cookies assigned to URL object to determine ownership
    visitCount: 0,
  };

  // redirects to urls_show page for newly created shortURL
  res.redirect(`/urls/${shortURL}`);
});


// put triggered by clicking submit on urls_show page (next to edit input)
app.put('/urls/:id', (req, res) => {

  // checks if current users URLs include the shortURL shown on the current page
  if (!Object.keys(urlsForUser(urlDatabase, req.session['user_id'])).includes(req.params.id)) {

    // error HTML if URL does not belong to current user
    return res.status(403).send('You do not have permission to edit this URL');
  }

  // contents of input saved to variable
  let longURL = req.body.newURL;

  // checks if provided URL starts with "http://" and adds it to string if absent
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL;
  }

  // view count goes generateGoBackHtml down to 0 when destination is changed
  urlDatabase[req.params.id].visitCount = 0;

  // updates destination of shortened URL to match URL provided in input
  urlDatabase[req.params.id].longURL = longURL;

  // redirects to updated page (effectively a refresh)
  res.redirect(`/urls/${req.params.id}`);
});


// post triggered by clicking edit button on URL index page
app.post('/urls/:id', (req, res) => {

  // links to urls_show page of relevant URL
  res.redirect(`/urls/${req.params.id}`);
});


// delete triggered by clicking delete button on URL index page
app.delete('/urls/:id', (req, res) => {

  // checks if current users URLs include the shortURL associated with the delete
  // button. this may seem redundant as delete buttons cannot be seen by non approved
  // users, but this check prevents page access permissions from being bypassed by APIs
  if (!Object.keys(urlsForUser(urlDatabase, req.session['user_id'])).includes(req.params.id)) {

    // appropriately snarky error HTML
    return res.status(403).send('You do not have permission to delete this URL, hackerman');
  }

  // deletes target URL from database if permissions pass
  delete urlDatabase[req.params.id];

  // redirects to updated page (effectively a refresh)
  res.redirect('/urls');
});


// starts the server on specified port (8080 by default)
app.listen(PORT, () => {
  // message to console confirming that server is running
  console.log(`Express listening on port ${PORT}!`);

  app.get('/', (req, res) => {
    if (!req.session['user_id']) {
      return res.redirect('/login');
    }
    res.redirect('/urls');
  });
});
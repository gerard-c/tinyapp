// anchor tag links to specified path out of error screens while keeping .send text clean
const back = (route) => {
  return `<br><a href="${route}">BACK</a>`;
}


// checks user emails against target email and returns true or false
const getUserByEmail = (data, targetEmail) => {

  // iterates through database comparing values of email keys to target email
  for (const user in data) {
    if (data[user].email === targetEmail) {
      return true;
    }
  }
  return false;
};


// generates 6 "random" alphanumeric characters to function as a shortened URL or user ID
const generateRandomString = () => {
  let output = ''; // output starts as empty string

  //all possible characters that may be added to output
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';

  for (let i = 0; i < 6; i++) { // loop will run 6 times to make 6 characters

    // each loop will pick a character at random and add it to the output
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};


// sorts through urls and returns only those made by the specified user
const urlsForUser = (data, id) => {
  const output = {};
  
  //creates array containing the ID strings of database
  const compare = Object.keys(data);
  for (const key of compare) {

    // if the user ID of a shortened URL matches the provided ID,
    // are added to the output object as { shortURL: longURL }
    if (data[key].userID === id) {
      output[key] = data[key].longURL;
    }
  }
  return output;
};


module.exports = {
  back,
  getUserByEmail,
  generateRandomString,
  urlsForUser
}
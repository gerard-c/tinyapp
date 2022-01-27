// anchor tag links to specified path out of error screens while keeping .send text clean
const back = (route) => {
  return `<br><a href="${route}">BACK</a>`;
}

// checks user emails against target email and returns true or false
const emailLookup = (data, targetEmail) => {
  for (const user in data) {
    if (data[user].email === targetEmail) {
      return true;
    }
  }
  return false;
};

// generates 6 "random" alphanumeric characters to function as a shortened URL or user ID
const generateRandomString = () => {
  let output = '';
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

// sorts through urls and returns only those made by the specified by user
const urlsForUser = (data, id) => {
  const output = {};
  const compare = Object.keys(data);
  for (const key of compare) {
    if (data[key].userID === id) {
      output[key] = data[key].longURL;
    }
  }
  return output;
};

module.exports = {
  back,
  emailLookup,
  generateRandomString,
  urlsForUser
}
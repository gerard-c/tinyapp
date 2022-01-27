const back = (route) => {
  return `<br><a href="${route}">BACK</a>`;
}

const emailLookup = (data, targetEmail) => {
  for (const user in data) {
    if (data[user].email === targetEmail) {
      return true;
    }
  }
  return false;
};

const generateRandomString = () => {
  // generates 6 "random" alphanumeric characters to function as a shortened URL
  let output = '';
  const characters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

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
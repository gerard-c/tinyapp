const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  sgq3y6: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  qr6Yf0: {
    longURL: "https://www.youtube.com",
    userID: "userRandomID"
  },
  fE4unP: {
    longURL: "https://www.facebook.com",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', () => {
  it('should return true for a user with a valid email', () => {
    const output = getUserByEmail(testUsers, 'user@example.com');
    assert.isTrue(output);
  });
  it('should return false for a user with an invalid email', () => {
    const output = getUserByEmail(testUsers, 'user3@example.com');
    assert.isFalse(output);
  });
  it('should return false if arguments are missing', () => {
    const output = getUserByEmail();
    assert.isFalse(output);
  });
});

describe('urlsForUser', () => {
  it('should return URLs associated with given ID only', () => {
    const output = urlsForUser(testURLs, 'userRandomID');
    const expected = { b6UTxQ: 'https://www.tsn.ca', qr6Yf0: 'https://www.youtube.com' };
    assert.deepEqual(output, expected);
  });
  it('should return empty object when provided data does not contain URLs from provided ID', () => {
    const output = urlsForUser(testURLs, 'user3RandomID');
    const expected = {};
    assert.deepEqual(output, expected);
  });
});
const { assert } = require('chai');

const { userExists, urlExists, getUserId, urlsForUser } = require('../helpers');

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

describe('getUserId', function() {
  it('should return a user with valid email', function() {
    const user = getUserId("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it('should return false for an email not in the db', function() {
    const user = getUserId("user@banana.com", testUsers)
    assert.isFalse(user);
  });
});
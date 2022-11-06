// Generates a random string for creating ids and cookies
function generateRandomString() {
  return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('');
};

// Checks to see if a user exists in the database
function userExists(userEmail, userList) {
  for (const user in userList) {
    if (userList[user].email === userEmail) {
      return true;
    }
  }
  return false;
};

// Checks to see if a URL exists in the database
function urlExists(entered, urlList) {
  for (const url in urlList) {
    if (url === entered) {
      return true;
    }
  }
  return false;
};

// Gets the id of a User based on their email
function getUserId(userEmail, userList) {
  for (const user in userList) {
    if (userList[user].email === userEmail) {
      return userList[user].id;
    }
  }
  return false;
};

// Collects the URLs associated with a specific user id
function urlsForUser(id, urlList) {
  const filteredUrls = {};
  
  for (let url in urlList) {
    if (urlList[url].userId === id) {
      filteredUrls[url] = urlList[url];
    }
  }
  return filteredUrls;
}

module.exports = {
  generateRandomString,
  userExists,
  urlExists,
  getUserId,
  urlsForUser
};
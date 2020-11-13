const { assert } = require('chai');

const {deleteitem,validateEmail,getUserByEmail} = require("../script/helper");

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

describe('validateEmail', function() {
  it('should return false if the email exists in database', function() {
    const valid = validateEmail(testUsers, "user2@example.com");
    const expectedOutput = false;
    assert.strictEqual(valid,expectedOutput);
    // Write your assert statement here
  });
  it('should return true if the email doesn\'t exists in database', function() {
    const valid = validateEmail(testUsers, "user2@exawanjinmple.com");
    const expectedOutput = true;
    assert.strictEqual(valid,expectedOutput);
    // Write your assert statement here
  });
});
describe('getUserByEmail', function() {
  it('should return a userID with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user,expectedOutput);
    // Write your assert statement here
  });
  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("HelloWorld", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user,expectedOutput);
    // Write your assert statement here
  });
});
describe('Deleteitem', function() {
  it('should delete item', function() {
    deleteitem("userRandomID",testUsers);
    const actual = Object.keys(testUsers).length;
    const expectedOutput = 1;
    assert.strictEqual(actual,expectedOutput);
    // Write your assert statement here
  });
});
const generateRandomString = () => {
  let s = "";
  for (let i = 0; i < 6; i++) {
    let temparray = [];
    let character = Math.floor(Math.random() * 26 + 65); // uppercase
    temparray.push(String.fromCharCode(character).toLowerCase());
    temparray.push(String.fromCharCode(character));
    temparray.push(String.fromCharCode(Math.random() * 10 + 48));
    s += temparray[Math.floor(Math.random() * 3)];
  }
  return s;
};
const deleteitem = (url,data) => {
  delete data[url];
};
const validateEmail = (data, email) => {
  if (!email) return false;
  for (const id in data) {
    if (data[id].email === email) {
      return false;
    }
  }
  return true;
};
const logincheck = (req,data) => {
  for (const id in data) {
    if (id  === req.cookies[`user_id`]) {
      return id;
    }
  }
  return "";
};
const urlsForUser = (data,id) => {
  const userurls = {};
  for (const shorturl in data) {
    if (data[shorturl].userID === id) {
      userurls[shorturl] = data[shorturl];
    }
  }
  return userurls;
};

module.exports = {generateRandomString,deleteitem,validateEmail,logincheck,urlsForUser};
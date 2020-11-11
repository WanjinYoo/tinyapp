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

module.exports = {generateRandomString,deleteitem};
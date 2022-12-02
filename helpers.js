//Generate random short URL ID
const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};


const getUserByEmail = (email, database) => {
  for (let ids in database){
    if (email === database[ids].email) {
     return database[ids]
    } 
  }
}

module.exports = { getUserByEmail, generateRandomString };
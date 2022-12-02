//  bcrypt.genSalt(10).then(salt => {
//  return bcrypt.hash('secret', salt)
//  }).then(hash => {
//   console.log("HASH", hash);
//  });
const bcrypt = require('bcryptjs');
console.log(bcrypt);
const plaintextPass = '1234';
const Salt = bcrypt.genSaltSync(10);
console.log(Salt);
const hash = bcrypt.hashSync(plaintextPass, Salt);
console.log(hash);
var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/users.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getUser(user) {
    return new Promise((resolve, reject) => {
        db.findOne({user}, (err,data) => {
               if(err) {
                      reject(err);
               } else {
                      resolve(data);
               }
        });
    });
}

function updateUser(user, viz_account, balance) {
  return new Promise((resolve, reject) => {
  db.update({user}, {user, viz_account, balance}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
  });
  });
}

function findAllUsers() {
  return new Promise((resolve, reject) => {
  db.find({}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
      });
});
}

module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.findAllUsers = findAllUsers;
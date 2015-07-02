var UserFactory = function() {
  var users = []; // {username: '',password: ''} //to username tha einai kai to id sta sockets.

  this.getUser = function(username) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        return users[i];
      }
    }
    return undefined;
  };

  this.removeUser = function(username) {
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        userIndex = i;
        break;
      }
    }
    users.splice(userIndex, 1);
  }

  this.signin = function(username, password) {
    var user = this.getUser(username);
    if (user === undefined) {
      user = {
        username: username,
        password: password
      };
      users.push(user);
    }
    if (user.password === password) {
      return user;
    } else {
      return undefined;
    }


  };


};


module.exports = new UserFactory();

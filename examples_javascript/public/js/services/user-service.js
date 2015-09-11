function UserService($rootScope, $http, $cookies, $location) {
  /*xrisimopoiw autin tin fasi me $rootScope gia na: otan o xristis sto mellon kanei signin apo ena tab kai eixe anoixto
  ena akoma tab pou den eixe kanei signin, tote automatos me socket.io 9a dinw event sto  service.signin kai auto me to rootscope$broadcast
  9a stelnei event sto sign-controller gia na kanei connect me to chat  */
  var service = {};
  
  service.signin = function(username, password) {
    if (username && password) {
      $http.post('/signin', {
        username: username,
        password: password
      }).then(function(res) {
        SetCredentials(res.data.username);
        //  $rootScope.$broadcast('signin', res.data.username);
        $location.path('/');
        $location.replace();
        //connectChat(res.data.username);
      }, function(errorRes) {
        alert(errorRes.data);
      });
    }
  };

  function SetCredentials(username) {
    // var authdata = Base64.encode(username + ':' + password);
    var currentUser = {
      username: username
    };
    $rootScope.globals = {
      currentUser: currentUser
    };

    $http.defaults.headers.common['Authorization'] = 'Basic ' + currentUser.username; // jshint ignore:line
    console.log('putting to cookies: ' + currentUser.username);
    $cookies.putObject('user', currentUser);
  }

  function ClearCredentials() {
    $rootScope.globals = {};
    $cookies.remove('user');
    $http.defaults.headers.common.Authorization = 'Basic ';
  }

  return service;
}

angular.module('textme').factory('UserService', ['$rootScope', '$http', '$cookies', '$location', UserService]);

function SigninController($scope, $rootScope, $location, $socket, UserService, ChatService) {


  //auto meta kapws na to kalw kai apo cookies kserw'gw

  /*    $rootScope.$on('signin', function(evt, username) {
             $location.path('/');
             $location.replace();
      });
  */

  $scope.signin = function() {
    UserService.signin($scope.username, $scope.password);

  };
}

angular.module('textme').controller('SigninController', ['$scope', '$rootScope', '$location', '$socket', 'UserService', 'ChatService', SigninController]);

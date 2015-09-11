angular.module('textme', ['ngRoute', 'ngCookies']).config(config).run(run);

config.$inject = ['$routeProvider', '$locationProvider'];

function config($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
        templateUrl: 'partials/chat.html',
        resolve: {
          load: function($q, $socket,$cookies,ChatService) {
            var defer = $q.defer();
            var user = $cookies.getObject('user');
            if (user) {
              var username = user.username;
              ChatService.connect().then(function() {
                $socket.emit('set username', username, function(data) {
                  ChatService.me = data.user;
                  ChatService.roomNames = data.roomNames;
                  ChatService.rooms = data.rooms;
                  console.log('setting chatserver me and room names');
                  defer.resolve();
                });
              });
            } else {
              defer.reject("not_logged_in");
            }
            return defer.promise;

          }
        }
        })
      .when('/signin', {
        templateUrl: 'partials/signin.html'
      })
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);
    }

  run.$inject = ['$rootScope', '$location', '$cookies', '$http', '$timeout', '$socket', 'ChatService'];

  function run($rootScope, $location, $cookies, $http, $timeout, $socket, ChatService) {
    // keep user logged in after page refresh
    $rootScope.globals = {
      currentUser: $cookies.getObject('user')
    } || {};

    // if ($rootScope.globals.currentUser) {
    //   var username = $rootScope.globals.currentUser.username;
    //   $http.defaults.headers.common['Authorization'] = 'Basic ' + username; // jshint ignore:line
    //
    //   //  $rootScope.$broadcast('signin',  $rootScope.globals.currentUser.username);
    //   ChatService.connect().then(function() {
    //     $socket.emit('set username', username, function(data) {
    //       ChatService.me = data.user;
    //       ChatService.roomNames = data.roomNames;
    //       console.log('setting chatserver me and room names');
    //     });
    //   });
    //
    // }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = $.inArray($location.path(), ['/signin', '/register']) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
        $location.path('/signin');
      }
    });
  }

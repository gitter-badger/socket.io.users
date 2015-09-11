function SocketService($rootScope, $timeout, $q) {
  var socket;

  function initSocket() {
    if (!socket) {
      socket = io.connect('/');

      socket.on('connect', function() {
        console.log('socket connected');

      });

      socket.on('disconnected', function() {
        service.destroy();
      });

    }
    // else {
    //   socket.socket.connect();
    // }
  }

  var asyncAngularify = function(callback) {
    return callback ? function() {
      var args = arguments;
      $timeout(function() {
        callback.apply(socket, args);
      }, 0);
    } : angular.noop;
  };

  var service = {};
  service.events = [];

  service.connect = function() {
    var deferred = $q.defer();

    socket = io.connect('/');
    socket.on('connect', function() {
      deferred.resolve();
    });
    
    socket.on('disconnected', function() {
      service.destroy();
    });

    return deferred.promise;
  };
  service.on = function(evtStr, callback) {

    if (service.events.indexOf(evtStr) === -1) {
      service.events.push(evtStr);
    }

    socket.on(evtStr, callback.__ng = asyncAngularify(callback));
  };

  service.off = function(evtStr, fn) {
    if (fn && fn.__ng) {
      arguments[1] = fn.__ng;
    }
    socket.removeListener.apply(socket, arguments);
  };

  service.emit = function() {
    // var args = Array.prototype.slice.call(arguments);
    // var evtStr = evt(args.shift());
    // socket.emit(evtStr, args);
    var lastIndex = arguments.length - 1;
    var callback = arguments[lastIndex];
    if (typeof callback === 'function') {
      callback = asyncAngularify(callback);
      arguments[lastIndex] = callback;
    }
    return socket.emit.apply(socket, arguments);
  };

  service.disconnect = function() {
    socket.socket.disconnect();
    if (service.events.length > 0) {
      service.destroy();
    }
  };

  service.destroy = function() {
    var listener;
    if (service.events.length > 0) {
      while (listener = service.events.prop()) {
        $rootScope.$off(listener);
        service.off(listener);
      }
    }
  };


  //initSocket();

  return service;
};

angular.module('textme').factory('$socket', ['$rootScope', '$timeout', '$q', SocketService]);

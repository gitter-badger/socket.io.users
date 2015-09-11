function ChatController($scope, $rootScope, $timeout, ChatService) {
  $scope.me = ChatService.me;
  $scope.roomNames = ChatService.roomNames;
  $scope.rooms = ChatService.rooms;

  //join to the first room (global) when view is ready.
  $timeout(function() {
    $('#' + $scope.rooms[0].name).addClass('active');
    $('button[aria-controls="' + $scope.rooms[0].name + '"]').addClass('active');
    $('#' + $scope.rooms[0].name).tab('show');
  }, 300);

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.sendMessage = function(room) { //dn xreiazome to msg variable edw gt to pernw mesa apto room.newMessage.
    //  var roomToSend = ChatService.getRoom(roomName);
  //  console.log('try to send msg to ' + roo.name);
    ChatService.sendMessage(room.name, room.newMessage).then(function(msgSent) {
      //    roomToSend.messages.push(msgSent);
      room.newMessage = '';

    }, function(error) {
      console.log('Error: ' + error);
    });
  };

  $scope.newMessageInputKeyPressed = function(evt, room) {
    if (evt.keyCode === 13) {
      $scope.sendMessage(room);
    }

  };

  $scope.joinRoom = function(roomName) {
    if (ChatService.canJoin(roomName)) {
      ChatService.joinRoom(roomName).then(function(theJoinedRoom) {
        //edw pros9ese ena tab me to new chat-messages area view autou tou room.
        console.log('joined to ' + theJoinedRoom.name);
        $timeout(function() {
          //  $('.tab-pane ul li.active').removeClass('active');
          $("div.tab-pane.active").removeClass('active');
          $('button[aria-controls]').removeClass('active');

          $('#' + theJoinedRoom.name).addClass('active');
          $('button[aria-controls="' + theJoinedRoom.name + '"]').addClass('active');
          $('#' + theJoinedRoom.name).tab('show');
        });
      });
    } else {
      alert('You are already joined to ' + roomName);
    }
  };

  $scope.createRoom = function(roomName) {
    $scope.joinRoom(roomName);
    $newRoomName = '';
  }

}

angular.module('textme').controller('ChatController', ['$scope', '$rootScope', '$timeout', 'ChatService', ChatController]);

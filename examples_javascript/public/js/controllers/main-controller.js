function MainController($scope) {

  jQuery(document).ready(function() {
    moment.locale('el');
  });
}

angular.module('textme').controller('MainController', ['$scope', MainController]);

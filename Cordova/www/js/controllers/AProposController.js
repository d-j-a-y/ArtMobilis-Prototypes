angular.module('artmobilis').controller('AProposController',
  ['$scope',
    '$location',
    '$cordovaGeolocation',
    '$stateParams',
    function (
      $scope,
      $location,
      $cordovaGeolocation,
      $stateParams
      ) {
        $scope.$on('$ionicView.enter', function (e) {

        });
        $scope.$on("$ionicView.loaded", function (e) {
          
        });

        $scope.$on("$ionicView.beforeLeave", function (e) {

        });


    }]);
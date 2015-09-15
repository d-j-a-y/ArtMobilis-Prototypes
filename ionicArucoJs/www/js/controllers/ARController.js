angular.module('artmobilis').controller('ARController',
  [ '$scope',
    '$cordovaGeolocation',
    '$stateParams',
    '$ionicModal',
    '$ionicPopup',
    'LocationsService',
    'InstructionsService',
    function(
      $scope,
      $cordovaGeolocation,
      $stateParams,
      $ionicModal,
      $ionicPopup,
      LocationsService,
      InstructionsService
      ) {
        $scope.video = null;
        // this has to be done BEFORE webcam authorization
        $scope.channel = {
          videoHeight: 800,
          videoWidth: 600,
          video: null // Will reference the video element on success
        };
        $scope.video = $scope.channel.video;

        // pause for a few milliseconds before accessing canvas
        setTimeout(function() {
            
            $scope.infos = angular.element(document.getElementById('infos'));
            $scope.canvas = angular.element(document.getElementById('canevas'));
            console.log("canvas: "+$scope.canvas);
            $scope.ctx = $scope.canvas[0].getContext("2d");
            $scope.ctx.moveTo(0,0);
            $scope.ctx.lineTo(200,100);
            $scope.ctx.stroke(); 
            console.log("context: "+$scope.ctx);
    
            $scope.detector = new AR.Detector();

            // start animation loop
            requestAnimationFrame($scope.tick);
        }, 1000);

    $scope.framecount = 0;
    $scope.channel = {};
    $scope.onError = function (err) {console.log("webcam onError");};
    $scope.onStream = function (stream) {
        console.log("webcam onStream, frame:" + $scope.framecount);
    };
    $scope.onSuccess = function () {
        console.log("webcam onSuccess, frame:" + $scope.framecount);
    };

    $scope.tick = function() {
        $scope.framecount++;
        $scope.framez = $scope.framecount;

        $scope.video = $scope.channel.video;
         
        if ($scope.video) {
            $scope.infos = "video frame available, frame:" + $scope.framecount; 
            //console.log("video frame available");
            
            if ($scope.video.width > 0) {
                //console.log("video width" + $scope.video.width);
                var videoData = getVideoData(0, 0, $scope.video.width, $scope.video.height);
                $scope.ctx.putImageData(videoData, 0, 0);
                $scope.imageData = $scope.ctx.getImageData(0, 0, $scope.canvas[0].width, $scope.canvas[0].height);
                $scope.ctx.moveTo(0,0);
                $scope.ctx.lineTo(200,100);
                $scope.ctx.stroke(); 


                $scope.markers = $scope.detector.detect($scope.imageData);
                $scope.drawCorners($scope.markers);
                $scope.drawId($scope.markers);

            }
         } else {
            //$scope.infos = "video frame not available"; 
        }
        requestAnimationFrame($scope.tick);
    }
    var getVideoData = function getVideoData(x, y, w, h) {
        var hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = $scope.video.width;
        hiddenCanvas.height = $scope.video.height;
        var ctx = hiddenCanvas.getContext('2d');
        ctx.drawImage($scope.video, 0, 0, $scope.video.width, $scope.video.height);
        return ctx.getImageData(x, y, w, h);
    };

    $scope.drawCorners = function(markers) {
        var corners, corner, i, j;

        $scope.ctx.lineWidth = 3;

        for (i = 0; i !== markers.length; ++i) {
            corners = markers[i].corners;

            $scope.ctx.strokeStyle = "red";
            $scope.ctx.beginPath();

            for (j = 0; j !== corners.length; ++j) {
                corner = corners[j];
                $scope.ctx.moveTo(corner.x, corner.y);
                corner = corners[(j + 1) % corners.length];
                $scope.ctx.lineTo(corner.x, corner.y);
            }

            $scope.ctx.stroke();
            $scope.ctx.closePath();

            $scope.ctx.strokeStyle = "green";
            $scope.ctx.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
        }
    }

    $scope.drawId = function(markers) {
        var corners, corner, x, y, i, j;

        $scope.ctx.strokeStyle = "blue";
        $scope.ctx.lineWidth = 1;

        for (i = 0; i !== markers.length; ++i) {
            corners = markers[i].corners;

            x = Infinity;
            y = Infinity;

            for (j = 0; j !== corners.length; ++j) {
                corner = corners[j];

                x = Math.min(x, corner.x);
                y = Math.min(y, corner.y);
            }

            $scope.ctx.strokeText(markers[i].id, x, y)
        }
    }

    }]);
document.addEventListener('DOMContentLoaded', function(){

    // aruco.js
    var video, canvas, context, imageData, detector;

	//var target = {"name": "Paris", "latitude" : 48.856578, "longitude" : 2.351828};
	//var target = {"name": "Lyon", "latitude" : 45.759723, "longitude" : 4.842223};
	var target = {"name": "Marseille", "latitude" : 43.296346, "longitude" : 5.369889}; 
	
	var status = document.querySelector("#status");
	var infos  = document.querySelector("#infos");

	//map 
	var map = L.map('myMap');
	map.setView([0, 0], 3);

	//pattern
	var mapPatternUrl = 'http://tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayer = L.tileLayer(mapPatternUrl);
	tileLayer.addTo(map);

	//marker
	var marker = L.marker([0, 0]);
	marker.bindPopup("Me.");
	marker.addTo(map);

    // centre Nice
	var centreNice = L.marker([43.7054009, 7.26449]);
	centreNice.bindPopup("Centre");
	centreNice.addTo(map);

    //centre  circle
	var chasse = L.circle([43.7054009, 7.26449], 1000, {
	    color: 'red',
	    fillColor: '#f03',
	    fillOpacity: 0.5
	});
	chasse.bindPopup("Chasse au tresor");
	chasse.addTo(map);
	chasse.setStyle({
	    color: 'green',
	    fillColor: '#f03',
	    fillOpacity: 0.5
	});

	//accuracy circle
	var circle = L.circle([0, 0], 0);
	circle.bindPopup("Accuracy.");
	circle.addTo(map);

	function processPosition(event){
		status.innerHTML = "Lat : " + event.coords.latitude + "° Long : " + event.coords.longitude + "° Precision : " + event.coords.accuracy + "m.";
		var coords = [event.coords.latitude, event.coords.longitude] ;

		marker.setLatLng( coords );
		circle.setLatLng( coords );
		circle.setRadius(event.coords.accuracy);

		if ( ! map.getBounds().contains( coords ) ) {
			map.setView(coords, 12);
		}

		var distanceTarget = geoDistance(target.latitude, target.longitude, event.coords.latitude, event.coords.longitude);
		var distanceCentreNice = geoDistance(centreNice.getLatLng().lat, centreNice.getLatLng().lng, event.coords.latitude, event.coords.longitude);
		if (distanceCentreNice < 1)
		{
		    infos.innerHTML = "Gagn�! Km de CentreNice:" + distanceCentreNice;
		}
		else
		{
		    infos.innerHTML = "Distance from " + target.name + " : " + distanceTarget + "km. From CentreNice:" + distanceCentreNice;
		}
	}

	function errorPosition(){
		status.innerHTML = "No position.";
		marker.setLatLng( [0,0] );
		map.setView([0, 0], 3);
	}
	var popup = L.popup();

	function onMapClick(e) {
	    popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
	}

	map.on('click', onMapClick);
	//location notifications
	var options = {"enableHighAccuracy": true, "maximumAge" : 0, "timeout" : Infinity};
	navigator.geolocation.watchPosition( processPosition, errorPosition, options );
    //aruco
	video = document.getElementById("video");
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	canvas.width = parseInt(canvas.style.width);
	canvas.height = parseInt(canvas.style.height);

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if (navigator.getUserMedia) {

	    function successCallback(stream) {
	        if (window.webkitURL) {
	            video.src = window.webkitURL.createObjectURL(stream);
	        } else if (video.mozSrcObject !== undefined) {
	            video.mozSrcObject = stream;
	        } else {
	            video.src = stream;
	        }
	    }

	    function errorCallback(error) {
	    }

	    navigator.getUserMedia({ video: true }, successCallback, errorCallback);

	    detector = new AR.Detector();

	    requestAnimationFrame(tick);
	}
	function tick() {
	    requestAnimationFrame(tick);

	    if (video.readyState === video.HAVE_ENOUGH_DATA) {
	        snapshot();

	        var markers = detector.detect(imageData);
	        drawCorners(markers);
	        drawId(markers);
	    }
	}

	function snapshot() {
	    context.drawImage(video, 0, 0, canvas.width, canvas.height);
	    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	}

	function drawCorners(markers) {
	    var corners, corner, i, j;

	    context.lineWidth = 3;

	    for (i = 0; i !== markers.length; ++i) {
	        corners = markers[i].corners;

	        context.strokeStyle = "red";
	        context.beginPath();

	        for (j = 0; j !== corners.length; ++j) {
	            corner = corners[j];
	            context.moveTo(corner.x, corner.y);
	            corner = corners[(j + 1) % corners.length];
	            context.lineTo(corner.x, corner.y);
	        }

	        context.stroke();
	        context.closePath();

	        context.strokeStyle = "green";
	        context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
	    }
	}

	function drawId(markers) {
	    var corners, corner, x, y, i, j;

	    context.strokeStyle = "blue";
	    context.lineWidth = 1;

	    for (i = 0; i !== markers.length; ++i) {
	        corners = markers[i].corners;

	        x = Infinity;
	        y = Infinity;

	        for (j = 0; j !== corners.length; ++j) {
	            corner = corners[j];

	            x = Math.min(x, corner.x);
	            y = Math.min(y, corner.y);
	        }

	        context.strokeText(markers[i].id, x, y)
	    }
	}

});
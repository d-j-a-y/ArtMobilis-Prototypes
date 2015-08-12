document.addEventListener('DOMContentLoaded', function () {
    // replace "toner" here with "terrain" or "watercolor"
    //var layer = new L.StamenTileLayer("watercolor");
    //var map = new L.Map("element_id", {
    //    center: new L.LatLng(43.6048, 7.1418),
    //    zoom: 12
    //});
    //map.addLayer(layer);

        var map = new L.Map("watercolor", {
            center: new L.LatLng(43.6048, 7.1418),
            zoom: 10
        });
        map.addLayer(new L.StamenTileLayer("watercolor", {
            detectRetina: true
        }));
    
});
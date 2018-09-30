require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/core/watchUtils",
    "esri/geometry/support/webMercatorUtils"
  ],
  function(
    Map, MapView,
    FeatureLayer,
    watchUtils,
    webMercatorUtils
  ) {

    map = new Map({
      basemap: "gray"
    });

    view = new MapView({
      container: "map_canvas",
      map: map,
    center: [2.17014, 41.38605],
    zoom: 12
      // extent: { // autocasts as new Extent()
      //   xmin: -9177811,
      //   ymin: 4247000,
      //   xmax: -9176791,
      //   ymax: 4247784,
      //   spatialReference: 102100
      // }
    });

    window.webMercatorUtils=webMercatorUtils
    window.FeatureLayer=FeatureLayer

    watchUtils.whenTrue(view, "stationary", function() {
        // Get the new extent of the view only when view is stationary.
          if (view.extent) {
            var info = "<br> <span> the view extent changed: </span>" +
              "<br> xmin:" + view.extent.xmin.toFixed(2) + " xmax: " +
              view.extent.xmax.toFixed(2) +
              "<br> ymin:" + view.extent.ymin.toFixed(2) + " ymax: " +
              view.extent.ymax.toFixed(2);
              console.log(info);
          }
          GenerateLink();
        });

    /********************
     * Add feature layer
     ********************/




  });



$(document).ready(function () {
    // MapMBStart();
    $("#datatype,#hmCategory,#locationScoreData").change(TypeChange);
    $("input,select").change(GenerateLink);

});
//
// var map;
// var mapboxToken = '';
// function MapMBStart(){
//     var options = {};
//     options.zoom = options.zoom || 12;
//     options.lat = options.lat || 41.38605;
//     options.lon = options.lon || 2.17014;
//
//     map = new L.map('map_canvas').setView(new L.LatLng(options.lat, options.lon), options.zoom);
//     var baselayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
//         maxZoom: 18
//     }).addTo(map);
//
//     map.on('moveend', function() {
//         GenerateLink();
//     });
//
//
// }
function TypeChange() {
    var type = $("#datatype").val();
    $(".locationScoreData,.hmCategory").hide();
    if(type == 'hm')
        $(".hmCategory").show();
    if(type == 'lsbox')
        $(".locationScoreData").show();

    $("#geojsonlink").html('');
}
function GenerateLink(){

    var key = $("#key").val();
    if(key == ''){
        $("#geojsonlink").html('<b>Key</b> is required.');
        return;
    }
    var type = $("#datatype").val();
    if(type == ''){
        $("#geojsonlink").html('<b>Type of Data</b> is required.');
        return;
    }
    // debugger
    var extent = view.extent.toJSON();
    var southWest=webMercatorUtils.webMercatorToGeographic({
        "x" : extent.xmin,
        "y" : extent.ymin,
        "spatialReference" : {"wkid" : extent.spatialReference}
    })
    var northEast=webMercatorUtils.webMercatorToGeographic({
        "x" : extent.xmax,
        "y" : extent.ymax,
        "spatialReference" : {"wkid" : extent.spatialReference}
    })
    var box = {
        north: northEast.y,
        south: southWest.y,
        west: southWest.x,
        east: northEast.x
    }



    var center = view.center;
    var url = '';
    switch(type){
        case 'pois':
            // key_type/box_limit_language
            url = urlGeojson +'/'+key+'_pois/'+box.north+','+box.west+','+box.south+','+box.east+'_100_en/FeatureServer';
            break;
        case 'transport':
            // key_type/lat_lon
            url = urlGeojson +'/'+key+'_transport/'+center[0]+'_'+center[1]+'/FeatureServer';
            break;
        case 'hm':
            // key_type/box_category
            url = urlGeojson +'/'+key+'_hm/'+box.north+','+box.west+','+box.south+','+box.east+'_'+$('#hmCategory').val()+'/FeatureServer';
            break;
        case 'lsbox':
            // key_type/box_category
            url = urlGeojson +'/'+key+'_lsbox/'+box.north+','+box.west+','+box.south+','+box.east+'_'+$('#locationScoreData').val()+'/FeatureServer';
            break;
    }

    $("#geojsonlink").html(`${url}/0`);
    $("#geojsonlinksave").attr('href',`//www.arcgis.com/home/webmap/viewer.html?panel=gallery&suggestField=true&url=${url}/0`);


    if(typeof(featureLayer)!= "undefined"){
        map.remove(featureLayer);
    }
    featureLayer = new FeatureLayer({
      url: url
    });

    map.add(featureLayer);

}
//
//
//

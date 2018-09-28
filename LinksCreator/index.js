$(document).ready(function () {
    MapMBStart();
    $("#datatype,#hmCategory,#locationScoreData").change(TypeChange);
    $("input,select").change(GenerateLink);

});

var map;
var mapboxToken = '';
function MapMBStart(){
    var options = {};
    options.zoom = options.zoom || 12;
    options.lat = options.lat || 41.38605;
    options.lon = options.lon || 2.17014;

    map = new L.map('map_canvas').setView(new L.LatLng(options.lat, options.lon), options.zoom);
    var baselayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    map.on('moveend', function() {
        GenerateLink();
    });


}
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
    var box = map.getBounds();
    var center = map.getCenter();
    var url = '';
    switch(type){
        case 'pois':
            // key_type/box_limit_language
            url = urlGeojson +'/'+key+'_pois/'+box.getNorth()+','+box.getWest()+','+box.getSouth()+','+box.getEast()+'_100_en/FeatureServer/0/query';
            break;
        case 'transport':
            // key_type/lat_lon
            url = urlGeojson +'/'+key+'_transport/'+center.lat+'_'+center.lng+'/FeatureServer/0/query';
            break;
        case 'hm':
            // key_type/box_category
            url = urlGeojson +'/'+key+'_hm/'+box.getNorth()+','+box.getWest()+','+box.getSouth()+','+box.getEast()+'_'+$('#hmCategory').val()+'/FeatureServer/0/query';
            break;
        case 'lsbox':
            // key_type/box_category
            url = urlGeojson +'/'+key+'_lsbox/'+box.getNorth()+','+box.getWest()+','+box.getSouth()+','+box.getEast()+'_'+$('#locationScoreData').val()+'/FeatureServer/0/query';
            break;
    }

    $("#geojsonlink").html(url);
    $("#geojsonlinksave").attr('href',url);

}




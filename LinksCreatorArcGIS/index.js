require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/core/watchUtils",
    "esri/geometry/support/webMercatorUtils",
    "esri/widgets/Search",
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapGallery/support/LocalBasemapsSource",
    "esri/core/Collection",
    "esri/Basemap",
    "esri/widgets/Expand",
    "esri/widgets/Legend"
],
function(
    Map, MapView,
    FeatureLayer,
    watchUtils,
    webMercatorUtils,
    Search,
    BasemapGallery,
    LocalBasemapsSource,
    Collection,
    Basemap,
    Expand,
    Legend
) {

    map = new Map({
        //basemap: "streets-navigation-vector"
        basemap: "topo"
    });

    view = new MapView({
        container: "map_canvas",
        map: map,
        center: [2.17014, 41.38605],
        zoom: 12
    });

    var searchWidget = new Search({
        view: view
    });

    var collection = new Collection([
        new Basemap({portalItem: {id: "c50de463235e4161b206d000587af18b"}}), // Navigation
        new Basemap({portalItem: {id: "8d91bd39e873417ea21673e0fee87604"}}), // Nova
        new Basemap({portalItem: {id: "867895a71a1840399476fc717e76bb43"}}), // Mid-century
        new Basemap({portalItem: {id: "826498a48bd0424f9c9315214f2165d4"}}), // Colored Pencil Map
        new Basemap({portalItem: {id: "f35ef07c9ed24020aadd65c8a65d3754"}}), // Modern Antique
        new Basemap({portalItem: {id: "75a3ce8990674a5ebd5b9ab66bdab893"}}), // Newspaper
        new Basemap({portalItem: {id: "67372ff42cd145319639a99152b15bc3"}}), // Topo
        new Basemap({portalItem: {id: "00f90f3f3c9141e4bea329679b257142"}}), // Streets (with Relief)
        new Basemap({portalItem: {id: "7e2b9be8a9c94e45b7f87857d8d168d6"}}), // Streets (Night)
        new Basemap({portalItem: {id: "358ec1e175ea41c3bf5c68f0da11ae2b"}}), // Dark Gray Canvas
        new Basemap({portalItem: {id: "979c6cc89af9449cbeb5342a439c6a76"}}), // Light Gray Canvas
        new Basemap({portalItem: {id: "a52ab98763904006aa382d90e906fdd5"}}), // Terrain with Labels
        new Basemap({portalItem: {id: "86265e5a4bbb4187a59719cf134e0018"}}), // Imagery Hybrid
        new Basemap({portalItem: {id: "b834a68d7a484c5fb473d4ba90d35e71"}}) // OSM
    ]);

    localBasemapsSource = new LocalBasemapsSource({
        basemaps: collection
    })

    var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div"),
        source:localBasemapsSource
    });

    var bgExpand = new Expand({
        view: view,
        content: basemapGallery
    });

    view.ui.add(searchWidget, {
        position: "top-right"
    });
    view.ui.add(bgExpand, {
        position: "top-left"
    });

    window.webMercatorUtils = webMercatorUtils
    window.FeatureLayer = FeatureLayer
    window.Legend = Legend

    watchUtils.whenTrue(view, "stationary", function() {
        if (view.extent) {
            // If the extent has changed
            GenerateLink();
        }
    });

});


$(document).ready(function () {
    $("#datatype,#hmCategory,#locationScoreData").change(TypeChange);
    $("input,select").change(GenerateLink);
});


function TypeChange() {
    var type = $("#datatype").val();
    $(".locationScoreData,.hmCategory").hide();
    if(type == 'hm'){
        $(".hmCategory").show();
    }
    if(type == 'lsbox'){
        $(".locationScoreData").show();
    }
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

    var extent = view.extent.toJSON();
    var southWest = webMercatorUtils.webMercatorToGeographic({
        "x" : extent.xmin,
        "y" : extent.ymin,
        "spatialReference" : {"wkid" : extent.spatialReference}
    })
    var northEast = webMercatorUtils.webMercatorToGeographic({
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
    $("#exploreAgol").attr('href',`//www.arcgis.com/home/webmap/viewer.html?panel=gallery&suggestField=true&url=${url}/0`);
    $("#geojsonlinksave").attr('href',`${url}/0/query?f=geojson`);


    if(typeof(featureLayer)!= "undefined"){
        map.remove(featureLayer);
        view.ui.remove(legend);
    }

    featureLayer = new FeatureLayer({
        url: url
    });

    map.add(featureLayer);

    legend = new Legend({
        view: view,
        layerInfos: [{
            layer: featureLayer,
            title: "Legend"
        }]
    });

    view.ui.add(legend, "bottom-right");
}

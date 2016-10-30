/* global $ */
/* global google */

var lng, lat;

// Mississauga Central Library
lng = -79.6436414, lat = 43.5875534;

var pos = new google.maps.LatLng(lat, lng);
var mapProperties = {
        "center": pos,
        "zoom": 16,
        "mapTypeId": google.maps.MapTypeId.ROADMAP
    };
	
var div = document.getElementById('divMap');
var map = new google.maps.Map(div, mapProperties);

var marker = new google.maps.Marker({
        "position": pos,
        "icon": {
            "path": google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            "scale": 10,
            "strokeWeight":4,
            "strokeColor":"#FF0000"
        },
        "map": map
    });
	
$(document).ready(function() {
	// query for landmark types and generate the drop down options
	$.get('http://127.0.0.1:3000/getProperty', function(resp){
		$.each(resp.typedesc, function(key, value) {              
			$('#ddPropertyTypes').append($('<option>').val(value._id).text(value._id));     
		});
	});
	
	// code from the first session on geoJSON
    /*$.get('http://127.0.0.1:3000', function(resp){
       map.data.addGeoJson(resp);
       map.data.setStyle(function(feature) {
           return {
               "title": feature.getProperty('LANDMARKNA'),
               "icon": {
                   "path": google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                   "scale": 5,
                   "strokeWeight":2,
                   "strokeColor":"#0000FF"
                },
           };
       });
    });*/
});

// event handler for select element onchange event
function filterByPropertyType(propertyType){
	map.data.forEach(function(feature){
		map.data.remove(feature);
	});
	$.get('http://127.0.0.1:3000/filterByPropertyType=' + propertyType, function(resp){
		console.log(resp);
       map.data.addGeoJson(resp);
       map.data.setStyle(function(feature) {
           return {
               "title": feature.getProperty('LANDMARKNA'),
               "icon": {
                   "path": google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                   "scale": 5,
                   "strokeWeight":2,
                   "strokeColor":"#0000FF"
                },
           };
       });
    });
}

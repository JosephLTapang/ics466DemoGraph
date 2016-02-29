var key = "d1dd85496279393bec91d98ae64dca9eae86ba3b";
var marker, zip, mainMap, info;
Meteor.startup(function() {
	GoogleMaps.load();
	$("#info-container").hide();
	$("#error").hide();
	$("#information").hide();
});

function gc(loc, callback) {
	var coder = new google.maps.Geocoder;
  coder.geocode(loc, function (res, stat) {
		if (stat === google.maps.GeocoderStatus.OK) {
			if (res[0]) {
				callback(res[0], loc);
			}
		}
	});
}

function er1(loc, callback) {
	Meteor.call("fccCall", loc.location.lat(), loc.location.lng(), function(error, r) {
		if (error) console.log(e); else if (r) { callback(r.data.Block.FIPS); }
	});
}

function er2(fips) {
	if (fips !== null) {
		state = fips.substring(0, 2);
		county = fips.substring(2, 5);
		tract = fips.substring(5, 11);
		block = fips.substring(11);
		Meteor.call("cenCall", key,tract,state,county, function(error, r) {
			er3(r);
		});
	}
}

function er3(r) {
	$('#appZip').text('Approximate ZIP: ' + zip);
	$('#popTot').text('Population: ' + JSON.parse(r.content)[1][0]);
	$('#popM').text('Male: ' + JSON.parse(r.content)[1][1]);
	$('#popF').text('Female: ' + JSON.parse(r.content)[1][2]);
	$("#loading").hide(300, function() {
		$("#information").show(300);
	});
}

function parse(results, loc) {
	var addr = results.address_components;
 	zip = addr[addr.length - 1].long_name;
	var fips = "";
	var state = "";
	var county = "";
	var tract = "";
	var block = "";

  if (zip.match(/[01-9]{5}/)) {
		er1(loc, er2);
	}
	else {
		$("#loading").hide(300, function() {
			$("#error").show(300);
		});
	}
}

function mapClick(e) {
	$("#map-container").animate({height: "70vh"}, 300);
	$("#info-container").show(300, function() {
		$("#loading").show(300);
		$("#error").hide(300);
		$("#information").hide(300);
	});
	marker.setPosition(e.latLng);
  gc({'location': e.latLng}, parse);
}

function mapReady(map) {
	info = new google.maps.InfoWindow();
	mainMap = map.instance;
	marker = new google.maps.Marker({
		position: map.options.center,
		map: map.instance
	});
	map.instance.addListener('click', mapClick);
}

Template.map.onCreated(function () {
	GoogleMaps.ready('myMap', mapReady);
});

Template.map.helpers({
	options: function() {
		if (GoogleMaps.loaded()) {
			return {
				center: {lat: 21.3, lng: -157.818968},
				zoom: 10
			};
		}
	}
});

Template.infoDiv.events({
	"click #close": function(e) {
		$("#info-container").hide(300);
		$("#map-container").animate({height: "100vh"}, 300);
	}
});

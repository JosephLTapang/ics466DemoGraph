var key = "d1dd85496279393bec91d98ae64dca9eae86ba3b", marker, zip, mainMap, info;
var codes = [["B01003_001E","B01001_002E","B01001_026E"], ["B01003_001E", "B02001_002E", "B02001_003E", "B02001_004E", "B02001_005E", "B02001_006E", "B02001_007E", "B02001_008E"]];
var params = ["Total Population by Gender", "Total Population by Race"];
var labels = [["Total Population", "Male", "Female"], ["Total Population", "White", "Black", "American Indian or Alaska Native", "Asian", "Native Hawaiian or Other Pacific Islander", "Other", "Two or More"]];

var states = [];
Meteor.call("states", key, function(error, r) {
	if (error) {
		console.log(error);
  } else if (r) {
		var eh = r.data;
		eh.shift();
		states = eh;
	}
});

var genders = [['Male', 'male'], ['Female', 'female']];

var races = [ ['White', 'white'], ['Black', 'black'], ['American Indian or Alaska Native', 'native'], ['Asian', 'asian'], ['Native Hawaiian or Other Pacific Islander', 'hwn'], ['Other', 'other'], ['Two or More Races', 'ge2'] ];

var ages = [
	['Any age', 'any'],
	['Under 5 years', 'lt5'],
	['5 to 9 years', 'ge5le9'],
	['10 to 14 years', 'ge10le14'],
	['15 to 17 years', 'ge15le17'],
	['18 to 19 years', 'ge18le19'],
	['20 to 24 years', 'ge20le24'],
	['25 to 29 years', 'ge25le29'],
	['30 to 34 years', 'ge30le34'],
	['35 to 39 years', 'ge35le39'],
	['40 to 44 years', 'ge40le44'],
	['45 to 54 years', 'ge45le54'],
	['55 to 64 years', 'ge55le64'],
	['65 to 74 years', 'ge65le74'],
	['75 to 84 years', 'ge75le84'],
	['Over 85 years', 'ge85']
];

/*
 * http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
 */
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function createCodes() {
	var retval = [];
	var aRace = ["A", "B", "C", "D", "E", "F", "G"];
	for (var p = 1; p <= 31; p++) {
		for (var k = 0; k < aRace.length; k++) {
			retval[retval.length] = "B01001" + aRace[k] + "_" + pad(p, 3) + "E";
		}
	}
	return retval;
}

var codes2 = createCodes();

ReactiveTabs.createInterface({
	template: 'dynamicTabs',
	onChange: function(slug, template) {
		Session.set('activeTab', slug);
	}
});

Template.infoDiv.events({
	'change #choices': function() {
		$("#dataWrapper").hide();
		$("#error").hide();
		$("#loading").show(300);
		gc({'location': marker.position}, parse);
	}
});

function constructQuery() {
	var state = states[$("#selectL option:selected").index()][1];
	var ageInc = ages.length * $("#selectG option:selected").index();
	var code = codes2[races.length * ($("#selectA option:selected").index() + ageInc) + $("#selectR option:selected").index()];
	return {
		state: state,
		code: code
	};
}

Template.search.events({
	'click input[type=submit]': function() {
		search();
	}
});

Template.search.helpers({
	states: function() {
		return states;
	},
	genders: function() {
		return genders;
	},
	races: function() {
		return races;
	},
	ages: function() {
		return ages;
	}
});

Template.tabs.helpers({
	tabs: function() {
		var retval = [{name: 'Information', slug: 'info', onRender: function(slug, template) {}},
									{name: 'Search', slug: 'src'}];
		return retval;
	},
	activeTab: function () {
    return Session.get('activeTab');
  }
});

function chartBuild() {
	var data = [];
	var c = [];
	var text = $("#choices option:selected").text();
	$("#information p").each(function() {
		var t = $(this);
		c.push([t.text().split(": ")[0], Number.parseInt(t.text().split(": ")[1])]);
	});

	var total = c[1][1];
	for (var l = 2; l < c.length; l++) {
		data[data.length] = [c[l][0], c[l][1]/ total * 100];
	}

	return {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false
		},
		title: {
			text: text
		},
		tooltip: {
			pointFormat: '<b>{point.percentage:.1f}%<b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					},
					connectorColor: 'silver'
				}
			}
		},
		series: [{
			type: 'pie',
			name: 'stats',
			data: data
		}]
	};
}

Template.infoDiv.helpers({
	params: function(){
		return params;
	},
	chart: function() {
		return chartBuild();
	}
});

Meteor.startup(function() {
	GoogleMaps.load();
	$("#down").hide();
	$("#tabs").hide();
	$("#loading").hide();
	$("#error").hide();
	$("#dataWrapper").hide();
	$("#map-container").toggleClass("map-tab-closed", true);
	$("#tabs").toggleClass("tabs-closed", true);
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
		Meteor.call("cenCall", key, codes[params.indexOf($("#choices option:selected").text())], tract,state,county, function(error, r) {
			er3(r);
		});
	}
}

function er3(r) {
	$("#loading").hide(300, function() {
		var con = JSON.parse(r.content)[1];
		$("#information").empty();
		$("#information").html("<p>Approximate ZIP: " + zip + "</p>");
		for (var p = 0; p < labels[params.indexOf($("#choices option:selected").text())].length; p++) {
			$("#information").html($("#information").html() + "\n<p>" + labels[params.indexOf($("#choices option:selected").text())][p] + ": " + con[p] + "</p>");
		}
		$("#chart").highcharts(chartBuild());
		$("#dataWrapper").show(300);
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
		if ($("#map-container").hasClass("map-tab-closed")) {
			$("#up").toggle();
			$("#down").toggle();
			$("#tabs").toggle(300);
			$("#map-container").toggleClass("map-tab-open");
			$("#map-container").toggleClass("map-tab-closed");
		}
		Session.set('activeTab','info');
		$("#dataWrapper").hide();
		$("#error").hide();
		$("#loading").show(300);
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

function search() {
	var q = constructQuery();
	console.log(q);
	Meteor.call("cenCall2", key, q.code, q.state, function(error, r) {
		if (error) console.log(error); else if (r) {
			console.log(r.data);
		}
	});
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

Template.tabs.events({
	"click #upDown": function(e) {
		$("#tabs").toggle(300);
		$("#up").toggle();
		$("#down").toggle();
		$("#map-container").toggleClass("map-tab-open");
		$("#map-container").toggleClass("map-tab-closed");
		$("#tabs").toggleClass("tabs-open");
		$("#tabs").toggleClass("tabs-closed");
	}
});

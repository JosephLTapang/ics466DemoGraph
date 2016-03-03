Meteor.methods({
  fccCall: function(lat, lng) {
		this.unblock();
		return Meteor.http.call('GET', 'http://data.fcc.gov/api/block/2010/find?latitude=' + lat + '&longitude=' + lng + '&showall=false&format=json');
	},
	cenCall: function(key, info, tract, state, county) {
		this.unblock();
		return Meteor.http.call('GET', 'http://api.census.gov/data/2014/acs5?key=' + key + '&get=' + info.join() + '&for=tract:' + tract + '&in=state:' + state + '+county:' + county);
	}
});

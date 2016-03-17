Meteor.methods({
	/*
	 * Finds Census block from provided lat, lng
	 *	Parameters
	 * Lat: Latitude
	 * Lng: Longitude */
  	fccCall: function(lat, lng) {
		this.unblock();
		return Meteor.http.call('GET', 'http://data.fcc.gov/api/block/2010/find?latitude=' + lat + '&longitude=' + lng + '&showall=false&format=json');
	},
	/* Provides Census track information from the information of the query, state, and county
	 * Parameters
	 * key: CensusAPIKey
	 * info: SearchInfo
	 * tract: Census Tract
	 * state: State where the query is being done
	 * county: County where the query is being done */
	cenCall: function(key, info, tract, state, county) {
		this.unblock();
		return Meteor.http.call('GET', 'http://api.census.gov/data/2014/acs5?key=' + key + '&get=' + info.join() + '&for=tract:' + tract + '&in=state:' + state + '+county:' + county);
	},
	/* Provides information from state from the provided information of the query
	 * Parameters
	 * key: CensusAPIKey
	 * info: Search Info
	 * state: State where the query is being done */
	cenCall2: function(key, info, state) {
		this.unblock();
		return Meteor.http.call('GET', 'http://api.census.gov/data/2014/acs5?key=' + key + '&get=' + info + ',NAME&for=county:*&in=state:' + state);
	},
	/* Return the states
	 * Parameters
	 * key: CensusAPIKey */
	states: function(key) {
		this.unblock();
		return Meteor.http.call('GET', 'http://api.census.gov/data/2014/acs5?key=' + key + '&get=NAME&for=state:*');
	}
});

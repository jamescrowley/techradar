require('./stylesheets/base.scss');
const d3 = require('d3');
const factory = require('./util/factory');

d3.selectAll('.radar').each(function () {
	var radarElement = d3.select(this);
	// Pick and parse JSON data from page post data.
	var data = JSON.parse(radarElement.select('pre').html());
	// Build the radar!
	factory.RadarBuilder(data, radarElement.attr("id")).build();
});
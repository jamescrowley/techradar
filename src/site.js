require('./stylesheets/base.scss');
require('./images/favicon.ico');
require('./images/logo.png');

const d3 = require('d3');
const factory = require('./util/factory');

// Pick and parse JSON data from page post data.
var data = require("./../radarData.yml");

// Build the radar!
factory.RadarBuilder(data, "radar").build();
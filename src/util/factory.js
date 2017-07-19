const d3 = require('d3');
const Tabletop = require('tabletop');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const ContentValidator = require('./contentValidator');
const Sheet = require('./sheet');
const ExceptionMessages = require('./exceptionMessages');

const RadarBuilder = function (blips, radarElement) {
    var self = {};

    self.build = function() {

        blips = _.map(blips, new InputSanitizer().sanitize);

        var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
        var ringMap = {};
        var maxRings = 6;

        _.each(rings, function (ringName, i) {
            if (i == maxRings) {
                throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
            }
            ringMap[ringName] = new Ring(ringName, i);
        });

        var quadrants = {};
        _.each(blips, function (blip) {
            if (!quadrants[blip.quadrant]) {
                quadrants[blip.quadrant] = new Quadrant(blip.quadrant);
            }
            quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
        });

        var radar = new Radar(radarElement);
        _.each(quadrants, function (quadrant) {
            radar.addQuadrant(quadrant)
        });

        var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

        new GraphingRadar(size, radar).init(radarElement).plot();
    }
    return self;
};


module.exports = { RadarBuilder: RadarBuilder };
const d3 = require('d3');

const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const ContentValidator = require('./contentValidator');
const Sheet = require('./sheet');
const ExceptionMessages = require('./exceptionMessages');

const RadarBuilder = function (radarDefinition, radarElement) {
    var self = {};

    self.build = function() {

        var ringMap = {};
        var maxRings = 6;

        _.each(radarDefinition.rings, function (ringName, i) {
            if (i == maxRings) {
                throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
            }
            ringMap[ringName] = new Ring(ringName, i);
        });

        var quadrants = {};

        _.each(radarDefinition.quadrants, function (quadrant) {
            quadrants[quadrant.id] = new Quadrant(quadrant.id, quadrant.name, quadrant.color);
            _.each(quadrant.blips, function(blip) {
                quadrants[quadrant.id].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew, blip.topic, blip.description))
            });
        });

        var radar = new Radar(radarElement);
        _.each(quadrants, function (quadrant) {
            radar.addQuadrant(quadrant)
        });

        var size = (window.innerHeight - 250) < 620 ? 620 : window.innerHeight - 250;

        new GraphingRadar(size, radar).init(radarElement).plot();
    }
    return self;
};


module.exports = { RadarBuilder: RadarBuilder };

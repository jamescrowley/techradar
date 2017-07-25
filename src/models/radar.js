const MalformedDataError = require('../exceptions/malformedDataError');
const ExceptionMessages = require('../util/exceptionMessages');

const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  sortBy: require('lodash/sortBy')
};

const Radar = function() {
  var self, quadrants;

  quadrants = [];
  self = {};

  function setNumbers(blips) {
    var blipNumber = 0;
    blips.forEach(function (blip) {
      blip.setNumber(++blipNumber);
    });
  }

  self.addQuadrant = function (quadrant) {
    quadrants.push(quadrant);
    setNumbers(quadrant.blips());
  };

  function allBlips() {
    return quadrants.reduce(function (blips, quadrant) {
      return blips.concat(quadrant.blips());
    }, []);
  }

  self.rings = function () {
    return _.sortBy(_.map(_.uniqBy(allBlips(), function (blip) {
      return blip.ring().name();
    }), function (blip) {
      return blip.ring();
    }), function (ring) {
      return ring.order();
    });
  };

  self.quadrants = function () {
    return quadrants;
  };

  return self;
};

module.exports = Radar;

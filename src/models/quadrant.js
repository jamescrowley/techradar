const Quadrant = function (id, name, order) {
  var self, blips;

  self = {};
  blips = [];

  self.order = order;
  self.startAngle = 0;

  self.id = function () {
    return id;
  };
  
  self.name = function () {
    return name;
  };

  self.add = function (newBlips) {
    if (Array.isArray(newBlips)) {
      blips = blips.concat(newBlips);
    } else {
      blips.push(newBlips);
    }
  };

  self.blips = function () {
    return blips.slice(0);
  };

  return self;
};

module.exports = Quadrant;
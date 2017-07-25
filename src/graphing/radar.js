const d3 = require('d3');
const d3tip = require('d3-tip');
const Chance = require('chance');
const _ = require('lodash/core');

const RingCalculator = require('../util/ringCalculator');

const MIN_BLIP_WIDTH = 12;

const Radar = function (size, radar) {
  var svg, radarElement;

  var tip = d3tip().attr('class', 'd3-tip').html(function (text) {
    return text;
  });

  tip.direction(function () {
    if (radarElement.select('.quadrant-table.selected').node()) {
      var selectedQuadrant = radarElement.select('.quadrant-table.selected');
      if (selectedQuadrant.classed('first') || selectedQuadrant.classed('fourth'))
        return 'ne';
      else
        return 'nw';
    }
    return 'n';
  });

  var ringCalculator = new RingCalculator(radar.rings().length, center());

  var self = {};

  function center() {
    return Math.round(size / 2);
  }

  function toRadian(angleInDegrees) {
    return Math.PI * angleInDegrees / 180;
  }

  function plotLines(quadrantGroup, quadrant) {
    var startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2);
    var endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    var startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2);
    var endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    if (startY > endY) {
      var aux = endY;
      endY = startY;
      startY = aux;
    }

    quadrantGroup.append('line')
      .attr('x1', center()).attr('x2', center())
      .attr('y1', startY - 2).attr('y2', endY + 2)
      .attr('stroke-width', 10);

    quadrantGroup.append('line')
      .attr('x1', endX).attr('y1', center())
      .attr('x2', startX).attr('y2', center())
      .attr('stroke-width', 10);
  }

  function plotQuadrant(rings, quadrant) {
    var quadrantGroup = svg.append('g')
      .attr('class', 'quadrant-group quadrant-group-' + quadrant.id());
     // .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
      //.on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
     // .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle));

    rings.forEach(function (ring, i) {
      var arc = d3.arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + 1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - 90));

      quadrantGroup.append('path')
        .attr('d', arc)
        .attr('class', 'ring-arc-' + ring.order())
        .attr('transform', 'translate(' + center() + ', ' + center() + ')');
    });

    return quadrantGroup;
  }

  function plotTexts(quadrantGroup, rings, quadrant) {
    rings.forEach(function (ring, i) {
      quadrantGroup.append('text')
        .attr('class', 'line-text')
        .attr('y', center() + 4)
        .attr('x', center() - (ringCalculator.getRadius(rings.length - i - 1) + ringCalculator.getRadius(rings.length - i)) / 2)
        .attr('text-anchor', 'middle')
        .text(ring.name());
    });
  }

  function triangle(blip, x, y, order, group) {
    return group.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406")
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', order);
  }

  function triangleLegend(x, y, group) {
    return group.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406")
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')');
  }

  function circle(blip, x, y, order, group) {
    return (group || svg).append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', blip.width / 2)
      .attr('class', order);
  }

  function circleLegend(x, y, group) {
    return (group || svg).append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 6);
  }

  function addRing(ring, quadrantId) {
    var table = radarElement.select('.quadrant-table.' + quadrantId);
    table.append('h3').text(ring);
    return table.append('ul');
  }

  function calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle) {
    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle));

    var radius = chance.floating({min: minRadius + blip.width / 2, max: maxRadius - blip.width / 2});
    var angleDelta = Math.asin(blip.width / 2 / radius) * 180 / Math.PI;
    angleDelta = angleDelta > 45 ? 45 : angleDelta;
    var angle = toRadian(chance.integer({min: angleDelta, max: 90 - angleDelta}));

    var x = center() + radius * Math.cos(angle) * adjustX;
    var y = center() + radius * Math.sin(angle) * adjustY;

    return [x, y];
  }

  function thereIsCollision(blip, coordinates, allCoordinates) {
    return allCoordinates.some(function (currentCoordinates) {
      return (Math.abs(currentCoordinates[0] - coordinates[0]) < blip.width) && (Math.abs(currentCoordinates[1] - coordinates[1]) < blip.width)
    });
  }

  function plotBlips(quadrantGroup, rings, quadrant) {
    var blips, quadrant, startAngle, order;

    startAngle = quadrant.startAngle;
    order = quadrant.order;

    radarElement.select('.quadrant-table.' + quadrant.id())
      .append('h2')
      .attr('class', 'quadrant-table__name')
      .text(quadrant.name());

    blips = quadrant.blips();
    rings.forEach(function (ring, i) {
      var ringBlips = blips.filter(function (blip) {
        return blip.ring() == ring;
      });

      if (ringBlips.length == 0) {
        return;
      }

      var maxRadius, minRadius;

      minRadius = ringCalculator.getRadius(rings.length - i - 1);
      maxRadius = ringCalculator.getRadius(rings.length - i);

      var sumRing = ring.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0);
      }, 0);
      var sumQuadrant = quadrant.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0);
      }, 0);
      var chance = new Chance(Math.PI * sumRing * ring.name().length * sumQuadrant * quadrant.name().length);

      var ringList = addRing(ring.name(), quadrant.id());
      var allBlipCoordinatesInRing = [];

      ringBlips.forEach(function (blip) {
        const coordinates = findBlipCoordinates(blip,
          minRadius,
          maxRadius,
          startAngle,
          allBlipCoordinatesInRing);

        allBlipCoordinatesInRing.push(coordinates);
        drawBlipInCoordinates(blip, coordinates, order, quadrantGroup, ringList);
      });
    });
  }

  function findBlipCoordinates(blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing) {
    const maxIterations = 200;
    var coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle);
    var iterationCounter = 0;
    var foundAPlace = false;

    while (iterationCounter < maxIterations) {
      if (thereIsCollision(blip, coordinates, allBlipCoordinatesInRing)) {
        coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle);
      } else {
        foundAPlace = true;
        break;
      }
      iterationCounter++;
    }

    if (!foundAPlace && blip.width > MIN_BLIP_WIDTH) {
      blip.width = blip.width - 1;
      return findBlipCoordinates(blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing);
    } else {
      return coordinates;
    }
  }

  function drawBlipInCoordinates(blip, coordinates, order, quadrantGroup, ringList) {
    var x = coordinates[0];
    var y = coordinates[1];

    var group = quadrantGroup.append('g').attr('class', 'blip-link');

    if (blip.isNew()) {
      triangle(blip, x, y, order, group);
    } else {
      circle(blip, x, y, order, group);
    }

    group.append('text')
      .attr('x', x)
      .attr('y', y + 4)
      .attr('class', 'blip-text')
      // derive font-size from current blip width
      //.style('font-size', ((blip.width * 10) / 22) + 'px')
      .attr('text-anchor', 'middle')
      .text(blip.number());

    var blipListItem = ringList.append('li');
    var blipText = blip.number() + '. ' + blip.name() + (blip.topic() ? ('. - ' + blip.topic()) : '');
    blipListItem.append('div')
      .attr('class', 'blip-list-item')
      .text(blipText);

    var blipItemDescription = blipListItem.append('div')
      .attr('class', 'blip-item-description');
    if (blip.description()) {
      blipItemDescription.append('p').html(blip.description());
    }

    var mouseOver = function () {
      radarElement.selectAll('g.blip-link').attr('opacity', 0.3);
      group.attr('opacity', 1.0);
      blipListItem.selectAll('.blip-list-item').classed('highlight', true);
      tip.show(blip.name(), group.node());
    };

    var mouseOut = function () {
      radarElement.selectAll('g.blip-link').attr('opacity', 1.0);
      blipListItem.selectAll('.blip-list-item').classed('highlight', false);
      tip.hide().style('left', 0).style('top', 0);
    };

    blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut);
    group.on('mouseover', mouseOver).on('mouseout', mouseOut);

    var clickBlip = function () {
      radarElement.select('.blip-item-description.expanded').node() !== blipItemDescription.node() &&
        radarElement.select('.blip-item-description.expanded').classed("expanded", false);
      blipItemDescription.classed("expanded", !blipItemDescription.classed("expanded"));

      //blipItemDescription.on('click', function () {
      //  d3.event.stopPropagation();
      //});
    };

    blipListItem.on('click', clickBlip);
    group.on('click', clickBlip);
  }

  function removeHomeLink(){
    radarElement.select('.home-link').remove();
  }

  function removeRadarLegend(){
    radarElement.select('.legend').remove();
  }

  function drawLegend(quadrantId) {
    removeRadarLegend();

    var triangleKey = "New or moved";
    var circleKey = "No change";

    var container = radarElement.select('svg').append('g')
      .attr('class', 'legend legend'+"-"+quadrantId);

    var x = 10;
    var y = 10;


    /*if(order == "first") {
      x = 4 * size / 5;
      y = 1 * size / 5;
    }

    if(order == "second") {*/
      x = 1 * size / 5 - 15;
      y = 1 * size / 5 - 20;
/*    }

    if(order == "third") {
      x = 1 * size / 5 - 15;
      y = 4 * size / 5 + 15;
    }

    if(order == "fourth") {
      x = 4 * size / 5;
      y = 4 * size / 5;
    }*/

    radarElement.select('.legend')
      .attr('class', 'legend legend-'+quadrantId)
      .transition()
      .style('visibility', 'visible');

    triangleLegend(x, y, container);

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 5)
      .attr('font-size', '0.8em')
      .text(triangleKey);


    circleLegend(x, y + 20, container);

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 25)
      .attr('font-size', '0.8em')
      .text(circleKey);
  }

  function plotRadarHeader() {
    var header = radarElement.insert('header');
    return header;
  }

  function plotQuadrantButtons(quadrants, header) {

    function addButton(quadrant) {
      radarElement
        .append('div')
        .attr('class', 'quadrant-table ' + quadrant.id());


      header.append('div')
        .attr('class', 'button ' + quadrant.order + ' ' + quadrant.id() + ' full-view')
        .text(quadrant.name())
        //.on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
        //.on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
        .on('click', selectQuadrant.bind({}, quadrant.id(), quadrant.startAngle));
    }

    _.each(quadrants, function (quad) {
      addButton(quad);
    });
  }
/*
  function mouseoverQuadrant(order) {
    radarElement.select('.quadrant-group-' + order).style('opacity', 1);
    radarElement.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 0.3);
  }

  function mouseoutQuadrant(order) {
    radarElement.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 1);
  }
*/
  function selectQuadrant(quadrantId, startAngle) {
    radarElement.selectAll('.button').classed('selected', false).classed('full-view', false);
    radarElement.selectAll('.button.' + quadrantId).classed('selected', true);
    radarElement.selectAll('.quadrant-table').classed('selected', false);
    radarElement.selectAll('.quadrant-table.' + quadrantId).classed('selected', true);
    radarElement.selectAll('.blip-item-description').classed('expanded', false);

    var scale = 2;

    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY = Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle));

    var translateX = (-1 * (1 + adjustX) * size / 2 * (scale - 1)) + (-adjustX * (1 - scale / 2) * size);
    var translateY = (-1 * (1 - adjustY) * (size / 2 - 7) * (scale - 1)) - ((1 - adjustY) / 2 * (1 - scale / 2) * size);

    var translateXAll = (1 - adjustX) / 2 * size * scale / 2 + ((1 - adjustX) / 2 * (1 - scale / 2) * size);
    var translateYAll = (1 + adjustY) / 2 * size * scale / 2;

    var moveRight = (1 + adjustX) * (0.8 * window.innerWidth - size) / 2;
    var moveLeft = (1 - adjustX) * (0.8 * window.innerWidth - size) / 2;

    var blipScale = 3 / 4;
    var blipTranslate = (1 - blipScale) / blipScale;

    svg.style('left', moveLeft + 'px').style('right', moveRight + 'px');
    radarElement.select('.quadrant-group-' + quadrantId)
      .transition()
      .duration(1000)
      .attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')');
    radarElement.selectAll('.quadrant-group-' + quadrantId + ' .blip-link text').each(function () {
      var x = d3.select(this).attr('x');
      var y = d3.select(this).attr('y');
      d3.select(this.parentNode)
        .transition()
        .duration(1000)
        .attr('transform', 'scale(' + blipScale + ')translate(' + blipTranslate * x + ',' + blipTranslate * y + ')');
    });

    radarElement.selectAll('.quadrant-group')
      .style('pointer-events', 'auto');

    radarElement.selectAll('.quadrant-group:not(.quadrant-group-' + quadrantId + ')')
      .transition()
      .duration(1000)
      .style('pointer-events', 'none')
      .attr('transform', 'translate(' + translateXAll + ',' + translateYAll + ')scale(0)');


    if (radarElement.select('.legend.legend-' + quadrantId).empty()){
      drawLegend(quadrantId);
    }
  }

  self.init = function (radarElementId) {
    radarElement = d3.select("#" + radarElementId);
    return self;
  };

  self.plot = function () {
    var rings, quadrants;

    rings = radar.rings();
    quadrants = radar.quadrants();
    var header = plotRadarHeader();

    plotQuadrantButtons(quadrants, header);

    radarElement.style('height', size + 14 + 'px');
    svg = radarElement.append("svg").call(tip);
    svg.attr('class', 'radar-plot').attr('width', size).attr('height', size + 14);

    _.each(quadrants, function (quadrant) {
      var quadrantGroup = plotQuadrant(rings, quadrant);
      plotLines(quadrantGroup, quadrant);
      plotTexts(quadrantGroup, rings, quadrant);
      plotBlips(quadrantGroup, rings, quadrant);
    });


    selectQuadrant(quadrants[0].id(), quadrants[0].startAngle);
  };

  return self;
};

module.exports = Radar;

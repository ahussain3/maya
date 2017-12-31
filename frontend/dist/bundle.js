/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var width = window.innerWidth;
var height = window.innerHeight - 100;

var year = 1995;
var district = false; // If this is true, show district level map

function hide_loading_spinner() {
    console.log("Hide loading spinner");
    $(".loading-overlay").addClass("hidden");
    $("#spinner").removeClass("loading");
}

function addCommas(value) {
    return value.toLocaleString();
}

var Map = function () {
    function Map(width, height) {
        _classCallCheck(this, Map);

        console.log("Map class created");
        this.year = null;
        this.district = null;
        this.areaMap = null;
        this.districtMap = null;
        this.areaPrice = null;
        this.districtPrice = null;

        // this.data_loaded.bind(this)
        this.load_data();
    }

    _createClass(Map, [{
        key: "load_data",
        value: function load_data() {
            var _this = this;

            this.data_loaded.bind(this);
            d3.queue().defer(d3.json, "../data/uk-area.json").defer(d3.json, "../data/uk-district.json").defer(d3.json, "../data/all_years_price_by_area.json").defer(d3.json, "../data/all_years_price_by_district.json").await(function (error, areaMap, districtMap, areaPrice, districtPrice) {
                return _this.data_loaded(_this, error, areaMap, districtMap, areaPrice, districtPrice);
            });
        }
    }, {
        key: "data_loaded",
        value: function data_loaded(context, error, areaMap, districtMap, areaPrice, districtPrice) {
            hide_loading_spinner();
            // have no idea why "this" is null here -- would normally just use "this"
            context.initialise_page(district, areaMap, districtMap, areaPrice, districtPrice);
        }
    }, {
        key: "initialise_page",
        value: function initialise_page(district, areaMap, districtMap, areaPrice, districtPrice) {
            this.areaMap = areaMap;
            this.districtMap = districtMap;
            this.areaPrice = areaPrice;
            this.districtPrice = districtPrice;
            this.year = year;

            // draw both maps, high level and low level
            this.drawMapGeometry(g_district, districtMap);
            this.drawMapGeometry(g_area, areaMap);
            this.updateMapForYear(this.year);
        }
    }, {
        key: "getPrice",
        value: function getPrice(area, year) {
            if (this.districtPrice[area]) {
                return Math.round(this.districtPrice[area][year]) || null;
            } else if (this.areaPrice[area]) {
                return Math.round(this.areaPrice[area][year]) || null;
            }
            return null;
        }
    }, {
        key: "getMapData",
        value: function getMapData(district) {
            return district ? this.districtMap : this.areaMap;
        }
    }, {
        key: "drawMapGeometry",
        value: function drawMapGeometry(g, mapData) {
            console.log("drawMapGeometry()");
            var features = mapData.features;
            var selection = g.selectAll("path.area").data(features);

            selection.exit().remove();
            selection.enter().append("path").attr('class', 'area');

            g.selectAll("path.area").attr('d', function (data) {
                return path(data);
            }).attr('fill', '#EEEEEE');
        }
    }, {
        key: "updateMapForYear",
        value: function updateMapForYear(year) {
            var _this2 = this;

            console.log("updateMapForYear()");
            this.year = year;
            d3.select(".d3-tip").remove();
            var tooltip = d3.tip().attr("class", "d3-tip").offset([-8, 0]).html(function (data) {
                return "<strong>Postcode&nbspArea:&nbsp</strong>" + data.properties.name + "<br/>" + "<strong>Avg&nbspPrice:&nbsp</strong>" + (_this2.getPrice(data.properties.name, year) ? "£" + addCommas(_this2.getPrice(data.properties.name, year)) : "No data");

                console.log(d);
            });

            g_area.selectAll("path.area").attr('fill', function (data) {
                var price = _this2.getPrice(data.properties.name, year);
                return color(price) || '#EEEEEE';
            }).on('mouseover', tooltip.show).on('mouseout', tooltip.hide);

            g_district.selectAll("path.area").attr('fill', function (data) {
                var price = _this2.getPrice(data.properties.name, year);
                return color(price) || '#EEEEEE';
            }).on('mouseover', tooltip.show).on('mouseout', tooltip.hide);

            svg.call(tooltip);
            $("#year-label").text(year);
        }
    }, {
        key: "changeMapGranularity",
        value: function changeMapGranularity(newGranularity) {
            console.log("changeMapGranularity()");
            // hide the map which is no longer visible
            this.district = newGranularity;
            if (this.district) {
                g_area.classed("outline-only", true);
            } else {
                g_area.classed("outline-only", false);
            }
            this.updateMapForYear(this.year);
        }
    }]);

    return Map;
}();

var map = new Map();

var projection = d3.geoAlbers().center([0, 55.4]).rotate([4.4, 0]).parallels([50, 60]).scale(5000).translate([width / 2, height / 2]);

var zoom = d3.zoom().scaleExtent([1, 100]).on("zoom", zoomed);

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

var path = d3.geoPath().projection(projection);

var g_district = svg.append("g").attr("class", "district");
var g_area = svg.append("g").attr("class", "area");
var g = g_area;

svg.call(zoom);

var color = d3.scaleLinear().domain([25000, 50000, 75000, 100000, 150000, 200000, 300000, 450000, 600000, 1000000, 2000000]).range(d3.schemeOrRd[9]);

var oldGranularity = district;
var DISTRICT_THRESHOLD = 3;
function zoomed() {
    var newGranularity = d3.event.transform.k > DISTRICT_THRESHOLD;
    g_area.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(" + d3.event.transform.k + ")");
    g_district.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(" + d3.event.transform.k + ")");
    if (newGranularity != oldGranularity) {
        map.changeMapGranularity(newGranularity);
        oldGranularity = newGranularity;
    }
}

$(function () {
    $("#slider").slider({
        value: 1995,
        min: 1995,
        max: 2017,
        step: 1,
        slide: function slide(event, ui) {
            $("#amount").val(ui.value);
            map.updateMapForYear(ui.value);
            year = ui.value;
            console.log("draw map function has returned");
        }
    });
    $("#amount").val($("#slider").slider("value"));
});

$(document.body).append("<h1 id='year-label' class='center'>" + year + "</h2>");
$(document.body).append("<div id=\"slider\"></div>");

console.log("Hello world");

/***/ })
/******/ ]);
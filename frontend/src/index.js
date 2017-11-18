var width = 700;
var height = 700;

var year = 1995
var district = false; // If this is true, show district level map

d3.queue()
    .defer(d3.json, "../data/uk-area.json")
    .defer(d3.json, "../data/uk-district.json")
    .defer(d3.json, "../data/all_years_price_by_area.json")
    .defer(d3.json, "../data/all_years_price_by_district.json")
    .await(data_loaded)

function hide_loading_spinner() {
    $(".loading-overlay").addClass("hidden")
    $("#spinner").removeClass("loading")
}

function data_loaded(area_map, district_map, area_price, district_price) {
    hide_loading_spinner()
}

var price_data_area = require("../data/all_years_price_by_area.json");
var price_data_district = require("../data/all_years_price_by_district.json");
var price_data = district ? price_data_district : price_data_area

var datafile = district ? "../data/uk-district.json" : "../data/uk-area.json"
drawMapGeometry(datafile, year)

function get_datafile(district) {
    return district ? "../data/uk-district.json" : "../data/uk-area.json"
}

function get_price_datafile(district) {
    return district ? price_data_district : price_data_area
}

var projection = d3.geoAlbers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(5000)
    .translate([width / 2, height / 2]);

var zoom = d3.zoom()
    .scaleExtent([1,100])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

svg.call(zoom)

var color = d3.scaleThreshold()
    .domain([25000, 50000, 75000, 100000, 150000, 200000, 300000, 450000, 600000, 1000000, 2000000])
    .range(d3.schemeOrRd[9])

function drawMapGeometry(datafile, year) {
    console.log("drawMapGeometry()");
    d3.json(datafile, function(error, mapData) {
        var features = mapData.features;
        var selection = g.selectAll("path.area")
            .data(features)

        selection.exit().remove();
        selection.enter().append("path")
            .attr('class', 'area')

        g.selectAll("path.area").attr('d', (data) => {
                return path(data)
            })
            .attr('fill', '#EEEEEE')

        updateMapForYear(year)
    });
}

function getPrice(area, year) {
    if (price_data[area]) {
        return price_data[area][year] || null
    }
    return null
}

function updateMapForYear(year) {
    d3.select(".d3-tip").remove();
    var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html((data) => {
        return "<strong>Postcode&nbspArea:&nbsp</strong>" + data.properties.name + "<br/>" +
        "<strong>Avg&nbspPrice:&nbsp</strong>" + (getPrice(data.properties.name, year) ? "£" + Math.round(getPrice(data.properties.name, year)) : "No data");

        console.log("Tooltip");
        console.log(d);
    });

    console.log("Update map for year")
    g.selectAll("path.area")
        .attr('fill', (data) => {
            var price = getPrice(data.properties.name, year)
            return color(price) || '#EEEEEE';
        })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

    svg.call(tooltip)
    $("#year-label").text(year)
}

var old_zoom_level = district
var DISTRICT_THRESHOLD = 3
function zoomed() {
    var new_zoom_level = d3.event.transform.k > DISTRICT_THRESHOLD
    g.attr("transform", `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
    if (new_zoom_level != old_zoom_level) {
        price_data = get_price_datafile(new_zoom_level)
        drawMapGeometry(get_datafile(new_zoom_level), year)
        old_zoom_level = new_zoom_level
    }
}

$( function() {
$( "#slider" ).slider({
    value:1995,
    min: 1995,
    max: 2017,
    step: 1,
    slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
        updateMapForYear(ui.value)
        year = ui.value
        console.log("draw map function has returned")
    }
});
$( "#amount" ).val( $( "#slider" ).slider( "value" ) );
} );

$(document.body).append(`<h1 id='year-label' class='center'>${year}</h2>`)
$(document.body).append(`<div id="slider"></div>`)

console.log("Hello world")
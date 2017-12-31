var width = window.innerWidth;
var height = window.innerHeight - 100;

var year = 1995
var district = false; // If this is true, show district level map

function hide_loading_spinner() {
    console.log("Hide loading spinner")
    $(".loading-overlay").addClass("hidden")
    $("#spinner").removeClass("loading")
}

function addCommas(value) {
    return value.toLocaleString()
}

class Map {
    constructor(width, height) {
        console.log("Map class created")
        this.year = null
        this.district = null
        this.areaMap = null
        this.districtMap = null
        this.areaPrice = null
        this.districtPrice = null

        // this.data_loaded.bind(this)
        this.load_data()
    }

    load_data() {
        this.data_loaded.bind(this)
        d3.queue()
        .defer(d3.json, "../data/uk-area.json")
        .defer(d3.json, "../data/uk-district.json")
        .defer(d3.json, "../data/all_years_price_by_area.json")
        .defer(d3.json, "../data/all_years_price_by_district.json")
        .await((error, areaMap, districtMap, areaPrice, districtPrice) =>
            this.data_loaded(this, error, areaMap, districtMap, areaPrice, districtPrice)
        )
    }

    data_loaded(context, error, areaMap, districtMap, areaPrice, districtPrice) {
        hide_loading_spinner()
        // have no idea why "this" is null here -- would normally just use "this"
        context.initialise_page(district, areaMap, districtMap, areaPrice, districtPrice)
    }

    initialise_page(district, areaMap, districtMap, areaPrice, districtPrice) {
        this.areaMap = areaMap
        this.districtMap = districtMap
        this.areaPrice = areaPrice
        this.districtPrice = districtPrice
        this.year = year

        // draw both maps, high level and low level
        this.drawMapGeometry(g_district, districtMap)
        this.drawMapGeometry(g_area, areaMap)
        this.updateMapForYear(this.year)
    }

    getPrice(area, year) {
        if (this.districtPrice[area]) {
            return Math.round(this.districtPrice[area][year]) || null
        } else if (this.areaPrice[area]) {
            return Math.round(this.areaPrice[area][year]) || null
        }
        return null
    }

    getMapData(district) {
        return district ? this.districtMap : this.areaMap
    }

    drawMapGeometry(g, mapData) {
        console.log("drawMapGeometry()");
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
    }

    updateMapForYear(year) {
        console.log("updateMapForYear()")
        this.year = year
        d3.select(".d3-tip").remove();
        var tooltip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html((data) => {
                return "<strong>Postcode&nbspArea:&nbsp</strong>" + data.properties.name + "<br/>" +
                "<strong>Avg&nbspPrice:&nbsp</strong>" + (this.getPrice(data.properties.name, year) ? "£" + addCommas(this.getPrice(data.properties.name, year)) : "No data");

                console.log(d);
        });

        g_area.selectAll("path.area")
            .attr('fill', (data) => {
                var price = this.getPrice(data.properties.name, year)
                return color(price) || '#EEEEEE';
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);

        g_district.selectAll("path.area")
            .attr('fill', (data) => {
                var price = this.getPrice(data.properties.name, year)
                return color(price) || '#EEEEEE';
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);

        svg.call(tooltip)
        $("#year-label").text(year)
    }

    changeMapGranularity(newGranularity) {
        console.log("changeMapGranularity()")
        // hide the map which is no longer visible
        this.district = newGranularity
        if (this.district) {
            g_area.classed("outline-only", true)
        } else {
            g_area.classed("outline-only", false)
        }
        this.updateMapForYear(this.year);
    }
}

var map = new Map()

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

var g_district = svg.append("g").attr("class", "district")
var g_area = svg.append("g").attr("class", "area");
var g = g_area

svg.call(zoom)

var color = d3.scaleLinear()
    .domain([25000, 50000, 75000, 100000, 150000, 200000, 300000, 450000, 600000, 1000000, 2000000])
    .range(d3.schemeOrRd[9])

var oldGranularity = district
var DISTRICT_THRESHOLD = 3
function zoomed() {
    var newGranularity = d3.event.transform.k > DISTRICT_THRESHOLD
    g_area.attr("transform", `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
    g_district.attr("transform", `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
    if (newGranularity != oldGranularity) {
        map.changeMapGranularity(newGranularity)
        oldGranularity = newGranularity
    }
}

$( function() {
$( "#slider" ).slider({
    value: 1995,
    min: 1995,
    max: 2017,
    step: 1,
    slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
        map.updateMapForYear(ui.value)
        year = ui.value
        console.log("draw map function has returned")
    }
});
$( "#amount" ).val( $( "#slider" ).slider( "value" ) );
} );

$(document.body).append(`<h1 id='year-label' class='center'>${year}</h2>`)
$(document.body).append(`<div id="slider"></div>`)

console.log("Hello world")
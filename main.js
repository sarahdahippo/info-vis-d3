
/** variables **/
var dataset;
var absolute_selected = true;
var selected_types;
var types = ["car_occupants", "pedestrians", "motorcyclists", "bicyclists", "truck_occupants"];
var types_per_100k = ["car_occupants_per_100k", "pedestrians_per_100k", "motorcyclists_per_100k", "bicyclists_per_100k", "truck_occupants_per_100k"];

var show_total = false;

// scales
var xScale;
var yScale;


// dimensions
var svg_width = 800,
    svg_height = 600;
var margin = {top: 30, right: 30, bottom: 80, left: 100};
var graph_width = svg_width - margin.left - margin.right,
    graph_height = svg_height - margin.top - margin.bottom;

// set up svg
var svg = d3.select("#chart").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .append("g").attr("id", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// front-end views/filters
var view = d3.select("#view")

view.append("input")
    .attr("class", "radio-buttons")
    .attr("id", "absolute")
    .attr("type", "radio")
    .attr("name", "view")
    .attr("value", "Absolute Values")
    .attr("checked", "true")
    .on("click", function() {
        absolute_selected = true;
        selected_types = types;
        updateChart();
        return;
    })
view.append("label").attr("for", "absolute").text("Absolute Value")

view.append("input")
    .attr("class", "radio-buttons")
    .attr("id", "per100k")
    .attr("type", "radio")
    .attr("name", "view")
    .attr("value", "Per 100k")
    .on("click", function() {
        absolute_selected = false;
        selected_types = types_per_100k;
        updateChart();
        return;
    })
view.append("label").attr("for", "per100k").text("Per 100k")

// toggle show total checkbox
var show = d3.select("#show").select("#total-checkbox")
    .on("click", function() {
        show_total = document.getElementById("total-checkbox").checked;
        console.log(show_total);
        updateChart();
        return;
    })

var filter = d3.select("#filter")



/** axes **/
function initAxes() {
    xScale = d3.scaleTime()
        .domain(d3.extent(dataset, function(d) { return d.year }))
        .range([0, graph_width]);
    yScale = d3.scaleLinear()
        .domain([0,d3.max(dataset, function(d) {
            return absolute_selected ? d.total : d.total_per_100k
        })])
        .range([graph_height, 0]);

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + graph_height + ")")
        .call(d3.axisBottom(xScale));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(350," +  (graph_height + 60) +")")
        .text("Year");

    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(-80,200) rotate(90)")
        .text("Total Fatalities");
}

/** update chart **/
function updateChart() {
    selected_types = absolute_selected ? types : types_per_100k;

    // groups & reformat data
    var stacked_data = d3.stack()
        .keys(selected_types)
        (dataset)

    console.log(stacked_data);

    // colors
    var color = d3.scaleOrdinal()
        .domain(selected_types)
        .range(['#9abbe6','#c2554f','#a0deb7','#eba57a','#ae85c9'])

    // add data
    svg.selectAll(".layers")
        .data(stacked_data)
        .enter()
        .append("path")
        .attr("class", "layers")
        .attr("fill", function(d) { return color(d.key); })
        .attr("d", d3.area()
            .x(function(d) { return xScale(d.data.year)})
            .y0(function(d) { return yScale(d[0])})
            .y1(function(d) { return yScale(d[1])})
        )

    // show total line
    if (show_total) {
        svg.append("path")
          .datum(dataset)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("stroke-width", 2.0)
          .attr("d", d3.line()
            .x(function(d) { return xScale(d.year) })
            .y(function(d) { return yScale(absolute_selected ? d.total : d.total_per_100k) })
          )
    } else {
        d3.select(".line").remove();
    }


    // update y axis
    yScale = d3.scaleLinear()
         .domain([0,d3.max(dataset, function(d) {
             return absolute_selected ? d.total : d.total_per_100k
         })])
         .range([graph_height, 0]);
    d3.select("#y-axis").call(d3.axisLeft(yScale));
}

// get the data
d3.dsv(",", "transportation_fatalities.csv", function (d) {
    return {
        year: d3.timeParse("%Y")(d.Year),
        population: +d.Population,
        car_occupants: +d.Car_Occupant,
        pedestrians: +d.Pedestrian,
        motorcyclists: +d.Motorcycle,
        bicyclists: +d.Bicycle,
        truck_occupants: +d.Trucks,
        total: +d.Total,
        car_occupants_per_100k: +d.Car_Per_100K,
        pedestrians_per_100k: +d.Ped_Per_100K,
        motorcyclists_per_100k: +d.Motorcycle_Per_100K,
        bicyclists_per_100k: +d.Bicycle_Per_100K,
        truck_occupants_per_100k: +d.Trucks_Per_100K,
        total_per_100k: +d.Total_Per_100K
    };
}).then(function (data) {
    dataset = data;
    console.log(data);

    initAxes();
    updateChart();

})


/** variables **/
var dataset;
var area_selected = true;

var types = ["car_occupants", "pedestrians", "motorcyclists", "bicyclists", "truck_occupants"];
var selected_types = types;

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
    .attr("id", "area")
    .attr("type", "radio")
    .attr("name", "view")
    .attr("value", "Area")
    .attr("checked", "true")
    .on("click", function() {
        area_selected = true;
        updateChart("Area");
        return;
    })
view.append("label").attr("for", "area").text("Area")

view.append("input")
    .attr("class", "radio-buttons")
    .attr("id", "line")
    .attr("type", "radio")
    .attr("name", "view")
    .attr("value", "Line")
    .on("click", function() {
        area_selected = false;
        updateChart("Line");
        return;
    })
view.append("label").attr("for", "line").text("Line")

// toggle show total checkbox
var show = d3.select("#show").select("#total-checkbox")
    .on("click", function() {
        show_total = document.getElementById("total-checkbox").checked;
        console.log(show_total);
        updateChart();
        return;
    })

var filter = d3.select("#filter.checkbox")
// on change of any element in name group, call update chart



/** axes **/
function initAxes() {
    xScale = d3.scaleTime()
        .domain(d3.extent(dataset, function(d) { return d.year }))
        .range([0, graph_width]);
    yScale = d3.scaleLinear()
        .domain([0,d3.max(dataset, function(d) {
            return area_selected ? d.total : d.total_per_100k
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
function updateChart(chart_view) {
    // get selected types from filter
    selected_types = [];
    for (i = 0; i < types.length; i++) {
        var element = document.getElementById(types[i]);
        if (element.checked) {
            selected_types.append(types[i]);
        }
    }

    // show chart view
    if (chart_view == "Area") {
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
        var layers = svg.selectAll(".layers")
            .data(stacked_data);

        var layers_enter = layers.enter()
            .append("path")
            .attr("class", "layers")

        layers_enter.merge(layers)
            .attr("fill", function(d) { return color(d.key); })
            .attr("d", d3.area()
                .x(function(d) { return xScale(d.data.year)})
                .y0(function(d) { return yScale(d[0])})
                .y1(function(d) { return yScale(d[1])})
            )

        layers.exit().remove();
    } else { // line view


    }
}


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
            .y(function(d) { return yScale(area_selected ? d.total : d.total_per_100k) })
          )
    } else {
        d3.select(".line").remove();
    }


//    // update y axis
//    yScale = d3.scaleLinear()
//         .domain([0,d3.max(dataset, function(d) {
//             return area_selected ? d.total : d.total_per_100k
//         })])
//         .range([graph_height, 0]);
//    d3.select("#y-axis").call(d3.axisLeft(yScale));
//}

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



// dimensions
var svg_width = 800,
    svg_height = 600;
var margin = {top: 10, right: 30, bottom: 80, left: 100};
var graph_width = svg_width - margin.left - margin.right,
    graph_height = svg_height - margin.top - margin.bottom;

// set up svg
var svg = d3.select("#main").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .append("g").attr("id", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
    console.log(data);

    /** axes **/
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.year }))
        .range([0, graph_width]);
    var yScale = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d.total - 2000 }),d3.max(data, function(d) { return d.total + 2000 })])
        //.domain([0,d3.max(data, function(d) { return d.total + 5000 })])
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

    /** data **/
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.0)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.year) })
            .y(function(d) { return yScale(d.total) })
        )
})

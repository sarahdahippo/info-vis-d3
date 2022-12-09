

// dimensions
var svg_width = 800,
    svg_height = 600;
var margin = {top: 30, right: 30, bottom: 80, left: 100};
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
        //.domain([d3.min(data, function(d) { return d.total - 2000 }),d3.max(data, function(d) { return d.total + 2000 })])
        .domain([0,d3.max(data, function(d) { return d.total })])
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


    /** groups & reformat data **/
    var types = ["car_occupants", "pedestrians", "motorcyclists", "bicyclists", "truck_occupants"];
    var types_per_100k = ["car_occupants_per_100k", "pedestrians_per_100k", "motorcyclists_per_100k", "bicyclists_per_100k", "truck_occupants_per_100k"];

    var stacked_data = d3.stack()
        .keys(types)
        (data)

    console.log(stacked_data);

    /** colors **/
    var color = d3.scaleOrdinal()
        .domain(types)
        .range(['#9abbe6','#c2554f','#a0deb7','#eba57a','#ae85c9'])

    /** data **/
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

})

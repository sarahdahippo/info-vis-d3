// define the dimensions and margins for the graph
const margins = { top: 20, right: 20, bottom: 20, left: 20 };
const outerWidth = 900;
const outerHeight = 500;
const width = outerWidth - margins.left - margins.right;
const height = outerHeight - margins.top - margins.bottom;
const titleHeight = 20;

// make the plot
var barGraph = d3.select("body").selectAll("#bar-graph");
barGraph.attr("width", outerWidth)
    .attr("height", outerHeight)
    .attr("transform", `translate(${margins.left}, ${margins.top})`);
  
// make the chart title
barGraph.append("text")
    .attr("id", "bar-graph-title")
    .attr("x", outerWidth / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Transportation Fatalities by Year");

// make a container for the bars and axes
var barGraphContainer = barGraph.append("g")
    .attr("id", "bar-graph-container")
    .attr("transform", `translate(${margins.left}, ${titleHeight})`);

// initialize the bars
var bars = barGraphContainer.append("g")
    .attr("id", "bars");

// make the axes
barGraphContainer.append("g")
    .attr("id", "x-axis-bars")
    .attr("transform", `translate(0, ${height})`);
barGraphContainer.append("text")
    .attr("id", "x-axis-bars-label")
    .attr("x", outerWidth / 2)
    .attr("y", height + 10)
    .attr("text-anchor", "middle")
    .text("Year");
barGraphContainer.append("g")
    .attr("id", "y-axis-bars");
barGraphContainer.append("text")
    .attr("id", "y-axis-bars-label")
    .attr("x", -(outerHeight / 2))
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Number of Deaths");

// creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});

// get the data
d3.dsv(",", "transportation_fatalities.csv", function (d) {
    return {
        year: +d.Year,
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

    // draw the bars
})
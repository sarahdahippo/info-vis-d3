/** VARIABLES **/
var dataset;
var chart_view = "Area";
var brushableGraph, brush;
var tooltip, hoveredData;

const types = ["car_occupants", "pedestrians", "motorcyclists", "bicyclists", "truck_occupants"];
const colors = ['#9abbe6','#c2554f','#a0deb7','#eba57a','#ae85c9'];

// toggle whether to show total fatalities
var show_total = false;

// scales and axes
var xScale, xAxis;
var yScale, yAxis;

// dimensions
const svg_width = 1000,
    svg_height = 600;
const legend_width = 200;
const margin = {top: 30, right: 30, bottom: 80, left: 100};
const graph_width = svg_width - legend_width - margin.left - margin.right,
    graph_height = svg_height - margin.top - margin.bottom;
const legendSquare = 20;

/*********************************************************/
/** SET UP **/
var svg = d3.select("#chart").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);
var graph = svg.append("g").attr("id", "graph")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
var plot = graph.append("g").attr("id", "plot");
var legend = svg.append("g").attr("id", "legend")
    .attr("width", legend_width)
    .attr("transform", `translate(${margin.left + legendSquare}, ${svg_height / 2})`);

// make the chart title
graph.append("text")
    .attr("id", "title")
    .attr("x", graph_width / 2)
    .attr("text-anchor", "middle")
    .text("Transportation Fatalities by Year");

// for smooth transitions
var idleTimeout;
function idled() { idleTimeout = null; }

// views
var area_view = d3.select("#view").select("#area")
    .on("click", function() {
        chart_view = "Area";
        updateChart();
        return;
    });
var line_view = d3.select("#view").select("#line")
    .on("click", function() {
        chart_view = "Line";
        
        // reset brushing if switched to line
        xScale.domain(d3.extent(dataset, function(d) { return d.year; }));
        updateChart();
        return;
    });

// toggle show total checkbox
var show = d3.select("#show").select("#total-checkbox")
    .on("click", function() {
        show_total = document.getElementById("total-checkbox").checked;
        updateChart();
        return;
    });

/*********************************************************/
/** AXES **/
function initAxes() {
    xScale = d3.scaleTime()
        .domain(d3.extent(dataset, function(d) { return d.year; }))
        .range([0, graph_width]);
    yScale = d3.scaleLinear()
        .domain([0,d3.max(dataset, function(d) { return d.total; })])
        .range([graph_height, 0]);

    xAxis = graph.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${graph_height})`)
        .call(d3.axisBottom(xScale));
    graph.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${graph_width / 2}, ${graph_height + 40})`)
        .text("Year");

    yAxis = graph.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale));
    graph.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(-60, ${graph_height / 2}) rotate(-90)`)
        .text("Number of Fatalities");
}

/*********************************************************/
/** UPDATE CHART **/
function updateChart() {
    // clear plot
    d3.select("#plot").remove();
    var plot = graph.append("g").attr("id", "plot");

    // colors
    var color = d3.scaleOrdinal()
        .domain(types)
        .range(colors);

    /** AREA VIEW **/
    if (chart_view === "Area") {
        // reformat data
        var stacked_data = d3.stack()
            .keys(types)
            (dataset);

        // ensure brushing is only within this clipPath
        plot.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", graph_width)
            .attr("height", graph_height)
            .attr("x", 0)
            .attr("y", 0);
        brushableGraph = plot.append('g').attr("clip-path", "url(#clip)");

        // add data
        brushableGraph.selectAll(".layers")
            .data(stacked_data)
            .enter()
            .append("path")
            .attr("class", function(d) { return "layer " + d.key; })
            .attr("fill", function(d) { return color(d.key); })
            .attr("d", d3.area()
                .x(function(d) { return xScale(d.data.year); })
                .y0(function(d) { return yScale(d[0]); })
                .y1(function(d) { return yScale(d[1]); })
            );

        // show total line
        if (show_total) {
            brushableGraph.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", 2.0)
                .attr("d", d3.line()
                    .x(function(d) { return xScale(d.year) })
                    .y(function(d) { return yScale(d.total) })
                );
        } else {
            brushableGraph.select(".line").remove();
        }

        // horizontal brushing
        brush = d3.brushX()
            .extent( [ [0,0], [graph_width, graph_height] ] )
            .on("end", updateBrushedChart);
        brushableGraph.append("g").attr("class", "brush").call(brush);

    /** LINE VIEW **/
    } else if (chart_view === "Line") {
        // show total line
        if (show_total) {
            plot.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", 2.0)
                .attr("d", d3.line()
                    .x(function(d) { return xScale(d.year) })
                    .y(function(d) { return yScale(d.total) })
                );
        }

        // plot each line in filtered types
        for (i = 0; i < types.length; i++) {
            plot.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("id", types[i] + "-line")
                .attr("fill", "none")
                .attr("stroke", function(d) { return colors[i]; })
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(function(d) { return xScale(d.year); })
                    .y(function(d) { return yScale(d[types[i]]); })
                );
        }

        // tooltip + vertical line
        d3.selectAll("#tooltip").remove();
        tooltip = d3.select("#chart").append("div")
            .attr("id", "tooltip")
            .style("display", "none");
        var hoverableGraph = plot.append("g").attr("id", "hoverable");

        // vertical line that follows cursor
        hoverableGraph.append("rect")
            .attr("class", "hover-line")
            .attr("width", 1)
            .attr("height", graph_height)
            .style("opacity", "0");
        hoverableGraph.selectAll('.hover-circle')
            .data(dataset)
            .enter().append("g").attr("class", "hover-line-each")
            .append("circle")
            .attr("r", 4)
            .style("stroke", function (_, i) { return colors[i]; })
            .style("opacity", "0");

        // to catch mouse effects
        hoverableGraph.append('svg:rect')
            .attr('width', graph_width) 
            .attr('height', graph_height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function () {
                // hide line, circles, and tooltip
                d3.select(".hover-line").style("opacity", 0);
                d3.selectAll(".hover-line-each circle").style("opacity", 0);
                d3.selectAll("#tooltip").style("display", "none");
            })
            .on('mouseover', function () {
                // show line, circles, and tooltip
                d3.select(".hover-line").style("opacity", 1);
                d3.selectAll(".hover-line-each circle").style("opacity", 1);
                d3.selectAll("#tooltip").style("display", "inline");
              })
            .on('mousemove', function () {
                var mousePos = d3.mouse(this);
                d3.selectAll(".hover-line-each")
                    .attr("transform", function (_, i) {
                        // get year corresponding to mouse x-position
                        var xHovered = xScale.invert(mousePos[0]);
                        
                        // retrieve row index of that year in the dataset
                        var bisect = d3.bisector(function (d) { return d.year; }).left;
                        var idx = bisect(dataset, xHovered);
                        hoveredData = dataset[idx];

                        // move hover line, circles, and tooltip accordingly
                        d3.select(".hover-line").attr("x", xScale(dataset[idx].year));
                        if (yScale(hoveredData[types[i]]))
                            return `translate(${xScale(hoveredData.year)}, ${yScale(hoveredData[types[i]])})`;
                    });
                updateTooltips();
            });
    }
}

/*********************************************************/
/** get the data **/
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
    initAxes();

    // legend
    legend.selectAll(".legend-rect")
        .data(types)
        .enter()
        .append("rect").attr("class", "legend-rect")
        .attr("x", graph_width)
        .attr("y", function(_, i) { return i * (legendSquare + 5); })
        .attr("width", legendSquare)
        .attr("height", legendSquare)
        .style("fill", function(_, i) { return colors[i]; })
        .on("mouseover", legendMouseover)
        .on("mouseleave", legendMouseleave);
    legend.selectAll(".legend-label")
        .data(types)
        .enter()
        .append("text").attr("class", "legend-label")
        .attr("x", graph_width + legendSquare + 10)
        .attr("y", function(_, i) { return 15 + i * (legendSquare + 5); })
        .style("fill", function(_, i) { return colors[i]; })
        .text(function(d) { return d; })
        .attr("text-anchor", "start")
        .on("mouseover", legendMouseover)
        .on("mouseleave", legendMouseleave);

    updateChart();
})

function updateBrushedChart() {
    var selected = d3.event.selection;
    if (!selected) {
        // invalid/no selection; waits a bit then scale to original
        // (double-clicking will return graph to original scale)
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        xScale.domain(d3.extent(dataset, function(d) { return d.year; }));
    } else {
        // zoom into the selected area
        xScale.domain([ xScale.invert(selected[0]), xScale.invert(selected[1]) ]);

        // remove brushing rectangle
        brushableGraph.select(".brush").call(brush.move, null);
    }
    xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
    brushableGraph.selectAll(".layer")
        .transition().duration(1000)
        .attr("d", d3.area()
            .x(function(d) { return xScale(d.data.year); })
            .y0(function(d) { return yScale(d[0]); })
            .y1(function(d) { return yScale(d[1]); })
        );
    if (show_total) {
        brushableGraph.select(".line")
            .transition().duration(1000)
            .attr("d", d3.line()
                    .x(function(d) { return xScale(d.year); })
                    .y(function(d) { return yScale(d.total); })
                );
    }
}

// makes the non-hovered groups less opaque
function legendMouseover(d) {
    d3.selectAll(".layer").style("opacity", 0.1);
    d3.select("."+d).style("opacity", 1);
}

// restore opacity of all groups
function legendMouseleave(d) {
    d3.selectAll(".layer").style("opacity", 1);
}

function updateTooltips() {
    var year = `Year: ${hoveredData.year.getFullYear()}<br/>`;
    var population = `Population: ${hoveredData.population}<br/>`;
    var total = `Total Fatalities: ${hoveredData.total}<br/>`;
    tooltip.html(year + population + total)
        .style("left", `${d3.event.pageX + 20}px`)
        .style("top", `${d3.event.pageY + 20}px`)
        .style("color", "white")
        .selectAll()

        // list out no. of fatalities for each transportation type that year
        .data(types).enter()
        .append("div")
        .style("color", (_, i) => { return colors[i]; })
        .html(d => { return `${d}: ${hoveredData[d]}`; })
}

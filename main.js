// constants
const svg_width = 1000,
    svg_height = 600;
const legend_width = 200;
const margin = {top: 30, right: 30, bottom: 80, left: 100};
const graph_width = svg_width - legend_width - margin.left - margin.right,
    graph_height = svg_height - margin.top - margin.bottom;
const legendSquare = 20;
const types = ["car_occupants", "pedestrians", "motorcyclists", "bicyclists", "truck_occupants"];
const types_per_100k = ["car_occupants_per_100k", "pedestrians_per_100k", "motorcyclists_per_100k", "bicyclists_per_100k", "truck_occupants_per_100k"];

// set up svg
var main = d3.select("#main").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);
var svg = main.append("g").attr("id", "graph")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
var legend = main.append("g").attr("id", "legend")
    .attr("width", legend_width)
    .attr("transform", `translate(${margin.left + legendSquare}, ${svg_height / 2})`);

// make the chart title
svg.append("text")
    .attr("id", "title")
    .attr("x", graph_width / 2)
    .attr("text-anchor", "middle")
    .text("Transportation Fatalities by Year");

// for smooth transitions
var idleTimeout;
function idled() { idleTimeout = null; }

// tooltip
// var tooltip = d3.tip().attr("id", "tooltip");

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
    /** groups & reformat data **/
    var stacked_data = d3.stack()
        .keys(types)
        (data);
    
    /** colors **/
    var color = d3.scaleOrdinal()
        .domain(types)
        .range(['#9abbe6','#c2554f','#a0deb7','#eba57a','#ae85c9'])

    /** axes **/
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([0, graph_width]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.total; })])
        .range([graph_height, 0]);

    // x-axis
    var xAxis = svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + graph_height + ")")
        .call(d3.axisBottom(xScale));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(350," +  (graph_height + 60) +")")
        .text("Year");

    // y-axis
    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(-80,200) rotate(90)")
        .text("Total Fatalities");
    
    // ensure brushing is only within this clipPath
    svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", graph_width)
        .attr("height", graph_height)
        .attr("x", 0)
        .attr("y", 0);
    var brushableSvg = svg.append('g').attr("clip-path", "url(#clip)");

    // invisible target to let tooltip follow cursor
    // brushableSvg.append('circle').attr('id', 'tooltipMouseTarget');

    /** data **/
    brushableSvg.selectAll(".layers")
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

        // on hover, show tooltip
        // .on("mouseover", function(d) {
        //     // var fatalityType = `<p>Fatality Type: ${d.key}</p>`;
        //     // var fatalities = `<p>Fatalities: ${d.value}</p>`;
        //     // var fatalitiesPer100K = '-1';//`<p>Fatalities per 100K: ${d.data}</p>`;
        //     // var year = `<p>Year: ${d.index}</p>`;
        //     // var population = `<p>Population: ${d.data.population}</p>`;
        
        //     // tooltip.html(
        //     //     fatalityType + fatalities + fatalitiesPer100K + year + population
        //     // ).style("top", d3.event.pageY + "px")
        //     // .style("left", d3.event.pageX + "px");
        //     // console.log(d)
        //     tooltip.html(d.key)
        //     // lets tooltip follow cursor
        //     var target = d3.select('#tooltipMouseTarget')
        //       .attr('cx', d3.event.offsetX)
        //       .attr('cy', d3.event.offsetY - 5)
        //       .node();
              
        //     brushableSvg.call(tooltip);
        //     tooltip.show(d, target);
        // })

        // // on mouseout, the tooltip should disappear
        // .on("mouseout", tooltip.hide);

    // brushableSvg.append("path")
    //     .datum(data)
    //     .attr("class", "population")
    //     .attr("fill", "none")
    //     .attr("stroke", "red")
    //     .attr("d", d3.line()
    //         .x(function(d) { return xScale(d.year) })
    //         .y(function(d) { return yScale(d.population) })
    //     )

    // brushableSvg.append("path")
    //     .datum(data)
    //     .attr("class", "total-fatalities")
    //     .attr("fill", "none")
    //     .attr("stroke", "blue")
    //     .attr("d", d3.line()
    //         .x(function(d) { return xScale(d.year) })
    //         .y(function(d) { return yScale(d.total) })
    //     )

    // horizontal brushing
    var brush = d3.brushX()
        .extent( [ [0,0], [graph_width, graph_height] ] )
        .on("end", updateChart);
    brushableSvg.append("g").attr("class", "brush").call(brush);

    /** legend */
    legend.selectAll(".legend-rect")
        .data(types)
        .enter()
        .append("rect").attr("class", "legend-rect")
        .attr("x", graph_width)
        .attr("y", function(_, i) { return i * (legendSquare + 5); })
        .attr("width", legendSquare)
        .attr("height", legendSquare)
        .style("fill", function(d) { return color(d); })
        .on("mouseover", legendMouseover)
        .on("mouseleave", legendMouseleave);
    legend.selectAll(".legend-label")
        .data(types)
        .enter()
        .append("text").attr("class", "legend-label")
        .attr("x", graph_width + legendSquare + 10)
        .attr("y", function(_, i) { return 10 + i * (legendSquare + 7); })
        .style("fill", function(d) { return color(d); })
        .text(function(d) { return d; })
        .attr("text-anchor", "start")
        .on("mouseover", legendMouseover)
        .on("mouseleave", legendMouseleave);
    
    function updateChart() {
        var selected = d3.event.selection;
        if (!selected) {
            // invalid/no selection; waits a bit then scale to original
            // (double-clicking will return graph to original scale)
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
            xScale.domain(d3.extent(data, function(d) { return d.year; }))
        } else {
            // zoom into the selected area
            xScale.domain([ xScale.invert(selected[0]), xScale.invert(selected[1]) ]);

            // remove brushing rectangle
            brushableSvg.select(".brush").call(brush.move, null);
        }
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
        brushableSvg.selectAll("path")
            .transition().duration(1000)
            .attr("d", d3.area()
                .x(function(d) { return xScale(d.data.year); })
                .y0(function(d) { return yScale(d[0]); })
                .y1(function(d) { return yScale(d[1]); })
            );
    }
})

// makes the non-hovered groups less opaque
function legendMouseover(d) {
    d3.selectAll(".layer").style("opacity", 0.1);
    d3.select("."+d).style("opacity", 1);
}

// restore opacity of all groups
function legendMouseleave(d) {
    d3.selectAll(".layer").style("opacity", 1);
}

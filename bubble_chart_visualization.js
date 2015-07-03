var width = 600,
    height = 400,
    offset_y = 100;
offset_x = 100;

var data = [
    {id: 1, name: "onrust", val: -15.695442450570816},
    {id: 2, name: "uw_eigen_factor", val: -2.3778043292777675},
    {id: 3, name: "piekeren", val: 2.3736427124478197},
    {id: 4, name: "concentratie", val: 1.1899372553252616},
    {id: 5, name: "opgewektheid", val: -1.1078891632279635},
    {id: 6, name: "eigenwaarde", val: -0.876250480045563}
];

var links = [
    {source: {"x": 0, "y": 5}, target: {"x": 0, "y": 45}},
    {source: {"x": 0, "y": 5}, target: {"x": 0, "y": 90}},
    {source: {"x": 0, "y": 5}, target: {"x": 0, "y": 135}},
    {source: {"x": 0, "y": 135}, target: {"x": 0, "y": 90}},
    {source: {"x": 0, "y": 180}, target: {"x": 0, "y": 225}}

];


var svgContainer = d3.select("#bubble_chart")
    .style("height", height + "px")
    .style("width", width + "px");

var svg = d3.select("#bubble_chart").append("svg")
    .attr("class", "bubble_chart_svg")
    .attr("width", width)
    .attr("height", height);

var calculate_radius = function (value) {
    return Math.abs(value) * 2
};

var show_links = function (d, i) {
    id = "#bubble" + i;
    svg.selectAll('.line')
        .classed("hidden", false);

};

var hide_links = function (d, i) {
    svg.selectAll('.line')
        .classed("hidden", true);
};

var draw_arc = function(d, reverse) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = 75/2;
    if(reverse)
        return "M" + (offset_x+ d.target.x) + "," + (offset_y + d.target.y) + "A" + dr + "," + dr + " 0 0,1 " + (offset_x+ d.source.x) + "," + (offset_y+ d.source.y);
    return "M" + (offset_x+ d.source.x) + "," + (offset_y + d.source.y) + "A" + dr + "," + dr + " 0 0,1 " + (offset_x+ d.target.x) + "," + (offset_y+ d.target.y);
};

var render = function (data) {
    console.log(data);

    svg.append("text")
        .attr("id", "bubbleItemNote")
        .attr("x", 0)
        .attr("y", 10)
        .attr("font-size", 12)
        .attr("dominant-baseline", "middle")
        .attr("alignment-baseline", "middle")
        .style("fill", "#888888")
        .text(function (d) {
            return "Test visualisatie D3";
        });

    svg.selectAll('g')
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("opacity", "1.3")
        .attr("id", function (d, i) {
            console.log('i: ' + i);
            return "bubble" + i;
        })
        .attr("r", function (d, i) {
            return calculate_radius(d.val)
        })
        .attr("cx", function (d, i) {
            return offset_x
        })
        .attr("cy", function (d, i) {
            return offset_y + i * 45 + "px"
        })
        .style("fill", "#3397da")
        .on("mouseleave", function (d, i) {
            hide_links(d, i);
        })
        .on("mouseenter", function (d, i) {
            show_links(d, i);
        });

    svg.selectAll("g")
        .data(links)
        .enter()
        .append('path')
        .attr("class", function(d, i) {return "hidden line"})
        .attr("d", function(d){ return draw_arc(d, true) })
        .style("stroke", "#ff0000")
        .style("stroke-width", 2)
        .attr("fill", "none");


    svg.selectAll('g')
        .data(data)
        .enter()
        .append("text")
        .text(function (d) {
            var res = 'Meer ';
            if (Math.sign(d.val) == -1) res = 'Minder ';
            return res + d.name
        }
    )
        .style("fill", "#888")
        .attr("font-size", 12)
        .attr("x", function (d, i) {
            var radius = calculate_radius(d.val);
            return radius + offset_x + 6 + "px"
        })
        .attr("y", function (d, i) {
            return offset_y + 6 + i * 45 + "px"
        });
};

render(data);
var width = 600,
    height = 400,
    offset_y = 100;
offset_x = 50;

var data = [
        {text: "onrust", value: -15.695442450570816},
        {text: "uw_eigen_factor", value: -2.3778043292777675},
        {text: "piekeren", value: 2.3736427124478197},
        {text: "concentratie", value: 1.1899372553252616},
        {text: "opgewektheid", value: -1.1078891632279635},
        {text: "eigenwaarde", value: -0.876250480045563}
    ];

var calculate_radius = function (value) {
    return Math.abs(value) * 2
};

var increaseSize = function (d, i) {
    id = "#bubble" + i;
};

var decreaseSize = function (d, i) {
    console.log(d + " leave! " + i);
};

var render = function(data) {
    console.log(data);
    var svgContainer = d3.select("#bubble_chart")
        .style("height", height + "px")
        .style("width", width + "px");

    var svg = d3.select("#bubble_chart").append("svg")
        .attr("class", "bubble_chart_svg")
        .attr("width", width)
        .attr("height", height);

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
            decreaseSize(d, i);
        })
        .on("mouseenter", function (d, i) {
            increaseSize(d, i);
        });

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
}
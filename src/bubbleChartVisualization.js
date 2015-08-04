var width = 600,
  height = 400,
  offset_y = 00;
offset_x = 00;

var force = d3.layout.force()
.charge(20)
.linkDistance(30)
.size([width, height]);

var svg = d3.select("#bubble_chart").append("svg")
.attr("class", "bubble_chart_svg")
.attr("width", width)
.attr("height", height);

var draw_arc = function(d, reverse) {
var dx = d.target.x - d.source.x,
dy = d.target.y - d.source.y,
dr = 75;
if(reverse)
return "M" + (offset_x+ d.target.x) + "," + (offset_y + d.target.y) + "A" + 10 + "," + 10 + " 0 0,1 " + (offset_x+ d.source.x) + "," + (offset_y+ d.source.y);
return "M" + (offset_x+ d.source.x) + "," + (offset_y + d.source.y) + "A" + 10 + "," + 10 + " 0 0,1 " + (offset_x+ d.target.x) + "," + (offset_y+ d.target.y);
};

d3.json("../visualization.json", function(error, graph) {
  if (error) console.error(error);
  console.log(graph);
  force.nodes(graph.nodes)
  .links(graph.links)
  .start();

  var link = svg.selectAll(".link")
  .data(graph.links)
  .enter().append("line")
  .style("stroke", "#ff0000")
  .style("stroke-width", 2)
  .attr("fill", "none")
  .style("stroke-width", function(d) { return 1; });

  var node = svg.selectAll(".node")
  .data(graph.nodes)
  .enter().append("rect")
  .attr("class", "node")
  .attr("width", width)
  .attr("height", function(d){return 123;})
  .style("fill", "#123")
  .style("opacity", ".3");

  node.append("title")
  .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .style("stroke", "#999");


    node.attr("x", function(d) { return 0; })
    .attr("y", function(d) { console.log( d) ;return d.y  ; });
    //var link = svg.selectAll(".link")
  });
});

//var calculate_radius = function (value) {
//return Math.abs(value) * 2;
//};



//var render = function (data) {
//svg.append("text")
//.attr("id", "bubbleItemNote")
//.attr("x", 0)
//.attr("y", 10)
//.attr("font-size", 12)
//.attr("dominant-baseline", "middle")
//.attr("alignment-baseline", "middle")
//.style("fill", "#888888")
//.text(function (d) {
//return "Test visualisatie D3";
//});

//svg.selectAll('g')
//.data(data)
//.enter()
//.append("circle")
//.attr("class", "node")
//.attr("opacity", "1.3")
//.attr("id", function (d, i) {
//return "bubble" + i;
//})
//.attr("r", function (d, i) {
//return calculate_radius(d.val)
//})
//.attr("cx", function (d, i) {
//return offset_x
//})
//.attr("cy", function (d, i) {
//return offset_y + i * 45 + "px"
//})
//.style("fill", "#3397da")
//.on("mouseleave", function (d, i) {
//console.log(d)
//hide_links(d, i);
//})
//.on("mouseenter", function (d, i) {
//console.log(d)
//show_links(d, i);
//});



//svg.selectAll("g")
//.data(links)
//.enter()
//.append('path')
//.attr("class", function(d, i) {return "line"})
//.attr("d", function(d){ return draw_arc(d, true) })
//.style("stroke", "#ff0000")
//.style("stroke-width", 2)
//.attr("fill", "none")
//.on("mouseleave", function (d, i) {
//console.log(d)
//hide_links(d, i);
//})
//.on("mouseenter", function (d, i) {
//console.log(d)
//show_links(d, i);
//});


//svg.selectAll('g')
//.data(data)
//.enter()
//.append("text")
//.text(function (d) {
//var res = 'Meer ';
//if (Math.sign(d.val) == -1) res = 'Minder ';
//return res + d.name
//}
//)
//.style("fill", "#888")
//.attr("font-size", 12)
//.attr("x", function (d, i) {
//var radius = calculate_radius(d.val);
//return radius + offset_x + 6 + "px"
//})
//.attr("y", function (d, i) {
//return offset_y + 6 + i * 45 + "px"
//});
//};

//render(data);

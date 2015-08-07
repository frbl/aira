var width = 800,
  height = 800;

var force = d3.layout.force()
.charge(-10000)
.linkDistance(100)
.linkStrength(linkStrength)
.friction(0.9)
.gravity(0.1)
.theta(0.1)
.size([width, height]);

var svg = d3.select("#bubble_chart").append("svg")
.attr("class", "bubble_chart_svg")
.attr("width", width)
.attr("height", height)
.style("background-color", '#ffaa00');

var draw_arc = function(d, reverse) {
  var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = 75;
  if(reverse)
    return "M" + (offset_x+ d.target.x) + "," + (offset_y + d.target.y) + "A" + 10 + "," + 10 + " 0 0,1 " + (offset_x+ d.source.x) + "," + (offset_y+ d.source.y);
  return "M" + (offset_x+ d.source.x) + "," + (offset_y + d.source.y) + "A" + 10 + "," + 10 + " 0 0,1 " + (offset_x+ d.target.x) + "," + (offset_y+ d.target.y);
};

var get_radius = function(d) {
  return Math.log(1 + Math.abs(d.val)) * 20;
};

var get_direction = function(d){
  var res = 'Meer ';
  if (Math.sign(d.val) == -1) res = 'Minder ';
  return res + d.name;
};

var on_mouse_click = function(d, graph) {
  svg.selectAll('line').classed("visible-line-click", false);
  graph.links.forEach(function(link) {
    link.distance = 0.9;
    if(link.source.index === d.index)
    link.distance = 10;
  });

  svg.selectAll('line').filter(function(line) {
    return line.source.index === d.index;
  }).classed("visible-line-click", function (d) {
    return !d3.select(this).classed("visible-line-click");
  });
  force.start();
};

function linkStrength(d) {
  console.log(d);
  return d.distance;
}

var on_mouse_out = function(d) {
  svg.selectAll('line').classed("visible-line-hover", false);
};

var on_mouse_enter = function(d ) {
  svg.selectAll('line').filter(function(line) {
    return line.source.index === d.index;
  }).classed("visible-line-hover", true);
};


d3.json("../visualization.json", function(error, graph) {
  if (error) console.error(error);
  console.log(graph);
  force.nodes(graph.nodes)
  .links(graph.links)
  .start();


  svg.append("svg:defs").selectAll("marker")
  .data(graph.links)
  .enter().append("svg:marker")
  .attr("id",function(d){return "arrow-head-" + d.source.index + "-" + d.target.index;})
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", function(d) {return get_radius(d.target) * (6/10)/Math.sqrt(2) + 10;}) //function(d){ return 0.41* get_radius(d.target) +10; })
  .attr("refY", 0)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

  var link = svg.selectAll(".link")
  .data(graph.links)
  .enter().append("line")
  .attr("class", "line")
  .style("stroke", "#ff0000")
  .attr("fill", "none")
  .style("stroke-width", function(d) { return 4; })
  .attr("marker-end", function(d) {
    return "url(#arrow-head-" + d.source.index + "-" + d.target.index + ")";
  });

  var node = svg.selectAll(".node")
  .data(graph.nodes)
  .enter().append("circle")
  .attr("class", "node")
  .attr("r", get_radius)
  .style("fill", "#aaaaff")
  .style("opacity", "1")
  .on({
    "mouseenter": on_mouse_enter,
    "mouseout":  on_mouse_out,
    "click":  function(d) {on_mouse_click(d, graph);} ,
  });

  var text = svg.selectAll(".text")
  .data(graph.nodes)
  .enter().append("text")
  .attr("x", 8)
  .attr("y", ".31em")
  .text(function(d) { return get_direction(d); });


  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .style("stroke", "#999");


    var minx = 10000;
    var miny = 10000;
    var maxx = -10000;
    var maxy = -10000;
    graph.nodes.forEach(function(node) {
      if (node.x < minx) minx = node.x;
      if (node.x > maxx) maxx = node.x;
      if (node.y < miny) miny = node.y;
      if (node.y > maxy) maxy = node.y;
    });

    graph.nodes.forEach(function(node) {
      if (maxx-minx > 0.05) node.x = 100+(width-200)*(node.x-minx)/(maxx-minx);
      if (maxy-miny > 0.05) node.y = 100+(height-200)*(node.y-miny)/(maxy-miny);
    });

    node.attr("cx", function(d) { return d.x = Math.max(get_radius(d), Math.min(width - get_radius(d), d.x)); })
    .attr("cy", function(d) { return d.y = Math.max(get_radius(d), Math.min(height - get_radius(d), d.y)); });


    text.attr("x", function(d) { return d.x  ; })
    .attr("y", function(d) { return d.y  ; });

  });

  for (var i = 0; i < 400; i++) force.tick();

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

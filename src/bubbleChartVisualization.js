var width = 400,
  height = 400,
  max_size = 40,
  min_size = 10,
  min = 999999,
  max = -99999;

var force = d3.layout.force()
  .charge(-10000)
  .linkDistance(100)
  .linkStrength(linkStrength)
  .friction(0.9)
  .gravity(0.1)
  .theta(0.1)
  .size([width, height]);

var graph,
  svg = d3.select("#bubble_chart").append("svg")
  .attr("class", "bubble_chart_svg")
  .attr("width", width)
  .attr("height", height);

var determineMinMax = function() {
  var val;
  graph.nodes.forEach(function(node) {
    val = Math.log(1 + Math.abs(node.val));
    min = min < val ? min : val;
    max = max > val ? max : val;
  });
};

var get_radius = function(d) {
  return ((Math.log(1 + Math.abs(d.val)) - min) / (max - min)) * (max_size - min_size) + min_size;
};

var get_direction = function(d) {
  var res = 'Meer ';
  if (Math.sign(d.val) == -1) res = 'Minder ';
  return res + d.name.toLowerCase();
};

var removeAllElements = function(d) {
  d.selectAll("*").remove();
};

var resetNodes = function() {
  svg.selectAll('line').classed("visible-line-click", false);
  svg.selectAll('line').classed("visible-line-hover", false);

  svg.selectAll('.node')
    .style('stroke-width', '0px')
    .style('stroke', '#fff')
    .classed('selected_node', false);
};

var resetNodeNames = function(d, original) {
  if (d === undefined) d = {
    "index": -1
  };
  graph.nodes.forEach(function(node) {
    svg.select("#label_" + node.key).text(node.index == d.index || original ? get_direction(node) : node.name);
  });
};

var renderResultText = function(text) {
  var result = "";

  if (text.length == 1) {
    result = "Wanneer u " + text[0] + " ervaart, wordt dat gevolgd door meer leefplezier, maar heeft dat geen significant effect op de andere variabelen.";
  } else {
    result += "Wanneer u " + text[0] + " ervaart, wordt dat gevolgd door ";
    for (var i = 1; i < text.length; i++) {
      if (text.length == 2) {
        result += text[i] + ".";
      } else if (i == text.length - 1) {
        result += "en " + text[i] + ".";
      } else {
        result += text[i] + ", ";
      }
    }
  }
  d3.select("#effect_list").select("span").append("span").text(result);
};

var renderNodesFromNodePerspective = function(d) {
  var result_text = [];
  result_text.push(get_direction(d).toLowerCase());
  graph.links.forEach(function(edge) {
    if (edge.source.index == d.index) {
      var res = graph.nodes.filter(function(node) {
        return node.index == edge.target.index;
      }).map(function(node) {
        return {
          "val": Math.sign(edge.weight * d.val),
          "key": node.key,
          "name": node.name
        };
      })[0];
      svg.select("#label_" + res.key).text(function(d) {
        return get_direction(res);
      });
      result_text.push(get_direction(res).toLowerCase());
    }
  });
  renderResultText(result_text);
};

var renderEdgesFromNodePerspective = function(d) {
  svg.selectAll('line').filter(function(line) {
    return line.source.index === d.index;
  }).classed("visible-line-click", function(d) {
    return !d3.select(this).classed("visible-line-click");
  });
};


var onNodeClick = function(d) {
  var clicked_node = d3.select(this);
  var previously_clicked = clicked_node.classed('selected_node');

  removeAllElements(d3.select("#effect_list").select("span"));

  resetNodes();
  resetNodeNames(d, previously_clicked);
  if (previously_clicked) return;

  clicked_node.style('stroke-width', '2px')
    .style('stroke', '#ff0000')
    .classed('selected_node', true);

  renderEdgesFromNodePerspective(d);
  renderNodesFromNodePerspective(d);
};

function linkStrength(d) {
  return d.distance;
}

var onNodeOut = function(d) {
  svg.selectAll('line').classed("visible-line-hover", false);
};

var onNodeEnter = function(d) {
  svg.selectAll('line').filter(function(line) {
    return line.source.index === d.index;
  }).classed("visible-line-hover", true);
};


var render = function(graph_from_json) {
  removeAllElements(svg);
  graph = graph_from_json;

  determineMinMax();

  force.nodes(graph.nodes)
    .links(graph.links)
    .start();

  svg.append("svg:defs").selectAll("marker")
    .data(graph.links)
    .enter().append("svg:marker")
    .attr("id", function(d) {
      return "arrow-head-" + d.source.index + "-" + d.target.index;
    })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", function(d) {
      return get_radius(d.target) * (6 / 10) / Math.sqrt(2) + 10;
    }) //function(d){ return 0.41* get_radius(d.target) +10; })
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .attr("fill", "#666")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "line")
    .style("stroke", "#B8CEB3")
    .attr("fill", "none")
    .style("stroke-width", function(d) {
      return 4;
    })
    .attr("marker-end", function(d) {
      return "url(#arrow-head-" + d.source.index + "-" + d.target.index + ")";
    });

  var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", get_radius)
    .style("fill", "#3397da")
    .on({
      "mouseenter": onNodeEnter,
      "mouseout": onNodeOut,
      "click": onNodeClick
    });

  var text = svg.selectAll(".text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("x", 8)
    .attr("y", ".41em")
    .attr("id", function(d) {
      return "label_" + d.key;
    })
    .style("text-anchor", "middle")
    .text(function(d) {
      return get_direction(d);
    });

  var minx,
    miny,
    maxx,
    maxy;
  force.on("tick", function() {
    link.attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      })
      .style("stroke", "#999");

    minx = 10000;
    miny = 10000;
    maxx = -10000;
    maxy = -10000;
    graph.nodes.forEach(function(node) {
      if (node.x < minx) minx = node.x;
      if (node.x > maxx) maxx = node.x;
      if (node.y < miny) miny = node.y;
      if (node.y > maxy) maxy = node.y;
    });

    graph.nodes.forEach(function(node) {
      if (maxx - minx > 0.05) node.x = 100 + (width - 200) * (node.x - minx) / (maxx - minx);
      if (maxy - miny > 0.05) node.y = 100 + (height - 200) * (node.y - miny) / (maxy - miny);
    });

    node.attr("cx", function(d) {
        d.x = Math.max(get_radius(d), Math.min(width - get_radius(d), d.x));
        return d.x;
      })
      .attr("cy", function(d) {
        d.y = Math.max(get_radius(d), Math.min(height - get_radius(d), d.y));
        return d.y;
      });


    //.attr("y", function(d){return d.y+ get_radius(d) + 10;});

    var x_offset = 20;
    var y_offset = 3;

    text.attr("x", function(d) {
        return d.x;
      })
      //text.attr("x", function(d) { return d.x > width / 2 ? d.x + get_radius(d) + x_offset : d.x - get_radius(d) - x_offset ;})
      .attr("y", function(d) {
        return d.y > height / 2 ? d.y + get_radius(d) + x_offset : d.y - get_radius(d) - y_offset;
      });

  });

  for (var i = 0; i < 400; i++) force.tick();

};

var BubbleChartVisualization = (function() {
  var width = 400,
    height = 400,
    max_size = 40,
    min_size = 5,
    min = 999999,
    max = -99999,
    default_wanted_increase = 10,
    graph,optimizer;

  var bubble_force_layout = d3.layout.force()
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

  var get_direction = function(d, higher, lower) {
    var res = higher;
    if (Math.sign(d.val) == -1) res = lower;
    return res + d.name.toLowerCase();
  };

  var removeAllElements = function(d) {
    d.selectAll("*").remove();
    min = 999999;
    max = -99999;
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
      svg.select("#label_" + node.key).text(node.index == d.index || original ? get_direction(node, 'More ', 'Less ') : node.name);
    });
  };

  var renderResultText = function(text) {
    var result = "";

    if (text.length == 1) {
      result = "Whenever you experience " + text[0] + ", youre well-being will be increased the next moment. However, this does not have a significant effect on the other variables.";
    } else {
      result += "Whenever you experience " + text[0] + ", the next moment you'll experience  ";
      for (var i = 1; i < text.length; i++) {
        if (text.length == 2) {
          result += text[i] + ".";
        } else if (i == text.length - 1) {
          result += "and " + text[i] + ".";
        } else {
          result += text[i] + ", ";
        }
      }
    }
    d3.select("#effect_list").select("span").append("span").text(result);
  };

  var renderPercentagesText = function(d) {
    var wanted_increase = Math.sign(d.val) >= 0 ? default_wanted_increase : -1 * default_wanted_increase;
    var number_of_options = 0;
    var result = '';
    var percentages = aira.determineOptimalNodeSimple(d.index, optimizer, {'wanted_increase': wanted_increase});

    var number_of_advices = 0;
    for (var effect in percentages) {
      current = percentages[effect].needed_difference * 100;
      console.log(percentages[effect].needed_difference);
      if(current < -100 || percentages[effect].needed_difference === Infinity) {
        continue;
      }

      number_of_options += 1;
      result += (( current > 0 ? 'increase' : 'decrease') + ' your average amount of \'' + effect + '\' with ' + Math.abs(current.toFixed(0)) + '%');
      number_of_advices++;
    }

    if(number_of_advices > 0) {
      result = 'In order to ' + (Math.sign(d.val) >= 0 ? 'increase': 'decrease') + " '" + d.name + '\' with '+Math.abs(wanted_increase)+'%, you could ' + result;
    } else{
      result = 'We could not determine a suitable way to ' + (Math.sign(d.val) >= 0 ? 'increase': 'decrease') + '\'' + d.name + '\' with '+Math.abs(wanted_increase)+'%.';
    }
    d3.select("#percentage_advice").select("span").append("span").text(result);
  };

  var renderNodesFromNodePerspective = function(d) {
    var result_text = [];
    result_text.push(get_direction(d, 'more ', 'less '));
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
          return get_direction(res, 'More ', 'Less ');
        });
        result_text.push(get_direction(res, 'More ', 'Less '));
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
    removeAllElements(d3.select("#percentage_advice").select("span"));

    resetNodes();
    resetNodeNames(d, previously_clicked);
    if (previously_clicked) return;

    clicked_node.style('stroke-width', '2px')
      .style('stroke', '#ff0000')
      .classed('selected_node', true);

    renderEdgesFromNodePerspective(d);
    renderNodesFromNodePerspective(d);
    renderPercentagesText(d);
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

  var findNode = function(id) {
    var x = graph.nodes.filter(function(node) {
      return node.index === id;
    });
    return x[0];
  };

  function BubbleChartVisualization(aira, provided_optimizer) {
    var res = aira.determineBestNodeFromAll();
    graph = aira.createAiraNetworkJson(res);
    optimizer = provided_optimizer;
  }

  BubbleChartVisualization.prototype.render = function() {
    removeAllElements(svg);

    determineMinMax();

    bubble_force_layout.nodes(graph.nodes)
      .links(graph.links);
    svg.append("svg:defs").selectAll("marker")
      .data(graph.links)
      .enter().append("svg:marker")
      .attr("id", function(d) {
        return "arrow-head-" + d.source.index + "-" + d.target.index;
      })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", function(d) {
        return get_radius(findNode(d.target.index)) * (6 / 10) / Math.sqrt(2) + 10;
      })
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
        return get_direction(d, 'More ', 'Less ');
      });


    bubble_force_layout.start();
    var minx,
      miny,
      maxx,
      maxy;


    bubble_force_layout.on("tick", function() {
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

    for (var i = 0; i < 400; i++) bubble_force_layout.tick();

  };

  return BubbleChartVisualization;
})();

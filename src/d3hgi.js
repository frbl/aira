/*
 * D3 Reusable charts
 *
 * Rob Wanders
 */

// DEBUG info
var DEBUG = false;
if(DEBUG) console.log('d3HGI -- Loaded (DEBUG)');



/*
 * Format data functions
 *
 */
var formatCount = d3.format(",.0f");


/*
 * Helper functions
 *
 */

// Check if object is empty
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

// Sorts array by key
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}

// Computes the angle of an arc, converting from radians to degrees.
function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
}

// Pseudo random number generator (used to get start positions for network nodes)
var seed = 17;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Function to generate a valid ID for the nodes in the network, based on their name
function generate_id(name) {
    name = name.toLowerCase();
    name = name.replace(/ /g, '_');
    name = name.replace(/\./g, '_');
    return name;
};

/*
 * Network plot
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiNetwork() {



    //// Properties
    var margin = {top: 70, right: 130, bottom: 40, left: 130},
        width = 255,
        height = 210,
        mapping = ['links','nodes'],
        xDomain = 0,
        yDomain = 0,
        linkDistance = 200,
        linkStrength = 1,
        charge = -10000,
        gravity = 0.1,
        friction = 0.8,
        labelDistance = 5,
        minStrokeWidth = 2,
        maxStrokeWidth = 7,
        addLabels = true,
        doCenterNode = false,
        doStaticLayout = true,
        allowDragging = true,
        doForceBasedLabels = true,
        addCoefficientMarkers = true,
        coefMarkerDistance = 7,
        coefMarkerOffset = 12,
        isDirectedGraph = false,
        addGradients = true,
        doWeightedCharge = false;



    //// D3 Helper functions
    // Force layout
    var netLayout = d3.layout.force();
    var labelLayout = d3.layout.force();




    //// Internal auxilary functions


    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {
            // Check if there are nodes defined
            if(isEmpty(data.nodes)) { return; }
            if(isEmpty(data.links)) { var noLinks = true;}

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiNetwork');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }

            // Compute link distance if not set
            if(linkDistance == 0) { linkDistance = Math.min( (height)/4 , (width)/4 ); }

            // Specify layout
            netLayout
                .linkDistance(function(d,i) {
                    // if this link connects to a small node, make the distance small
                    if(d.source.weight == 2 || d.target.weight == 2) {
                        return linkDistance/2;
                    }

                    // if this link connects to a single node, make the distance even smaller
                    if(d.source.weight == 1 || d.target.weight == 1) {
                        return linkDistance/3;
                    }

                    return linkDistance;
                })
                .nodes(data.nodes)
                .links(data.links)
                .linkStrength(function(d,i) {
                    /* if this link connects a single node, make it stronger
                     if(d.source.weight == 1 || d.target.weight == 1) {
                     return linkStrength*2;
                     }*/

                    return linkStrength;
                })
                //.charge(charge)
                .charge(function(d,i) {
                    if(DEBUG) console.log('Charge:'+(-50*(d.radius*d.radius)));
                    if(doWeightedCharge) {
                        return (-50*(d.radius*d.radius));
                    } else {
                        return charge;
                    }
                })
                .friction(friction)
                .gravity(gravity)
                .size([width,height])
                .on("tick",tickLayout)
                .start();


            // Node with most links
            // Obtain center node (i.e. node with most links)
            var centerNode = data.nodes[0];
            data.nodes.forEach(function(node) {(node.weight>centerNode.weight)?centerNode=node:0;});

            // Starting positions (pseudo random starting positions)
            data.nodes.forEach(function(node) {
                node.px = Math.floor(random()*(width));
                node.py = Math.floor(random()*(height));

                node.x = node.px;
                node.y = node.py;

                if(DEBUG) console.log('Node:'+node.name+' ('+node.x+','+node.y+')');
            });

            // If we do force based labels than compute a new (alternative) network with labels as nodes linked to original nodes
            // (inspired on code from Moritz Stefaner)
            if(doForceBasedLabels) {
                // Nodes associated with labels
                data.labelNodes = [];
                data.nodes.forEach(function(node) {data.labelNodes.push({node:node});data.labelNodes.push({node:node});});

                // Links between each original node and associated label node
                data.labelLinks = [];
                for(var i = 0; i < data.nodes.length; i++) {
                    data.labelLinks.push({
                        source : i * 2,
                        target : i * 2 + 1,
                        weight : 1
                    });
                }

                labelLayout
                    .nodes(data.labelNodes)
                    .links(data.labelLinks)
                    .gravity(0)
                    //.friction(0.8)
                    .linkDistance(1)
                    .linkStrength(8)
                    .charge(-250)
                    .on("tick",tickLabel)
                    .size([width,height]); // NOTE: labels are allowed to go in margin space

                if(DEBUG) {
                    console.log('Generated force based label network:');
                    console.log(data.labelNodes);
                    console.log(data.labelLinks);
                    console.log('');
                }
            }



            // Start layout
            netLayout.start();
            (doForceBasedLabels) ? labelLayout.start() : 0;

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g").attr("class", "network");

            // SVG Definitions
            if(addGradients) {
                var svgdefs = svg.append("defs");
                // Radial gradient for nodes
                var radialGradient = svgdefs.append("radialGradient")
                    .attr("id","nodeGrad")
                    .attr("cx","30%")
                    .attr("cy","30%")
                    .attr("r","55%");
                radialGradient
                    .append("stop")
                    .attr("offset","0%")
                    .style("stop-color","white")
                    .attr("stop-opacity","1.0");

                radialGradient
                    .append("stop").attr("offset","5%")
                    .style("stop-color","white")
                    .attr("stop-opacity","1.0");

                radialGradient
                    .append("stop")
                    .attr("offset","100%")
                    .style("stop-color","white")
                    .attr("stop-opacity","0.0");
            }

            // Set chart width and height
            svg.attr({'width': width + margin.left + margin.right,'height':height + margin.top + margin.bottom});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            //-- Draw lines and nodes
            gLinks = gChart.selectAll(".link");
            gArclinks = gChart.selectAll(".arclink");

            if(!noLinks) {

                if(isDirectedGraph) {
                    // Check for doubly encoded directionality
                    data.links.forEach(function(link) {
                        link.doubly = false;
                        data.links.forEach(function(d) {
                            ( (d.target == link.source) && (d.source == link.target) ) ? link.doubly = true : 0;
                        });
                    });
                }

                var gLinks = gLinks
                    .data(data.links.filter(function(d) { if(!isDirectedGraph || d.doubly==false) return d;}))
                    .enter().append("g").attr("class","link");

                if(isDirectedGraph) {
                    var gArclinks = gArclinks
                        .data(data.links.filter(function(d) { if(d.doubly==true) return d;}))
                        .enter().append("g").attr("class","link");
                }

                if(addCoefficientMarkers) {
                    if(DEBUG && 1==0) gLinks.append("circle").attr("r",2);
                    gLinks.append("text")
                        .attr("text-anchor","middle")
                        .attr("dy","0.3em")
                        .attr("class", function(d) { if(d.coef>0) { return "positive"; } else { return "negative"} })
                        .text(function(d) { (d.coef > 0) ? d.coefSign="+" : d.coefSign="-"; return d.coefSign; });//return d.coef; });

                    gArclinks.append("text")
                        .attr("text-anchor","middle")
                        .attr("dy","0.3em")
                        .attr("class", function(d) { if(d.coef>0) { return "positive"; } else { return "negative"} })
                        .text(function(d) { (d.coef > 0) ? d.coefSign="+" : d.coefSign="-"; return d.coefSign; });//return d.coef; });

                }


                gLinks.append("line")
                    .style("stroke-width", function(d) { d.width=(minStrokeWidth + Math.min(maxStrokeWidth,maxStrokeWidth*Math.max(0,(Math.abs(d.coef)-0.2)*2))); return d.width+"px"; });

                if(isDirectedGraph) {
                    gArclinks.append("path").attr("class","arclink")
                        // Stroke width as a function of coefficient strength
                        .style("stroke-width", function(d) { d.width=(minStrokeWidth + Math.min(maxStrokeWidth,maxStrokeWidth*Math.max(0,(Math.abs(d.coef)-0.2)*2))); return d.width+"px"; });
                }

                // Arrow on link if graph is directed
                if(isDirectedGraph) {
                    if(DEBUG && 1==0) gLinks.append("rect").attr("width",6).attr("height",6).attr("fill","black").attr("x",-3).attr("y",-3);
                    gLinks.append('path')
                        .attr('class','arrow')
                        .attr('d', function(d) {
                            var x = 0, y = -2;
                            return "M0,-5L10,0L0,5";
                            //return 'M ' + x +' '+ y + ' l 4 4 l -8 0 z';
                        });

                    if(DEBUG && 1==0) gArclinks.append("rect").attr("width",6).attr("height",6).attr("fill","black").attr("x",-3).attr("y",-3);
                    gArclinks.append('path')
                        .attr('class','arrow')
                        .attr('d', function(d) {
                            var x = 0, y = -2;
                            return "M0,-5L10,0L0,5";
                            //return 'M ' + x +' '+ y + ' l 4 4 l -8 0 z';
                        });
                }
            }

            // Draw nodes
            var gNodes = gChart.selectAll(".node")
                .data(data.nodes)
                .enter().append("g");

            gNodes.append("circle")
                .attr("class", function (d) { return "node "+d.type; })
                .attr("id", function (d) { return generate_id(d.name); })
                // Radius nodes depends on number of links
                .attr("r", function(d) { if(noLinks) { d.radius = 15; } else { d.radius=(10+10*(d.weight/centerNode.weight)); } return d.radius; })

            if(!addGradients) {
                gNodes.append("circle")
                    .attr("class","nodeGrad")
                    .attr("r", function(d) { return d.radius; }) // d.radius=(10+10*(d.weight/centerNode.weight)); return d.radius; })
                    .style("fill", "url(#nodeGrad)");
            }

            //-- Labels
            if(doForceBasedLabels) {
                var gLabelLinks = gChart.selectAll(".labelLink")
                    .data(data.labelLinks);
                //.enter().append("line").attr("class","link");

                var gLabelNodes = gChart.selectAll(".labelNode")
                    .data(data.labelNodes)
                    .enter().append("g").attr("class","labelNode");
                gLabelNodes.append("circle").attr("r",0).style("fill","#000"); // Invisible nodes
                gLabelNodes.append("text").text(function(d, i) { // Text at the place of the text node
                    return (i % 2 == 0) ? "" : d.node.name;
                });
            }


            // Allow nodes to be dragged
            if(allowDragging) {

                // Enable dragging
                gNodes.call(netLayout.drag);

                // Set attribute to fixed whenever they are dragged
                netLayout.drag().on("dragstart", function(d) { d3.select(this).classed("fixed", d.fixed = true); });

                if(doForceBasedLabels) { netLayout.drag().on("drag", function() { labelLayout.resume(); } ); }

                // On double click release nodes
                gNodes.on("dblclick", function(d) { d3.select(this).classed("fixed", d.fixed = false); });
            }




            // Do a static layout by only visualizing the end result of the network simulation
            if(doStaticLayout) {

                // Hide chart
                gChart.attr('visibility','hidden');

                // Run layout simulation
                setTimeout(function() {
                    if(DEBUG) var start = new Date().getTime();

                    // Run the layout a fixed number of times
                    var n = 10;

                    // Layout
                    netLayout.start();
                    for (var i = n * n; i > 0; --i) netLayout.tick();
                    netLayout.stop();

                    // Labels
                    if(doForceBasedLabels) {
                        labelLayout.start();
                        for (var i = n * n; i > 0; --i) labelLayout.tick();
                        labelLayout.stop();
                    }

                    // Show chart
                    gChart.attr('visibility',null);

                    if(DEBUG) {
                        var end = new Date().getTime();
                        console.log('Simulation time: ' + (end - start) + 'ms');
                    }

                }, 10);

            } else {
                // Show animation (i.e. update node positions) during layout simulation
                netLayout.start();
            }



            // The layout is based on a physics simulation, each tick of this simulation calls this function
            // We can therefore control the layout by updating node positions during the simulation
            function tickLayout() {

                // Center the node with the most links
                if(doCenterNode) {
                    data.nodes[centerNode.index].x = width/2;
                    data.nodes[centerNode.index].y = height/2;
                    // No charge on center node
                    data.nodes[centerNode.index].charge = 0;
                }

                // Constrain nodes to be within layout, and nodes without links to be part of the layout, circling around the center
                var minx = 10000;
                var miny = 10000;
                var maxx = -10000;
                var maxy = -10000;
                data.nodes.forEach(function(node) {
                    if(node.weight<=0)
                    {
                        // Smaller charge
                        node.charge = -30;
                    }

                    // Always keep within borders
                    if (node.x < minx) minx = node.x;
                    if (node.x > maxx) maxx = node.x;
                    if (node.y < miny) miny = node.y;
                    if (node.y > maxy) maxy = node.y;
                });
                data.nodes.forEach(function(node) {
                    if (maxx-minx > 0.05) node.x = width*(node.x-minx)/(maxx-minx);
                    if (maxy-miny > 0.05) node.y = height*(node.y-miny)/(maxy-miny);
                });
                if(doForceBasedLabels && !doStaticLayout) {
                    // Simulate label layout
                    labelLayout.start();
                }

                //-- Update node and link positions
                gLinks.selectAll('line').attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
                gArclinks.selectAll('path.arclink').attr("d",linkArc);

                if(addCoefficientMarkers) {
                    if(DEBUG) { // Draws circles at point where coefficient markers (+ or -) should be drawn
                        gLinks.selectAll('circle').attr("transform",function(d) {
                            // Position at node with least links if network is undirected (less clutter)
                            if( !isDirectedGraph && (d.source.weight < d.target.weight)) {
                                targetRadius = d.source.radius; targetX = d.source.x; targetY = d.source.y; fromX = d.target.x; fromY = d.target.y;
                            } else {
                                targetRadius = d.target.radius; targetX = d.target.x; targetY = d.target.y; fromX = d.source.x; fromY = d.source.y;
                                console.log('called..');
                            }

                            maxDistance = coefMarkerDistance + targetRadius;

                            // First compute place on link at distance defined in coefMarkerDistance
                            diffX = fromX - targetX;
                            diffY = fromY - targetY;
                            distance = Math.sqrt(diffX*diffX + diffY*diffY);
                            d.x = targetX + maxDistance * (diffX/distance);
                            d.y = targetY + maxDistance * (diffY/distance);

                            // Next add an offset based on target
                            coefMarkerOffsetRad = coefMarkerOffset * Math.PI / 180;

                            transX = d.x-targetX;
                            transY = d.y-targetY;
                            d.x = targetX + (transX*Math.cos(coefMarkerOffsetRad) -  transY*Math.sin(coefMarkerOffsetRad));
                            d.y = targetY + (transX*Math.sin(coefMarkerOffsetRad) + transY*Math.cos(coefMarkerOffsetRad));

                            return "translate("+d.x+","+d.y+")"
                        });
                    }

                    gLinks.selectAll('text').attr("transform",function(d) {
                        // Position at node with least links (less clutter)
                        if( !isDirectedGraph && (d.source.weight < d.target.weight)) {
                            targetRadius = d.source.radius; targetX = d.source.x; targetY = d.source.y; fromX = d.target.x; fromY = d.target.y;
                        } else {
                            targetRadius = d.target.radius; targetX = d.target.x; targetY = d.target.y; fromX = d.source.x; fromY = d.source.y;
                        }

                        maxDistance = coefMarkerDistance + targetRadius;

                        // First compute place on link at distance defined in coefMarkerDistance
                        diffX = fromX - targetX;
                        diffY = fromY - targetY;
                        distance = Math.sqrt(diffX*diffX + diffY*diffY);
                        d.x = targetX + maxDistance * (diffX/distance);
                        d.y = targetY + maxDistance * (diffY/distance);

                        // Next add an offset based on target
                        coefMarkerOffsetRad = coefMarkerOffset * Math.PI / 180;

                        transX = d.x-targetX;
                        transY = d.y-targetY;
                        d.x = targetX + (transX*Math.cos(coefMarkerOffsetRad) -  transY*Math.sin(coefMarkerOffsetRad));
                        d.y = targetY + (transX*Math.sin(coefMarkerOffsetRad) + transY*Math.cos(coefMarkerOffsetRad));

                        return "translate("+d.x+","+d.y+")"
                    });

                    gArclinks.selectAll('text').attr("transform",function(d) {
                        // Position at node with least links (less clutter)
                        if( !isDirectedGraph && (d.source.weight < d.target.weight)) {
                            targetRadius = d.source.radius; targetX = d.source.x; targetY = d.source.y; fromX = d.target.x; fromY = d.target.y;
                        } else {
                            targetRadius = d.target.radius; targetX = d.target.x; targetY = d.target.y; fromX = d.source.x; fromY = d.source.y;
                        }

                        maxDistance = coefMarkerDistance + targetRadius;

                        // First compute place on link at distance defined in coefMarkerDistance
                        diffX = fromX - targetX;
                        diffY = fromY - targetY;
                        distance = Math.sqrt(diffX*diffX + diffY*diffY);
                        d.x = targetX + maxDistance * (diffX/distance);
                        d.y = targetY + maxDistance * (diffY/distance);

                        // Next add an offset based on target
                        coefMarkerOffsetRad = coefMarkerOffset * Math.PI / 180;

                        transX = d.x-targetX;
                        transY = d.y-targetY;
                        d.x = targetX + (transX*Math.cos(coefMarkerOffsetRad) -  transY*Math.sin(coefMarkerOffsetRad));
                        d.y = targetY + (transX*Math.sin(coefMarkerOffsetRad) + transY*Math.cos(coefMarkerOffsetRad));

                        return "translate("+d.x+","+d.y+")"
                    });

                }

                if(isDirectedGraph) {
                    gLinks.selectAll('.arrow').attr("transform",function(d) {
                        maxDistance = coefMarkerDistance + targetRadius;

                        // First compute place on link
                        var alpha = Math.atan((d.target.y-d.source.y)/(d.target.x-d.source.x));
                        var factr = 1-((d.width-minStrokeWidth) / maxStrokeWidth);
                        d.x = d.source.x + (0.95+0.05*factr)*(Math.cos(alpha) * d.source.radius + 0.5*(d.target.x - d.source.x - Math.cos(alpha) * d.source.radius - Math.cos(alpha) * d.target.radius));
                        d.y = d.source.y + (0.95+0.05*factr)*(Math.sin(alpha) * d.source.radius + 0.5*(d.target.y - d.source.y - Math.sin(alpha) * d.source.radius - Math.sin(alpha) * d.target.radius));


                        // Find orientation
                        orient = Math.atan((d.target.y-d.source.y)/(d.target.x-d.source.x));
                        orientdeg = (orient*180)/Math.PI;
                        (d.target.x < d.source.x) ? orientdeg = orientdeg - 180 : 0;

                        // Translate to middle point, rotate in correct direction, and scale between 1-1.5 according to coefficient weight
                        return "translate("+d.x+","+d.y+") rotate("+(orientdeg)+") scale("+(1+(d.width-minStrokeWidth)/(2*(maxStrokeWidth-minStrokeWidth)))+")";
                    });


                    gArclinks.select('.arrow').attr("transform",function(d, i) {
                        // Middle
                        var halfLength = gArclinks.select('path.arclink')[0][i].getTotalLength()/2;
                        midPoint = gArclinks.select('path.arclink')[0][i].getPointAtLength(halfLength);

                        // Find orientation
                        orient = Math.atan( (d.target.y-d.source.y)/(d.target.x-d.source.x));
                        orientdeg = (orient*180)/Math.PI;
                        (d.target.x < d.source.x) ? orientdeg = orientdeg - 180 : 0;

                        // Translate to middle point, rotate in correct direction, and scale between 1-1.5 according to coefficient weight
                        return "translate("+midPoint.x+","+midPoint.y+") rotate("+(orientdeg)+") scale("+(1+(d.width-minStrokeWidth)/(2*(maxStrokeWidth-minStrokeWidth)))+")";
                    });
                }


                gNodes.selectAll(".node")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });

                // Gradients on top of nodes
                if(addGradients) {
                    gNodes.selectAll(".nodeGrad")
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                }
            }


            // The label placement is based on a physics simulation, each tick of this simulation calls this function
            // We can therefore control the layout of the labels by updating positions during the simulation
            function tickLabel() {
                gLabelNodes.each(function(d,i) {
                    // Fix 'real' nodes
                    if(i % 2 == 0) {
                        d.x = d.node.x;
                        d.y = d.node.y;
                        // Control label nodes
                    } else {
                        // Compute distance to 'real' node
                        diffX = d.x - d.node.x;
                        diffY = d.y - d.node.y;
                        distance = Math.sqrt(diffX*diffX + diffY*diffY);

                        // Force on circle, i.e. force the labelDistance from the edge of the node (include node radius)
                        maxDistance = labelDistance + d.node.radius;
                        // Traverse to closest point on circle
                        d.x = d.node.x + maxDistance * ( diffX/distance);
                        d.y = d.node.y + maxDistance * ( diffY/distance);

                        // Check on which side the label node is (topleft,topright,bottomright,bottomleft)
                        if(diffX > 0) {
                            (diffY > 0) ? d.side = "bottomright" : d.side = "topright";
                        } else {
                            (diffY > 0) ? d.side = "bottomleft" : d.side = "topleft";
                        }
                    }
                });

                // Update node and link positions
                gLabelLinks.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
                gLabelNodes.attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });
                gLabelNodes.selectAll("text")
                    .attr("dy", function(d) {
                        if(d.side == "topleft") return "-0.1em";
                        if(d.side == "topright") return "-0.1em";
                        if(d.side == "bottomleft") return "0.4em";
                        if(d.side == "bottomright") return "0.4em";
                    })
                    .attr("text-anchor", function(d) {
                        if(d.side == "topleft") return "end";
                        if(d.side == "topright") return "start";
                        if(d.side == "bottomleft") return "end";
                        if(d.side == "bottomright") return "start";
                    });
            }

            // Create arced links
            function linkArc(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            }
        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.doCenterNode = function(_) {  if (!arguments.length) {return doCenterNode;}   doCenterNode = _;  return chart;  };
    chart.doStaticLayout = function(_) {  if (!arguments.length) {return doStaticLayout;}   doStaticLayout = _;  return chart;  };
    chart.linkDistance = function(_) {  if (!arguments.length) {return linkDistance;}   linkDistance = _;  return chart;  };
    chart.linkStrength = function(_) {  if (!arguments.length) {return linkStrength;}   linkStrength = _;  return chart;  };
    chart.charge = function(_) {  if (!arguments.length) {return charge;}   charge = _;  return chart;  };
    chart.labelDistance = function(_) {  if (!arguments.length) {return labelDistance;}   labelDistance = _;  return chart;  };
    chart.gravity = function(_) {  if (!arguments.length) {return gravity;}   gravity = _;  return chart;  };
    chart.friction = function(_) {  if (!arguments.length) {return friction;}   friction = _;  return chart;  };
    chart.minStrokeWidth = function(_) {  if (!arguments.length) {return minStrokeWidth;}   minStrokeWidth = _;  return chart;  };
    chart.maxStrokeWidth = function(_) {  if (!arguments.length) {return maxStrokeWidth;}   maxStrokeWidth = _;  return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.doCenterNode = function(_) {  if (!arguments.length) {return doCenterNode;}   doCenterNode = _;  return chart;  };
    chart.allowDragging = function(_) {  if (!arguments.length) {return allowDragging;}   allowDragging = _;  return chart;  };
    chart.doForceBasedLabels = function(_) {  if (!arguments.length) {return doForceBasedLabels;}   doForceBasedLabels = _;  return chart;  };
    chart.addCoefficientMarkers = function(_) {  if (!arguments.length) {return addCoefficientMarkers;}   addCoefficientMarkers = _;  return chart;  };
    chart.coefMarkerDistance = function(_) {  if (!arguments.length) {return coefMarkerDistance;}   coefMarkerDistance = _;  return chart;  };
    chart.coefMarkerOffset = function(_) {  if (!arguments.length) {return coefMarkerOffset;}   coefMarkerOffset = _;  return chart;  };
    chart.isDirectedGraph = function(_) {  if (!arguments.length) {return isDirectedGraph;}   isDirectedGraph = _;  return chart;  };
    chart.addGradients = function(_) {  if (!arguments.length) {return addGradients;}   addGradients = _;  return chart;  };
    chart.doWeightedCharge = function(_) {  if (!arguments.length) {return doWeightedCharge;}   doWeightedCharge = _;  return chart;  };


    return chart;
}



/*
 * Pie chart
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiPie() {



    //// Properties
    var margin = {top: 30, right: 30, bottom: 30, left: 30},
        width = 510,
        height = 515,
        mapping = ['x','y'],
        xDomain = 0,
        yDomain = 0,
        addLegends = true,
        addLabels = true,
        offsetLegends = 1.6,
        innerRadius = 60,
        outerRadius = 150;




    //// D3 Helper functions
    // Proportions of pie elements
    var pieColor = d3.scale.category20();
    var pieLayout = d3.layout.pie();
    var pieArc = d3.svg.arc()



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        yValue = function(d) { return d[mapping[1]]; };


    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiPie');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');

            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update pie layout
            pieSum = 0;
            pieLayout
                .value(function(d) { pieSum+=d[1]; return d[1]; })
                .sort(null);

            pieArc
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);



            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g");

            // Append chart with axes and lines
            gChart.append("g").attr("class", "pie");

            // Set chart width and height
            svg.attr({'width': width + margin.left + margin.right,'height':height + margin.top + margin.bottom});

            // !TODO - Check margins
            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + (width + margin.left + margin.right)/2 + "," + (height + margin.top + margin.bottom) / 2 + ")");


            // Groups for each pie element with the data
            var gPie = svg.select(".pie").selectAll(".arc").data(pieLayout(data)).enter()


            gPie.append("g").attr("class", "arc")
                .append("path")
                .attr("d", pieArc)
                .style("fill", function(d) { return pieColor(d.data[0]); });


            if(addLegends) {
                gPie.append("text")
                    .attr("class","legend")
                    .attr("transform", function(d) { //rotate the text
                        var c = pieArc.centroid(d);
                        return "translate(" + offsetLegends*c[0] + "," + offsetLegends*c[1] + ") rotate("+angle(d)+")";
                    })
                    .attr("text-anchor", function(d) { //center the text on it's origin
                        var c=pieArc.centroid(d);
                        if(c[0]>0) {
                            return "start"
                        } else {
                            return "end"
                        }
                    })
                    .text(function(d, i) { return data[i][0]; });
            }

            if(addLabels) {
                gPie.append("text")
                    .attr("class","label")
                    .attr("transform", function(d) { return "translate(" + pieArc.centroid(d) + ")"; })
                    .text(function(d) { return d.data[1]; });
            }
        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.innerRadius = function(_) { if (!arguments.length) {return innerRadius;}    innerRadius = _;  return chart;  };
    chart.outerRadius = function(_) { if (!arguments.length) {return outerRadius;}    outerRadius = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.pieColor = function(_) { if (!arguments.length) {return pieColor;}      pieColor = _;    return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.addLegends = function(_) {  if (!arguments.length) {return addLegends;}   addLegends = _;  return chart;  };
    chart.offsetLegends = function(_) {  if (!arguments.length) {return offsetLegends;}   offsetLegends = _;  return chart;  };



    return chart;
}



/*
 * Scatter plot
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiScatter() {



    //// Properties
    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 425,
        height = 415,
        mapping = ['x','y'],
        xDomain = 0,
        yDomain = 0,
        addLOESS = false,
        xTicks, yTicks,
        xLabel, yLabel;



    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.linear(),
        yScale = d3.scale.linear();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        yValue = function(d) { return d[mapping[1]]; };



    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiScatter');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'xDomain':xDomain,'yDomain':yDomain,'addLOESS':addLOESS});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');

            if(addLOESS) {
                data = sortByKey(data, mapping[0]);
            }

            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update scales
            minX = d3.min(data, function(d) { return d[0]});
            maxX = d3.max(data,function(d) { return d[0];});
            margeX = (maxX-minX)/20;

            minY = d3.min(data, function(d) { return d[1]})
            maxY = d3.max(data, function(d) { return d[1]})
            margeY = (maxY-minY)/20;

            (xDomain==0) ? xScale.domain([minX-margeX,maxX+margeX]) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain([minY-margeY,maxY+margeY]) : yScale.domain(yDomain);
            xScale.range([0, width - margin.left - margin.right]);
            yScale.range([height - margin.top - margin.bottom, 0]);

            // Update axis
            if(typeof xTicks != undefined) xAxis.ticks(xTicks);
            if(typeof yTicks != undefined) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g").attr("class","scatter");

            // Append chart with axes and lines
            gChart.append("g").attr("class", "dots");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Update the dots
            var gDots = gChart.select(".dots").selectAll(".dot").data(data.filter(function(d) { return (isNaN(d[0])||isNaN(d[1])||d[0]==null||d[1]==null) ? 0:1;})).enter();

            gDots.append("circle")
                .attr("class", "bubble")
                .attr("cx", function(d) { return xScale(d[0]) })
                .attr("cy", function(d) { return yScale(d[1]) })
                .attr("r", 3.5);//function(d) { 3.5 })

            // LOESS fitted curve
            if(addLOESS) {

                // Render the fitted line
                gChart.append('path')
                    .datum(function() {
                        var loess = science.stats.loess();
                        loess.bandwidth(0.7);

                        var dataNARM = data.filter(function(d) { return (isNaN(d[0])||isNaN(d[1])||d[0]==null||d[1]==null) ? 0:1;});

                        var xValues = dataNARM.map(function(d) { return xScale(d[0]); });
                        var yValues = dataNARM.map(function(d) { return yScale(d[1]) });
                        var yValuesSmoothed = loess(xValues, yValues);

                        return d3.zip(xValues, yValuesSmoothed);
                    })
                    .attr('class', 'line')
                    .attr('d', d3.svg.line()
                        .interpolate('basis')
                        .x(function(d) { return d[0]; })
                        .y(function(d) { return d[1]; }));
            }

            // Axes
            if(typeof xAxis == 'function') {
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + (height - margin.top - margin.bottom) + ")")
                    .call(xAxis);

                // Add x axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-margin.left-margin.right)/2)
                        .attr("y", margin.bottom)
                        .attr("dy","-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }


        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.addLOESS = function(_) { if (!arguments.length) {return addLOESS;}  addLOESS = _;    return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };



    return chart;
}




/*
 * Bubble chart
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiBubble() {



    //// Properties
    var margin = {top: 0, right: 15, bottom: 40, left: 40},
        width = 515,
        height = 515,
        mapping = ['x','y'],
        weightMapping = ['weight'],
        xDomain = 0,
        yDomain = 0,
        addLabels = true,
        orderBubbles = true,
        xTicks, yTicks,
        xLabel, yLabel;


    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.linear(),
        yScale = d3.scale.ordinal();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        yValue = function(d) { return d[mapping[1]]; },
        weightValue = function(d) { return d[weightMapping]; };



    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiBubble');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'weightMapping':weightMapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels,'orderBubbles':orderBubbles});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');

            // Order by frequency
            if(orderBubbles) {
                data = sortByKey(data, mapping[0]);
            }

            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i), weightValue.call(data,d,i)];
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update scales
            (xDomain==0) ? xScale.domain([0,d3.max(data,function(d) { return d[0]; })]) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain(data.map(function(d) { return d[1]; })) : yScale.domain(yDomain);
            xScale.range([0, width - margin.left - margin.right]);
            yScale.rangeRoundBands([0, height - margin.top - margin.bottom], .2);

            // !TODO - Add typeof == 'function' in other charts
            // Update axis
            if((typeof xTicks != undefined) && (typeof xAxis == 'function')) xAxis.ticks(xTicks);
            if((typeof yTicks != undefined) && (typeof yAxis == 'function')) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g");

            // Append chart with axes and lines
            gChart.append("g").attr("class", "bubbles");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Update the bars
            var gBubbles = gChart.select(".bubbles").selectAll(".bubble").data(data).enter();

            gBubbles.append("circle")
                .attr("class", "bubble")
                .attr("cx", function(d) { return xScale(d[0]) })
                .attr("cy", function(d) { return yScale(d[1]) + yScale.rangeBand()/2} )
                .attr("r", function(d) { return 7+4*d[2]} );

            if(addLabels) {
                gBubbles.append("text")
                    .attr("class","label")
                    .attr("y", function(d) { return yScale(d[1]) + yScale.rangeBand()/2 + 4} )
                    .attr("x", function(d) { return xScale(d[0]) - (7+4*d[2]) - 4 } )
                    .attr("text-anchor","end")
                    .text(function(d) { return d[1]});
            }


            // Axes
            if(typeof xAxis == 'function') {
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + (height - margin.top - margin.bottom) + ")")
                    .call(xAxis);

                // Add x axis label
                if(typeof xLabel != undefined) {

                    // !TODO Update position when yAxis is not defined
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-margin.left-margin.right)/2)
                        .attr("y", margin.bottom)
                        .attr("dy","-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof yLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }

        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.weightMapping = function(_) { if (!arguments.length) {return weightMapping;}    weightMapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.orderBubbles = function(_) {  if (!arguments.length) {return orderBubbles;}   orderBubbles = _;  return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };


    return chart;
}



/*
 * Horzontal bars chart
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiBar() {



    //// Properties
    var margin = {top: 20, right: 20, bottom: 40, left: 90},
        width = 515,
        height = 300,
        mapping = ['x','y'],
        errorMapping = 'sd',
        freqMapping = 'freq',
        xDomain = 0,
        yDomain = 0,
        addLabels = false,
        addError = false,
        addFrequencies = false,
        xTicks, yTicks,
        xLabel, yLabel,
        title;


    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.linear(),
        yScale = d3.scale.ordinal();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");



    //// Internal auxilary functions
    // Map data to x,y,error,frequencies
    var xValue = function(d) { return d[mapping[0]]; },
        yValue = function(d) { return d[mapping[1]]; },
        errorValue = function(d) { return d[errorMapping]; },
        freqValue = function(d) { return d[freqMapping]; };


    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiBar');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels,'addError':addError});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');


            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                if(addError) {
                    if(addFrequencies) {
                        return [xValue.call(data, d, i), yValue.call(data, d, i), errorValue.call(data,d,i), freqValue.call(data,d,i)];
                    } else {
                        return [xValue.call(data, d, i), yValue.call(data, d, i), errorValue.call(data,d,i)];
                    }
                } else {
                    if(addFrequencies) {
                        return [xValue.call(data, d, i), yValue.call(data, d, i),freqValue.call(data,d,i)];
                    } else {
                        return [xValue.call(data, d, i), yValue.call(data, d, i)];
                    }
                }
            });


            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }



            // Update scales
            (xDomain==0) ? xScale.domain([0,d3.max(data, function(d) { return d[1]; })]) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain(data.map(function(d) {return d[0];})) : yScale.domain(yDomain);
            xScale.range([0, width - margin.left - margin.right]);
            yScale.rangeRoundBands([height - margin.top - margin.bottom,0], .2);

            // Update axis
            if(typeof xTicks != undefined) xAxis.ticks(xTicks);
            if(typeof yTicks != undefined) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data.filter(function(d) { return(isNaN(d[1])||d[1]==0) ? 0:1})]);
            var gChart = svg.enter().append("svg").append("g");


            // Append chart with axes and lines
            gChart.append("g").attr("class", "bars");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Update the bars
            var gBars = gChart.select(".bars").selectAll(".bar").data(data.filter(function(d) { return(isNaN(d[1])||d[1]==0) ? 0:1})).enter();


            gBars.append("rect")
                .attr("class", "bar")
                //.attr("x", function(d) { return x(d.value); })
                .attr("width", function(d) { return xScale(d[1]); })
                .attr("y", function(d) { return yScale(d[0]); })
                .attr("height", yScale.rangeBand())

            // Labels in bars
            if(addLabels) {
                gBars.append("text")
                    .attr("class", "label")
                    .attr("dy", ".75em")
                    .attr("y", function(d) { return yScale(d[0]) -5 + yScale.rangeBand()/2; })
                    .attr("x", function(d) { return xScale(d[1])-5; })
                    .attr("text-anchor", "end")
                    .text(function(d) { return formatCount(d[1]); });
            }

            // Frequencies in bars
            if(addFrequencies) {
                // Frequenties
                gBars.append("text")
                    .attr("class", "label")
                    .attr("dy", ".75em")
                    .attr("y", function(d) { return yScale(d[0]) -5 + yScale.rangeBand()/2; })
                    .attr("x", function(d) { return 5; })
                    .attr("text-anchor", "first")
                    .text(function(d) { if( xScale(d[1])>27 ) { return formatCount(d[3])+"x"; }} ); // HACK - Do not display text when bar is smaller than 27px
            }

            // Error bars
            if(addError) {
                // Horizontal line of one sd
                gBars.insert("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[1]); })
                    .attr("y1",function(d) { return yScale(d[0])+yScale.rangeBand()/2;})
                    .attr("x2",function(d) { return xScale(d[1]+d[2]); })
                    .attr("y2",function(d) { return yScale(d[0])+yScale.rangeBand()/2;})

                // Vertical line on top of error bar
                gBars.append("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[1]+d[2])})
                    .attr("y1",function(d) { return yScale(d[0])+yScale.rangeBand()/4})
                    .attr("x2",function(d) { return xScale(d[1]+d[2])})
                    .attr("y2",function(d) { return yScale(d[0])+yScale.rangeBand()/1.33;})
                    .style("visibility",function(d) { if(d[2]==0) { return("hidden") } else { return("visible") }})
            }


            // Axes
            if(typeof xAxis == 'function') {
                // Draw x axis
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + (height-margin.bottom-margin.top) + ")")
                    .call(xAxis);


                // Add x axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-margin.left-margin.right)/2)
                        .attr("y", margin.bottom)
                        .attr("dy","-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof yLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }

            // Add title
            if(typeof title != undefined) {
                gChart.append("text")
                    .attr("class","title")
                    .attr("x", (width-margin.left-margin.right)/2)
                    //.attr("y", margin.bo)
                    .attr("dy","-0.2em")
                    .style("text-anchor","middle")
                    .text(title);
            }
        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.errorMapping = function(_) { if (!arguments.length) {return errorMapping;}    errorMapping = _;  return chart;  };
    chart.freqMapping = function(_) { if (!arguments.length) {return freqMapping;}    freqMapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.addError = function(_) {  if (!arguments.length) {return addError;}   addError = _;  return chart;  };
    chart.addFrequencies = function(_) {  if (!arguments.length) {return addFrequencies;}   addFrequencies = _;  return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };
    chart.title = function(_) { if (!arguments.length) {return title;}    title = _;    return chart;  };





    return chart;
}




/*
 * Histogram
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiHistogram() {



    //// Properties
    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 515,
        height = 300,
        mapping = ['x','y'],
        errorMapping = 'sd',
        xDomain = 0,
        yDomain = 0,
        addLabels = false,
        addError = false,
        addFrequencies = false,
        xTicks, yTicks,
        xLabel, yLabel,
        rotateXScale = false;

    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        yValue = function(d) { return d[mapping[1]]; },
        errorValue = function(d) { return d[errorMapping]; };



    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiHistogram');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'errorMapping':errorMapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels,'addError':addError});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');

            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                if(addError) {
                    return [xValue.call(data, d, i), yValue.call(data, d, i), errorValue.call(data,d,i)];
                } else {
                    return [xValue.call(data, d, i), yValue.call(data, d, i)];
                }
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update scales
            (xDomain==0) ? xScale.domain(data.map(function(d) {return d[0];})) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain([0,d3.max(data, function(d) { return d[1]; })]) : yScale.domain(yDomain);
            xScale.rangeRoundBands([0, width - margin.left - margin.right],.2);
            yScale.range([height - margin.top - margin.bottom,0]);

            // Update axis
            if(typeof xTicks != undefined) xAxis.ticks(xTicks);
            if(typeof yTicks != undefined) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g");

            // Append chart with axes and lines
            gChart.append("g").attr("class", "bars");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Update the bars
            var gBars = gChart.select(".bars").selectAll(".bar").data(data.filter(function(d) { return(isNaN(d[1])||d[1]==0) ? 0:1})).enter();

            gBars.append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return xScale(d[0]); })
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(d[1]); })
                .attr("height", function(d) { return height -margin.top - margin.bottom - yScale(d[1]); })

            // Labels in bars
            if(addLabels) {
                gBars.append("text")
                    .attr("class", "label")
                    .attr("dy", ".75em")
                    .attr("y", function(d) { return 10+yScale(d[1]); })
                    .attr("x", function(d) { return xScale(d[0])+xScale.rangeBand()/2; })
                    .attr("text-anchor", "middle")
                    //.text(function(d) { return formatCount(d[1]); });
                    .text(function(d) { if( (height - margin.top - margin.bottom - yScale(d[1]))>22 ) { return formatCount(d[2]); }} ); // HACK - Do not display text when bar is smaller than 22px
            }

            // Error bars
            if(addError) {
                // Vertical line of one sd
                gBars.insert("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/2;})
                    .attr("y1",function(d) { return yScale(d[1]); })
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/2;})
                    .attr("y2",function(d) { return yScale(d[1]+d[2]); })

                // Horizontal line on top of error bar
                gBars.append("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/4})
                    .attr("y1",function(d) { return yScale(d[1]+d[2])})
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/1.33;})
                    .attr("y2",function(d) { return yScale(d[1]+d[2])})
            }


            // Axes
            if(typeof xAxis == 'function') {
                // Draw x axis
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + yScale.range()[0] + ")")
                    .call(xAxis);

                // Rotate text
                if(rotateXScale) {
                    gChart.select(".x.axis").selectAll("text")
                        .attr("transform","rotate(-90)")
                        .attr("dy",".35em")
                        .attr("x",-9)
                        .attr("y",0)
                        .style("text-anchor","end");
                }


                // Add x axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-yScale.range()[0])/2 )
                        .attr("y", margin.bottom)
                        .attr("dy", "-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }

        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.errorMapping = function(_) { if (!arguments.length) {return errorMapping;}    errorMapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.addError = function(_) {  if (!arguments.length) {return addError;}   addError = _;  return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };
    chart.rotateXScale = function(_) { if (!arguments.length) {return rotateXScale;}    rotateXScale = _;    return chart;  };


    return chart;
}






/*
 * Paired histogram
 *
 * Properties and D3 helpers have getter-setter methods
 */
function hgiPairedHistogram() {



    //// Properties
    var margin = {top: 20, right: 90, bottom: 40, left: 50},
        width = 515,
        height = 300,
        mapping = ['x','y1','y2'],
        errorMapping = ['sd1','sd2'],
        xDomain = 0,
        yDomain = 0,
        addLabels = false,
        addError = false,
        addLegend = true,
        legend = ['Bar one','Bar two'],
        xTicks, yTicks,
        xLabel, yLabel;


    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        y1Value = function(d) { return d[mapping[1]]; },
        y2Value = function(d) { return d[mapping[2]]; },
        error1Value = function(d) { return d[errorMapping[0]]; },
        error2Value = function(d) { return d[errorMapping[1]]; };



    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiHistogram');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'xDomain':xDomain,'yDomain':yDomain,'addLabels':addLabels,'addError':addError});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');


            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                if(addError) {
                    return [xValue.call(data, d, i), y1Value.call(data, d, i), y2Value.call(data, d, i), error1Value.call(data,d,i), error2Value.call(data,d,i)];
                } else {
                    return [xValue.call(data, d, i), y1Value.call(data, d, i), y2Value.call(data, d, i)];
                }
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update scales
            (xDomain==0) ? xScale.domain(data.map(function(d) {return d[0];})) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain([0,d3.max(data, function(d) { return d[1]; })]) : yScale.domain(yDomain);
            xScale.rangeRoundBands([0, width - margin.left - margin.right],.2);
            yScale.range([height - margin.top - margin.bottom,0]);

            // Update axis
            if(typeof xTicks != undefined) xAxis.ticks(xTicks);
            if(typeof yTicks != undefined) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g");

            // Append chart with axes and lines
            gChart.append("g").attr("class", "bars");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");
            if(addLegend) gChart.append("g").attr("class","legend");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Update the bars
            var gBars = gChart.select(".bars").selectAll(".bar").data(data.filter(function(d) { return(isNaN(d[1])||d[1]==0) ? 0:1})).enter();


            //BAR 1
            gBars.append("rect")
                .attr("class", "bar1")
                .attr("x", function(d) { return xScale(d[0]); })
                .attr("width", xScale.rangeBand()/2)
                .attr("y", function(d) { return yScale(d[1]); })
                .attr("height", function(d) { return height - margin.top - margin.bottom - yScale(d[1]); });

            if(addError) {
                // Vertical line of one sd
                gBars.insert("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/4;})
                    .attr("y1",function(d) { return yScale(d[1]); })
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/4;})
                    .attr("y2",function(d) { return yScale(d[1]+d[3]); });

                // Horizontal line on top of error bar
                gBars.append("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/8})
                    .attr("y1",function(d) { return yScale(d[1]+d[3])})
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/2.67;})
                    .attr("y2",function(d) { return yScale(d[1]+d[3])});
            }

            if(addLabels) {
                gBars.append("text")
                    .attr("class", "label")
                    .attr("dy", ".75em")
                    .attr("y", function(d) { return 10+yScale(d[1]); })
                    .attr("x", function(d) { return xScale(d[0])+xScale.rangeBand()/4; })
                    .attr("text-anchor", "middle")
                    //.text(function(d) { return formatCount(d[1]); });
                    .text(function(d) { if( (height - margin.top - margin.bottom - yScale(d[1]))>22 ) { return formatCount(d[1]); }} ); // HACK - Do not display text when bar is smaller than 22px
            }

            //BAR 2
            gBars.append("rect")
                .attr("class", "bar2")
                .attr("x", function(d) { return xScale(d[0])+xScale.rangeBand()/2; })
                .attr("width", xScale.rangeBand()/2)
                .attr("y", function(d) { return yScale(d[2]); })
                .attr("height", function(d) { return height - margin.top - margin.bottom - yScale(d[2]); });

            // Vertical line of one sd
            if(addError) {
                gBars.insert("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/1.33;})
                    .attr("y1",function(d) { return yScale(d[2]); })
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/1.33;})
                    .attr("y2",function(d) { return yScale(d[2]+d[4]); });

                // Horizontal line on top of error bar
                gBars.append("line")
                    .attr("class","errorbar")
                    .attr("x1",function(d) { return xScale(d[0])+xScale.rangeBand()/1.6})
                    .attr("y1",function(d) { return yScale(d[2]+d[4])})
                    .attr("x2",function(d) { return xScale(d[0])+xScale.rangeBand()/1.14;})
                    .attr("y2",function(d) { return yScale(d[2]+d[4])});
            }

            if(addLabels) {
                gBars.append("text")
                    .attr("class", "label")
                    .attr("dy", ".75em")
                    .attr("y", function(d) { return 10+yScale(d[2]); })
                    .attr("x", function(d) { return xScale(d[0])+xScale.rangeBand()/1.33; })
                    .attr("text-anchor", "middle")
                    //.text(function(d) { return formatCount(d[2]); });
                    .text(function(d) { if( (height - margin.top - margin.bottom - yScale(d[2]))>22 ) { return formatCount(d[2]); }} ); // HACK - Do not display text when bar is smaller than 22px

            }


            // Axes
            if(typeof xAxis == 'function') {
                // Draw x axis
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + yScale.range()[0] + ")")
                    .call(xAxis);

                // Add x axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-yScale.range()[0])/2 )
                        .attr("y", margin.bottom)
                        .attr("dy", "-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof yLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }

            // Legend
            if(addLegend) {
                // Draw
                gChart.select(".legend")
                    .attr('transform','translate('+(width-margin.right-margin.left)+','+(5+margin.top)+')');

                // Circles
                gChart.select(".legend")
                    .append("circle")
                    .attr("class","legend1")
                    .attr("cx","-.8em")
                    .attr("cy","-.35em")
                    .attr("r",".4em");
                gChart.select(".legend")
                    .append("circle")
                    .attr("class","legend2")
                    .attr("cx","-.8em")
                    .attr("cy","1.65em")
                    .attr("r",".4em");

                // Text
                gChart.select(".legend")
                    .append("text")
                    .attr("class","legend1")
                    .text(legend[0]);

                gChart.select(".legend")
                    .append("text")
                    .attr("class","legend2")
                    .attr("dy","1.8em")
                    .text(legend[1]);

                /*
                 // add legend
                 var legend = svg.append("g")
                 .attr("class", "legend")
                 //.attr("x", w - 65)
                 //.attr("y", 50)
                 .attr("height", 100)
                 .attr("width", 100)
                 .attr('transform', 'translate(-20,50)')


                 legend.selectAll('rect')
                 .data(dataset)
                 .enter()
                 .append("rect")
                 .attr("x", w - 65)
                 .attr("y", function(d, i){ return i *  20;})
                 .attr("width", 10)
                 .attr("height", 10)
                 .style("fill", function(d) {
                 var color = color_hash[dataset.indexOf(d)][1];
                 return color;
                 })

                 legend.selectAll('text')
                 .data(dataset)
                 .enter()
                 .append("text")
                 .attr("x", w - 52)
                 .attr("y", function(d, i){ return i *  20 + 9;})
                 .text(function(d) {
                 var text = color_hash[dataset.indexOf(d)][0];
                 return text;
                 });*/

            }

        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.errorMapping = function(_) { if (!arguments.length) {return errorMapping;}    errorMapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.addLabels = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.addLegend = function(_) {  if (!arguments.length) {return addLabels;}   addLabels = _;  return chart;  };
    chart.addError = function(_) {  if (!arguments.length) {return addError;}   addError = _;  return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };


    return chart;
}




/*
 * Multiple line chart
 *
 * Properties and D3 helpers have getter-setter methods
 */

function hgiLine() {



    //// Properties
    var margin = {top: 20, right: 120, bottom: 40, left: 50},
        width = 515,
        height = 300,
        mapping = ['x','y1','y2'],
        xDomain = 0,
        yDomain = 0,
        legend = 0,
        xTicks, yTicks,
        xLabel, yLabel,
        addVerticalIndicator = true,
        overlayScale = 1, overlayOffset = 0,
        overlayOrigRect;



    //// D3 Helper functions
    // Scales
    var xScale = d3.scale.linear(),
        yScale = d3.scale.linear();

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Helper functions to draw lines
    var y1Line = d3.svg.line()
        .x(function(d) { return xScale(d[0]);})
        .y(function(d) { return yScale(d[1]);})
        .defined(function(d) { return !(isNaN(d[1])||d[1]==null); })
        .interpolate('cardinal');
    y2Line = d3.svg.line()
        .x(function(d) { return xScale(d[0]);})
        .y(function(d) { return yScale(d[2]);})
        .defined(function(d) { return !(isNaN(d[2])||d[2]==null); })
        .interpolate('cardinal');



    //// Internal auxilary functions
    // Map data to x,y1,y2
    var xValue = function(d) { return d[mapping[0]]; },
        y1Value = function(d) { return d[mapping[1]]; },
        y2Value = function(d) { return d[mapping[2]]; };



    //// Chart building function
    function chart(selection) {
        selection.each(function(data) {

            // DEBUG info
            if(DEBUG) {
                console.log('--hgiLine');
                console.log('properties:');
                console.log({'margin': margin,'size':[width,height],'mapping':mapping,'legend':legend,'xDomain':xDomain,'yDomain':yDomain});
                console.log('selection:');
                console.log(selection);
                console.log('data:');
                console.log(data);
            }
            data = sortByKey(data, 'meetmoment');



            // Convert data to nondeterministic array using mapping
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), y1Value.call(data, d, i), y2Value.call(data,d,i)];
            });

            if(DEBUG) {
                console.log('mapped data:');
                console.log(data);
            }


            // Update scales
            (xDomain==0) ? xScale.domain([0,d3.max(data, function(d) { return d[0]; })]) : xScale.domain(xDomain);
            (yDomain==0) ? yScale.domain([0,d3.max(data, function(d) { return d[1]; })]) : yScale.domain(yDomain);
            xScale.range([0, width - margin.left - margin.right]);
            yScale.range([height - margin.top - margin.bottom,0])

            // Update axis
            if(typeof xTicks != undefined) xAxis.ticks(xTicks);
            if(typeof yTicks != undefined) yAxis.ticks(yTicks);

            // Create SVG with data appended
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gChart = svg.enter().append("svg").append("g");

            // Append chart with axes and lines
            gChart.append("g").attr("class","y1").append("path").attr("class", "y1 line");
            gChart.append("g").attr("class","y2").append("path").attr("class", "y2 line");
            gChart.append("g").attr("class", "x axis");
            gChart.append("g").attr("class", "y axis");



            // Set chart width and height
            svg.attr({'width': width,'height':height});

            // Translate chart to adjust for margins
            var gChart = svg.select("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // Vertical line indicator
            if(addVerticalIndicator) {
                if (DEBUG) console.log('Vertical indicator');
                // Draw vertical line first, so it will be below other elements, but hide it first (display: none)
                var verticalLine = gChart.append('line')
                    .attr({
                        'x1': 0,
                        'y1': 0,
                        'x2': 0,
                        'y2': height - margin.top - margin.bottom + 5
                    })
                    .attr('class', 'verticalLine')
                    .style('display','none');
            }

            // Update the line paths
            gChart.select(".y1.line")
                .attr("d", y1Line);

            gChart.select(".y2.line")
                .attr("d", y2Line);


            if(typeof xAxis == 'function') {
                // Draw x axis
                gChart.select(".x.axis")
                    .attr("transform","translate(0," + yScale.range()[0] + ")")
                    .call(xAxis);

                // Add x axis label
                if(typeof xLabel != undefined) {

                    // !TODO change xPos on other charts
                    gChart.select(".x.axis")
                        .append("text")
                        .attr("x", (width-margin.left-margin.right)/2)
                        .attr("y", margin.bottom)
                        .attr("dy","-0.2em")
                        .style("text-anchor","middle")
                        .text(xLabel);
                }
            }

            if(typeof yAxis == 'function') {
                // Draw y axis
                gChart.select(".y.axis")
                    .call(yAxis);

                // Add y axis label
                if(typeof xLabel != undefined) {
                    gChart.select(".y.axis")
                        .append("text")
                        .attr("transform","rotate(-90)")
                        .attr("x", 0- ((height-margin.bottom-margin.top)/2) )
                        .attr("y", 0 - margin.left)
                        .attr("dy", "1em")
                        .style("text-anchor","middle")
                        .text(yLabel);
                }
            }


            // Legend
            if(legend!=0) {
                //If legends are getting to close together, forces distance of minimal 14px
                // Absoluut verschil en dan corrigeren voor sign
                var diffYPos = yScale(data[data.length-1][1])-yScale(data[data.length-1][2]);
                (Math.abs(diffYPos)<14) ? offsetYPos = (14-Math.abs(diffYPos))/2 : offsetYPos = 0;//5-((diffYPos-10)/2) : offsetYPos = 0;
                (yScale(data[data.length-1][1])<yScale(data[data.length-1][2])) ? offsetYPos = offsetYPos : offsetYPos = -offsetYPos;
                if(DEBUG) {
                    console.log(diffYPos);
                    console.log(offsetYPos);
                }

                gChart.select("g.y1")
                    .append("text")
                    .attr("transform", "translate(" + xScale(data[data.length-1][0]) + "," + (yScale(data[data.length-1][1]) - offsetYPos) + ")")
                    .attr("dy", ".35em")
                    .attr("x", "6")
                    .text(legend[0]);

                gChart.select("g.y2")
                    .append("text")
                    .attr("transform", "translate(" + xScale(data[data.length-1][0]) + "," + (yScale(data[data.length-1][2]) + offsetYPos) + ")")
                    .attr("dy", ".35em")
                    .attr("x", "6")
                    .text(legend[1]);
            }

            // Dots
            gChart.selectAll('g.y1.dot')
                .data(data.filter(function(d) { return isNaN(d[1]) ? 0:d[1]; }))
                .enter().append("circle")
                .attr("class","dot1")
                .attr("cx", y1Line.x())
                .attr("cy", y1Line.y())
                .attr("r", 2.5);

            gChart.selectAll('g.y2.dot')
                .data(data.filter(function(d) { return isNaN(d[2]) ? 0:d[2]; }))
                .enter().append("circle")
                .attr("class","dot2")
                .attr("cx", y2Line.x())
                .attr("cy", y2Line.y())
                .attr("r", 2.5);

            // Vertical indicator
            if(addVerticalIndicator) {
                // Invisible overlay to catch mouse events
                var rect = gChart.append("rect").attr({
                    'class': 'overlay',
                    'width': (width - margin.right - margin.left),
                    'height': (height - margin.top - margin.bottom)
                });


                var indXBg = gChart.append("rect").attr("class","verticalLineBGLabel").attr({width: 30, height: 15 ,y: (height - margin.top - margin.bottom + 7)}).style("display","none");
                var indX = gChart.append("text").attr("class","verticalLine").attr("y",height - margin.top - margin.bottom + 19).attr("text-anchor","middle").style("display","none").text('test');


                // Mouse events
                rect.on("mouseover", function() { verticalLine.style("display", null); indX.style("display", null); indXBg.style("display", null) })
                rect.on("mouseout", function() { verticalLine.style("display", "none"); indX.style("display","none"); indXBg.style("display", "none"); gChart.selectAll('circle').classed("hover",0) })
                rect.on('mousemove', function () {

                    /* Computes overlayScale and overlayOffset for transform-origin top left (0px 0px), does not work for other transforms
                     var thisRect = this.getBoundingClientRect(),
                     overlayScale = thisRect.width/(width-margin.right-margin.left),
                     overlayOffset = margin.left-margin.left*overlayScale;
                     */

                    // Find two closest data points
                    var x0 = xScale.invert((d3.mouse(this)[0]+overlayOffset)/overlayScale),  // Invert x position to data point
                        bisectTime = d3.bisector(function(d) { return d[0]; }).left,
                        i = bisectTime(data, x0, 1),      // Find index in data where this (fictional) point should be located
                        d0 = data[i-1],              // Find real data point before
                        d1 = data[i];              // and after

                    // TODO - This does not work correct, presumably something goes wrong at bisectTime()...
                    // Check if data is not missing (
                    //isNaN(d0[1]) ? d0=data[i-2]:0;
                    //(d0[1]=='null' || d0[2]=='null') ? d0=data[i-2]:0;
                    //(d1[1]=='null' || d1[2]=='null') ? d1=data[i+1]:0;

                    // Check which real data point is closest
                    var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;

                    // Move vertical line to correct position using closest data point
                    gChart.select(".verticalLine").attr("transform", function () {
                        return "translate(" + xScale(d[0]) + ",0)";
                    });

                    // Animate by adding class 'hover' (animation done through css transition)
                    gChart.selectAll('circle').classed("hover",function(data) { return(data[0]==d[0])}); // CSS based transition

                    // Update text indicator and show on x axis
                    indX.text(d[0]).attr("transform", function() { return "translate(" + xScale(d[0]) + ",0)"});
                    indXBg.attr("transform", function() { return "translate(" + (xScale(d[0])-15) + ",0)"});

                    if(DEBUG)  console.log(d)
                });

            }
        });
    }


    // Getter setter methods
    chart.margin = function(_) { if (!arguments.length) {return margin;}     margin = _;   return chart;   };
    chart.width = function(_) {  if (!arguments.length) {return width;}       width = _;    return chart;  };
    chart.height = function(_) { if (!arguments.length) {return height;}    height = _;    return chart;  };
    chart.mapping = function(_) { if (!arguments.length) {return mapping;}    mapping = _;  return chart;  };
    chart.xDomain = function(_) { if (!arguments.length) {return xDomain;}    xDomain = _;  return chart;  };
    chart.yDomain = function(_) { if (!arguments.length) {return yDomain;}    yDomain = _;  return chart;  };
    chart.legend = function(_) { if (!arguments.length) {return legend;}    legend = _;    return chart;  };
    chart.xAxis = function(_) { if (!arguments.length) {return xAxis;}      xAxis = _;    return chart;  };
    chart.yAxis = function(_) {  if (!arguments.length) {return yAxis;}       yAxis = _;    return chart;  };
    chart.y1Line = function(_) { if (!arguments.length) {return y1Line;}    y1Line = _;    return chart;  };
    chart.y2Line = function(_) { if (!arguments.length) {return y2Line;}    y2Line = _;    return chart;  };
    chart.xTicks = function(_) { if (!arguments.length) {return xTicks;}    xTicks = _;    return chart;  };
    chart.yTicks = function(_) { if (!arguments.length) {return yTicks;}    yTicks = _;    return chart;  };
    chart.xLabel = function(_) { if (!arguments.length) {return xLabel;}    xLabel = _;    return chart;  };
    chart.yLabel = function(_) { if (!arguments.length) {return yLabel;}    yLabel = _;    return chart;  };
    chart.addVerticalIndicator = function(_) { if (!arguments.length) {return addVerticalIndicator;}    addVerticalIndicator = _;    return chart;  };
    chart.overlayOffset = function(_) { if (!arguments.length) {return overlayOffset;}    overlayOffset = _;    return chart;  };
    chart.overlayScale = function(_) { if (!arguments.length) {return overlayScale;}    overlayScale = _;    return chart;  };


    return chart;
}








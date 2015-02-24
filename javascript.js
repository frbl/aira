var node_values = {};
var node_names = {};
var intervals = [];
var steps_ahead;

var_coefficients = [[1.7882516, 0.1949013, -0.084094128, 0.11716910, -1.2175403, -0.1011495, -0.004600462, -0.21240047, 0.4607406, -0.043924025, -0.00170015, 0.27501572, -0.05340928, 0.007395215, 0.08565463, -0.1871212],
    [-0.1434025, 1.1777061, 0.051717609, -0.72341422, -0.1856313, -0.1827150, -0.223365088, 0.65999277, 0.4372010, 0.049277377, 0.08473083, 0.50693900, -0.09505128, -0.070681395, 0.08362111, -0.4105609],
    [-0.5635340, -0.1032722, 0.868404043, 0.06140683, 0.7605549, -0.1631870, -0.106785400, -0.45862230, -0.4438344, 0.269430102, -0.02312552, -0.09951292, 0.31046631, -0.086729273, 0.21139926, 0.2803912],
    [-0.7296624, -0.1348578, 0.005928757, 0.57157062, 0.6387346, 0.1178550, 0.053104567, 0.03745348, -0.1017310, -0.001811418, -0.03468194, 0.08797242, 0.19575410, 0.020053093, -0.02997414, 0.2349770]];
var lags = 4;

var inject_buttons = function () {
    var nodes = $('#netDynamisch').find('g .node');
    var location = $('#aira-buttons');
    location.html('');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var html = $('<input class="button light button_' + node.id + '" name="' + node.id + '" type="button" value="' + node.id + '" id="button_' + node.id + '"/>');
        node_names[i] = node.id;

        location.append(html);
        location.on("click", ".button_" + node.id, {current_id: i, current_node: node.id}, function (event) {
            var name = event.data.current_node;
            var myid = event.data.current_id;
            clickNode(name, myid);
        });
    }

    location.append($('<input class="button light button_reset" name="button_reset" type="button" value="Reset" id="button_button_reset"/>'));
    location.on("click", ".button_reset", function () {
        clearSimulation();
    });

};


var generateSelectOptions = function(from, to, stepsize, location) {
    html = $(location);
    for (i = from; i < to; i += stepsize) {
            html.append($("<option></option>")
                .attr("value", i)
                .text(i));
    }
    return html;
};

var clickNode = function(node_name, node_id) {
    if(DEBUG > 1) console.log('Impulse given on: ' + node_name + ' (' + node_id + ')');

    steps_ahead = $('#prediction').val();
    var irf = transpose(runImpulseResponseCalculation(var_coefficients, node_id, lags, steps_ahead));
    redraw(irf);

    var interpolation = $('#interpolation').val();
    irf  = linearInterpolation(irf, interpolation);
    interpolation = interpolation == 0 ? 1 : interpolation;
    run_simulation(irf, steps_ahead * interpolation);


    update_best(determineOptimalNode(var_coefficients,
        node_id, lags, steps_ahead,
        [maximumValueOptimizer, thresholdOptimizer], {threshold: 1}));
};


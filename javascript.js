var node_values = {};
/*
 var var_coefficients = [[1.7882516, 0.1949013, -0.084094128, 0.11716910, -1.2175403, -0.1011495, -0.004600462, -0.21240047, 0.4607406, -0.043924025, -0.00170015, 0.27501572, -0.05340928, 0.007395215, 0.08565463, -0.1871212],
 [-0.1434025, 1.1777061, 0.051717609, -0.72341422, -0.1856313, -0.1827150, -0.223365088, 0.65999277, 0.4372010, 0.049277377, 0.08473083, 0.50693900, -0.09505128, -0.070681395, 0.08362111, -0.4105609],
 [-0.5635340, -0.1032722, 0.868404043, 0.06140683, 0.7605549, -0.1631870, -0.106785400, -0.45862230, -0.4438344, 0.269430102, -0.02312552, -0.09951292, 0.31046631, -0.086729273, 0.21139926, 0.2803912],
 [-0.7296624, -0.1348578, 0.005928757, 0.57157062, 0.6387346, 0.1178550, 0.053104567, 0.03745348, -0.1017310, -0.001811418, -0.03468194, 0.08797242, 0.19575410, 0.020053093, -0.02997414, 0.2349770]];

 var lags = 4;
 var number_of_variables = 4;

 */

if (synthetic) {
    var_coefficients = [[1.7882516, 0.1949013, -0.084094128, 0.11716910, -1.2175403, -0.1011495, -0.004600462, -0.21240047, 0.4607406, -0.043924025, -0.00170015, 0.27501572, -0.05340928, 0.007395215, 0.08565463, -0.1871212],
        [-0.1434025, 1.1777061, 0.051717609, -0.72341422, -0.1856313, -0.1827150, -0.223365088, 0.65999277, 0.4372010, 0.049277377, 0.08473083, 0.50693900, -0.09505128, -0.070681395, 0.08362111, -0.4105609],
        [-0.5635340, -0.1032722, 0.868404043, 0.06140683, 0.7605549, -0.1631870, -0.106785400, -0.45862230, -0.4438344, 0.269430102, -0.02312552, -0.09951292, 0.31046631, -0.086729273, 0.21139926, 0.2803912],
        [-0.7296624, -0.1348578, 0.005928757, 0.57157062, 0.6387346, 0.1178550, 0.053104567, 0.03745348, -0.1017310, -0.001811418, -0.03468194, 0.08797242, 0.19575410, 0.020053093, -0.02997414, 0.2349770]];
    lags = 4;
    number_of_variables = 4;

} else {
    var_coefficients = [[0.05593811, 0.008279758, -0.0003967761, 0.2414802, -5.572453e-02, 0.0004820246, 0.15560358, -0.009187657, 0.000291006, 0.02481446, -8.563874e-05, -0.0001981559, 0.07986844, 0.04543598, -0.0009708116, 2.258909, 0.9605118, -0.1897256, -0.5734213, 0.01938417, -0.1375947, -0.06147198, -0.1147570, 0.008673931, -0.1787394, 0.001565246],
        [-0.29686878, -0.133275653, -0.0064464898, 0.1899747, -1.438257e-05, -0.0025135134, -0.01879705, -0.015123995, 0.006647059, 0.15312647, 5.961286e-02, 0.0034446200, 0.99139880, 0.10311419, 0.0071701517, -2.280329, 10.1965909, 7.2962788, 0.6232063, 0.29440890, -0.5711844, 1.00771103, -0.8216043, 1.210830082, -0.4150525, -0.039007710],
        [-26.36146388, 2.865875339, -0.0698347921, 2.3568588, 1.153705e+00, 0.0088562798, -6.59123996, -0.705650271, 0.023601524, 20.38377933, 2.493860e+00, 0.0669803610, -0.95389764, 1.33255762, -0.0139738055, 325.816396, -206.3139625, -264.6304951, -8.4775085, -37.29036879, -4.6075446, -11.67485162, -55.3974243, 8.584562424, -3.1507797, 0.397881044]]
    lags = 5;
    number_of_variables = 3;
}

var dataToMatrix = function(data){

    // Undirected network
    var links, nodes, i, source, target, coef;
    links = data[0]['links'];
    nodes = data[0]['nodes'];

    var var_coef = createMatrix(0, nodes.length, nodes.length, false);
    for(i = 0; i < links.length ; i++) {
        source = links[i]['source'];
        target = links[i]['target'];
        coef = links[i]['coef'];
        var_coef[target][source] = parseFloat(coef);
    }
    return var_coef;
};


var injectButtons = function (node_names) {
    injectSimulationFunctionality();
    var location = $('#aira-buttons');
    location.html('');
    for (var i = 0; i < node_names.length; i++) {
        var node = node_names[i];
        var html = $('<input class="button light button_' + node + '" name="' + node + '" type="button" value="' + node + '" id="button_' + node + '"/>');

        location.append(html);
        location.on("click", ".button_" + node, {current_id: i, current_node: node}, function (event) {
            var name = event.data.current_node;
            var myid = event.data.current_id;
            clickNode(name, myid);
        });
    }

    location.append($('<input class="button red button_all" name="button_all" type="button" value="Shock ALL!" id="button_button_all"/>'));
    location.on("click", ".button_all", function () {
        clickNode('All', -1);
    });

    location.append($('<input class="button green button_reset" name="button_reset" type="button" value="Reset" id="button_button_reset"/>'));
    location.on("click", ".button_reset", function () {
        simulation.clear();
    });

};

var injectSimulationFunctionality = function () {
    var location = $('#simulation-buttons');

    location.on("click", ".button_pause", function () {
        simulation.pause()
    });
    location.on("click", ".button_play", function () {
        simulation.run()
    });
    location.on("click", ".button_next", function () {
        simulation.simulateStep(1)
    });
    location.on("click", ".button_previous", function () {
        simulation.simulateStep(-1);
    });
};


var generateSelectOptions = function (from, to, stepsize, location) {
    html = $(location);
    for (i = from; i < to; i += stepsize) {
        html.append($("<option></option>")
            .attr("value", i)
            .text(i));
    }
    return html;
};

var convertNumberToText = function (number) {
    if (number < 1) return 'very few';
    if (number > 20) return 'alot of';
    return {
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: "six",
        7: "seven",
        8: "eight",
        9: "nine",
        11: "eleven",
        12: "twelve",
        13: "thirteen",
        14: "fourteen",
        15: "fifteen",
        16: "sixteen",
        17: "seventeen",
        18: "eighteen",
        19: "nineteen",
        20: "twenty",
    }[number]


};

var clickNode = function (node_name, node_id) {
    if (DEBUG > 1) console.log('Impulse given on: ' + node_name + ' (' + node_id + ')');

    steps_ahead = $('#prediction').val();
    var irf = transpose(aira.runImpulseResponseCalculation(node_id, steps_ahead, 1));
    visualization_engine.draw(irf);

    var interpolation = $('#interpolation').val();
    irf = linearInterpolation(irf, interpolation);
    console.log('Interpolation!');
    printMatrix(irf);
    interpolation = interpolation == 0 ? 1 : interpolation;
    simulation.setStepsToRun(steps_ahead * interpolation);
    simulation.setIrf(irf);
    simulation.run(true);

    if (node_id != -1){
        visualization_engine.updateAdvice(aira.determineOptimalNodeSimple(node_id, steps_ahead, {threshold: 1}));
        aira.determineOptimalNode(node_id, steps_ahead, {threshold: 1})
    }

};


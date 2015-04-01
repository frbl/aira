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
            .text(roundToPlaces(i, 2)));
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

    steps_ahead = parseInt($('#prediction').val());
    var threshold = $('#threshold').val();

    var irf = transpose(impulse_response_calculator.runImpulseResponseCalculation(node_id, steps_ahead, 1));
    visualization_engine.draw(irf);

    var interpolation = $('#interpolation').val();
    irf = linearInterpolation(irf, interpolation);

    interpolation = interpolation == 0 ? 1 : interpolation;
    simulation.setStepsToRun(steps_ahead * interpolation);
    simulation.setIrf(irf);
    simulation.run(true);

    if (node_id != -1){
        var threshold = $('#threshold').val();
        var thresholdOptimizer = new ThresholdOptimizer({threshold: threshold});
        var netEffectOptimizer = new NetEffectOptimizer({});

        if($('#chk-threshold').prop('checked'))
            visualization_engine.updateAdvice(aira.determineOptimalNodeSimple(node_id, steps_ahead, thresholdOptimizer));

        if($('#chk-stability').prop('checked'))
            visualization_engine.updateNetEffect(aira.determineOptimalNodeSimple(node_id, steps_ahead, netEffectOptimizer));

        if($('#chk-frequency').prop('checked'))
            aira.determineOptimalNode(node_id, steps_ahead, {degradation: [], threshold: threshold})
    }

};


var hgiNetworkDataToMatrix = function (data) {
    // Undirected network
    var links, nodes, i, source, target, coef;
    links = data[0]['links'];
    nodes = data[0]['nodes'];
    console.log(data[0]);
    var var_coef = createMatrix(0, nodes.length, nodes.length, false);
    for (i = 0; i < links.length; i++) {
        source = links[i]['source'];
        target = links[i]['target'];
        console.log("Source:" + source + " target: " + target);
        coef = links[i]['coef'];
        var_coef[target][source] = parseFloat(coef);
    }
    return var_coef;
};

var getHgiNetworkJsonKeys = function (jsondata) {
    var keys = ['--'], name;
    for (name in jsondata) {
        if (jsondata.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    return keys;
};

var fullNetworkDataToMatrix = function (data, node_names) {
    var column, row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
    var full_network_location = 3;
    var estimate = data[full_network_location]['coefs']['header'].indexOf("Estimate");
    var std_error = data[full_network_location]['coefs']['header'].indexOf("Std. Error");
    var t_value = data[full_network_location]['coefs']['header'].indexOf("t value");
    var p_value = data[full_network_location]['coefs']['header'].indexOf("Pr(>|t|)");

    var coefficients = data[full_network_location]['coefs']['body'];
    var var_coef = [createMatrix(0, node_names.length, node_names.length, false)];

    highest_lag = 1;
    for (row = 0; row < node_names.length; row++) {
        node_name = node_names[row];
        current_row = coefficients[node_name];

        for (column_node_name in current_row) {
            if (current_row.hasOwnProperty(column_node_name)) {
                current = column_node_name.split('.');

                // Check if the variable is not any of the outlier variables
                if (current.length == 0 || node_names.indexOf(current[0]) < 0) continue;

                lag = parseInt(current[1].substring(1));

                // Check if we already had this lag, otherwise, add until we are at the current lag.
                // This is needed, in case we have e.g. lag 1 effects and lag 3 effects.
                while (lag > highest_lag) {
                    var_coef.push(createMatrix(0, node_names.length, node_names.length, false));
                    highest_lag++;
                }

                current_index = node_names.indexOf(current[0]);
                var_coef[lag - 1][row][current_index] = current_row[column_node_name][estimate];
            }
        }
    }
    return var_coef;
};

var injectButtons = function (node_names) {
    injectSimulationFunctionality();
    var location = $('#aira-buttons');
    location.html('');
    location.unbind();
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

    location.append($('<input class="button dark button_optimize" name="button_optimize" type="button" value="Find optimal node" id="button_button_reset"/>'));
    location.on("click", ".button_optimize", function () {
        var res = aira.determineBestNodeFromAll();
        var html = '<ol>';
        for( var i = 0 ; i < res.length ; i++ ) {
            html = html + '<li><strong>'+ res[i].name + '</strong>: '+ res[i].val + '</li>';
        }
        html += '</ol>';
        $(".effect .content").html(html);
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

var appendSelectOptions = function (data, location) {
    html = $(location);
    for (i = 0; i < data.length; i++) {
        html.append($("<option></option>")
            .attr("value", data[i])
            .text(data[i]));
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
        20: "twenty"
    }[number]
};


var clickNode = function (node_name, node_id) {
    if (DEBUG >= 1) console.log('Impulse given on: ' + node_name + ' (' + node_id + ')');

    console.log(node_id + " < id and name > " + node_name);
    var irf = transpose(impulse_response_calculator.runImpulseResponseCalculation(node_id, 1));
    visualization_engine.draw(irf);

    irf = linearInterpolation(irf, view_model.get_interpolation());

    var interpolation = view_model.get_interpolation() == 0 ? 1 : view_model.get_interpolation();
    simulation.setStepsToRun(view_model.get_steps() * interpolation);
    simulation.setIrf(irf);
    simulation.run(true);

    if (node_id != -1) {
        var thresholdOptimizer = new ThresholdOptimizer({threshold: view_model.get_threshold()});
        var netEffectOptimizer = new NetEffectOptimizer({});

        if ($('#chk-threshold').prop('checked'))
            visualization_engine.updateAdvice(aira.determineOptimalNodeSimple(node_id, thresholdOptimizer));

        if ($('#chk-stability').prop('checked'))
            visualization_engine.updateNetEffect(aira.determineOptimalNodeSimple(node_id, netEffectOptimizer));

        if ($('#chk-frequency').prop('checked'))
            aira.determineOptimalNode(node_id, {
                degradation: [],
                threshold: view_model.get_threshold()
            })

    }

};


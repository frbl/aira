var SIGNIFICANT_NETWORK_LOCATION = 0;

var hgiNetworkDataToMatrix = function (data) {
    // Undirected network
    var links, nodes, i, source, target, coef;
    links = data[0].links;
    nodes = data[0].nodes;
    console.log(data[0]);
    var var_coef = createMatrix(0, nodes.length, nodes.length, false);
    for (i = 0; i < links.length; i++) {
        source = links[i].source;
        target = links[i].target;
        console.log("Source:" + source + " target: " + target);
        coef = links[i].coef;
        var_coef[target][source] = parseFloat(coef);
    }
    return var_coef;
};

/**
 * Used for generating the dropdown menu
 * @param jsondata
 * @returns {string[]}
 */
var getHgiNetworkJsonKeys = function (jsondata) {
    var keys = ['--'], name;
    for (name in jsondata) {
        if (jsondata.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    return keys;
};

var data_summary_from_json = function (data, node_names) {
    var node_name,
        EXTENDED_NETWORK_LOCATION = 3,
        DATA_LOCATION = 'data',
        BODY_LOCATION = 'body',
        HEADER_LOCATION = 'header',
        result = {},
        // The data needs to be transposed so we don't have 1 array with 90 arrays, but x arrays with 90 measurements
        raw_data = transpose(data[EXTENDED_NETWORK_LOCATION][DATA_LOCATION][BODY_LOCATION]);

    for(var i = 0; i < node_names.length; i++) {
        node_name = node_names[i];
        data[EXTENDED_NETWORK_LOCATION][DATA_LOCATION][HEADER_LOCATION].indexOf(node_name);

        var average = calculateMean(raw_data[i]);
        var sd = standardDeviation(raw_data[i], average);

        result[node_name] = {"average": average, "sd": sd};
    }
    result.significant_network = data[SIGNIFICANT_NETWORK_LOCATION];
    return result;
};

var nodeNamesFromJson = function (data) {
  return data[SIGNIFICANT_NETWORK_LOCATION].nodes.map(function(node) { return variable_mapping.get_key(node.name);});
};

var fullNetworkDataToMatrix = function (data, node_names) {
    var column, row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
    var EXTENDED_NETWORK_LOCATION = 3;
    var COEFFICIENT_LOCATION = 'coefs';
    var HEADER_LOCATION = 'header';
    var estimate = data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Estimate");
    var std_error = data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Std. Error");
    var t_value = data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("t value");
    var p_value = data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Pr(>|t|)");

    var coefficients = data[EXTENDED_NETWORK_LOCATION]['coefs']['body'];
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

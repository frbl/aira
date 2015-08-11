var SIGNIFICANT_NETWORK_LOCATION = 0;
function JsonParser(data, variable_mapping) {
 this.data = data;
 this.variable_mapping = variable_mapping;
}

JsonParser.prototype.hgiNetworkDataToMatrix = function () {
    // Undirected network
    var links, nodes, i, source, target, coef;
    links = this.data[0].links;
    nodes = this.data[0].nodes;
    var var_coef = createMatrix(0, nodes.length, nodes.length, false);
    for (i = 0; i < links.length; i++) {
        source = links[i].source;
        target = links[i].target;
        coef = links[i].coef;
        var_coef[source][target] = parseFloat(coef);
    }
    return var_coef;
};

/**
 * Used for generating the dropdown menu
 * @param jsondata
 * @returns {string[]}
 */
getHgiNetworkJsonKeys = function (jsondata) {
    var keys = ['--'], name;
    for (name in jsondata) {
        if (jsondata.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    return keys;
};

JsonParser.prototype.dataSummaryFromJson = function (node_names) {
    var node_name,
        EXTENDED_NETWORK_LOCATION = 3,
        DATA_LOCATION = 'data',
        BODY_LOCATION = 'body',
        HEADER_LOCATION = 'header',
        result = {},
        // The data needs to be transposed so we don't have 1 array with 90 arrays, but x arrays with 90 measurements
        raw_data = transpose(this.data[EXTENDED_NETWORK_LOCATION][DATA_LOCATION][BODY_LOCATION]);

    for(var i = 0; i < node_names.length; i++) {
        node_name = node_names[i];
        this.data[EXTENDED_NETWORK_LOCATION][DATA_LOCATION][HEADER_LOCATION].indexOf(node_name);

        var average = calculateMean(raw_data[i]);
        var sd = standardDeviation(raw_data[i], average);

        result[node_name] = {"average": average, "sd": sd};
    }
    result.significant_network = this.data[SIGNIFICANT_NETWORK_LOCATION];
    return result;
};

JsonParser.prototype.nodeKeysFromJson = function () {
  var self = this;
  return this.data[SIGNIFICANT_NETWORK_LOCATION].nodes.map(function(node) { return self.variable_mapping.get_key(node.name);});
};

JsonParser.prototype.fullNetworkDataToMatrix = function (node_names) {
    var column, row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
    var EXTENDED_NETWORK_LOCATION = 3;
    var COEFFICIENT_LOCATION = 'coefs';
    var HEADER_LOCATION = 'header';
    var estimate = this.data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Estimate");
    var std_error = this.data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Std. Error");
    var t_value = this.data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("t value");
    var p_value = this.data[EXTENDED_NETWORK_LOCATION][COEFFICIENT_LOCATION][HEADER_LOCATION].indexOf("Pr(>|t|)");

    var coefficients = this.data[EXTENDED_NETWORK_LOCATION].coefs.body;
    var var_coef = [createMatrix(0, node_names.length, node_names.length, false)];

    highest_lag = 1;
    for (row = 0; row < node_names.length; row++) {
        node_name = node_names[row];
        current_row = coefficients[node_name];

        for (column_node_name in current_row) {
            if (current_row.hasOwnProperty(column_node_name)) {
                current = column_node_name.split('.');

                // Check if the variable is not any of the outlier variables
                if (current.length === 0 || node_names.indexOf(current[0]) < 0) continue;

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

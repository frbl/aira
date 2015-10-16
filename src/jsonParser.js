function JsonParser(data, variable_mapping) {
    this.data = data;
    this.variable_mapping = variable_mapping;

    this.SIGNIFICANT_NETWORK_LOCATION = 0;
    this.COMPLETE_DATA_LOCATION = 3;
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
    var keys = ['--'],
        name;
    for (name in jsondata) {
        if (jsondata.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    return keys;
};

JsonParser.prototype.nodeKeysFromJson = function () {
    var self = this;
    return this.data[this.SIGNIFICANT_NETWORK_LOCATION].nodes.map(function (node) {
        return self.variable_mapping.get_key(node.name);
    });

    // or: return this.data[this.COMPLETE_DATA_LOCATION].endogen.header
};

JsonParser.prototype.exogenKeysFromJson = function () {
    return this.data[this.COMPLETE_DATA_LOCATION].exogen.header
};

JsonParser.prototype.getYDataFromJson = function () {
    return this.data[this.COMPLETE_DATA_LOCATION].endogen.body;
};

JsonParser.prototype.getExogenDataFromJson = function () {
    return this.data[this.COMPLETE_DATA_LOCATION].exogen.body;
};

JsonParser.prototype.getExogenCoefficientMatrix = function () {
    var node_keys = this.nodeKeysFromJson();
    var node_exogen_keys = this.exogenKeysFromJson();
    return this.exogenCoefficientMatrix(node_keys, node_exogen_keys);
};

JsonParser.prototype.getEndogenCoefficientMatrix = function () {
    var node_keys = this.nodeKeysFromJson();
    return this.coefficientMatrix(node_keys);
};


JsonParser.prototype.coefficientMatrix = function (node_keys) {
    var row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
    var coeff_data = this.data[this.COMPLETE_DATA_LOCATION].coefs;
    var estimate = coeff_data.header.indexOf("Estimate");

    var coefficients = coeff_data.body;
    var var_coef = [createMatrix(0, node_keys.length, node_keys.length, false)];

    highest_lag = 1;
    for (row = 0; row < node_keys.length; row++) {
        node_name = node_keys[row];
        current_row = coefficients[node_name];

        for (column_node_name in current_row) {
            if (current_row.hasOwnProperty(column_node_name)) {
                current = column_node_name.split('.');

                // Check if the variable is not any of the outlier variables
                if (current.length === 0 || node_keys.indexOf(current[0]) < 0) continue;

                lag = parseInt(current[1].substring(1));


                // Check if we already had this lag, otherwise, add until we are at the current lag.
                // This is needed, in case we have e.g. lag 1 effects and lag 3 effects but no lag 2 effects.
                while (lag > highest_lag) {
                    var_coef.push(createMatrix(0, node_keys.length, node_keys.length, false));
                    highest_lag++;
                }

                current_index = node_keys.indexOf(current[0]);
                var_coef[lag - 1][row][current_index] = current_row[column_node_name][estimate];
            }
        }
    }
    return var_coef;
};


JsonParser.prototype.exogenCoefficientMatrix = function (equation_node_names, exogen_names) {
    var row, current_index, column_node_name, node_name, current_row;
    var coeff_data = this.data[this.COMPLETE_DATA_LOCATION].coefs;
    var estimate = coeff_data.header.indexOf("Estimate");
    var coefficients = coeff_data.body;
    var var_coef = createMatrix(0, equation_node_names.length, exogen_names.length, false);

    for (row = 0; row < equation_node_names.length; row++) {
        node_name = equation_node_names[row];
        current_row = coefficients[node_name];
        current_index = 0;
        for (column_node_name in current_row) {
            if (current_row.hasOwnProperty(column_node_name)) {

                // Check if the variable is not any of the outlier variables
                if (exogen_names.indexOf(column_node_name) < 0) continue;
                var_coef[row][current_index] = current_row[column_node_name][estimate];
                current_index++;
            }
        }
    }
    return var_coef;
};

JsonParser.prototype.getSignificantNetworkFromJson = function() {
    return  this.data[this.SIGNIFICANT_NETWORK_LOCATION];
};

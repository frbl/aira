/**
 * Constructor of the var model.
 * @param var_coefficients a list of beta matrices of coefficients of a var model
 * @param node_names names of the nodes in the network
 * @param make_positive whether to convert negative nodes to positive ones
 */
var VarModel = function (var_coefficients, exogenous_coefficients,
                         node_names, exogen_names,
                         y_values, exogen_values,
                         significant_network, make_positive,
                         variable_mapping) {

    this.exogen_coefficients = exogenous_coefficients;

    this.lags = var_coefficients.length;
    this.number_of_variables = node_names.length;
    this.number_of_measurements = y_values[0].length;

    this.node_names = node_names;
    this.significant_network = significant_network;
    this.variable_mapping = variable_mapping;
    this.y_values = y_values;
    this.exogen_values = exogen_values;

    // Merge all var coefficients into one matrix
    var concatted_var_coefficients = [];
    for (var i = 0; i < this.lags; i++) {
        concatted_var_coefficients = concatted_var_coefficients.concat(transpose(var_coefficients[i]));
    }
    this.var_coefficients = transpose(concatted_var_coefficients);

    // Convert the coefficients to always have a positive effect (decrease neg, increase pos)
    //TODO should we do this indeed in the constructor?
    if (make_positive) this.convert_coefficients();

    if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";
    this.number_of_exogen_variables = var_coefficients[0].length - this.lags * this.number_of_variables;
    this.number_of_exogen_variables = this.number_of_exogen_variables > 0 ? this.number_of_exogen_variable : 0;
    this.data_summary = this.calculateDataSummary();
};

/**
 * Returns all significant edges from the significant model. The result is a json object
 * @returns JSON
 */
VarModel.prototype.get_significant_edges = function () {
    return this.data_summary.significant_network.links;
};

VarModel.prototype.getSignificantNetwork = function () {
    return this.significant_network;
};


VarModel.prototype.getResiduals = function() {
    var current=[];

    for(var p = 0 ; p < this.lags ; p++) {
        current.push(this.y_values[p]);
    }


    for(var i = 0 ; i < this.number_of_measurements - this.lags ; i++) {

        current.pop();
        //current.
    }
};

VarModel.prototype.calculateNewOutput = function(endogen, exogen) {
    if(endogen.length != this.lags) throw "The endogen values should be for both lags";
    console.log(this.var_coefficients);
    var result = [],
        i, temp;
    for(i = 0 ; i < endogen.length; i++) {

        temp = math.multiply(this.getCoefficients(i+1), endogen[i]);

        if(exogen !== undefined || [])
            temp = math.add(temp, math.multiply(this.exogen_coefficients, exogen));

        result.push(temp);
    }

    return result;
};


/**
 * Gets a data summary for a node, based on the node name
 * @param node_name
 * @returns {*}
 */
VarModel.prototype.get_data_summary = function (node_name) {
    return this.data_summary[node_name];
};



VarModel.prototype.calculateDataSummary = function() {

    var node_name,
        result = {},
    // The data needs to be transposed so we don't have 1 array with 90 arrays, but x arrays with 90 measurements
        raw_data = transpose(this.y_values);

    for (var i = 0; i < this.node_names.length; i++) {
        node_name = this.node_names[i];
        this.node_names.indexOf(node_name);

        var average = calculateMean(raw_data[i]);
        var sd = standardDeviation(raw_data[i], average);

        result[node_name] = {
            "average": average,
            "sd": sd
        };
    }
    return result;
};


/**
 * Gets a node name based on the ID
 * @param integer_id
 * @returns {*}
 */
VarModel.prototype.get_node_name = function (integer_id) {
    return this.node_names[integer_id];
};

/**
 * Function to convert all negative values to positive ones. That means,
 * Negative effects should be inverted (i.e. onrust is negative, -onrust is positive.
 */
VarModel.prototype.convert_coefficients = function () {
    var multiplier = 0;
    for (var k = 0; k < this.lags; k++) {
        for (var i = 0; i < this.number_of_variables; i++) {
            for (var j = 0; j < this.number_of_variables; j++) {
                multiplier = this.variable_mapping.get_type(this.node_names[i]) == 'Negatief' ? -1 : 1;
                this.set_coefficient(k, j, i, multiplier * this.get_coefficient(k, j, i));
            }
        }
    }
};

/**
 * Converts the current, full var model, to json
 */
VarModel.prototype.to_json = function () {
    var links = [];
    var nodes = [];
    for (var k = 0; k < this.lags; k++) {
        for (var i = 0; i < this.number_of_variables; i++) {
            if (k === 0) {
                nodes.push({
                    "index": i,
                    "name": this.variable_mapping.get_value(this.node_names[i]),
                    "type": "Positief"
                });
            }
            for (var j = 0; j < this.number_of_variables; j++) {
                if (i === j) continue;
                links.push({
                    "source": j,
                    "target": i,
                    "coef": this.get_coefficient(k, j, i)
                });

            }
        }
    }
    return {
        "links": links, "nodes": nodes
    };
};

/**
 * Sets a coefficient in the full coefficient matrix. DOES NOT UPDATE THE SIGNIFICANT JSON.
 * @param lag
 * @param source
 * @param target
 * @param value
 */
VarModel.prototype.set_coefficient = function (lag, source, target, value) {
    this.var_coefficients[target][lag + source] = value;
};

/**
 * Retrieves a coefficient of an edge between source and target on the specified lag, for the full coefficient matrix
 * @param lag
 * @param source
 * @param target
 * @returns {*}
 */
VarModel.prototype.get_coefficient = function (lag, source, target) {
    return this.var_coefficients[target][lag + source];
};

VarModel.prototype.getCoefficients = function (lag) {
    if(lag > this.lags || lag <= 0) throw "Number of lags not included in the model";

    return subsetMatrix(this.var_coefficients, this.number_of_variables * (lag - 1),
        this.number_of_variables * lag);
};

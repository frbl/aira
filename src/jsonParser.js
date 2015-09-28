function JsonParser(data, variable_mapping) {
  this.data = data;
  this.variable_mapping = variable_mapping;

  this.SIGNIFICANT_NETWORK_LOCATION = 0;
  this.CONTEMPORANEOS_NETWORK_LOCATION = 1;
  this.TOP_THREE_NETWORK_LOCATION = 2;
  this.ENDOGEN_DATA_LOCATION = 3;
  this.EXOGEN_DATA_LOCATION = 4;
  this.EXTENDED_NETWORK_LOCATION = 5;
  this.DATA_LOCATION = 'data';
  this.BODY_LOCATION = 'body';
  this.HEADER_LOCATION = 'header';
  this.COEFFICIENT_LOCATION = 'coefs';
}

JsonParser.prototype.hgiNetworkDataToMatrix = function() {
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
getHgiNetworkJsonKeys = function(jsondata) {
  var keys = ['--'],
    name;
  for (name in jsondata) {
    if (jsondata.hasOwnProperty(name)) {
      keys.push(name);
    }
  }
  return keys;
};

JsonParser.prototype.getSubsetOfData = function(subset) {
  var variables = [],
  data = this.data[this.EXTENDED_NETWORK_LOCATION].data.body,
    result = createMatrix(0, data.length, variables.length, false),
    current,
  current_variable;

  this.data[this.EXTENDED_NETWORK_LOCATION].data.header.forEach(function(variable, index) {
    if (_.contains(subset, variable))
      variables.push(index);
  });

  for (var r = 0; r < data.length; r++) {
    current = data[r];
    for (var c = 0; c < variables.length; c++) {
      current_variable = variables[c];
      result[r].push(current[current_variable]);
    }
  }
  return result;
};

JsonParser.prototype.getYDataFromJson = function() {
  var variables = [],
  data = this.data[this.ENDOGEN_DATA_LOCATION].endogen.data.body;
};

JsonParser.prototype.getExogenVariables = function(node_names) {
  var data = this.data[this.EXTENDED_NETWORK_LOCATION].data.header;
  var re = new RegExp(/[a-zA-Z_-]*\.l[0-9]*/);
  var exovars = _.select(data, function(entry){ return !_.contains(node_names, entry) && !entry.match(re) ;});
  console.log(exovars);
  return this.getSubsetOfData(exovars);
};

JsonParser.prototype.dataSummaryFromJson = function(node_names) {
  var node_name,
    result = {},
    // The data needs to be transposed so we don't have 1 array with 90 arrays, but x arrays with 90 measurements
    raw_data = transpose(this.data[this.EXTENDED_NETWORK_LOCATION][this.DATA_LOCATION][this.BODY_LOCATION]);

  for (var i = 0; i < node_names.length; i++) {
    node_name = node_names[i];
    this.data[this.EXTENDED_NETWORK_LOCATION][this.DATA_LOCATION][this.HEADER_LOCATION].indexOf(node_name);

    var average = calculateMean(raw_data[i]);
    var sd = standardDeviation(raw_data[i], average);

    result[node_name] = {
      "average": average,
      "sd": sd
    };
  }
  result.significant_network = this.data[this.SIGNIFICANT_NETWORK_LOCATION];
  return result;
};

JsonParser.prototype.nodeKeysFromJson = function() {
  var self = this;
  return this.data[this.SIGNIFICANT_NETWORK_LOCATION].nodes.map(function(node) {
    return self.variable_mapping.get_key(node.name);
  });
};

JsonParser.prototype.fullNetworkDataToMatrix = function(node_names) {
  var column, row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
  var estimate = this.data[this.EXTENDED_NETWORK_LOCATION][this.COEFFICIENT_LOCATION][this.HEADER_LOCATION].indexOf("Estimate");
  var std_error = this.data[this.EXTENDED_NETWORK_LOCATION][this.COEFFICIENT_LOCATION][this.HEADER_LOCATION].indexOf("Std. Error");
  var t_value = this.data[this.EXTENDED_NETWORK_LOCATION][this.COEFFICIENT_LOCATION][this.HEADER_LOCATION].indexOf("t value");
  var p_value = this.data[this.EXTENDED_NETWORK_LOCATION][this.COEFFICIENT_LOCATION][this.HEADER_LOCATION].indexOf("Pr(>|t|)");

  var coefficients = this.data[this.EXTENDED_NETWORK_LOCATION].coefs.body;
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

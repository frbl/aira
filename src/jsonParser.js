var JsonParser;

JsonParser = (function () {
  var _data,
    _variable_mapping,
    _SIGNIFICANT_NETWORK_LOCATION,
    _COMPLETE_DATA_LOCATION;

  function JsonParser(data, variable_mapping) {
    _data = data;
    _variable_mapping = variable_mapping;

    _SIGNIFICANT_NETWORK_LOCATION = 0;
    _COMPLETE_DATA_LOCATION = 3;
  }

  JsonParser.prototype.hgiNetworkDataToMatrix = function () {
    // Undirected network
    var links, nodes, i, source, target, coef;
    links = _data[0].links;
    nodes = _data[0].nodes;
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
  JsonParser.prototype.getHgiNetworkJsonKeys = function () {
    var keys = ['--'],
      name;
    for (name in _data) {
      if (_data.hasOwnProperty(name)) {
        keys.push(name);
      }
    }
    return keys;
  };

  JsonParser.prototype.nodeKeysFromJson = function () {
    var self = this;
    return _data[_SIGNIFICANT_NETWORK_LOCATION].nodes.map(function (node) {
      return _variable_mapping.get_key(node.name);
    });

    // or: return _data[_COMPLETE_DATA_LOCATION].endogen.header
  };

  JsonParser.prototype.exogenKeysFromJson = function () {
    return _data[_COMPLETE_DATA_LOCATION].exogen.header
  };

  JsonParser.prototype.getYDataFromJson = function () {
    return _data[_COMPLETE_DATA_LOCATION].endogen.body;
  };

  JsonParser.prototype.getExogenDataFromJson = function () {
    return _data[_COMPLETE_DATA_LOCATION].exogen.body;
  };

  JsonParser.prototype.getSignificantNetworkFromJson = function () {
    console.log(_data[_SIGNIFICANT_NETWORK_LOCATION]);
    return _data[_SIGNIFICANT_NETWORK_LOCATION];
  };

  JsonParser.prototype.getExogenCoefficientMatrix = function () {
    var node_keys = this.nodeKeysFromJson();
    var node_exogen_keys = this.exogenKeysFromJson();
    return _exogenCoefficientMatrix(node_keys, node_exogen_keys);
  };

  JsonParser.prototype.getEndogenCoefficientMatrix = function () {
    var node_keys = this.nodeKeysFromJson();
    return _coefficientMatrix(node_keys);
  };

  /*
   * Private methods
   */

  var _coefficientMatrix = function (node_keys) {
    var row, lag, current_index, current, column_node_name, node_name, current_row, highest_lag;
    var coeff_data = _data[_COMPLETE_DATA_LOCATION].coefs;
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


  var _exogenCoefficientMatrix = function (equation_node_names, exogen_names) {
    var row, column_node_name, node_name, current_row;
    var coeff_data = _data[_COMPLETE_DATA_LOCATION].coefs;
    var estimate = coeff_data.header.indexOf("Estimate");
    var coefficients = coeff_data.body;
    var var_coef = createMatrix(0, equation_node_names.length, exogen_names.length, false);

    for (row = 0; row < equation_node_names.length; row++) {
      node_name = equation_node_names[row];
      current_row = coefficients[node_name];
      for (column_node_name in current_row) {
        if (current_row.hasOwnProperty(column_node_name)) {

          // Check if the variable is one of the outlier variables
          if (exogen_names.indexOf(column_node_name) < 0) continue;

          // Save the coefficient value on the good location in the coeficcient matrix
          var_coef[row][exogen_names.indexOf(column_node_name)] = current_row[column_node_name][estimate];
        }
      }
    }
    return var_coef;
  };

  // Expose private methods for testing
  JsonParser.prototype._exogenCoefficientMatrix = _exogenCoefficientMatrix;
  JsonParser.prototype._coefficientMatrix = _coefficientMatrix;

  return JsonParser;

})();

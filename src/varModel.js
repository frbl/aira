var VarModel;

VarModel = (function () {

  /**
   * Constructor of the var model.
   * @param var_coefficients a list of beta matrices of coefficients of a var model
   * @param node_names names of the nodes in the network
   * @param make_positive whether to convert negative nodes to positive ones
   */
  function VarModel(var_coefficients, exogenous_coefficients,
                    node_names, exogen_names,
                    y_values, exogen_values,
                    significant_network, make_positive,
                    variable_mapping) {
    this._exogen_coefficients = exogenous_coefficients;

    this._lags = var_coefficients.length;
    this._number_of_variables = node_names.length;
    this._number_of_measurements = y_values.length;

    this._node_names = node_names;

    this._exogen_names = exogen_names;

    this._significant_network = significant_network;
    this._variable_mapping = variable_mapping;
    this._y_values = y_values;
    this._exogen_values = exogen_values;

    // Merge all var coefficients into one matrix
    var concatted_var_coefficients = [];

    for (var i = 0; i < this.getLags(); i++) {
      concatted_var_coefficients = concatted_var_coefficients.concat(transpose(var_coefficients[i]));
    }
    this._var_coefficients = transpose(concatted_var_coefficients);

    // Convert the coefficients to always have a positive effect (decrease neg, increase pos)
    //TODO should we do this indeed in the constructor?
    if (make_positive) this.convert_coefficients();

    if (var_coefficients.length < 1 || this.getVarCoefficients()[0].length < 1) throw "At least one parameter is needed in the VAR model";
    this._number_of_exogen_variables = this.getVarCoefficients()[0].length - this.getLags() * this.getNumberOfVariables();
    this._number_of_exogen_variables = this._number_of_exogen_variables > 0 ? this._number_of_exogen_variables : 0;
    this._data_summary = this.calculateDataSummary();
    this._addSummaryToVarmodel();
  }

  VarModel.prototype._addSummaryToVarmodel = function () {
    var self = this,
      current_summary;

    self._significant_network.nodes.forEach(function(node) {
      node_key = variable_mapping.get_key(node.name);
      current_summary = self._data_summary[node_key];
      node.sd = current_summary.sd;
      node.average = current_summary.average;
    });
  };

  VarModel.prototype.getExogenCoefficients = function () {
    return this._exogen_coefficients;
  };

  VarModel.prototype.getLags = function () {
    return this._lags;
  };
  VarModel.prototype.getNumberOfVariables = function () {
    return this._number_of_variables;
  };
  VarModel.prototype.getNumberOfMeasurements = function () {
    return this._number_of_measurements;
  };
  VarModel.prototype.getNodeNames = function () {
    return this._node_names;
  };
  VarModel.prototype.getExogenNames = function () {
    return this._exogen_names;
  };
  VarModel.prototype.getSignificantNetwork = function () {
    return this._significant_network;
  };
  VarModel.prototype.getVariableMapping = function () {
    return this._variable_mapping;
  };
  VarModel.prototype.getYValues = function () {
    return this._y_values;
  };
  VarModel.prototype.getExogenValues = function () {
    return this._exogen_values;
  };
  VarModel.prototype.getVarCoefficients = function () {
    return this._var_coefficients;
  };
  VarModel.prototype.getNumberOfExogenVariables = function () {
    return this._number_of_exogen_variables
  };
  VarModel.prototype.getDataSummary = function () {
    return this._data_summary
  };

  /**
   * Returns all significant edges from the significant model. The result is a json object
   * @returns JSON
   */
  VarModel.prototype.getSignificantEdges = function () {
    return this.getSignificantNetwork().links;
  };

  VarModel.prototype.calculateNewOutput = function (endogen, exogen) {
    if (endogen.length != this.getLags()) throw "The endogen values should be for both lags";
    var result = [],
      i, temp;
    for (i = 0; i < endogen.length; i++) {
      temp = math.multiply(this.getCoefficients(i + 1), endogen[i]);
      result.push(temp);
    }

    // SUm the 2d array to a 1d array
    result = arraySum(result);

    // Check if there are exogen variables, if there are, add them
    if (exogen !== undefined || []) {
      result = math.add(result, math.multiply(this.getExogenCoefficients(), exogen));
    }

    return result;
  };

  VarModel.prototype.getResiduals = function () {
    var current_endo = [],
      current_exo,
      result = [],
      temp;
    for (var p = 0; p < this.getLags(); p++) {
      current_endo.unshift(this.getYValues()[p]);
    }

    for (var i = this.getLags(); i < this.getNumberOfMeasurements(); i++) {

      // We have some data with incomplete sets of endogen measurements (the first P measurements are cut off,
      // which is fine)
      if (this.getExogenValues().length < this.getNumberOfMeasurements())
        current_exo = this.getExogenValues()[i - this.getLags()];
      else
        current_exo = this.getExogenValues()[i];

      temp = this.calculateNewOutput(current_endo, current_exo);
      // Residual here is interpreted as the difference between observed and fitted.
      result.push(math.subtract(this.getYValues()[i], temp));

      current_endo.pop();
      current_endo.unshift(this.getYValues()[i]);
    }
    return result;
  };


  VarModel.prototype.getScaledResiduals = function () {
    var resid = transpose(this.getResiduals());
    var res = [];
    for (var i = 0; i < this.getNumberOfVariables(); i++) {
      res.push(centerArray(resid[i]));
    }
    return transpose(res);
  };

  /**
   * Gets a data summary for a node, based on the node name
   * @param node_name
   * @returns {*}
   */
  VarModel.prototype.get_data_summary = function (node_name) {
    return this.getDataSummary()[node_name];
  };


  VarModel.prototype.calculateDataSummary = function () {

    var node_name,
      result = {},
    // The data needs to be transposed so we don't have 1 array with 90 arrays, but x arrays with 90 measurements
      raw_data = transpose(this.getYValues());

    for (var i = 0; i < this.getNodeNames().length; i++) {
      node_name = this.getNodeNames()[i];
      this.getNodeNames().indexOf(node_name);

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
    return this.getNodeNames()[integer_id];
  };

  /**
   * Function to convert all negative values to positive ones. That means,
   * Negative effects should be inverted (i.e. onrust is negative, -onrust is positive.
   */
  VarModel.prototype.convert_coefficients = function () {
    var multiplier = 0;
    for (var k = 0; k < this.getLags(); k++) {
      for (var i = 0; i < this.getNumberOfVariables(); i++) {
        for (var j = 0; j < this.getNumberOfVariables(); j++) {
          multiplier = this.getVariableMapping().get_type(this.getNodeNames()[i]) == 'Negatief' ? -1 : 1;
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
    var nodes = [],
      node= null;
    for (var k = 0; k < this.getLags(); k++) {
      for (var i = 0; i < this.getNumberOfVariables(); i++) {
        if (k === 0) {
          node = this.getNodeNames()[i];
          nodes.push({
            "index": i,
            "average": this.getDataSummary()[node].average,
            "sd": this.getDataSummary()[node].sd,
            "name": this.getVariableMapping().get_value(node),
            "type": "Positief"
          });
        }
        for (var j = 0; j < this.getNumberOfVariables(); j++) {
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
    this.getVarCoefficients()[target][lag + source] = value;
  };

  /**
   * Retrieves a coefficient of an edge between source and target on the specified lag, for the full coefficient matrix
   * @param lag
   * @param source
   * @param target
   * @returns {*}
   */
  VarModel.prototype.get_coefficient = function (lag, source, target) {
    return this.getVarCoefficients()[target][lag + source];
  };

  VarModel.prototype.getCoefficients = function (lag) {
    if (lag > this.getLags() || lag <= 0) throw "Number of lags not included in the model";

    return subsetMatrix(this.getVarCoefficients(), this.getNumberOfVariables() * (lag - 1),
      this.getNumberOfVariables() * lag);
  };

  return VarModel;
})();

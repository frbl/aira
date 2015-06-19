/**
 * Constructor of the var model.
 * @param var_coefficients a list of beta matrices of coefficients of a var model
 * @param node_names names of the nodes in the network
 * @param make_positive whether to convert negative nodes to positive ones
 */
var VarModel = function (var_coefficients, node_names, data_summary, make_positive) {
  this.lags = var_coefficients.length;
  this.number_of_variables = node_names.length;
  this.node_names = node_names;
  this.data_summary = data_summary;

  // Merge all var coefficients into one matrix
  var concatted_var_coefficients = [];
  for (var i = 0; i < this.lags; i++) {
    for (var j = 0; j < this.number_of_variables; j++) {
      concatted_var_coefficients = concatted_var_coefficients.concat(transpose(var_coefficients[i]));
    }
  }
  this.var_coefficients = transpose(concatted_var_coefficients);

  // Convert the coefficients to always have a positive effect (decrease neg, increase pos)
  if(make_positive) this.convert_coefficients();

  if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";
  this.number_of_exogen_variables = var_coefficients[0].length - this.lags * number_of_variables;
};

VarModel.prototype.get_data_summary = function(node_name){
  return this.data_summary[node_name];
};


VarModel.prototype.get_node_name = function(integer_id) {
  return this.node_names[integer_id];
};

/**
 * Function to convert all negative values to positive ones. That means,
 * Negative effects should be inverted (i.e. onrust is negative, -onrust is positive.
 */
VarModel.prototype.convert_coefficients = function(){
  var multiplier =0;
  for (var k = 0; k < this.lags; k++) {
    for (var i = 0; i < this.number_of_variables; i++) {
      for (var j = 0; j < this.number_of_variables; j++) {
        console.log(this.node_names[i])
        multiplier = variable_mapping.get_type(this.node_names[i]) == 'Negatief' ? -1 : 1;
        console.log(multiplier)
        this.set_coefficient(k,j,i, multiplier * this.get_coefficient(k, j, i));
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
      if (k == 0) {
        nodes.push({
          "index": i,
          "name": variable_mapping.get_value(this.node_names[i]),
          "type": "Positief"
        });
      }
      for (var j = 0; j < this.number_of_variables; j++) {
        if (i===j) continue;
        links.push({
          "source": j,
          "target": i,
          "coef": this.get_coefficient(k, j, i)
        })

      }
    }
  }
  return {
    "links": links, "nodes": nodes
  };
};


VarModel.prototype.set_coefficient = function(lag, source, target, value) {
  this.var_coefficients[target][lag + source] = value;
};

VarModel.prototype.get_coefficient = function(lag, source, target) {
  return this.var_coefficients[target][lag + source];
};


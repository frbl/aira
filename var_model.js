var VarModel = function(var_coefficients, lags, number_of_variables, node_names) {
    this.var_coefficients = var_coefficients;
    this.lags = lags;
    this.number_of_variables = number_of_variables
    if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";
    this.var_coefficients = var_coefficients;
    this.lags = lags;
    this.number_of_variables = number_of_variables;
    this.node_names = node_names;
    this.number_of_exogen_variables = var_coefficients[0].length - this.lags * number_of_variables;
};

var VarModel = function(var_coefficients, node_names) {
    this.lags = var_coefficients.length;
    this.number_of_variables = node_names.length;

    var concatted_var_coefficients = [];
    for (var i = 0 ; i< this.lags ; i++ ) {
        for (var j = 0; j < this.number_of_variables; j++) {
            concatted_var_coefficients = concatted_var_coefficients.concat(transpose(var_coefficients[i]));
        }
    }

    this.var_coefficients = transpose(concatted_var_coefficients);

    if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";

    this.node_names = node_names;
    this.number_of_exogen_variables = var_coefficients[0].length - this.lags * number_of_variables;
    console.log('!!!!!!!!!!!');
    console.log(this)
};

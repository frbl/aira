describe('Var', function() {
  var network,
  json_parser,
  node_names,
  vector_autoregressor,
  variable_mapping;

  beforeEach(function() {
    network = fabricateFullNetworLagOneData();
    variable_mapping = fabricateVariableMapping();
    json_parser = new JsonParser(network, variable_mapping);
    node_names = json_parser.nodeKeysFromJson();
    vector_autoregressor = new Var();
  });

  it('should be able to compute a good VAR model for the Y variables', function() {
    var data_summary = json_parser.dataSummaryFromJson(node_names);

    var exogen_names = json_parser.exogenKeysFromJson();

    // Var coefficients
    var var_coefficients = json_parser.getEndogenCoefficientMatrix();
    var exogen_var_coefficients = json_parser.getExogenCoefficientMatrix();

    // The actual data
    var y_values = json_parser.getYDataFromJson(node_names);
    var exogen_values = json_parser.getExogenDataFromJson(node_names);

    // The significant network
    var significant_network = json_parser.getSignificantNetwork();

    var lags = var_model.lags;

    var var_model = new VarModel(
        var_coefficients, exogen_var_coefficients,
        node_names, exogen_names,
        y_values, exogen_values,
        significant_network,
        true,
        variable_mapping
    );

    var result = vector_autoregressor.compute(y_values, exogen_values,
        node_names, exogen_names,
        significant_network, lags
    );

    expect(dimensions(result)).toEqual(dimensions(var_coefficients[0]));
    for (var i = 0; i < result.length ; i++) {
      var row = result[i];
      for (var j = 0; j < row.length ; j++) {
        var result_value = row[j];
        expect(result_value).toBeCloseTo(var_coefficients[0][i][j], 4);
      }
    }
  });
});

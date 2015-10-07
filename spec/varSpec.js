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
    var var_coefficients = json_parser.fullNetworkDataToMatrix(node_names);
    var var_model = new VarModel(var_coefficients, node_names, data_summary,  true, variable_mapping);

    var y_values = json_parser.getYDataFromJson(node_names);
    var lags = var_model.lags;
    var exogen_values = json_parser.getExogenVariables(node_names);
    var result = vector_autoregressor.compute(y_values, lags, exogen_values);
    console.log(var_coefficients[0]);
    console.log(result);
    console.log('Difference:');
    console.log(math.subtract(var_coefficients[0], result));
    expect(dimensions(result)).toEqual(dimensions(var_coefficients[0]));
    expect(result).toEqual(var_coefficients[0]);
  });
});

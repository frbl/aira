describe('Var', function () {
    var network,
        json_parser,
        node_names,
        vector_autoregressor,
        variable_mapping;

    beforeEach(function () {
        network = fabricateFullNetworLagOneData();
        variable_mapping = fabricateVariableMapping();
        json_parser = new JsonParser(network, variable_mapping);
        node_names = json_parser.nodeKeysFromJson();
        vector_autoregressor = new Var();
    });

    it('should be able to compute a good VAR model for the Y variables', function () {
        var exogen_names = json_parser.exogenKeysFromJson();

        // Var coefficients
        var var_coefficients = json_parser.getEndogenCoefficientMatrix();
        var exogen_var_coefficients = json_parser.getExogenCoefficientMatrix();

        // The actual data
        var y_values = json_parser.getYDataFromJson(node_names);
        var exogen_values = json_parser.getExogenDataFromJson(node_names);

        // The significant network
        var significant_network = json_parser.getSignificantNetworkFromJson();

        var lags = 1;
        var make_positive = false;

        var var_model = new VarModel(
            var_coefficients, exogen_var_coefficients,
            node_names, exogen_names,
            y_values, exogen_values,
            significant_network,
            make_positive,
            variable_mapping
        );

        var result = vector_autoregressor.compute(y_values, exogen_values,
            node_names, exogen_names,
            significant_network, lags
        );

        expect(dimensions(result.getVarCoefficients())).toEqual(dimensions(var_model.getVarCoefficients()));

        for (var i = 0; i < result.getVarCoefficients().length; i++) {
            var row = result.getVarCoefficients()[i];
            for (var j = 0; j < row.length; j++) {
                var result_value = row[j];
                expect(result_value).toBeCloseTo(var_model.getVarCoefficients()[i][j], 4);
            }
        }
    });
});

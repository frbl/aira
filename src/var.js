var Var;

Var = (function () {

    var Var = function () {
    };

    /**
     * Computes a new var model based on the inputs it gets.
     * @param y_values the y values on which the var model needs to be calculated
     * @param exogen_values the exogen inputs in the model
     * @param node_names the names of the nodes of the y values (need to be in the same order)
     * @param exogen_names the names of the exogen variables used in the model (need to be in the same order)
     * @param significant_network the significant granger causal network. This is only passed through to the calculated
     *        var-model (not used for calculating the model). In future versions this significant model can be
     *        calculated automatially.
     * @param lags the number of lags to use for fitting the model
     * @returns {VarModel} the actual var model calculated.
     */
    Var.prototype.compute = function (y_values, exogen_values, node_names, exogen_names, significant_network, lags) {
        // Number of measurements
        var T = y_values.length - lags,
        // Number of variables
            k = y_values[0].length,
        // The original measurements, transposed
            Y = transpose(y_values),
        // The Z matrix to store the results in
            Z = createMatrix(0, k * lags, T, false),
            result,
            i, j, t;

        var transposed_exogen_values = transpose(exogen_values);

        // Create the Z Matrix (Lutkepohl, 2015)
        for (i = 0; i < lags; i++) {
            for (j = 0; j < k; j++) {
                for (t = 0; t < T; t++) {
                    row = j;
                    col = (t - (i + 1)) + lags;
                    Z[(k * i) + j][(t)] = Y[row][col];
                }
            }
        }

        // If the exogen values also contain the lag 0 values, remove them
        if (transposed_exogen_values[0].length === y_values.length)
            transposed_exogen_values = subsetMatrix(transposed_exogen_values, lags, y_values.length);

        // Add the exogen values to the matrix (add them after the loop, since they don't need lagging)
        // TODO: This can be done in a native method, without a loop probably.
        for (i = 0; i < transposed_exogen_values.length; i++) {
            Z.push(transposed_exogen_values[i]);
        }

        // Subset the Y matrix so it has the correct dimensions and offset to perform the OLS
        Y = subsetMatrix(Y, lags, T + lags);
        result = multiplyMatrices(Z, transpose(Z));
        result = math.inv(result);
        result = multiplyMatrices(transpose(Z), result);
        result = multiplyMatrices(Y, result);


        // Split the var coefficients in separate matrices
        var var_coefficients = [];
        for (i = 0; i < lags; i++)
            var_coefficients.push(subsetMatrix(result, i * k, k * (i + 1)));

        var total_length = result[0].length;
        var exogen_coefficients = subsetMatrix(result, (lags + 1) * k, total_length);

        // TODO variable mapping is a global variable
        var var_model = new VarModel(
            var_coefficients, exogen_coefficients,
            node_names, exogen_names,
            y_values, transposed_exogen_values,
            significant_network,
            false,
            variable_mapping
        );

        return var_model;
    };

    return Var;

})();

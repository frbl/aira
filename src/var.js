var Var = function () {
};

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

    exogen_values = transpose(exogen_values);

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
    if (exogen_values[0].length === y_values.length)
        exogen_values = subsetMatrix(exogen_values, lags, y_values.length);

    // Add the exogen values to the matrix (add them after the loop, since they don't need lagging)
    // TODO: This can be done in a native method, without a loop probably.
    for (i = 0; i < exogen_values.length; i++) {
        Z.push(exogen_values[i]);
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
        y_values, exogen_values,
        significant_network,
        false,
        variable_mapping
    );

    return var_model;
};

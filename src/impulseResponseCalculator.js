function ImpulseResponseCalculator(var_model) {
    this.var_model = var_model;
}

/**
 *
 * @param forecast_until
 * @returns {Array}
 */
ImpulseResponseCalculator.prototype.estimateVmaCoefficients = function (forecast_until) {
    // Create a list B of coefficient matrices for each time lag
    var B = [];
    var lag;
    for (lag = 0; lag < this.var_model.lags; lag++) {
        var x = (this.var_model.number_of_variables * (lag));
        B[lag] = subsetMatrix(this.var_model.var_coefficients, x, x + this.var_model.number_of_variables);
    }

    if (DEBUG > 2) {
        console.log('printing B matrix');
        for (b = 0; b < B.length; b++) printMatrix(B[b]);
        console.log('Done printing B matrix');
    }


    // Create a matrix of all exogenous coefficients
    var exogenous_variables = subsetMatrix(this.var_model.var_coefficients, this.var_model.lags * this.var_model.number_of_variables, (this.var_model.lags * this.var_model.number_of_variables) + this.var_model.number_of_exogen_variables);

    // Create a list C of VMAcoefficient matrices for each VMAtime lag
    var C = [];
    var forecast_step;
    var c_array_index;
    for (forecast_step = 0; forecast_step < forecast_until; forecast_step++) {
        var temp = [];

        for (c_array_index = 0; c_array_index <= forecast_step; c_array_index++) {
            temp[c_array_index] = this.delta(B, c_array_index);
            if (forecast_step - c_array_index > 0) {
                var reduced_matrix = sumMatrices(C[(forecast_step - c_array_index) - 1]);
                temp[c_array_index] = multiplyMatrices(temp[c_array_index], reduced_matrix);
            }
        }
        C.push(temp);
    }

    // TODO: Remove zero matrices if needed.
    if (DEBUG > 3) {
        for (c = 0; c < C.length; c++) {
            for (ci = 0; ci < C[c].length; ci++) {
                console.log(c + ':' + ci);
                printMatrix(C[c][ci]);
            }
        }
    }
    return C;
};

/**
 *
 * @param E
 * @param C
 * @returns {*}
 */
ImpulseResponseCalculator.prototype.calculateImpulseResponse = function (E, C) {
    if (E.length < 1) throw ('Number of shocks should be more than one');
    var number_of_timesteps = C.length;

    if (number_of_timesteps < 1) throw ('At least one coefficient matrix is needed');

    if (DEBUG > 0) console.log('Starting calculation with ' + number_of_timesteps + ' timesteps and for ' + this.var_model.number_of_variables + ' variables.');

    var Y_temp, e_lagged, t, i;

    // Create a matrix to store the results in, size is
    var Y = createMatrix(0, number_of_timesteps, this.var_model.number_of_variables, false);

    var identity_matrix = createMatrix(0, this.var_model.number_of_variables, this.var_model.number_of_variables, true);

    // The extra [] around E[0] are needed to properly perform the transform.
    Y[0] = [E[0]];

    for (t = 1; t < number_of_timesteps; t++) {
        // TODO: check e_lagged is a matrix with t lags for all variables.
        // TODO: check First measurement is the vector times the identity matrix. This should be changed we want to include orthogonalized irf
        Y_temp = makeFilledArray(this.var_model.number_of_variables, 0);

        // Multiplying with I matrix should be changed to cholesky decomposition?
        //e_lagged = multiplyMatrices(E.slice(0, t), identity_matrix);
        e_lagged = E.slice(0, t);
        for (i = 0; i < e_lagged.length; i++) {
            var addition = multiplyMatrices([e_lagged[i]], transpose(C[t - 1][i]));

            if (i === 0) Y_temp = sumMatrices([
                [Y_temp], addition
            ]);
            else Y_temp = sumMatrices([Y_temp, addition]);
        }
        Y[t] = Y_temp;
    }
    Y = transpose(Y);
    return Y[0];
};


/**
 * Runs the actual impulse response calculation on the var model provided to the constructor. It determines it for a
 * given number of steps in the future, for a selected parameter and for a provided shock size
 * @param variable_to_shock the variable to exert the shock on
 * @param steps_ahead the number of steps to make a prediction for
 * @param shock_size the size of the shock to give
 * @returns {Array} an array of arrays containing the IRF
 */
ImpulseResponseCalculator.prototype.runImpulseResponseCalculation = function (variable_to_shock, shock_size, steps) {
    if (DEBUG > 0) console.log('Running calculation for: ' + variable_to_shock + ' with ' + this.var_model.lags + ' lags, and doing it for ' + steps + ' steps in the future');

    var nr_of_variables = this.var_model.var_coefficients.length;

    var shocks;
    if (variable_to_shock == -1) {
        shocks = createMatrix(shock_size, nr_of_variables, steps, false);
    } else {
        shocks = createMatrix(0, nr_of_variables, steps, false);
        shocks[variable_to_shock] = makeFilledArray(steps, shock_size);
    }
    shocks = transpose(shocks);

    var C = this.estimateVmaCoefficients(steps);
    var result = this.calculateImpulseResponse(shocks, C);

    if (DEBUG > 2) {
        console.log('Impulse response:');
        printMatrix(result);
    }

    return result;
};

/**
 * Function that either returns an array of coefficients of the var model (if the asked index is included in the list
 * of coefficients), or returns an empty matrix with the same size as the coefficient matrix it would return.
 * @param B the list of coefficient matrices, indexed by lag
 * @param index the index required from the matrix
 * @returns B at the index, or a zero-matrix with the same dimensions
 */
ImpulseResponseCalculator.prototype.delta = function (B, index) {
    if (index >= this.var_model.lags) {
        return createMatrix(0, B[0].length, B[0][0].length, false);
    }
    return B[index];
};

ImpulseResponseCalculator.prototype.bootstrappedImpulseResponseCalculation = function (variable_to_shock, shock_size, steps, bootstrap_iterations) {
    var confidence = 0.95;
console.log(this.var_model)
    var var_orig = this.var_model,
        current_endo,
        current_exo,
        temp,
        indices = makeSequenceArray(1, 0, var_orig.number_of_measurements - (var_orig.lags + 1)),
        y_sampled,
        total_y_sampled = [],
        irfs = [],
        residuals = var_orig.getScaledResiduals(),
        current_y_values,
        vector_autoregressor = new Var(),
        upper_bound = Math.round(bootstrap_iterations * confidence),
        lower_bound = Math.round(bootstrap_iterations * (1-confidence));
var first = true;
    console.log(var_orig);
    // Bootstrap the var model
    bootstrap_iterations = 1
    for (var iteration = 0; iteration < bootstrap_iterations; iteration++) {

        // shuffle the measurement indices
        indices = shuffle(indices);
        current_endo = [];
        y_sampled = [];

        for (var p = 0; p < var_orig.lags; p++) {
            current_y_values = var_orig.y_values[p];
            current_endo.unshift(current_y_values);
            y_sampled.push(current_y_values);
        }

        printMatrix(current_endo);
        // Each iteration of i we calculate the values of y_i
        for (var i = var_orig.lags; i < var_orig.number_of_measurements; i++) {
            current_exo = var_orig.exogen_values[i];

            temp = var_orig.calculateNewOutput(current_endo, current_exo);

            if(first){
                console.log('First values: ');
                console.log('endo');
                console.log(current_endo);
                console.log('exo');
                console.log(current_exo);
                console.log('res');
                console.log(temp[0]);
                console.log(temp[1]);
                first = false;
            }
            // Add random residual to the result
            // TODO check whether these should be the residuals or the lutkepohl method
            temp = math.add(temp, residuals[indices[i - var_orig.lags]]);

            y_sampled.push(temp);

            current_endo.pop();
            current_endo.unshift(var_orig.y_values[i]);
        }
        total_y_sampled.push(y_sampled);

        this.var_model = vector_autoregressor.compute(
            y_sampled, var_orig.exogen_values,
            var_orig.node_names, var_orig.exogen_names,
            var_orig.significant_network, var_orig.lags
        );
        irfs.push(this.runImpulseResponseCalculation(variable_to_shock, shock_size, steps))
    }

    // calculate the Y value using
    this.var_model = var_orig;

    var irf_model,
        irf_row;
    // fabricate the 95% conf interval
    irfs_ci_high = createMatrix(0, steps, this.var_model.number_of_variables, false);
    irfs_ci_low = createMatrix(0, steps, this.var_model.number_of_variables, false);

    // Transpose the irfs matrix, so we have a matrix where each row is a moment in time, each column is an irf
    irfs = transpose(irfs);
    for (var i = 0; i < irfs.length; i++) {
        irf_at_time = transpose(irfs[i]);
        // Now we have #variables rows and #bootstraps columns
        for(var variable_id = 0; variable_id < irf_at_time.length; variable_id++) {
            irf_at_time[variable_id].sort();
            //console.log(irf_at_time[variable_id]);
            //console.log(lower_bound);
            irfs_ci_high[i][variable_id] = irf_at_time[variable_id][upper_bound];
            irfs_ci_low[i][variable_id] = irf_at_time[variable_id][lower_bound];
        }
    }
console.log(irfs_ci_high)
    console.log(irfs_ci_low)
    return {'low': irfs_ci_low, 'high': irfs_ci_high};
};


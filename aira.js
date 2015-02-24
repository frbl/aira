var DEBUG = 1;

var estimateVmaCoefficients = function (var_coefficients, forecast_until, p) {
    if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";
    var number_of_variables = var_coefficients.length;

    // Create a list B of coefficient matrices for each time lag
    var B = [];
    var lag;
    for (lag = 0; lag < p; lag++) {
        var x = (number_of_variables * (lag ));
        B[lag] = subset_matrix(var_coefficients, x, x + number_of_variables);
    }

    if (DEBUG > 2) for (b = 0; b < B.length; b++) printMatrix(B[b]);

    // Create a list C of VMAcoefficient matrices for each VMAtime lag
    var C = [];
    var forecast_step;
    var c_array_index;
    for (forecast_step = 0; forecast_step < forecast_until; forecast_step++) {
        var temp = [];

        for (c_array_index = 0; c_array_index <= forecast_step; c_array_index++) {
            temp[c_array_index] = delta(B, c_array_index, p);
            if (forecast_step - c_array_index > 0) {
                var reduced_matrix = sumMatrices(C[(forecast_step - c_array_index) - 1]);
                temp[c_array_index] = multiplyMatrices(temp[c_array_index], reduced_matrix);
            }
        }
        C.push(temp)
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
 * @param p
 * @param E
 * @param C
 * @returns {*}
 */
var calculateImpulseResponse = function (p, E, C) {
    if (E.length < 1) throw('Number of shocks should be more than one');
    var number_of_timesteps = C.length;
    var number_of_variables = E[0].length;

    if (number_of_timesteps < 1) throw('At least one coefficient matrix is needed');

    if (DEBUG > 0) console.log('Starting calculation with ' + number_of_timesteps + ' timesteps and for ' + number_of_variables + ' variables.');

    var Y_temp, e_lagged, t, i;

    // Create a matrix to store the results in, size is
    var Y = createMatrix(0, number_of_timesteps + 1, number_of_variables, false);

    var identity_matrix = createMatrix(0, number_of_variables, number_of_variables, true);

    // The extra [] around E[0] are needed to properly perform the transform.
    Y[0] = multiplyMatrices([E[0]], identity_matrix);

    for (t = 0; t <= number_of_timesteps; t++) {
        // TODO: check e_lagged is a matrix with t lags for all variables.
        // TODO: check First measurement is the vector times the identity matrix. This should be changed we want to include orthogonalized irf
        Y_temp = makeFilledArray(number_of_variables, 0);

        if (t > 0) {
            e_lagged = multiplyMatrices(E.slice(0, t), identity_matrix);
            for (i = 0; i < e_lagged.length; i++) {
                var addition = multiplyMatrices([e_lagged[i]], transpose(C[t - 1][i]));

                if (i == 0) Y_temp = sumMatrices([[Y_temp], addition]);
                else Y_temp = sumMatrices([Y_temp, addition]);
            }
        } else {
            Y_temp = multiplyMatrices([E[0]], identity_matrix);
        }
        Y[t] = Y_temp
    }
    return transpose(Y)
};

/**
 *
 * @param var_model
 * @param variable_to_improve
 * @param lags
 * @param steps_ahead
 * @param optimizers
 * @params options
 * @returns {{}}
 */
var determineOptimalNode = function (var_model, variable_to_improve, lags, steps_ahead, options) {
    var variable, irf, cumulative, cumulative_name, name;
    var result = {};
    cumulative = {};
    var effects = {};

    var number_of_variables = var_model.length;

    if (DEBUG > 0) console.log('Determining best shock for variable ' + variable_to_improve + ' (out of ' + number_of_variables + ')');

    for (variable = 0; variable < number_of_variables; variable++) {
        name = node_names[variable];
        cumulative_name = name + '_cumulative';

        irf = transpose(runImpulseResponseCalculation(var_model, variable, lags, steps_ahead));
        cumulative = cumulativeSummation(irf);

        result[name] = irf[variable_to_improve];
        result[cumulative_name] = cumulative[variable_to_improve];

        // TODO: Check if the variable is a negative one, if it is, the threshold should be a minimization
        // if(-NODE = "Negatief") cumulative *= -1;

        effects[name] = thresholdOptimizer(options, result[name], result[cumulative_name]);

    }

    if (DEBUG > 0) {
        console.log('Effects found for variable: ' + variable_to_improve);
        var interval;
        for (var effect in effects) {
            if (effects.hasOwnProperty(effect)) {

                for(interval = 0 ; interval < effects[effect].length ; interval++) {
                    console.log(effect + ':' + effects[effect][interval]);
                }
            }

        }

    }

    return effects;
};

/**
 * Function that either returns an array of coefficients of the var model (if the asked index is included in the list
 * of coefficients), or returns an empty matrix with the same size as the coefficient matrix it would return.
 * @param B the list of coefficient matrices, indexed by lag
 * @param index the index required from the matrix
 * @param lags the total number of lags in the model
 * @returns B at the index, or a zero-matrix with the same dimensions
 */
var delta = function (B, index, lags) {
    if (index >= lags) {
        return createMatrix(0, B[0].length, B[0][0].length, false);
    }
    return B[index];
};

/**
 *
 * @param var_model
 * @param variable_to_shock
 * @param lags
 * @param steps_ahead
 * @returns {*}
 */
var runImpulseResponseCalculation = function (var_model, variable_to_shock, lags, steps_ahead) {
    if (DEBUG > 0) console.log('Running calculation for: ' + variable_to_shock + ' with ' + lags + ' lags, and doing it for ' + steps_ahead + ' steps in the future');

    var nr_of_variables = var_model.length;
    var shocks = createMatrix(0, nr_of_variables, steps_ahead, false);

    shocks[variable_to_shock] = makeFilledArray(steps_ahead, 1);
    shocks = transpose(shocks);

    var C = estimateVmaCoefficients(var_model, steps_ahead, lags);
    var result = calculateImpulseResponse(lags, shocks, C);

    if (DEBUG > 2) {
        console.log('Impulse response:');
        printMatrix(result[0]);
    }

    return result[0];
};
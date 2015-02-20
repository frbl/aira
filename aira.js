var DEBUG = true;

var estimate_c_values = function (var_coefficients, forecast_until, p) {
    if (var_coefficients.length < 1 || var_coefficients[0].length < 1) throw "At least one parameter is needed in the VAR model";
    var number_of_variables = var_coefficients.length;

    // Create a list B of coefficient matrices for each time lag
    var B = [];
    var lag;
    for (lag = 0; lag < p; lag++) {
        var x = (number_of_variables * (lag ));
        B[lag] = subset_matrix(var_coefficients, x, x + number_of_variables);
    }

    if (DEBUG) {
        for (b = 0; b < B.length; b++) {
            printMatrix(B[b])
        }
    }

    //B_average <<- (Reduce('+', B)) / p ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    if (DEBUG) {
        for (c = 0; c < C.length; c++) {
            for (ci = 0; ci < C[c].length; ci++) {
                console.log(c + ':' + ci);
                printMatrix(C[c][ci]);
            }
        }
        return C;
    }
};

var delta = function (B, c_index, lags) {
    if (c_index >= lags) {
        vma_matrix = create_matrix(0, B[0].length, B[0][0].length, false);
        return vma_matrix;
    } else {
        return B[c_index];
    }
};

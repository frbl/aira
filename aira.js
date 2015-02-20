var DEBUG = true;

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

/**
 *
 * @param p
 * @param E
 * @param C
 * @returns {*}
 */
var calculateImpulseResponse = function(p, E, C) {
    if(E.length < 1 ) throw('Number of shocks should be more than one');
    var number_of_timesteps = C.length;
    var number_of_variables = E[0].length;

    var t, Y, Y_temp;

    if(number_of_timesteps < 1) throw('At least one coefficient matrix is needed');
    if(number_of_variables != C[0][0].length) throw('length of g should be < the amount of variables');

    // Create a matrix to store the results in, size is
    Y = createMatrix(0, number_of_variables, number_of_timesteps + 1);

    // TODO: Is it possible to set it just to the rows of the Y matrix, and then transpose the matrix?
    Y[,1] = multiplyMatrices(E[1], createMatrix(0, number_of_variables, number_of_variables, true);

    for(t = 0; t <= number_of_timesteps ; t++) {
    // e_lagged is a matrix with t lags for all variables.
    // First measurement is the vector times the identity matrix. This should be changed we want to include orthogonalized irf

        Y_temp = 0;

        if(t > 1) {
            var e_lagged = E[1:t-1,] %*% diag(1,number_of_variables); //////////////////////////////////
            
            if(!is.null(nrow(e_lagged)) && nrow(e_lagged) > 1) {
                for(i in 1:nrow(e_lagged)){
                    Y_temp <- Y_temp + e_lagged[i,] %*% t(C[[t-1]][[i]])
                }
            } else {
                Y_temp <- Y_temp + e_lagged %*% t(C[[t-1]][[1]]) //////////////////////////////////////////////////////
            }
        } else {
            Y_temp <- E[1,] %*% diag(1,number_of_variables)
        }
        Y[,t] <- Y_temp
    }
    j <<- t(Y)
    return(Y)
};

var delta = function (B, c_index, lags) {
    if (c_index >= lags) {
        vma_matrix = createMatrix(0, B[0].length, B[0][0].length, false);
        return vma_matrix;
    } else {
        return B[c_index];
    }
};

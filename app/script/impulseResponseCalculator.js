var ImpulseResponseCalculator;

ImpulseResponseCalculator = (function () {

  function ImpulseResponseCalculator(var_model) {
    this._var_model = var_model;
  }


  ImpulseResponseCalculator.prototype.getVarModel = function () {
    return this._var_model;
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
    if (DEBUG > 0) console.log('Running calculation for: ' + variable_to_shock + ' with ' + this._var_model.getLags() + ' lags, and doing it for ' + steps + ' steps in the future');

    var nr_of_variables = this._var_model.getVarCoefficients().length;

    // Actually we want to generate from step 0 till step steps, which is steps + 1
    steps++;
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

  ImpulseResponseCalculator.prototype.bootstrappedImpulseResponseCalculation = function (variable_to_shock, shock_size, steps, bootstrap_iterations, confidence) {
    confidence = 1 - confidence;

    // The extend is needed because otherwise the model gets overwritten
    var var_orig = $.extend(true, {}, this._var_model),
      current_endo,
      current_exo,
      temp,
      indices = makeSequenceArray(1, 0, var_orig.getNumberOfMeasurements() - (var_orig.getLags() + 1)),
      y_sampled,
      total_y_sampled = [],
      irfs = [],
      residuals = var_orig.getScaledResiduals(),
      current_y_values,
      vector_autoregressor = new Var(),
      upper_bound = Math.max(confidence / 2, 1),
      lower_bound = Math.min((1 - confidence / 2 ), 0),
      i, p, iteration;

    // Bootstrap the var model
    for (iteration = 0; iteration < bootstrap_iterations; iteration++) {

      // shuffle the measurement indices
      indices = sample(indices);
      current_endo = [];
      y_sampled = [];
      for (p = 0; p < var_orig.getLags(); p++) {
        current_y_values = var_orig.getYValues()[p];
        current_endo.unshift(current_y_values);
        y_sampled.push(current_y_values);
      }

      // Each iteration of i we calculate the values of y_i
      for (i = var_orig.getLags(); i < var_orig.getNumberOfMeasurements(); i++) {
        current_exo = var_orig.getExogenValues()[i];
        temp = var_orig.calculateNewOutput(current_endo, current_exo);

        // Add random residual to the result
        // TODO check whether these should be the residuals or the lutkepohl method
        temp = math.add(temp, residuals[indices[i - var_orig.getLags()]]);

        y_sampled.push(temp);

        current_endo.pop();
        current_endo.unshift(var_orig.getYValues()[i]);
      }
      total_y_sampled.push(y_sampled);

      this._var_model = vector_autoregressor.compute(
        y_sampled, var_orig.getExogenValues(),
        var_orig.getNodeNames(), var_orig.getExogenNames(),
        var_orig.getSignificantNetwork(), var_orig.getLags()
      );

      irfs.push(this.runImpulseResponseCalculation(variable_to_shock, shock_size, steps));
      // calculate the Y value using

      this._var_model = var_orig;
    }
    steps++;
    // fabricate the 95% conf interval
    irfs_ci_high = createMatrix(0, steps, this._var_model.getNumberOfVariables(), false);
    irfs_ci_low = createMatrix(0, steps, this._var_model.getNumberOfVariables(), false);

    // Transpose the irfs matrix, so we have a matrix where each row is a moment in time, each column is an irf
    irfs = transpose(irfs);
    for (i = 0; i < irfs.length; i++) {
      irf_at_time = transpose(irfs[i]);
      // Now we have #variables rows and #bootstraps columns
      for (var variable_id = 0; variable_id < irf_at_time.length; variable_id++) {
        irfs_ci_high[i][variable_id] = getQuantile(irf_at_time[variable_id], upper_bound);
        irfs_ci_low[i][variable_id] = getQuantile(irf_at_time[variable_id], lower_bound);
      }
    }
    if(DEBUG > 2) console.log({'low': irfs_ci_low, 'high': irfs_ci_high});
    return {'low': irfs_ci_low, 'high': irfs_ci_high};
  };

  ImpulseResponseCalculator.prototype.significantImpulseResponseCalculation = function (variable_to_shock, shock_size, steps, bootstrap_iterations, confidence) {
    bootrstrapped_response = this.bootstrappedImpulseResponseCalculation(variable_to_shock, shock_size, steps, bootstrap_iterations, confidence);

    var result = [],
      hi,
      lo,
      significant_response;

    for (var j = 0; j < this._var_model.getNumberOfVariables(); j++) {
      result[j] = [];
      for (var i = 0; i < steps; i++) {

        hi = bootrstrapped_response.high[i][j];
        lo = bootrstrapped_response.low[i][j];

        // If the CI crosses zero, the result is not significant
        if (sign(hi) !== sign(lo)) {
          significant_response = 0;
        } else {
          significant_response = (Math.abs(hi) - Math.abs(lo)) > 0 ? lo : hi;
        }
        result[j].push(significant_response)
      }
    }
    return result;
  };

  /**
   *
   * @param forecast_until
   * @returns {Array}
   */
  ImpulseResponseCalculator.prototype.estimateVmaCoefficients = function (forecast_until) {
    // Create a list B of coefficient matrices for each time lag
    var B = [];
    var lag;
    for (lag = 0; lag < this._var_model.getLags(); lag++) {
      var x = (this._var_model.getNumberOfVariables() * (lag));
      B[lag] = subsetMatrix(this._var_model.getVarCoefficients(), x, x + this._var_model.getNumberOfVariables());
    }

    if (DEBUG > 2) {
      console.log('printing B matrix');
      for (b = 0; b < B.length; b++) printMatrix(B[b]);
      console.log('Done printing B matrix');
    }


    // Create a matrix of all exogenous coefficients
    var exogenous_variables = subsetMatrix(this._var_model.getVarCoefficients(), this._var_model.getLags() * this._var_model.getNumberOfVariables(), (this._var_model.getLags() * this._var_model.getNumberOfVariables()) + this._var_model.getNumberOfExogenVariables());

    // Create a list C of VMAcoefficient matrices for each VMAtime lag
    var C = [];
    var forecast_step;
    var c_array_index;
    for (forecast_step = 0; forecast_step < forecast_until; forecast_step++) {
      var temp = [];

      for (c_array_index = 0; c_array_index <= forecast_step; c_array_index++) {
        temp[c_array_index] = _delta.call(this, B, c_array_index);
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

    if (DEBUG > 0) console.log('Starting calculation with ' + number_of_timesteps + ' timesteps and for ' + this._var_model.getNumberOfVariables() + ' variables.');

    var Y_temp, e_lagged, t, i;

    // Create a matrix to store the results in, size is
    var Y = createMatrix(0, number_of_timesteps, this._var_model.getNumberOfVariables(), false);

    var identity_matrix = createMatrix(0, this._var_model.getNumberOfVariables(), this._var_model.getNumberOfVariables(), true);

    // The extra [] around E[0] are needed to properly perform the transform.
    Y[0] = [E[0]];

    for (t = 1; t < number_of_timesteps; t++) {
      // TODO: check e_lagged is a matrix with t lags for all variables.
      // TODO: check First measurement is the vector times the identity matrix. This should be changed we want to include orthogonalized irf
      Y_temp = makeFilledArray(this._var_model.getNumberOfVariables(), 0);

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
   * PRIVATE METHODS
   */

  /**
   * PRIVATE
   * Function that either returns an array of coefficients of the var model (if the asked index is included in the list
   * of coefficients), or returns an empty matrix with the same size as the coefficient matrix it would return.
   * @param B the list of coefficient matrices, indexed by lag
   * @param index the index required from the matrix
   * @returns B at the index, or a zero-matrix with the same dimensions
   */
  var _delta = function (B, index) {

    if (index >= this._var_model.getLags()) {
      return createMatrix(0, B[0].length, B[0][0].length, false);
    }
    return B[index];
  };

  // Expose private method for testing
  ImpulseResponseCalculator.prototype._delta = _delta;

  return ImpulseResponseCalculator;
})();

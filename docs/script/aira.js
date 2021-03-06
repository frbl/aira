"use strict";

var DEBUG = 0;
class Aira {

  constructor(impulse_response_calculator, var_model, view_model, convert_to_positive) {
    this.impulse_response_calculator = impulse_response_calculator;
    this.var_model = var_model;
    this.view_model = view_model;
    this.convert_to_positive = convert_to_positive;
  }

  /**
   * Determines the node which has the most positive effect of all nodes in the network.
   * It does so by running the irf calculation for each node in the network, and summing
   * the irf responses of the other variables in the model. The cumulative score is returned.
   *
   * @returns [] a list of hashes containing each variable and the cumulative effect it has.
   */
  determineBestNodeFromAll() {
    var variable, irf, cumulative_name, name, max, max_var,
      result = {},
      cumulative = {},
      effects = [];

    // Loop through all variables, and determine the impulse response of each variable on the variable to improve.
    for (variable = 0; variable < this.var_model.getNumberOfVariables(); variable++) {

      // Set the names for the nodes in the var model
      name = this.var_model.get_node_name(variable);
      cumulative_name = name + '_cumulative';

      var only_significant = this.view_model.get_chk_bootstrap(),
        bootstrap_iterations = this.view_model.get_bootstrap_iterations(),
        confidence = 0.95;

      // Shock the current variable in the loop
      if (only_significant) {
        irf = this.impulse_response_calculator.significantImpulseResponseCalculation(variable, 1, this.view_model.get_steps(),
          bootstrap_iterations, confidence);
      } else {
        irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable, 1, this.view_model.get_steps()));
      }

      cumulative = cumulativeSummation(irf);

      result[name] = 0;
      result[cumulative_name] = 0;
      // Check the response this variable has on all other variables, and sum the result
      for (var current = 0; current < irf.length; current++) {
        if (current == variable) continue;
        result[cumulative_name] += cumulative[current][this.view_model.get_steps() - 1];
      }
      effects.push({
        name: name,
        val: result[cumulative_name]
      });
    }
    return effects;
    //.sort(function (a, b) {
    //return Math.abs(a.val) - Math.abs(b.val);
    //}).reverse();
  };

  /**
   * Determines the optimal node using an optimizer past into it. See AiraOptimalVariableFinder for details
   *
   * @param variable_to_improve the variable a participant would like to improve
   * @param optimizer the optimizer to use for the optimization
   * @param options extra options needed for the optimizer
   * @returns {{}}
   */
  determineOptimalNodeSimple(variable_to_improve, optimizer, options) {
    var variable, irf, cumulative_name, name,
      result = {},
      cumulative = {},
      effects = {};

    // Should we take the shocked variable into account?
    var consider_shocked_variable = false;
    var variable_to_improve_name = this.var_model.get_node_name(variable_to_improve);

    if (DEBUG > 0) console.log('Determining best shock for variable ' + variable_to_improve + ' (out of ' + this.var_model.getNumberOfVariables() + ')');

    // Loop through all variables, and determine the impulse response of each variable on the variable to improve.
    for (variable = 0; variable < this.var_model.getNumberOfVariables(); variable++) {

      // Don't take into account direct effects on the shocked variable
      if (variable_to_improve == variable && !consider_shocked_variable) continue;

      name = this.var_model.get_node_name(variable);
      cumulative_name = name + '_cumulative';

      irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable, 1, this.view_model.get_steps()));
      cumulative = cumulativeSummation(irf);

      result[name] = irf[variable_to_improve];
      result[cumulative_name] = cumulative[variable_to_improve];

      // TODO: Check if the variable is a negative one, if it is, the threshold should be a minimization
      // if(-NODE = "Negatief") cumulative *= -1;
      var airaOptimalVariableFinder = new AiraOptimalVariableFinder(
        result[name],
        result[cumulative_name],
        this.var_model.get_data_summary(variable_to_improve_name),
        this.var_model.get_data_summary(name),
        options
      );

      effects[this.var_model.getVariableMapping().get_translation(name)] = airaOptimalVariableFinder.execute(optimizer);
    }

    if (DEBUG > 1) {
      console.log('Effects found for variable: ' + variable_to_improve);
      var interval;
      console.log(effects);
      for (var effect in effects) {
        if (effects.hasOwnProperty(effect)) {

          for (interval = 0; interval < effects[effect].length; interval++) {
            console.log(effect + ':' + effects[effect][interval]);
          }
        }
      }
    }
    return effects;
  };

/**
 * description
 * @param variable_to_shock the variable that receives the shock
 * @param variable_to_respond the variable that should respon
 * @param measurement_interval the interval between the measurements in minutes
 */
  determineLengthOfEffect(variable_to_shock, variable_to_respond, measurement_interval) {
    var variable, irf,
      result = {},
      effects = {};

    // Should we take the shocked variable into account?
    var variable_to_shock_name = this.var_model.get_node_name(variable_to_shock);
    var variable_to_respond_name = this.var_model.get_node_name(variable_to_respond);
    if (DEBUG > 0) console.log('Determining length of effect for variable ' + variable_to_shock + ' (out of ' + this.var_model.getNumberOfVariables() + ')');

    irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable_to_shock, 1, this.view_model.get_steps()));

    result[variable_to_respond_name] = irf[variable_to_respond];


    if (DEBUG > 1) {
      console.log('Effects found for variable: ' + variable_to_improve);
      var interval;
      console.log(effects);
      for (var effect in effects) {
        if (effects.hasOwnProperty(effect)) {

          for (interval = 0; interval < effects[effect].length; interval++) {
            console.log(effect + ':' + effects[effect][interval]);
          }
        }
      }
    }
    return result;
  };

  /**
   * This method determines the freequency of an intervention. Note that this method is higly under construction and should not be used
   * until thouroughly validated
   *
   * @param variable_to_improve the variable to improve in the present model
   * @param options extra options such as a threshold and whether or not a degredation of the effect should be modelled
   * @returns {{}}
   */
  determineOptimalNode(variable_to_improve, options) {
    var variable, irf, valleys, i, temp_result, sum_array, irf_on_var, impulses, minimum, frequency, range, degradated_value;
    var result = {};
    var consider_shocked_variable = false;

    if (DEBUG > 0) console.log('Determining best shock for variable ' + variable_to_improve + ' (out of ' + this.var_model.getNumberOfVariables() + ')');

    var degradation_effect = getDegradationEffect(options);

    var impulse_response_strengths = makeSequenceArray(0.1, 0.1, 10);

    // Loop through all variables, and determine the impulse response of each variable on the variable to improve.
    for (variable = 0; variable < this.var_model.getNumberOfVariables(); variable++) {

      // Don't take into account direct effects on the shocked variable
      if (variable_to_improve == variable && !consider_shocked_variable) continue;

      temp_result = {};

      irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable, 1, this.view_model.get_steps()));
      irf_on_var = irf[variable_to_improve];

      for (frequency = 0; frequency < this.view_model.get_steps(); frequency++) {
        minimum = 0;
        impulses = [];

        /*
         * If the frequency is 0, sum all IRFs on timstep 0. If it is not zero, each timestep should have a
         * proportion of the IRFs, with regards to the frequency and the steps ahead. I.e., frequency = 0, all
         * impulses are at time 0. Frequency is 1, the difference between all IRFs is 1
         */
        range = (frequency === 0 ? this.view_model.get_steps() : Math.ceil(this.view_model.get_steps() / frequency));

        for (j = 0; j < range; j++) {
          // Add zero padding to all of the IRFs with regards to their position, to shift them
          degradated_value = addPadding(irf_on_var, j * frequency, 0);

          // Degrade subsequent responses (add a weight to the effect
          degradated_value = scaleArray(degradated_value, degradation_effect[j]);

          impulses.push(degradated_value);
        }

        sum_array = arraySum(impulses);

        if (variable === 0)
          visualization_engine.addData('Sum ' + frequency + ' ' + this.var_model.getNodeNames()[variable], sum_array);

        // Determine all valleys in the sum data. These should be kept > threshold
        valleys = findAllValleys(sum_array);

        if (valleys.length > 0) {
          valleys = findValleyInMean(sum_array, valleys, 5);
          if (variable === 0)
            console.log(valleys);
          minimum = findMinimum(selectionFromArray(sum_array, valleys));
        }

        if (minimum > 0) {
          temp_result[frequency] = options.threshold / minimum;
        } else {
          temp_result[frequency] = -1;
        }

      }

      result[this.var_model.getNodeNames()[variable]] = temp_result;
    }

    return result;
  };

  createAiraNetworkJson(data) {
    var self = this;
    var result = {
      "nodes": [],
      "links": []
    };
    var variable_mapping = this.var_model.getVariableMapping();
    data.forEach(function (entry) {
      result.nodes.push({
        "name": variable_mapping.get_value(entry.name),
        "key": entry.name,
        "val": entry.val,
        "type": variable_mapping.get_type(entry.name),
        "inverted": variable_mapping.get_type(entry.name) == 'Negatief' && self.convert_to_positive
      });
    });
    var edges = this.var_model.getSignificantEdges();
    edges.forEach(function (entry) {
      result.links.push({
        "weight": entry.coef,
        "distance": 0.9,
        "source": entry.source,
        "target": entry.target
      });
    });

    return result;
  };

  /**
   * PRIVATE METHODS
   */

  /**
   *
   * @param data
   * @param valleys
   * @param max_deviation
   * @returns {Array}
   */
  findValleyInMean(data, valleys, max_deviation) {
    var i, current;
    var res = [];
    var mean = average(selectionFromArray(data, valleys));
    for (i = 0; i < valleys.length; i++) {
      current = valleys[i];
      //console.log('data :' + data[current] + ', mean: ' + mean);
      if (Math.abs(mean - data[current]) < max_deviation) {
        res.push(current);
      }
    }
    return res;
  };

  /**
   *
   * @param options
   */
  getDegradationEffect(options) {
    var degradation_location = 'degradation';
    if (options.hasOwnProperty(degradation_location) && options[degradation_location].length == this.view_model.get_steps()) {
      console.log('Using degradation effect');
      return options[degradation_location];
    } else {
      console.log('NOT Using degradation effect');
      return makeFilledArray(this.view_model.get_steps(), 1);
    }
  };

}

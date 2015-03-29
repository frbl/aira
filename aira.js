var DEBUG = 0;

function Aira(impulse_response_calculator, var_model) {
    this.impulse_response_calculator = impulse_response_calculator;
    this.var_model = var_model;
}

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
Aira.prototype.determineOptimalNodeSimple = function (variable_to_improve, steps_ahead, optimizer) {
    var variable, irf, cumulative, cumulative_name, name;
    var result = {};
    cumulative = {};
    var effects = {};

    var consider_shocked_variable = false;

    if (DEBUG > 0) console.log('Determining best shock for variable ' + variable_to_improve + ' (out of ' + this.var_model.number_of_variables + ')');

    // Loop through all variables, and determine the impulse response of each variable on the variable to improve.
    for (variable = 0; variable < this.var_model.number_of_variables; variable++) {

        // Don't take into account direct effects on the shocked variable
        if (variable_to_improve == variable && !consider_shocked_variable) continue;

        name = this.var_model.node_names[variable];
        cumulative_name = name + '_cumulative';

        irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable, steps_ahead, 1));
        cumulative = cumulativeSummation(irf);

        result[name] = irf[variable_to_improve];
        result[cumulative_name] = cumulative[variable_to_improve];

        // TODO: Check if the variable is a negative one, if it is, the threshold should be a minimization
        // if(-NODE = "Negatief") cumulative *= -1;
        var airaOptimalVariableFinder = new AiraOptimalVariableFinder(result[name], result[cumulative_name]);
        effects[name] = airaOptimalVariableFinder.execute(optimizer);
    }

    if (DEBUG > -1) {
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
 *
 * @param variable_to_improve
 * @param steps_ahead
 * @param options
 * @returns {{}}
 */
Aira.prototype.determineOptimalNode = function (variable_to_improve, steps_ahead, options) {
    var variable, irf, valleys, i, temp_result, sum_array, irf_on_var, impulses, minimum, frequency, range, degradated_value;
    var result = {};
    var consider_shocked_variable = false;

    if (DEBUG > 0) console.log('Determining best shock for variable ' + variable_to_improve + ' (out of ' + this.var_model.number_of_variables + ')');


    var degradation_location = 'degradation';
    var degradation_effect = [];
    if (options.hasOwnProperty(degradation_location) && options[degradation_location].length == steps_ahead) {
        console.log('Using degradation effect');
        degradation_effect = options[degradation_location];
    } else {
        console.log('NOT Using degradation effect' + options[degradation_location].length);
        degradation_effect = makeFilledArray(steps_ahead, 1);
    }

    var impulse_response_strengths = makeSequenceArray(0.1, 0.1, 10);

    // Loop through all variables, and determine the impulse response of each variable on the variable to improve.
    for (variable = 0; variable < this.var_model.number_of_variables; variable++) {

        // Don't take into account direct effects on the shocked variable
        if (variable_to_improve == variable && !consider_shocked_variable) continue;

        temp_result = {};
        for (i = 0; i < impulse_response_strengths.length; i++) {
            irf = transpose(this.impulse_response_calculator.runImpulseResponseCalculation(variable, steps_ahead, impulse_response_strengths[i]));
            irf_on_var = irf[variable_to_improve];
            frequency = 0;
            minimum = -10000;

            while (minimum < options['threshold'] && frequency < steps_ahead) {
                impulses = [];
                /*
                 * If the frequency is 0, sum all IRFs on timstep 0. If it is not zero, each timestep should have a
                 * proportion of the IRFs, with regards to the frequency and the steps ahead. I.e., frequency = 0, all
                 * impulses are at time 0. Frequency is 1, the difference between all IRFs is 1
                 */
                range = (frequency == 0 ? steps_ahead : Math.floor(steps_ahead / frequency));

                for (j = 0; j < range; j++) {
                    // Add zero padding to all of the IRFs with regards to their position, to shift them
                    degradated_value = addPadding(irf_on_var, j * frequency, 0);

                    // Degrade subsequent responses (add a weight to the effect
                    degradated_value *= degradation_effect[j];

                    impulses.push(degradated_value);
                }

                sum_array = arraySum(impulses);

                // Determine all valleys in the sum data. These should be kept > threshold
                valleys = findAllValleys(sum_array);

                if (valleys.length > 0) {
                    valleys = this.findValleyInMean(sum_array, valleys, 10);
                    minimum = findMinimum(selectionFromArray(sum_array, valleys));
                }

                frequency++;
            }
            temp_result[impulse_response_strengths[i]] = frequency;

        }
        result[this.var_model.node_names[variable]] = temp_result;
    }
    console.log(result);
    return result;
};

/**
 *
 * @param data
 * @param valleys
 * @param max_deviation
 * @returns {Array}
 */
Aira.prototype.findValleyInMean = function (data, valleys, max_deviation) {
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


var Optimizers = (function () {
  return {
    thresholdOptimizer: function (irf, cumulative_irf, options) {
      var threshold_location = 'threshold';

      if (!options.hasOwnProperty(threshold_location)) {
        throw('The threshold option needs to be provided when using the threshold optimizer.');
      }

      if (DEBUG > 0) console.log('Optimization using Threshold optimizer (theta = ' + options[threshold_location] + ')');

      var intervals = [];
      var above_threshold = -1;
      for (i = 0; i < irf.length; i++) {
        if (irf[i] >= options[threshold_location] && above_threshold == -1) {
          above_threshold = i;
        }

        if (irf[i] < options[threshold_location] && above_threshold != -1) {
          intervals.push([above_threshold, i - 1]);
          above_threshold = -1;
        }
      }

      return intervals;
    },

    netEffectOptimizer: function (irf, cumulative_irf, options) {
      // IRF and Cumulative irf are here the effects a variable has on the variable to improve.
      var i, prev;
      var sign_switches = 0;
      var total = 0;

      // The number of steps
      var steps = cumulative_irf.length;

      // The cumulative effect the variable has on the variable to improve
      var net_effect = cumulative_irf[steps - 1];

      // If the effect is to extremely low, skip this variable, it is not suitable
      if (Math.abs(net_effect) < 0.01) return {
        net_effect: Infinity,
        sign_switches: Infinity,
        stability: Infinity,
        needed_difference: Infinity
      };

      // The average of the variable to improve should differ with x%.
      var needed_difference = options.variable_to_improve_summary.average * steps;
      needed_difference *= (options.wanted_increase / 100) * options.variable_summary.sd;

      // In order to induce this difference the current variable should differ with:
      // Which is x percentage of its average
      needed_difference /= options.variable_summary.average *  net_effect * options.variable_to_improve_summary.sd;

      return {
        needed_difference: needed_difference
      };
    },
    maximumValueOptimizer: function (irf, cumulative_irf, options) {
      if (DEBUG > 0) console.log('Optimization using Maximum optimizer.');
      return searchers.linearSearch(Math.max.apply(null, irf), irf);
    }
  };
})();

var FinderCommand = function (command, options) {
  this.options = options;
  this.execute = command;
};

var AiraOptimalVariableFinder = function (irf, cumulative_irf, variable_to_improve_summary, variable_summary, options) {
  return {
    execute: function (command) {
      options = options === undefined ? command.options : options;

      options.variable_to_improve_summary = variable_to_improve_summary;
      options.variable_summary = variable_summary;

      return command.execute(irf, cumulative_irf, options);
    }
  };
};

var ThresholdOptimizer = function (options) {
  return new FinderCommand(Optimizers.thresholdOptimizer, options);
};

var NetEffectOptimizer = function (options) {
  return new FinderCommand(Optimizers.netEffectOptimizer, options);
};

var MaximumValueOptimizer = function (options) {
  return new FinderCommand(Optimizers.maximumValueOptimizer, options);
};

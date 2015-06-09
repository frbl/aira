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
            var i, prev;
            var sign_switches = 0;
            var total = 0;
            var length = cumulative_irf.length;
            net_effect = cumulative_irf[length - 1];

            for (i = 0; i < length; i++) {
                console.log(i + " " + cumulative_irf);
                if (prev != undefined) {
                    if (sign(irf[i]) != sign(prev)) {
                        sign_switches++
                    }
                    total++;
                }
                prev = irf[i];
            }
            return {net_effect: net_effect, sign_switches: sign_switches, stability: 1 - (sign_switches / total)};
        },
        maximumValueOptimizer: function (irf, cumulative_irf, options) {
            if (DEBUG > 0) console.log('Optimization using Maximum optimizer.');
            return linearSearch(Math.max.apply(null, irf), irf);
        }
    }
})();


var FinderCommand = function (command, options) {
    this.options = options;
    this.execute = command;
};

var AiraOptimalVariableFinder = function (irf, cumulative_irf) {
    return {
        execute: function (command) {
            return command.execute(irf, cumulative_irf, command.options);
        }
    }
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

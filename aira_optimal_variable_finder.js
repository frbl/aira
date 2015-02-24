var thresholdOptimizer = function (options, irf, cumulative_irf) {
    var threshold_location = 'threshold';
    if(!options.hasOwnProperty(threshold_location)){
        throw('The threshold option needs to be provided when using the threshold optimizer.');
    }

    if (DEBUG > 0) console.log('Optimization using Threshold optimizer (theta = ' + options[threshold_location]+')');
    return linearSearch(options[threshold_location], cumulative_irf);
};

var maximumValueOptimizer = function (options, irf, cumulative_irf) {
    if (DEBUG > 0) console.log('Optimization using Maximum optimizer.');
    return linearSearch(Math.max.apply(null, irf), irf);
};

var longestSlopeOptimizer = function(options, irf, cumulative_irf) {

};
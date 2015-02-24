var thresholdOptimizer = function (options, irf, cumulative_irf) {
    var threshold_location = 'threshold';

    if(!options.hasOwnProperty(threshold_location)){
        throw('The threshold option needs to be provided when using the threshold optimizer.');
    }

    if (DEBUG > 0) console.log('Optimization using Threshold optimizer (theta = ' + options[threshold_location]+')');

    var intervals = [];
    var above_threshold = -1;
    for( i = 0 ; i < irf.length ; i++) {
        if(irf[i] >= options[threshold_location] && above_threshold == -1) {
            above_threshold = i;
        }

        if(irf[i] < options[threshold_location] && above_threshold != -1) {
            intervals.push([above_threshold, i -1]);
            above_threshold = -1;
        }
    }

    return intervals;
};

var maximumValueOptimizer = function (options, irf, cumulative_irf) {
    if (DEBUG > 0) console.log('Optimization using Maximum optimizer.');
    return linearSearch(Math.max.apply(null, irf), irf);
};

var longestSlopeOptimizer = function(options, irf, cumulative_irf) {

};
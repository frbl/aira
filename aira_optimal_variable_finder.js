function AiraOptimalVariableFinder(irf, cumulative_irf) {
    this.irf = irf;
    this.cumulative_irf = cumulative_irf;
}


AiraOptimalVariableFinder.prototype.thresholdOptimizer = function (options) {
    var threshold_location = 'threshold';

    if(!options.hasOwnProperty(threshold_location)){
        throw('The threshold option needs to be provided when using the threshold optimizer.');
    }

    if (DEBUG > 0) console.log('Optimization using Threshold optimizer (theta = ' + options[threshold_location]+')');

    var intervals = [];
    var above_threshold = -1;
    for( i = 0 ; i < this.irf.length ; i++) {
        if(this.irf[i] >= options[threshold_location] && above_threshold == -1) {
            above_threshold = i;
        }

        if(this.irf[i] < options[threshold_location] && above_threshold != -1) {
            intervals.push([above_threshold, i -1]);
            above_threshold = -1;
        }
    }

    return intervals;
};

var maximumValueOptimizer = function (options) {
    if (DEBUG > 0) console.log('Optimization using Maximum optimizer.');
    return linearSearch(Math.max.apply(null, this.irf), this.irf);
};

var longestSlopeOptimizer = function(options) {

};
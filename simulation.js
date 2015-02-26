var step = 0;

var run_simulation = function (irf, steps_to_run) {
    var shockdiv = $("#shock");

    clearSimulation();
    intervals.push(setInterval(function () {
        doAnimation(((step/steps_to_run)*steps_ahead));
        if (step == 0) shockdiv.show();
        else shockdiv.fadeOut("slow");

        var node_id;
        for (node_id in node_names) {
            if (node_names.hasOwnProperty(node_id)) {
                var value = (irf[node_id][step]) * 20;
                plotValue(node_names[node_id], value);
            }
        }
        step++;
        step %= steps_to_run;

    }, Math.floor(1000/60))); // run on 60 fps
    return true;
};

var resetNodes = function() {
    for (node_id in node_names) {
        if (node_names.hasOwnProperty(node_id)) {
            plotValue(node_names[node_id], 20);
        }
    }
};

var clearSimulation = function () {
    for (var i = 0; i < intervals.length; i++) clearTimeout(intervals[i]);
    step = 0;
    resetNodes();
};

var plotValue = function (node, value) {
    value = Math.abs(value);
    $('#netDynamisch').find('g .node').parent().find('#' + node).parent().children().attr('r', value)
};
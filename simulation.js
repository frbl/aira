function Simulation(node_names) {
    this.node_names = node_names;
    this.default_size = 20;
    this.size_factor = 50;
    this.frame_rate = 60;
    this.step = 0;
    this.intervals = [];
    this.use_absolute_value = false;
}

Simulation.prototype.run = function (clear_all) {
    if(clear_all) this.clear();
    this.intervals.push(setInterval((function (self) {
        return function () {
            self.simulateStep(1);
        }
    })(this), Math.floor(1000 / this.frame_rate)));
    return true;
};


Simulation.prototype.setIrf = function(irf) {
    this.irf = irf;
};

Simulation.prototype.setStepsToRun = function(steps_to_run) {
    this.steps_to_run = steps_to_run;
};

Simulation.prototype.simulateStep = function (direction) {
    var shockdiv = $("#shock");
    visualization_engine.setPlotlineLocation(((this.step / this.steps_to_run) * steps_ahead));
    if (this.step == 0) shockdiv.show();
    else shockdiv.fadeOut("slow");

    var node_id;
    for (node_id = 0; node_id < this.node_names.length; node_id++) {
        if (this.node_names.hasOwnProperty(node_id)) {
            var value = (this.irf[node_id][this.step]) * this.size_factor;

            this.plotValue(this.node_names[node_id], value);
        }
    }
    this.step += direction;
    this.step %= this.steps_to_run;
};

Simulation.prototype.resetNodes = function (nodes_to_stop) {
    var node;
    for (node in nodes_to_stop) {
        if (nodes_to_stop.hasOwnProperty(node)) {
            this.plotValue(nodes_to_stop[node], this.default_size);
        }
    }
};

Simulation.prototype.pause = function () {
    for (var i = 0; i < this.intervals.length; i++) clearTimeout(this.intervals[i]);
};

Simulation.prototype.clear = function () {
    this.pause();
    this.step = 0;
    this.resetNodes(this.node_names);
};

Simulation.prototype.plotValue = function (node, value) {
    var positive_class = "Positief";
    var negative_class = "Negatief";
    var network = $('#netDynamisch');

    if (!this.use_absolute_value) {
        var class_posneg = value >= 0 ? positive_class : negative_class;
        network.find('g .node').parent().find('#'+node).parent().children().first().attr("class", "node " + class_posneg)
    }

    value = isNaN(value) ? 0 : Math.abs(value);
    network.find('g .node').parent().find('#' + node).parent().children().attr('r', value)

};
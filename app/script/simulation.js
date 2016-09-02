var Simulation;

Simulation = (function () {
  var _node_names,
    _default_size,
    _size_factor,
    _frame_rate,
    _step,
    _intervals,
    _use_absolute_value,
    _var_model,
    _scaling_factor;

  function Simulation(var_model) {
    _var_model = var_model;
    _node_names = var_model.getNodeNames();
    _default_size = 20;
    _size_factor = 2;
    _scaling_factor = 0.5;
    _frame_rate = 60;
    _step = 0;
    _intervals = [];
    _use_absolute_value = true;
  }

  Simulation.prototype.run = function (clear_all) {
    if (clear_all) this.clear();
    _intervals.push(setInterval((function (self) {
      return function () {
        self.simulateStep(1);
      };
    })(this), Math.floor(1000 / _frame_rate)));
    return true;
  };


  Simulation.prototype.setIrf = function (irf) {
    _irf = irf;
  };

  Simulation.prototype.setStepsToRun = function (steps_to_run) {
    _steps_to_run = steps_to_run;
  };

  Simulation.prototype.simulateStep = function (direction) {
    visualization_engine.setPlotlineLocation(((_step / _steps_to_run) * view_model.get_steps()));
    visualization_engine.showShock(_step);

    var node_id, sd, average;
    for (node_id = 0; node_id < _node_names.length; node_id++) {
      node = _node_names[node_id];
      sd = _var_model.getDataSummary()[node].sd;
      average = _var_model.getDataSummary()[node].average * _scaling_factor;
      var value = average + (_irf[node_id][_step]) * sd * _size_factor;

      this._plotValue(_node_names[node_id], value);
    }
    _step += direction;
    _step %= _steps_to_run;
  };

  Simulation.prototype.pause = function () {
    for (var i = 0; i < _intervals.length; i++) clearTimeout(_intervals[i]);
  };

  Simulation.prototype.clear = function () {
    this.pause();
    _step = 0;
    this._resetNodes(_node_names);
  };

  /*
   * Private methods
   */
  Simulation.prototype._resetNodes = function (nodes_to_stop) {
    var node;
    var summary = _var_model.getDataSummary();
    for (node in nodes_to_stop) {
      if (nodes_to_stop.hasOwnProperty(node)) {
        this._plotValue(nodes_to_stop[node], summary[nodes_to_stop[node]].average  * _scaling_factor);
      }
    }
  };


  Simulation.prototype._plotValue = function (node, value) {
    // Convert node back to network node

    var positive_class = "Positief";
    var negative_class = "Negatief";

    var network = $('body');

    if (!_use_absolute_value) {
      var class_posneg = value >= 0 ? positive_class : negative_class;
      network.find('g .node').parent().find('#' + node).parent().children().first().attr("class", "node " + class_posneg);
      value = isNaN(value) ? 0 : Math.abs(value);
    } else {
      value = isNaN(value) ? 0 : value;
    }

    node = variable_mapping.get_network_id_from_value(variable_mapping.get_value(node));
    network.find('g .node').parent().find('#' + node).parent().children().attr('r', value);

  };


  return Simulation;
})();

var Simulation;

Simulation = (function () {
  var _node_names,
    _default_size,
    _size_factor,
    _frame_rate,
    _step,
    _intervals,
    _use_absolute_value;

  function Simulation(node_names) {
    _node_names = node_names;
    _default_size = 20;
    _size_factor = 50;
    _frame_rate = 60;
    _step = 0;
    _intervals = [];
    _use_absolute_value = false;
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
    var shockdiv = $("#shock");
    visualization_engine.setPlotlineLocation(((_step / _steps_to_run) * view_model.get_steps()));
    if (_step === 0) shockdiv.show();
    else shockdiv.fadeOut("slow");

    var node_id;
    for (node_id = 0; node_id < _node_names.length; node_id++) {
      var value = (_irf[node_id][_step]) * _size_factor;

      _plotValue(_node_names[node_id], value);
    }
    _step += direction;
    _step %= _steps_to_run;
  };

  Simulation.prototype.clear = function () {
    _pause();
    _step = 0;
    _resetNodes(_node_names);
  };

  /*
   * Private methods
   */
  var _resetNodes = function (nodes_to_stop) {
    var node;
    for (node in nodes_to_stop) {
      if (nodes_to_stop.hasOwnProperty(node)) {
        _plotValue(nodes_to_stop[node], _default_size);
      }
    }
  };

  var _pause = function () {
    for (var i = 0; i < _intervals.length; i++) clearTimeout(_intervals[i]);
  };

  var _plotValue = function (node, value) {
    // Convert node back to network node

    var positive_class = "Positief";
    var negative_class = "Negatief";

    var network = $('body');

    if (!_use_absolute_value) {
      var class_posneg = value >= 0 ? positive_class : negative_class;
      network.find('g .node').parent().find('#' + node).parent().children().first().attr("class", "node " + class_posneg);
    }

    value = isNaN(value) ? 0 : Math.abs(value);

    node = variable_mapping.get_network_id_from_value(variable_mapping.get_value(node));
    network.find('g .node').parent().find('#' + node).parent().children().attr('r', value);

  };

  // Expose private methods as _ variables, for testing.
  Simulation.prototype._pause = _pause;
  Simulation.prototype._resetNodes = _resetNodes;
  Simulation.prototype._plotValue = _plotValue;

  return Simulation;
})();

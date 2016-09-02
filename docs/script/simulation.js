"use strict";
class Simulation{

  constructor(var_model, visualization_engine) {
    this._var_model = var_model;
    this._node_names = var_model.getNodeNames();
    this._default_size = 20;
    this._size_factor = 2;
    this._scaling_factor = 0.5;
    this._frame_rate = 60;
    this._step = 0;
    this._intervals = [];
    this._use_absolute_value = true;
    this._visualization_engine = visualization_engine
  }

  run(clear_all) {
    if (clear_all) this.clear();
    this._intervals.push(setInterval((function (self) {
      return function () {
        self.simulateStep(1);
      };
    })(this), Math.floor(1000 / this._frame_rate)));
    return true;
  };

  update_advice(aira_advice) {
    this._visualization_engine.updateAdvice(aira_advice);
  }

  setIrf(irf) {
    this._irf = irf;
  };

  drawIrf(irf, bootstrapped_irf){
    this._visualization_engine.draw(irf, bootstrapped_irf);
  }

  setStepsToRun(steps_to_run) {
    this._steps_to_run = steps_to_run;
  };

  simulateStep(direction) {
    this._visualization_engine.setPlotlineLocation(((this._step / this._steps_to_run) * view_model.get_steps()));
    this._visualization_engine.showShock(this._step);

    var node_id, sd, average, node;
    for (node_id = 0; node_id < this._node_names.length; node_id++) {
      node = this._node_names[node_id];
      sd = this._var_model.getDataSummary()[node].sd;
      average = this._var_model.getDataSummary()[node].average * this._scaling_factor;
      var value = average + (this._irf[node_id][this._step]) * sd * this._size_factor;

      this._plotValue(this._node_names[node_id], value);
    }
    this._step += direction;
    this._step %= this._steps_to_run;
  };

  pause() {
    for (var i = 0; i < this._intervals.length; i++) clearTimeout(this._intervals[i]);
  };

  clear() {
    this.pause();
    this._step = 0;
    this._resetNodes(this._node_names);
  };

  /*
   * Private methods
   */
  _resetNodes(nodes_to_stop) {
    var node;
    var summary = this._var_model.getDataSummary();
    for (node in nodes_to_stop) {
      if (nodes_to_stop.hasOwnProperty(node)) {
        this._plotValue(nodes_to_stop[node], summary[nodes_to_stop[node]].average  * this._scaling_factor);
      }
    }
  };


  _plotValue(node, value) {
    // Convert node back to network node

    var positive_class = "Positief";
    var negative_class = "Negatief";

    var network = $('body');

    if (!this._use_absolute_value) {
      var class_posneg = value >= 0 ? positive_class : negative_class;
      network.find('g .node').parent().find('#' + node).parent().children().first().attr("class", "node " + class_posneg);
      value = isNaN(value) ? 0 : Math.abs(value);
    } else {
      value = isNaN(value) ? 0 : value;
    }

    node = variable_mapping.get_network_id_from_value(variable_mapping.get_value(node));
    network.find('g .node').parent().find('#' + node).parent().children().attr('r', value);

  };
}

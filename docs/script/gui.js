"use strict";
class Gui {
  constructor() {
    this._simulation = null;
    this._aira = null;
    this._irfCalculator = null;
  }

  set simulation(simulation) {
    if (this._simulation !== null && this._simulation !== undefined) this._simulation.clear();
    this._simulation = simulation;
  }

  set aira(aira) {
    this._aira = aira;
  }

  set irfCalculator(irfCalculator) {
    this._irfCalculator = irfCalculator
  }

  injectButtons(node_names) {
    this._injectSimulationFunctionality();
    var self = this;
    var location = $('#aira-buttons');
    location.html('');
    location.unbind();
    for (var i = 0; i < node_names.length; i++) {
      var node = node_names[i];
      var html = $('<input class="btn waves-effect waves-light button_' + node + '" name="' + node + '" type="button" value="' + variable_mapping.get_value(node) + '" id="button_' + node + '"/>');

      location.append(html);
      location.on("click", ".button_" + node, {
        current_id: i,
        current_node: node
      }, function (event) {
        var name = event.data.current_node;
        var myid = event.data.current_id;
        self._clickNode(name, myid);
      });
    }

    location.append($('<input class="btn waves-effect waves-light orange button_all" name="button_all" type="button" value="Shock ALL!" id="button_button_all"/>'));
    location.on("click", ".button_all", function () {
      self._clickNode('All', -1);
    });

    location.append($('<input class="btn waves-effect waves-light red  button_reset" name="button_reset" type="button" value="Reset" id="button_button_reset"/>'));
    location.on("click", ".button_reset", function () {
      self._simulation.clear();
    });

    location.append($('<input class="btn waves-effect waves-light blue-grey  button_optimize" name="button_optimize" type="button" value="Find optimal node" id="button_button_reset"/>'));
    location.on("click", ".button_optimize", function () {

      var netEffectOptimizer = new NetEffectOptimizer({
        wanted_increase: view_model.get_improvement()
      });

      var res = self._aira.determineBestNodeFromAll();
      self._drawTable(res);
      res = self._aira.createAiraNetworkJson(res);

      var bubbleChartVisualization = new BubbleChartVisualization(self._aira, netEffectOptimizer);
      bubbleChartVisualization.render();
    });
  };

  generateSelectOptions(from, to, stepsize, location) {
    var html = $(location);
    for (var i = from; i < to; i += stepsize) {
      html.append($("<option></option>")
        .attr("value", i)
        .text(roundToPlaces(i, 2)));
    }
    return html;
  };

  appendSelectOptions(data, location) {
    var html = $(location);
    for (var i = 0; i < data.length; i++) {
      html.append($("<option></option>")
        .attr("value", data[i])
        .text(data[i]));
    }
    return html;
  };

  _drawTable(res) {
    var html = '<ol>';
    for (var i = 0; i < res.length; i++) {
      html = html + '<li><strong>' + res[i].name + '</strong>: ' + res[i].val + '</li>';
    }
    html += '</ol>';
    $(".effect .content").html(html);
  };

  _injectSimulationFunctionality() {
    var self = this;
    var location = $('#simulation-buttons');

    location.on("click", ".button_pause", function () {
      self._simulation.pause();
    });
    location.on("click", ".button_play", function () {
      self._simulation.run();
    });
    location.on("click", ".button_next", function () {
      self._simulation.simulateStep(1);
    });
    location.on("click", ".button_previous", function () {
      self._simulation.simulateStep(-1);
    });
  };

  _clickNode(node_name_id, node_id) {
    if (DEBUG >= 1) console.log('Impulse given on: ' + node_name_id + ' (' + node_id + ')');
    var self = this;
    var irf = transpose(this._irfCalculator.runImpulseResponseCalculation(node_id, 1, view_model.get_steps()));
    var bootstrapped_irf;
    if (view_model.get_chk_bootstrap()) {
      var confidence = 0.95,
        iterations = view_model.get_bootstrap_iterations(),
        shock_size = 1;

      bootstrapped_irf = this._irfCalculator.bootstrappedImpulseResponseCalculation(node_id, shock_size,
        view_model.get_steps(),
        iterations, confidence);
    }

    this._simulation.drawIrf(irf, bootstrapped_irf);

    irf = transpose(this._irfCalculator.runImpulseResponseCalculation(node_id, 1, view_model.get_steps()));
    irf = linearInterpolation(irf, view_model.get_interpolation());

    var interpolation = view_model.get_interpolation() === 0 ? 1 : view_model.get_interpolation();
    this._simulation.setStepsToRun(view_model.get_steps() * interpolation);
    this._simulation.setIrf(irf);
    this._simulation.run(true);

    if (node_id != -1) {
      var thresholdOptimizer = new ThresholdOptimizer({
        threshold: view_model.get_threshold()
      });

      if ($('#chk-threshold').prop('checked'))
        self._simulation.update_advice(self._aira.determineOptimalNodeSimple(node_id, thresholdOptimizer));

      if ($('#chk-frequency').prop('checked'))
        self._aira.determineOptimalNode(node_id, {
          degradation: [],
          threshold: view_model.get_threshold()
        });
    }
  };
}

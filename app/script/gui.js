var Gui;

Gui = (function () {
  "use strict";

  var _simulation;

  function Gui() {

  }

  Gui.prototype.setSimulation = function(simulation) {
    this._simulation = simulation;
  };

  Gui.prototype.injectButtons = function (node_names) {
    _injectSimulationFunctionality();
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
        _clickNode(name, myid);
      });
    }

    location.append($('<input class="btn waves-effect waves-light orange button_all" name="button_all" type="button" value="Shock ALL!" id="button_button_all"/>'));
    location.on("click", ".button_all", function () {
      _clickNode('All', -1);
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

      var res = aira.determineBestNodeFromAll();
      _drawTable(res);
      res = aira.createAiraNetworkJson(res);

      var bubbleChartVisualization = new BubbleChartVisualization(aira, netEffectOptimizer);
      bubbleChartVisualization.render();
    });
  };

  Gui.prototype.generateSelectOptions = function (from, to, stepsize, location) {
    var html = $(location);
    for (var i = from; i < to; i += stepsize) {
      html.append($("<option></option>")
        .attr("value", i)
        .text(roundToPlaces(i, 2)));
    }
    return html;
  };

  Gui.prototype.appendSelectOptions = function (data, location) {
    var html = $(location);
    for (var i = 0; i < data.length; i++) {
      html.append($("<option></option>")
        .attr("value", data[i])
        .text(data[i]));
    }
    return html;
  };

  var _drawTable = function (res) {
    var html = '<ol>';
    for (var i = 0; i < res.length; i++) {
      html = html + '<li><strong>' + res[i].name + '</strong>: ' + res[i].val + '</li>';
    }
    html += '</ol>';
    $(".effect .content").html(html);
  };

  var _injectSimulationFunctionality = function () {
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

  var _clickNode = function (node_name_id, node_id) {
    if (DEBUG >= 1) console.log('Impulse given on: ' + node_name_id + ' (' + node_id + ')');

    var irf = transpose(impulse_response_calculator.runImpulseResponseCalculation(node_id, 1, view_model.get_steps()));
    var bootstrapped_irf;
    if (view_model.get_chk_bootstrap()) {
      var confidence = 0.95,
        iterations = view_model.get_bootstrap_iterations(),
        shock_size = 1;

      bootstrapped_irf = impulse_response_calculator.bootstrappedImpulseResponseCalculation(node_id, shock_size,
        view_model.get_steps(),
        iterations, confidence);
    }

    visualization_engine.draw(irf, bootstrapped_irf);

    irf = transpose(impulse_response_calculator.runImpulseResponseCalculation(node_id, 1, view_model.get_steps()));
    irf = linearInterpolation(irf, view_model.get_interpolation());

    var interpolation = view_model.get_interpolation() === 0 ? 1 : view_model.get_interpolation();
    this._simulation.setStepsToRun(view_model.get_steps() * interpolation);
    this._simulation.setIrf(irf);
    this._simulation.run(true);

    if (node_id != -1) {
      var thresholdOptimizer = new ThresholdOptimizer({
        threshold: view_model.get_threshold()
      });
      var netEffectOptimizer = new NetEffectOptimizer({
        wanted_increase: view_model.get_improvement()
      });

      if ($('#chk-threshold').prop('checked'))
        visualization_engine.updateAdvice(aira.determineOptimalNodeSimple(node_id, thresholdOptimizer));

      if ($('#chk-stability').prop('checked'))
        visualization_engine.updateNetEffect(aira.determineOptimalNodeSimple(node_id, netEffectOptimizer), node_name_id);

      if ($('#chk-frequency').prop('checked'))
        aira.determineOptimalNode(node_id, {
          degradation: [],
          threshold: view_model.get_threshold()
        });
    }

  };

  return Gui;
})();

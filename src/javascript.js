var injectButtons = function (node_names) {
  injectSimulationFunctionality();
  var location = $('#aira-buttons');
  location.html('');
  location.unbind();
  for (var i = 0; i < node_names.length; i++) {
    var node = node_names[i];
    var html = $('<input class="button light button_' + node + '" name="' + node + '" type="button" value="' + variable_mapping.get_value(node) + '" id="button_' + node + '"/>');

    location.append(html);
    location.on("click", ".button_" + node, {current_id: i, current_node: node}, appendNodeClick(event));
  }

  location.append($('<input class="button red button_all" name="button_all" type="button" value="Shock ALL!" id="button_button_all"/>'));
  location.on("click", ".button_all", function () {
    clickNode('All', -1);
  });

  location.append($('<input class="button green button_reset" name="button_reset" type="button" value="Reset" id="button_button_reset"/>'));
  location.on("click", ".button_reset", function () {
    simulation.clear();
  });

  location.append($('<input class="button dark button_optimize" name="button_optimize" type="button" value="Find optimal node" id="button_button_reset"/>'));
  location.on("click", ".button_optimize", function () {
    var res = aira.determineBestNodeFromAll();
    render(res);
    //var html = '<ol>';
    //for( var i = 0 ; i < res.length ; i++ ) {
    //    html = html + '<li><strong>'+ res[i].name + '</strong>: '+ res[i].val + '</li>';
    //}
    //html += '</ol>';
    //$(".effect .content").html(html);
  });

};

var appendNodeClick = function(event){
  var name = event.data.current_node;
  var myid = event.data.current_id;
  clickNode(name, myid);
};

var injectSimulationFunctionality = function () {
  var location = $('#simulation-buttons');

  location.on("click", ".button_pause", function () {
    simulation.pause();
  });
  location.on("click", ".button_play", function () {
    simulation.run();
  });
  location.on("click", ".button_next", function () {
    simulation.simulateStep(1);
  });
  location.on("click", ".button_previous", function () {
    simulation.simulateStep(-1);
  });
};


var generateSelectOptions = function (from, to, stepsize, location) {
  html = $(location);
  for (i = from; i < to; i += stepsize) {
    html.append($("<option></option>")
                .attr("value", i)
                .text(roundToPlaces(i, 2)));
  }
  return html;
};

var appendSelectOptions = function (data, location) {
  html = $(location);
  for (i = 0; i < data.length; i++) {
    html.append($("<option></option>")
                .attr("value", data[i])
                .text(data[i]));
  }
  return html;
};

var convertNumberToText = function (number) {
  if (number < 1) return 'very few';
  if (number > 20) return 'alot of';
  return {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty"
  }[number];
};


var clickNode = function (node_name_id, node_id) {
  if (DEBUG >= 1) console.log('Impulse given on: ' + node_name_id + ' (' + node_id + ')');

  console.log(node_id + " < id and name > " + node_name_id);
  var irf = transpose(impulse_response_calculator.runImpulseResponseCalculation(node_id, 1));
  visualization_engine.draw(irf);

  irf = linearInterpolation(irf, view_model.get_interpolation());

  var interpolation = view_model.get_interpolation() == 0 ? 1 : view_model.get_interpolation();
  simulation.setStepsToRun(view_model.get_steps() * interpolation);
  simulation.setIrf(irf);
  simulation.run(true);

  if (node_id != -1) {
    var thresholdOptimizer = new ThresholdOptimizer({threshold: view_model.get_threshold()});
    var netEffectOptimizer = new NetEffectOptimizer({wanted_increase: view_model.get_improvement()});

    if ($('#chk-threshold').prop('checked'))
      visualization_engine.updateAdvice(aira.determineOptimalNodeSimple(node_id, thresholdOptimizer));

    if ($('#chk-stability').prop('checked'))
      visualization_engine.updateNetEffect(aira.determineOptimalNodeSimple(node_id, netEffectOptimizer), node_name_id);

    if ($('#chk-frequency').prop('checked'))
      aira.determineOptimalNode(node_id, {
        degradation: [],
        threshold: view_model.get_threshold()
      })

  }

};


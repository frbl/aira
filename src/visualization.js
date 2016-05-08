function Visualization(node_names) {
  this.node_names = node_names;
  this.chart = {};
}

Visualization.prototype.updateAdvice = function (effects) {
  var result = $(".aira-result").find('.advice .content');
  var number_of_measurements_per_day = 1;
  var number_of_options = 0;


  var html = '<ol>';
  var i, current;
  for (var effect in effects) {
    if (effects.hasOwnProperty(effect)) {
      number_of_options += effects[effect].length;

      for (i = 0; i < effects[effect].length; i++) {
        current = effects[effect][i];
        var length = current[1] - current[0];
        var when = current[1] - (length);

        html += ('<li>You could increase your level of ' + effect + ', every ' + (when / number_of_measurements_per_day).toFixed(1) + ' measurement moments. This has an effect that lasts for ' + (length / number_of_measurements_per_day).toFixed(2) + ' days </li>');
      }
    }
  }

  if (number_of_options > 0) {
    result.html("<p>If you would like to increase the variable you just clicked, you can do " + convertNumberToText(number_of_options) + " thing" + (number_of_options == 1 ? '' : 's') + ":</p>");
    result.append(html + '</ol>');
  }
};


Visualization.prototype.updateNetEffect = function (effects, variable_id_to_improve) {
  var number_of_options = 0;

  var result = $(".aira-result").find('.effect .content');
  result.html('');
  var current, text;
  var html = '<ol>';

  for (var effect in effects) {
    if (effects.hasOwnProperty(effect)) {
      current = effects[effect].needed_difference * 100;
      //if(current > 100) continue;
      text = current > 0 ? 'increase' : 'decrease';
      text = ('<li>You could ' + text + ' your average amount of ' + effect + ' with ' + Math.abs(current.toFixed(0)) + '%</li>');

      number_of_options += 1;
      html += text;

    }
  }
  result.append("<p>If you would like to change the '" + variable_mapping.get_value(variable_id_to_improve) + "'-variable with " + view_model.get_improvement() + "%, you can do " + convertNumberToText(number_of_options) + " thing" + (number_of_options == 1 ? '' : 's') + ":</p>");
  result.append(html + '</ol>');

};


Visualization.prototype._addPlotLine = function (x_value) {
  this.chart.xAxis[0].addPlotLine({
    value: x_value,
    color: 'rgb(255, 0, 0)',
    width: 1,
    id: 'plot_line'
  });
};

Visualization.prototype._removePlotLine = function () {
  this.chart.xAxis[0].removePlotLine('plot_line');
};

Visualization.prototype.setPlotlineLocation = function (x_value) {
  //this._removePlotLine();
  //this._addPlotLine(x_value);
};


Visualization.prototype.addData = function (name, data) {
  // find the clicked values and the series
  this.chart.addSeries({
    name: name,
    data: data,
    visible: false
  });
};

Visualization.prototype.draw = function (transposed_irf, bootstrapped_irf) {
  var i;
  var series_var = [];

  var low,
    high;
  if (bootstrapped_irf !== undefined) {
    low = transpose(bootstrapped_irf.low);
    high = transpose(bootstrapped_irf.high);
  }

  for (i = 0; i < transposed_irf.length; i++) {
    series_var.push({
      name: variable_mapping.get_translation(this.node_names[i]),
      data: transposed_irf[i],
      visible: true
    });

    if (bootstrapped_irf !== undefined) {
      series_var.push({
        name: variable_mapping.get_translation(this.node_names[i]) + " error",
        type: 'areasplinerange',
        data: _.zip(low[i], high[i]),
        visible: true
      });
    }
  }

  //this.chart = new Highcharts.Chart({
    //chart: {
      //renderTo: 'container',
      //type: 'spline'
    //},
    //plotOptions: {
      //series: {
        //marker: {
          //enabled: false
        //}
      //}
    //},

    //title: {
      //text: 'Impulse response graph',
      //x: -20 //center
    //},
    //subtitle: {
      //text: 'Calculated using AIRA',
      //x: -20
    //},
    //credits: {
      //enabled: false
    //},
    //xAxis: {
      //allowDecimals: false,
      //minTickInterval: 1,
      //maxTickInterval: 1,
      //title: {
        //text: 'Horizon (time steps)'
      //}
    //},
    //yAxis: {
      //title: {
        //text: 'Response (Y<sub>t</sub> - d)'
      //},
      //plotLines: [{
        //value: 0,
        //width: 1,
        //color: '#808080'
      //}]
    //},
    //series: series_var
  //});
};

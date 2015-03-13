function Visualization(node_names) {
    this.node_names = node_names;
    this.chart = {};
}

Visualization.prototype.updateAdvice = function (effects) {
    var result = $(".result").find('.advice .content');
    var number_of_measurements_per_day = 1;
    var number_of_options = 0;


    var html = '<ol>';
    var i, current;
    for (effect in effects) {
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


Visualization.prototype.updateNetEffect = function (effects) {
    var number_of_neg_options = 0;
    var number_of_pos_options = 0;
    var result = $(".result").find('.effect .content');
    result.html('');
    var current, text;
    var positive_html = '<ol>';
    var negative_html = '<ol>';
    for (effect in effects) {
        if (effects.hasOwnProperty(effect) && effects[effect].net_effect != 0) {
            current = effects[effect].net_effect;
            text = ('<li>You could increase your level of ' + effect + '. This has a net-effect of ' + current.toFixed(2) + '</li>');
            if (Math.sign(current) > 0) {
                number_of_pos_options += 1;
                positive_html += text
            } else {
                number_of_neg_options += 1;
                negative_html += text
            }
        }
    }
    if (number_of_pos_options > 0) {
        result.append("<p>If you would like to <strong>increase</strong> the variable you just clicked, you can do " + convertNumberToText(number_of_pos_options) + " thing" + (number_of_pos_options == 1 ? '' : 's') + ":</p>");
        result.append(positive_html + '</ol>');
    }
    if (number_of_neg_options > 0) {
        result.append("<p>If you would like to <strong>decrease</strong> the variable you just clicked, you can do " + convertNumberToText(number_of_neg_options) + " thing" + (number_of_neg_options == 1 ? '' : 's') + ":</p>");
        result.append(negative_html + '</ol>');
    }
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
    this._removePlotLine();
    this._addPlotLine(x_value);
};

Visualization.prototype.draw = function (transposed_irf) {
    var i;
    var series_var = [];
    for (i = 0; i < transposed_irf.length; i++) {
        series_var.push({
            name: this.node_names[i],
            data: transposed_irf[i]
        })
    }

    this.chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container'
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },

        title: {
            text: 'Impulse response',
            x: -20 //center
        },
        subtitle: {
            text: 'Calculated using AIRA',
            x: -20
        },
        credits: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Response'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        series: series_var
    });
};
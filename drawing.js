var chart;

var update_best = function (effects) {
    var result = $(".result");
    var number_of_measurements_per_day = 3;
    var number_of_options = 0;
    for(effect in effects) {
        if(effects.hasOwnProperty(effect)) {
            number_of_options += effects[effect].length;
        }
    }

    result.html("<p>If you would like to increase the variable you just clicked, you can do " + convertNumberToText(number_of_options) + " thing"+(number_of_options == 1 ? '' : 's') +":</p>");

    var html = '<ol>';
    var i, current;
    for(effect in effects) {
        if(effects.hasOwnProperty(effect)) {
            for(i = 0 ; i < effects[effect].length ; i++ ){
                current = effects[effect][i];
                var length = current[1]-current[0];
                var when = current[1] - (length);

                html += ('<li>You could increase your level of '+ effect +', every ' + (when/number_of_measurements_per_day).toFixed(2) +' days. This has an effect that lasts for '+ (length/number_of_measurements_per_day).toFixed(2) + ' days </li>');
            }
        }
    }

    result.append(html + '</ol>');
};


var addPlotLine = function(x_value) {
    chart.xAxis[0].addPlotLine({
        value: x_value,
        color: 'rgb(255, 0, 0)',
        width: 1,
        id: 'plot_line'
    });
};

var removePlotLine = function () {
    chart.xAxis[0].removePlotLine('plot_line');
};

var doAnimation = function(x_value) {
    removePlotLine();
    addPlotLine(x_value);
};

var redraw = function(transposed_irf) {
     chart = new Highcharts.Chart({
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
        series: [{
            name: "e",
            data: transposed_irf[0]
        }, {
            name: 'prod',
            data: transposed_irf[1]
        }, {
            name: 'rw',
            data: transposed_irf[2]
        }, {
            name: 'U',
            data: transposed_irf[3]
        }]
    });
};
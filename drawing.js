var update_best = function (best) {
    var result = $(".result");
    result.html("<p>Best nodes: </p>");
    for (var optimizer= 0 ; optimizer < best.length ; optimizer++) {
        keys = getSortedKeys(best[optimizer]);
        var key, html;
        html = 'Result '+ optimizer + ' <ol>';
        for (key in keys) {
            if (keys.hasOwnProperty(key)) {
                html += ('<li> <strong>' + keys[key] + '</strong>, at timestep: ' + best[optimizer][keys[key]] + '</li>');
            }
        }
        result.append(html + '</ol>');
    }
};

var redraw = function (transposed_irf) {
    $('#container').highcharts({
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
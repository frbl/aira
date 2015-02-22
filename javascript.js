var node_values = {};

var_coefficients = [[1.7882516, 0.1949013, -0.084094128, 0.11716910, -1.2175403, -0.1011495, -0.004600462, -0.21240047, 0.4607406, -0.043924025, -0.00170015, 0.27501572, -0.05340928, 0.007395215, 0.08565463, -0.1871212],
    [-0.1434025, 1.1777061, 0.051717609, -0.72341422, -0.1856313, -0.1827150, -0.223365088, 0.65999277, 0.4372010, 0.049277377, 0.08473083, 0.50693900, -0.09505128, -0.070681395, 0.08362111, -0.4105609],
    [-0.5635340, -0.1032722, 0.868404043, 0.06140683, 0.7605549, -0.1631870, -0.106785400, -0.45862230, -0.4438344, 0.269430102, -0.02312552, -0.09951292, 0.31046631, -0.086729273, 0.21139926, 0.2803912],
    [-0.7296624, -0.1348578, 0.005928757, 0.57157062, 0.6387346, 0.1178550, 0.053104567, 0.03745348, -0.1017310, -0.001811418, -0.03468194, 0.08797242, 0.19575410, 0.020053093, -0.02997414, 0.2349770]];
var lags = 4;
var steps_ahead = 50;


var update_node = function (node) {
    node_values[node] = node_values[node] + 0.2
    value = Math.sin(node_values[node]) * 10 + 10
    //console.log(node)
    $('#netDynamisch g .node').parent().find('#' + node).parent().children().attr('r', value)
};

var intervals = [];

var inject_buttons = function () {
    nodes = $('#netDynamisch g .node')

    var location = $('#netGelijk');
    location.html('');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        node_values[node.id] = 10;

        var html = $('<input class="button light button_' + node.id + '" name="' + node.id + '" type="button" value="' + node.id + '" id="button_' + node.id + '"/>');
        location.append(html);

        location.on("click", ".button_" + node.id, {current_id: i, current_node: node.id}, function (event) {
            var name = event.data.current_node;
            var myid = event.data.current_id;
            irf = runImpulseResponseCalculation(var_coefficients, i, lags, steps_ahead);
            redraw(transpose(irf));
            //intervals.push(setInterval(function () {
            //    update_node(name);
            //}, 100));
            console.log('clicked!' + name + ' ' + myid);
        });
    }
    console.log(node_values)
};

var redraw = function(transposed_irf) {
    labels = [];
    var i = 0;
    for( i = 0 ; i < steps_ahead; i++) {
        labels.push(i);
    }

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
        xAxis: {
            categories: labels
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'e',
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
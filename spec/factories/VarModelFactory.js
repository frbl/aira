var fabricateVarModel = function (make_positive) {
    var var_coefficients = [
        [
            [-0.0366, -0.1773, -0.9122, 0.2478, 0.3648, 0.1045],
            [-0.1724, -0.0669, -1.0035, 0.1977, 0.1498, -0.1872],
            [0.204, -0.0269, 0.5721, -0.0842, -0.0074, 0.1198],
            [-0.1385, -0.0772, -1.1145, 0.1877, 0.1151, -0.1512],
            [0.4768, 0.0789, 1.5165, -0.0319, 0.1546, 0.186],
            [-0.1821, 0.1159, -0.7114, 0.0655, 0.0649, -0.1424]
        ],
        [ // Synthetic lag2 model
            [0.5, 0, 0, 0, 0, 0],
            [0, 0.5, 0, 0, 0, 0],
            [0, 0, 0.5, 0, 0, 0],
            [0, 0, 0, 0.5, 0, 0],
            [0, 0, 0, 0, 0.5, 0],
            [0, 0, 0, 0, 0, 0.5]
        ]
    ];

    var exo_value = 0.1;

    var exogen_var_coefficients = createMatrix(exo_value, 3, 7, false);

    var y_values = [
        makeFilledArray(6, 1),
        makeFilledArray(6, 2),
        makeFilledArray(6, 3),
        makeFilledArray(6, 4),
        makeFilledArray(6, 5),
        makeFilledArray(6, 6),
        makeFilledArray(6, 7),
        makeFilledArray(6, 8)
    ];
    var exogen_values = [
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0)
    ];

    var node_names = ["uw_eigen_factor", "opgewektheid", "onrust", "concentratie", "piekeren", "eigenwaarde"];
    var exogen_names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var significant_network = fabricateHoegekisSignificantNetwork;
    var variable_mapping = new VariableMapping();

    return new VarModel(
        var_coefficients, exogen_var_coefficients,
        node_names, exogen_names,
        y_values, exogen_values,
        significant_network,
        make_positive,
        variable_mapping
    );
};

var fabricateSimpleVarModel = function () {
    var node_names = ['onrust', 'concentratie'];
    var coeff = createMatrix(0, 2, 2, false);
    coeff[0][1] = 0.5;
    coeff[1][0] = 0.3;

    var y_values = createMatrix(3, 10, 2, false);


    var significant_network = {
        "links": [{
            "source": 0,
            "target": 1,
            "coef": "0.5"
        }, {
            "source": 0,
            "target": 0,
            "coef": "0.2"
        }],
        "nodes": [{
            "index": 0,
            "name": node_names[0],
            "type": "Negatief"
        }, {
            "index": 1,
            "name": node_names[1],
            "type": "positifief"
        }]
    };

    return new VarModel(
        [coeff], [coeff],
        node_names, node_names,
        y_values, y_values,
        significant_network,
        false,
        fabricateVariableMapping()
    );
};

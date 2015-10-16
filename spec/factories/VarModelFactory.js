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

var fabricateRealP1Model = function (make_positive) {

    var var_coefficients = [
        [
            [0.4631281, 0.0000000],
            [-0.1777797, 0.372456]
        ],
        [
            [0.2471793, 0],
            [0, 0.1101666]
        ]
    ];

    var exogen_var_coefficients = [
        [
            [2.22633, 0.0000000, -7.198482],
            [-7.49279, -7.462984, -5.377515]
        ]
    ];


    var y_values = [
        [6.3015, 15],
        [3, 11],
        [4, 12],
        [2.3948, 5],
        [3, 12],
        [6.5, 13],
        [7, 16],
        [6.5, 15],
        [7, 16],
        [7, 15],
        [7, 14],
        [7, 15],
        [0, 8],
        [5.7269, 15],
        [7, 13],
        [7, 12],
        [7, 13],
        [6, 10],
        [7, 13],
        [6, 11],
        [6.5, 9],
        [6.5, 10],
        [4, 15],
        [5.5, 15],
        [5.5, 14],
        [5, 12],
        [7, 10],
        [5.5, 11],
        [6.5, 10],
        [7, 12],
        [7.3333, 11],
        [9.6667, 13],
        [12, 7],
        [10.8583, 8],
        [10, 8],
        [9, 11],
        [9.6667, 8],
        [9.6667, 8],
        [12, 10],
        [8.8333, 11],
        [10, 15],
        [13, 13],
        [8, 11],
        [10.3333, 11],
        [10.3333, 11],
        [9, 14],
        [8.5, 15],
        [11, 12],
        [11.5, 11],
        [9, 12],
        [9.5, 14],
        [6.8333, 13],
        [7.5, 13],
        [7, 13],
        [7, 11],
        [5, 15],
        [5.5, 13],
        [7.596, 12],
        [8, 12],
        [8, 12],
        [8.3333, 12],
        [12.3333, 11],
        [6.1667, 12],
        [7.6667, 12],
        [7.191, 12],
        [8, 11],
        [7.3333, 12],
        [7.5, 11],
        [8, 10],
        [7, 12],
        [8, 11],
        [6, 11],
        [4.5, 12],
        [6, 11],
        [5, 12],
        [5, 12],
        [6, 11],
        [6.7277, 9],
        [6.6667, 11],
        [4.5, 11],
        [5.8333, 12],
        [5.5833, 11],
        [5.5, 10],
        [5, 11],
        [8.0844, 10]
    ];
    var exogen_values = [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0]
    ];

    var node_names = ["SomBewegUur", "SomBewegUur"];
    var exogen_names = ['const', 'UitbijterPHQ', 'UitbijterBeweg'];
    var significant_network = {
        "links": [
            {
                "source": 0,
                "target": 1,
                "coef": "-0.177779650515062"
            }
        ],
        "nodes": [
            {
                "index": 0,
                "name": "SomBewegUur",
                "type": "Neutraal"
            },
            {
                "index": 1,
                "name": "SomPHQ",
                "type": "Neutraal"
            }
        ]
    };
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

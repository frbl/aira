var fabricateVarModel = function(make_positive) {
  var var_coefficients = [
    [
      [-0.0366, -0.1773, -0.9122, 0.2478, 0.3648, 0.1045],
      [-0.1724, -0.0669, -1.0035, 0.1977, 0.1498, -0.1872],
      [0.204, -0.0269, 0.5721, -0.0842, -0.0074, 0.1198],
      [-0.1385, -0.0772, -1.1145, 0.1877, 0.1151, -0.1512],
      [0.4768, 0.0789, 1.5165, -0.0319, 0.1546, 0.186],
      [-0.1821, 0.1159, -0.7114, 0.0655, 0.0649, -0.1424],
    ],
    [ // Synthetic lag2 model
      [0.5,0,0,0,0,0],
      [0,0.5,0,0,0,0],
      [0,0,0.5,0,0,0],
      [0,0,0,0.5,0,0],
      [0,0,0,0,0.5,0],
      [0,0,0,0,0,0.5]
    ]
  ];
  var node_names = ["uw_eigen_factor", "opgewektheid", "onrust", "concentratie", "piekeren", "eigenwaarde"];
  var data_summary = {"concentratie": {"average": 60.235324719101094, "sd": 17.194537251057916},
    "eigenwaarde": {"average": 58.30297303370786, "sd": 15.680453245165141},
  "onrust": {"average": 20.381912359550572, "sd": 12.398013589526974},
  "opgewektheid": {"average": 51.40226292134832, "sd": 17.525381582172997},
  "piekeren": {"average": 30.370144943820215, "sd": 21.026483020926744},
  "uw_eigen_factor": {"average": 48.0996213483146, "sd": 20.143308648488937}};

  var variable_mapping = new VariableMapping();

  return new VarModel(var_coefficients, node_names, data_summary, make_positive,variable_mapping);
};

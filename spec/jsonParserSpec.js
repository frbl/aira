describe("JsonParser", function() {
  describe("Constructor", function() {
    it('sets the correct data', function() {
      var data = ['varmodel'];
      var variable_mapping = fabricateVariableMapping();
      var json_parser = new JsonParser(data, variable_mapping);
      expect(json_parser.data).toBe(data);
      expect(json_parser.variable_mapping).toBe(variable_mapping);
    });
  });

  describe("with json parser", function() {
    var variable_mapping, network, json_parser;
    beforeEach(function () {
      variable_mapping = fabricateVariableMapping();
      network = fabricateFullNetworkData();
      json_parser = new JsonParser(network, variable_mapping );
    });

    describe("hgiNetworkDataToMatrix", function() {
      it('create a correct matrix from the network', function() {
        var result = json_parser.hgiNetworkDataToMatrix();
        var expected = [
          [0,0,0.204012838378178,0,0.476770360677939,0],
          [0,0,0,0,0,0],
          [-0.912167492997933,-1.00352833453079,0,-1.11448061044475,1.51648675179484,-0.711390503855866],
          [0,0,0,0,0,0],
          [0.36475504504839,0,0,0,0,0],
          [0,0,0,0,0,0],
        ];
        expect(result).toEqual(expected);
      });
    });

    describe("dataSummaryFromJson", function() {
      it('can give a datasummary based on a set of node_names', function() {
        var values = [
          [ 18, 13, 47, 33, 67, 32 ],
          [ 32, 41, 90, 90, 10, 84 ]
        ];

        var data = [
          network[0],0,0,
          { "data": {
            "body": values,
            "header": [
              "uw_eigen_factor",
              "opgewektheid",
              "onrust",
              "concentratie",
              "piekeren",
              "eigenwaarde"
            ]
          }
          }
        ];
        json_parser = new JsonParser(data, variable_mapping);
        var node_names = json_parser.nodeKeysFromJson();
        var result = json_parser.dataSummaryFromJson(node_names);
        var expected =
          {
          "uw_eigen_factor": {"average":(values[0][0] + values[1][0])/2, "sd": standardDeviation([values[0][0] , values[1][0]],(values[0][0] + values[1][0])/2)},
          "opgewektheid": {"average":(values[0][1] + values[1][1])/2, "sd": standardDeviation([values[0][1] , values[1][1]],(values[0][1] + values[1][1])/2)},
          "onrust":{"average":(values[0][2] + values[1][2])/2, "sd": standardDeviation([values[0][2] , values[1][2]],(values[0][2] + values[1][2])/2)},
          "concentratie":{"average":(values[0][3] + values[1][3])/2, "sd": standardDeviation([values[0][3] , values[1][3]],(values[0][3] + values[1][3])/2)},
          "piekeren":{"average":(values[0][4] + values[1][4])/2, "sd": standardDeviation([values[0][4] , values[1][4]],(values[0][4] + values[1][4])/2)},
          "eigenwaarde":{"average":(values[0][5] + values[1][5])/2, "sd": standardDeviation([values[0][5] , values[1][5]],(values[0][5] + values[1][5])/2)},
          "significant_network":network[0]
        };
        expect(result).toEqual(expected);
      });

    });

    describe("nodeKeysFromJson", function() {
      it('can generate a list of node ids from a json file', function() {
        var expected = [
              "uw_eigen_factor",
              "opgewektheid",
              "onrust",
              "concentratie",
              "piekeren",
              "eigenwaarde"
            ] ;
        var result = json_parser.nodeKeysFromJson();
        expect(result).toEqual(expected);
      });
    });

    describe("fullNetworkDataToMatrix", function() {
      it("returns the full network data matrix", function() {
        var node_names = json_parser.nodeKeysFromJson();
        var expected = [[
          [-0.0366,-0.1773,-0.9122,0.2478,0.3648,0.1045],
          [-0.1724,-0.0669,-1.0035,0.1977,0.1498,-0.1872],
          [0.204,-0.0269,0.5721,-0.0842,-0.0074,0.1198],
          [-0.1385,-0.0772,-1.1145,0.1877,0.1151,-0.1512],
          [0.4768,0.0789,1.5165,-0.0319,0.1546,0.186],
          [-0.1821,0.1159,-0.7114,0.0655,0.0649,-0.1424],
        ]];
        var result = json_parser.fullNetworkDataToMatrix(node_names);

        // The result should have one lag
        expect(result.length).toEqual(1);
        expect(result).toEqual(expected);
      });
    });

  });
});


describe("VarModel", function() {
  describe("VarModel constructor", function() {
    var first_value,
      second_value,
      var_coefficients,
      exogen_var_coefficients,
      y_values,
      exogen_values,
      node_names,
      exogen_names,
      significant_network,
      variable_mapping;

    beforeEach(function() {
      first_value = 0.5,
        second_value = 0.2,
        var_coefficients = [createMatrix(first_value, 3, 3, false),
          createMatrix(second_value, 3, 3, false)
        ],
        exogen_var_coefficients = createMatrix(first_value, 3, 3, false),
        y_values = [
          [1, 2, 3],
          [1, 2, 3],
          [1, 2, 3],
          [1, 2, 3]
        ],
        exogen_values = [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
          [0, 0, 0]
        ],
        node_names = ['beweging', 'onrust', 'hier_en_nu'],
        exogen_names = ['ochtend', 'middag', 'avond'],
        significant_network = {
          "links": [{
            "source": 0,
            "target": 1,
            "coef": "-0.177779650515062"
          }],
          "nodes": [{
            "index": 0,
            "name": "Beweging",
            "type": "Positief"
          }, {
            "index": 1,
            "name": "Onrust",
            "type": "Positief"
          }, {
            "index": 2,
            "name": "In het hier en nu leven",
            "type": "Positief"
          }]
        },
        variable_mapping = new VariableMapping();
    });

    it("should set the correct things in the variables", function() {
      var make_positive = false;

      var varmodel = new VarModel(
        var_coefficients, exogen_var_coefficients,
        node_names, exogen_names,
        y_values, exogen_values,
        significant_network,
        make_positive,
        variable_mapping
      );

      expect(varmodel.getLags()).toEqual(var_coefficients.length);
      expect(varmodel.getNumberOfVariables()).toEqual(node_names.length);
      expect(varmodel.getSignificantNetwork()).toEqual(significant_network);
      expect(varmodel.getVariableMapping()).toEqual(variable_mapping);
      expect(varmodel.getVarCoefficients().length).toEqual(node_names.length);
      expect(varmodel.getNumberOfExogenVariables()).toEqual(0);
      for (var i = 0; i < var_coefficients.length; i++) {
        expect(varmodel.getVarCoefficients()[i].length).toEqual(node_names.length * var_coefficients.length);
        for (var j = 0; j < var_coefficients.length; j++) {
          for (var k = 0; k < node_names.length; k++) {
            var expected = j === 0 ? first_value : second_value;
            expect(varmodel.getVarCoefficients()[i][j * node_names.length + k]).toEqual(expected);
          }
        }
      }
    });

    describe("converts coefficients if needed", function() {
      it("should not call the convert_coefficients function if it make positive = false", function() {
        make_positive = false;

        spyOn(VarModel.prototype, 'convert_coefficients');
        new VarModel(
          var_coefficients, exogen_var_coefficients,
          node_names, exogen_names,
          y_values, exogen_values,
          significant_network,
          make_positive,
          variable_mapping
        );
        expect(VarModel.prototype.convert_coefficients).not.toHaveBeenCalled();
      });

      it("should call the convert_coefficients function if it make positive = true", function() {
        var make_positive = true;
        spyOn(VarModel.prototype, 'convert_coefficients');
        new VarModel(
          var_coefficients, exogen_var_coefficients,
          node_names, exogen_names,
          y_values, exogen_values,
          significant_network,
          make_positive,
          variable_mapping
        );
        expect(VarModel.prototype.convert_coefficients).toHaveBeenCalled();

      });
    });
  });

  describe("with a created varmodel", function() {
    var varmodel,
      node_names,
      significant_network,
      make_possitive,
      first_value,
      second_value,
      exo_value,
      var_coefficients,
      exogen_names,
      exogen_var_coefficients,
      variable_mapping,
      y_values, exogen_values;

    beforeEach(function() {
      first_value = 0.5;
      second_value = 0.2;
      exo_value = 0.1;

      var_coefficientsl1 = createMatrix(first_value, 3, 3, false);
      var_coefficientsl2 = createMatrix(second_value, 3, 3, false);

      var_coefficients = [var_coefficientsl1, var_coefficientsl2];

      exogen_var_coefficients = createMatrix(exo_value, 3, 7, false);

      y_values = [
        makeFilledArray(3, 1),
        makeFilledArray(3, 2),
        makeFilledArray(3, 3),
        makeFilledArray(3, 4),
        makeFilledArray(3, 5),
        makeFilledArray(3, 6),
        makeFilledArray(3, 7),
        makeFilledArray(3, 8)
      ];
      exogen_values = [
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0),
        makeFilledArray(7, 0)
      ];

      node_names = ['beweging', 'concentratie', 'hier_en_nu'];
      exogen_names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      significant_network = {
        "links": [{
          "source": 0,
          "target": 1,
          "coef": "-0.177779650515062"
        }],
        "nodes": [{
          "index": 0,
          "name": "Beweging",
          "type": "Positief"
        }, {
          "index": 1,
          "name": "Concentratie",
          "type": "Positief"
        }, {
          "index": 2,
          "name": "In het hier en nu leven",
          "type": "Positief"
        }]
      };


      make_possitive = true;
      variable_mapping = new VariableMapping();

      varmodel = new VarModel(
        var_coefficients, exogen_var_coefficients,
        node_names, exogen_names,
        y_values, exogen_values,
        significant_network,
        make_possitive,
        variable_mapping
      );


    });

    describe("dataSummaryFromJson", function() {
      it('can give a datasummary based on a set of node_names', function() {
        var values = [
            [18, 13, 47],
            [32, 41, 90]
          ],
          node_names = ['beweging', 'concentratie', 'hier_en_nu'];

        varmodel = new VarModel(
          var_coefficients, exogen_var_coefficients,
          node_names, exogen_names,
          values, exogen_values,
          significant_network,
          false,
          variable_mapping
        );

        var result = varmodel.calculateDataSummary();
        var expected = {
          "beweging": {
            "average": (values[0][0] + values[1][0]) / 2,
            "sd": standardDeviation([values[0][0], values[1][0]], (values[0][0] + values[1][0]) / 2)
          },
          "concentratie": {
            "average": (values[0][1] + values[1][1]) / 2,
            "sd": standardDeviation([values[0][1], values[1][1]], (values[0][1] + values[1][1]) / 2)
          },
          "hier_en_nu": {
            "average": (values[0][2] + values[1][2]) / 2,
            "sd": standardDeviation([values[0][2], values[1][2]], (values[0][2] + values[1][2]) / 2)
          }
        };
        expect(result).toEqual(expected);
      });

    });
    describe("get_node_name", function() {
      it("returns the node name based on id", function() {
        expect(varmodel.get_node_name(0)).toEqual('beweging');
        expect(varmodel.get_node_name(1)).toEqual('concentratie');
        expect(varmodel.get_node_name(2)).toEqual('hier_en_nu');
      });

      it("returns undifined if not found", function() {
        expect(varmodel.get_node_name(9)).toBeUndefined();
      });
    });

    describe("convert_coefficients", function() {

    });

    describe("to_json", function() {

    });

    describe("set_coefficient", function() {

    });

    describe("get_coefficient", function() {

    });


    describe("getSignificantEdges", function() {
      it('should determine the correct significant edges in a var_model', function() {
        var result = varmodel.getSignificantEdges();
        expect(result).not.toBeUndefined();
        expect(result).toEqual(significant_network.links);
      });
    });

    describe("getResiduals", function() {
      it('should determine the correct residuals in a var_model', function() {
        var result = varmodel.getResiduals();

        var expected = [
          [-0.6, -0.6, -0.6],
          [-1.7, -1.7, -1.7],
          [-2.8, -2.8, -2.8],
          [-3.9, -3.9, -3.9],
          [-5, -5, -5],
          [-6.1, -6.1, -6.1]
        ];

        for (var i = 0; i < result.length; i++) {
          for (var j = 0; j < result[i].length; j++) {
            expect(result[i][j]).toBeCloseTo(expected[i][j]);
          }
        }
      });

      it('should determine the correct have the correct length (nr of measurements - lags)', function() {
        var result = varmodel.getResiduals();
        expect(result.length).toEqual(varmodel.getNumberOfMeasurements() - varmodel.getLags())
      });
    });

    describe("get_coefficients", function() {
      it('has the rows and cols for the coefficients correct', function() {
        var adder = 0;
        var_coefficientsl1 = var_coefficientsl1.map(function(r) {
          return r.map(function(c) {
            adder++;
            return c + adder;
          });
        });

        var_coefficients = [var_coefficientsl1, var_coefficientsl2];
        varmodel = new VarModel(
          var_coefficients, exogen_var_coefficients,
          node_names, exogen_names,
          y_values, exogen_values,
          significant_network,
          make_possitive,
          variable_mapping
        );

        // The rows should equal the variables
        expect(varmodel.getCoefficients(1)[0]).toEqual(var_coefficientsl1[0]);
        expect(varmodel.getCoefficients(1)[1]).toEqual(var_coefficientsl1[1]);
        expect(varmodel.getCoefficients(1)[2]).toEqual(var_coefficientsl1[2]);

        expect(varmodel.getCoefficients(2)[0]).toEqual(var_coefficientsl2[0]);
        expect(varmodel.getCoefficients(2)[1]).toEqual(var_coefficientsl2[1]);
        expect(varmodel.getCoefficients(2)[2]).toEqual(var_coefficientsl2[2]);

      });
      it('can retrieve the coefficient matrix for each lag', function() {
        expect(varmodel.getCoefficients(1)).toEqual(var_coefficients[0]);
        expect(varmodel.getCoefficients(2)).toEqual(var_coefficients[1]);
      });

      it('throws if the lag is higher than the model lag', function() {
        lag = 10;
        var func = function() {
          varmodel.getCoefficients(lag);
        };
        expect(func).toThrow();
      });

      it('throws if the lag is lower than the model lag', function() {
        lag = 0;
        var func = function() {
          varmodel.getCoefficients(lag);
        };
        expect(func).toThrow();
      });
    });


    describe("calculateNewOutput", function() {
      it('can detect that the endogen dimensions are incorrect', function() {
        var endogen = [
          [1, 2, 3, 4, 5, 6]
        ];
        var exogen = [
          [1, 2, 3, 4, 5, 6],
          [6, 5, 4, 3, 2, 1]
        ];
        var func = function() {
          varmodel.calculateNewOutput(endogen, exogen);
        };
        expect(func).toThrow();
      });

      it('can calculate a new output', function() {
        var endogen = [
          [1, 2, 3],
          [6, 5, 4]
        ];
        var exogen = [1, 0, 0, 0, 0, 0, 0];
        var result = varmodel.calculateNewOutput(endogen, exogen);
        // E <- matrix(c(0.5, 0.5, 0.5, 0.2, 0.2, 0.2, 0.5, 0.5, 0.5, 0.2, 0.2, 0.2, 0.5, 0.5, 0.5, 0.2, 0.2, 0.2), nrow = 3, ncol = 6, byrow=TRUE)
        // X <- matrix(c(0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1), nrow = 3, ncol = 7, byrow=TRUE)
        // B <- cbind(E, X)
        // matrix(c(0.5, 0.5, 0.5, 0.2, 0.2, 0.2, 0.5, 0.5, 0.5, 0.2, 0.2, 0.2, 0.5, 0.5, 0.5, 0.2, 0.2, 0.2), nrow = 3, ncol = 6, byrow=TRUE)
        // Z <- c(1,2,3,6,5,4,1,0,0,0,0,0,0)
        // print(B %*% Z)
        expect(result.length).toEqual(varmodel.getNumberOfVariables());
        expect(result).toEqual(arraySum([
          [3.05, 3.05, 3.05],
          [3.05, 3.05, 3.05]
        ]));
        expect(result).toEqual([6.1, 6.1, 6.1])
      });
    });
  });
});

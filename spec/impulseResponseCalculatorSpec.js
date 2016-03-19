describe("ImpulseResponseCalculator", function () {
  describe("constructor", function () {

  });

  describe('The varmodel variable is instance scope, not class scope', function () {
    it('should not change the var_model in one instance when changed in the other', function () {
      var_model = fabricateVarModel(false);
      impulse_response_calculator1 = new ImpulseResponseCalculator(var_model);
      impulse_response_calculator2 = new ImpulseResponseCalculator(var_model);

      expect(impulse_response_calculator1.getVarModel()).not.toEqual(undefined);
      expect(impulse_response_calculator1.getVarModel())
        .toEqual(impulse_response_calculator2.getVarModel());

      var_model2 = fabricateVarModel(true);
      expect(var_model).not.toEqual(var_model2);

      // When we'd create a third calculator with a new var_model (different specs), it should not change the
      // var model of the first one.
      impulse_response_calculator3 = new ImpulseResponseCalculator(var_model2);
      expect(impulse_response_calculator1.getVarModel())
        .not.toEqual(impulse_response_calculator3.getVarModel());

    });
  });


  describe("with calculator", function () {
    var impulse_response_calculator,
      var_model;

    beforeEach(function () {
      var_model = fabricateVarModel(false);
      impulse_response_calculator = new ImpulseResponseCalculator(var_model);
    });

    describe("estimate vma coefficients", function () {
      it('Should return a result', function () {
        expect(impulse_response_calculator).not.toBeUndefined();
        var result = impulse_response_calculator.estimateVmaCoefficients(5);
        expect(result).not.toBeUndefined();
      });

      it('should return a lower triangular matrix, based on steps and number of variables', function () {
        var steps = 50;
        var result = impulse_response_calculator.estimateVmaCoefficients(steps);

        // Check if the matrix has indeed <steps> entries
        expect(result.length).toEqual(steps);

        // Check for each step whether it consists step t + 1 items, i.e., lower triangular
        for (var i = 0; i < result.length; i++) {
          expect(result[i].length).toEqual(i + 1);

          // Each of the arrays in the matrix should contain <number_of_variables> elements
          for (var j = 0; j < result[i].length; j++) {
            expect(result[i][j].length).toEqual(var_model.getNumberOfVariables());
          }

        }
      });

      it('should return the correct matrix, for the test dataset', function () {
        var precision = 6;
        var i, j;
        var expected = [
          [-0.0366, -0.1773, -0.9122, 0.2478, 0.3648, 0.1045],
          [-0.1724, -0.0669, -1.0035, 0.1977, 0.1498, -0.1872],
          [0.2040, -0.0269, 0.5721, -0.0842, -0.0074, 0.1198],
          [-0.1385, -0.0772, -1.1145, 0.1877, 0.1151, -0.1512],
          [0.4768, 0.0789, 1.5165, -0.0319, 0.1546, 0.1860],
          [-0.1821, 0.1159, -0.7114, 0.0655, 0.0649, -0.1424]
        ];

        var C2 = [
          [
            [-0.03359583, 0.06465284, -0.1078578, 0.07440524, 0.05854097, -0.06441106],
            [-0.10873829, 0.03689658, -0.2096958, 0.04861592, -0.03172217, -0.10108358],
            [0.10019736, -0.02995788, 0.1655968, -0.01065913, 0.06309560, 0.08918638],
            [-0.15256287, 0.03676765, -0.3608744, 0.06591416, -0.02425621, -0.11897927],
            [0.32257359, -0.09439088, 0.4911596, 0.00732390, 0.20683463, 0.22382470],
            [-0.11063829, 0.02722913, -0.2304615, 0.03858577, -0.03547307, -0.10350609]
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

        var C3 = [
          []
        ];

        var steps = 3;
        var result = impulse_response_calculator.estimateVmaCoefficients(steps);

        expect(result.length).toEqual(steps);

        //C1
        expect(result[0][0]).toEqual(expected);

        //C2
        for (i = 0, l = C2[0].length; i < l; i++) {
          for (j = 0; j < C2[0][i].length; j++) {
            expect(result[1][0][i][j]).toBeCloseTo(C2[0][i][j], precision);
            expect(result[1][1][i][j]).toBeCloseTo(C2[1][i][j], precision);
          }
        }

        //C3
        for (i = 0, l = C3[0].length; i < l; i++) {
          for (j = 0; j < C3[0][i].length; j++) {
            expect(result[2][0][i][j]).toBeCloseTo(C3[0][i][j], precision);
            expect(result[2][1][i][j]).toBeCloseTo(C3[1][i][j], precision);
            expect(result[2][2][i][j]).toBeCloseTo(C3[2][i][j], precision);
          }
        }
      });

    });

    describe("runImpulseResponseCalculation", function () {
      var steps = 5;
      describe("with spy", function () {


        beforeEach(function () {
          spyOn(impulse_response_calculator, 'calculateImpulseResponse');
        });

        it("should be able to shock all variables", function () {
          result = impulse_response_calculator.runImpulseResponseCalculation(-1, 1, steps);
          var expected = createMatrix(1, steps, var_model.getNumberOfVariables());
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

        it("should be able to give a shock with a different magnitude", function () {
          var shock_size = 123;
          result = impulse_response_calculator.runImpulseResponseCalculation(-1, shock_size, steps);
          var expected = createMatrix(shock_size, steps, var_model.getNumberOfVariables());
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

        it("should be able to shock a single variable", function () {
          result = impulse_response_calculator.runImpulseResponseCalculation(2, 1, steps);
          var expected = createMatrix(0, steps, var_model.getNumberOfVariables());
          expected = transpose(expected);
          expected[2] = makeFilledArray(steps, 1);
          expected = transpose(expected);
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

      });
      it("should return a result", function () {
        result = impulse_response_calculator.runImpulseResponseCalculation(-1, 1, steps);
        expect(result).not.toBeUndefined();
        expect(result.length).toEqual(steps);
        expect(mergeMatrix(result)).not.toContain(NaN);
      });

    });

    describe("delta", function () {
      it('should return the B matrix until the index, if it fits in the matrix', function () {
        impulse_response_calculator._delta(1);
        //expect(condition).toEqual();
      });
    });

    describe('Bootstrap', function () {
      var network,
        json_parser,
        node_names,
        vector_autoregressor,
        variable_mapping,
        var_model;

      beforeEach(function () {
        network = fabricateFullNetworLagOneDataNewFormat();
        variable_mapping = fabricateVariableMapping();
        json_parser = new JsonParser(network, variable_mapping);
        node_names = json_parser.nodeKeysFromJson();
        vector_autoregressor = new Var();

        var significant_network = json_parser.getSignificantNetworkFromJson(),
          var_coefficients = json_parser.getEndogenCoefficientMatrix(),
          exogen_var_coefficients = json_parser.getExogenCoefficientMatrix(),
          exogen_names = json_parser.exogenKeysFromJson(),
          y_values = json_parser.getYDataFromJson(),
          exogen_values = json_parser.getExogenDataFromJson(),
          make_positive = false;

        var_model = new VarModel(
          var_coefficients, exogen_var_coefficients,
          node_names, exogen_names,
          y_values, exogen_values,
          significant_network,
          make_positive,
          variable_mapping
        );
        impulse_response_calculator = new ImpulseResponseCalculator(var_model);
      });

      it('should be able to compute a good VAR model for the Y variables', function () {
        var confidence = 0.95;
        var result = impulse_response_calculator.bootstrappedImpulseResponseCalculation(1, 1, 10, 50, confidence);
      });

      it('should have the correct dimensions', function () {
        var runs = Math.round(Math.random() * 10);
        var horizon = 20;
        var result = impulse_response_calculator.bootstrappedImpulseResponseCalculation(1, 1, horizon, runs);
        expect(result).not.toEqual(undefined);
        expect(result.low).not.toEqual(undefined);
        expect(result.low.length).toEqual(horizon);
        expect(result.high).not.toEqual(undefined);
        expect(result.high.length).toEqual(horizon);
      });
    });
  });

  describe("significantImpulseResponseCalculation", function () {
    xit("Can calculate the significant responses, and return them", function () {
      //significantImpulseResponseCalculation();
    });
  });

  describe("with real model", function () {

    describe("calculateImpulseResponse", function () {
      var C_matrix, steps = 10,
        result, E;

      beforeEach(function () {
        var_model = fabricateRealP1Model(false);
        impulse_response_calculator = new ImpulseResponseCalculator(var_model);
        C_matrix = impulse_response_calculator.estimateVmaCoefficients(steps);
        expect(impulse_response_calculator).not.toBeUndefined();

        E = createMatrix(0, var_model.getNumberOfVariables(), steps, false);

        // Give a shock to the first node
        E[0] = makeFilledArray(steps, 1);

        // Transpose E to have the correct input format
        E = transpose(E);
      });

      describe("with a correct result", function () {
        beforeEach(function () {
          result = impulse_response_calculator.calculateImpulseResponse(E, C_matrix);
        });

        it('Should return a result and should contain actual values', function () {
          expect(result).not.toBeUndefined();
          result = mergeMatrix(result);
          expect(result).not.toContain(NaN);
        });

        it("should have the correct length", function () {
          expect(result.length).toEqual(steps);
          for (var i = 0, l = result.length; i < l; i++) {
            var v = result[i].length;
            expect(v).toEqual(var_model.getNumberOfVariables());
          }
        });

        it("should determine the correct response", function () {
          var expected = [];
          expected.push([1.00000000, 0.00000000]);
          expected.push([0.46312810, -0.17777965]);
          expected.push([0.46166692, -0.14854998]);
          expected.push([0.32828659, -0.15698880]);
          expected.push([0.26615324, -0.13319945]);
          expected.push([0.20440869, -0.11422258]);
          expected.push([0.16045498, -0.09355680]);
          expected.push([0.12483680, -0.07595500]);
          expected.push([0.09747658, -0.06079023]);
          expected.push([0.07600121, -0.04833878]);

          for (var i = 0; i < expected.length; i++) {
            for (var j = 0; j < expected[i].length; j++) {
              expect(result[i][j]).toBeCloseTo(expected[i][j], 6);
            }
          }
        });
      });

      it("should throw when < 1 number of coefficients is provided", function () {
        expect(function () {
          impulse_response_calculator.calculateImpulseResponse(E, []);
        }).toThrow();
      });

      it("should throw when < 1 number of shocks is provided", function () {
        expect(function () {
          impulse_response_calculator.calculateImpulseResponse([],
            C_matrix);
        }).toThrow();
      });

    });


  })
});

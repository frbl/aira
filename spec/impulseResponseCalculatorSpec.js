describe("ImpulseResponseCalculator", function() {
  describe("constructor", function() {

  });

  describe("with calculator", function() {
    var impulse_response_calculator,
    var_model;

    beforeEach(function() {
      var_model = fabricateVarModel(false);
      impulse_response_calculator = new ImpulseResponseCalculator(var_model);
    });

    describe("estimate vma coefficients", function() {
      it('Should return a result', function(){
        expect(impulse_response_calculator).not.toBeUndefined();
        var result = impulse_response_calculator.estimateVmaCoefficients(5);
        expect(result).not.toBeUndefined();
      });

      it('should return a lower triangular matrix, based on steps and number of variables', function() {
        var steps = 50;
        var result = impulse_response_calculator.estimateVmaCoefficients(steps);

        // Check if the matrix has indeed <steps> entries
        expect(result.length).toEqual(steps);

        // Check for each step whether it consists step t + 1 items, i.e., lower triangular
        for (var i = 0 ; i < result.length; i ++) {
          expect(result[i].length).toEqual(i + 1);

          // Each of the arrays in the matrix should contain <number_of_variables> elements
          for (var j = 0 ; j < result[i].length; j ++) {
            expect(result[i][j].length).toEqual(var_model.number_of_variables);
          }

        }
      });

      it('should return the correct matrix, for the test dataset', function(){
        var precision = 6;
        var i,j;
        var expected = [
          [-0.0366, -0.1773, -0.9122,  0.2478,  0.3648,  0.1045],
          [-0.1724, -0.0669, -1.0035,  0.1977,  0.1498, -0.1872],
          [ 0.2040, -0.0269,  0.5721, -0.0842, -0.0074,  0.1198],
          [-0.1385, -0.0772, -1.1145,  0.1877,  0.1151, -0.1512],
          [ 0.4768,  0.0789,  1.5165, -0.0319,  0.1546,  0.1860],
          [-0.1821,  0.1159, -0.7114,  0.0655,  0.0649, -0.1424]
        ];

        var C2 = [[
          [-0.03359583,  0.06465284, -0.1078578,  0.07440524,  0.05854097, -0.06441106],
          [-0.10873829,  0.03689658, -0.2096958,  0.04861592, -0.03172217, -0.10108358],
          [0.10019736, -0.02995788,  0.1655968, -0.01065913,  0.06309560,  0.08918638],
          [-0.15256287,  0.03676765, -0.3608744,  0.06591416, -0.02425621, -0.11897927],
          [0.32257359, -0.09439088,  0.4911596,  0.00732390,  0.20683463,  0.22382470],
          [-0.11063829,  0.02722913, -0.2304615,  0.03858577, -0.03547307, -0.10350609]
        ],
        [ // Synthetic lag2 model
          [0.5,0,0,0,0,0],
          [0,0.5,0,0,0,0],
          [0,0,0.5,0,0,0],
          [0,0,0,0.5,0,0],
          [0,0,0,0,0.5,0],
          [0,0,0,0,0,0.5]
        ]];

        var C3 =[[

        ]];

        var steps = 3;
        var result = impulse_response_calculator.estimateVmaCoefficients(steps);

        expect(result.length).toEqual(steps);

        //C1
        expect(result[0][0]).toEqual(expected);

        //C2
        for (i = 0, l = C2[0].length; i < l; i ++) {
          for (j = 0; j < C2[0][i].length; j++) {
            expect(result[1][0][i][j]).toBeCloseTo(C2[0][i][j], precision);
            expect(result[1][1][i][j]).toBeCloseTo(C2[1][i][j], precision);
          }
        }

        //C3
        for (i = 0, l = C3[0].length; i < l; i ++) {
          for (j = 0; j < C3[0][i].length; j++) {
            expect(result[2][0][i][j]).toBeCloseTo(C3[0][i][j], precision);
            expect(result[2][1][i][j]).toBeCloseTo(C3[1][i][j], precision);
            expect(result[2][2][i][j]).toBeCloseTo(C3[2][i][j], precision);
          }
        }
      });

    });

    describe("calculateImpulseResponse", function() {
      var C_matrix, steps = 10, result, E;
      beforeEach(function () {
        C_matrix = impulse_response_calculator.estimateVmaCoefficients(steps);
        expect(impulse_response_calculator).not.toBeUndefined();

        E = createMatrix(0, var_model.number_of_variables, steps, false);

        // Give a shock to the first node
        E[0] = makeFilledArray(steps, 1);

        // Transpose E to have the correct input format
        E = transpose(E);
      });

      describe("with a correct result", function() {
        beforeEach(function () {
          result = impulse_response_calculator.calculateImpulseResponse(E, C_matrix);
        });

        it('Should return a result and should contain actual values', function(){
          expect(result).not.toBeUndefined();
          result = mergeMatrix(result);
          expect(result).not.toContain(NaN);
        });

        it("should have the correct length", function() {
          expect(result.length).toEqual(steps);
          for (var i = 0, l = result.length; i < l; i ++) {
            var v = result[i].length;
            expect(v).toEqual(var_model.number_of_variables);
          }
        });

        it("should determine the correct response",function() {
          // TODO: The expected values currently used are the values generated by the software. These
          //       should be calculated by hand (or in R for example) and replaced.
          var expected = [];
          expected.push([ 1, 0, 0, 0, 0, 0 ]);
          expected.push([ -0.0366, -0.1724, 0.204, -0.1385, 0.4768, -0.1821 ]);
          expected.push([ 0.46640417, -0.10873828999999999, 0.10019736000000001, -0.15256287, 0.32257358999999997, -0.11063828999999999 ]);
          expected.push([ -0.03918306045600001, -0.22101020579600003, 0.254598702283, -0.211901660319, 0.638309264242, -0.23316831857000003 ]);
          expected.push([ 0.19755625715563618, -0.1909433215759344, 0.17889149445777575, -0.2685923424936344, 0.5733385065114136, -0.1941706282840657 ]);
          expected.push([ -0.033846785519109954, -0.24217316432738423, 0.2701921559522844, -0.2730110395131253, 0.7306634707770583, -0.2546861257340452 ]);
          expected.push([ 0.06876413671229967, -0.24141657062101635, 0.2307016155040143, -0.34067804539435403, 0.7354680531124733, -0.2453992435191525 ]);
          expected.push([ -0.028848510675922895, -0.2595400187480549, 0.28144626030058106, -0.3266974745056763, 0.807856439627499, -0.2716040050160673 ]);
          expected.push([ 0.010086866994154717, -0.2735298233419323, 0.26645437349561363, -0.38724918583137047, 0.8451125130027202, -0.2780402570502328 ]);
          expected.push([ -0.026074786861492283, -0.2785089773363436, 0.295620676398, -0.3739672002983328, 0.88252634806788, -0.28982065579190375 ]);
          expect(result).toEqual(expected);
        });
      });

      it("should throw when < 1 number of coefficients is provided", function() {
        expect(function() { impulse_response_calculator.calculateImpulseResponse(E, []); }).toThrow();
      });

      it("should throw when < 1 number of shocks is provided", function() {
        expect(function() { impulse_response_calculator.calculateImpulseResponse([],
                                                                                 C_matrix); }).toThrow();
      });

    });

    describe("runImpulseResponseCalculation", function() {
      var steps = 5;
      describe("with spy", function() {


        beforeEach(function () {
          spyOn(impulse_response_calculator, 'calculateImpulseResponse');
        });

        it("should be able to shock all variables", function() {
          result = impulse_response_calculator.runImpulseResponseCalculation(-1, 1, steps);
          var expected = createMatrix(1, steps, var_model.number_of_variables);
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

        it("should be able to give a shock with a different magnitude", function() {
          var shock_size = 123;
          result = impulse_response_calculator.runImpulseResponseCalculation(-1, shock_size, steps);
          var expected = createMatrix(shock_size, steps, var_model.number_of_variables);
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

        it("should be able to shock a single variable", function() {
          result = impulse_response_calculator.runImpulseResponseCalculation(2, 1, steps);
          var expected = createMatrix(0, steps, var_model.number_of_variables);
          expected = transpose(expected);
          expected[2] = makeFilledArray(steps, 1);
          expected = transpose(expected);
          expect(impulse_response_calculator.calculateImpulseResponse).toHaveBeenCalledWith(expected, jasmine.any(Array));
        });

      });
      it("should return a result", function() {
        result = impulse_response_calculator.runImpulseResponseCalculation(-1, 1, steps);
        expect(result).not.toBeUndefined();
        expect(result.length).toEqual(steps);
        expect(mergeMatrix(result)).not.toContain(NaN);
      });

    });

    describe("delta", function() {
      it('should return the B matrix until the index, if it fits in the matrix', function() {
        impulse_response_calculator.delta(1);
        //expect(condition).toEqual();
      });
    });
  });
});


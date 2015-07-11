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

    fdescribe("calculateImpulseResponse", function() {
      var C_matrix, steps = 5;
      beforeEach(function () {
        C_matrix = impulse_response_calculator.estimateVmaCoefficients(steps);
      });

      it('Should return a result and should contain actual values', function(){
        expect(impulse_response_calculator).not.toBeUndefined();
        var E = createMatrix(0, var_model.number_of_variables, steps, false);

        // Give a shock to the first node
        E[0] = makeFilledArray(steps, 1);

        // Transpose E to have the correct input format
        E = transpose(E);

        var result = impulse_response_calculator.calculateImpulseResponse(E, C_matrix);
        expect(result).not.toBeUndefined();
        result = mergeMatrix(result);
        expect(result).not.toContain(NaN);
      });

    });

    describe("runImpulseResponseCalculation", function() {

    });

    describe("delta", function() {
      it('should return the B matrix until the index, if it fits in the matrix', function() {
        impulse_response_calculator.delta(1);
        //expect(condition).toEqual();
      });

    });

  });

});


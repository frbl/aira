describe("MathHelpers", function() {
  describe("MergeMatrix", function() {
    it("should correctly merge a matrix into one array", function() {
     var matrix = [[[[1,2,3],[31,1,5]]]];
     var expected = [1,2,3,31,1,5];
     var result = mergeMatrix(matrix);
     expect(result).toEqual(expected);
    });

  });

  describe('multiplyMatrices', function () {
    it('correctly multiplies two matrices', function() {
      var matrix_one = [[1,2,3],[4,5,6]];
      var matrix_two = [[7,8],[9,10],[11,12]];
      var expected_matrix = [[58,64],[139,154]];
      var result = multiplyMatrices(matrix_one, matrix_two);

      expect(result).toEqual(expected_matrix);
    });
  });

  describe('sumMatrices', function () {
    it('correclty sums a list of matrices', function() {
      var matrix_one = [[1,2,3],[3,4,2],[8,5,3],[0,1,6]],
        matrix_two = [[9,1,3],[10,1000,100],[1,1,1],[9,1,6]],
        expected_matrix = [[10,3,6],[13,1004,102],[9,6,4],[9,2,12]];
      var result = sumMatrices([matrix_one, matrix_two]);

      expect(result).toEqual(expected_matrix);
    });

    it('correclty sums a list of three matrices', function() {
      var matrix_one = [[1,2,3],[3,4,2],[8,5,3],[0,1,6]],
        matrix_two = [[9,1,3],[10,1000,100],[1,1,1],[9,1,6]],
        matrix_three = [[9,1,3],[10,1000,100],[1,1,1],[9,1,6]],
        expected_matrix = [[19,4,9],[23,2004,202],[10,7,5],[18,3,18]];
      var result = sumMatrices([matrix_one, matrix_two, matrix_three]);

      expect(result).toEqual(expected_matrix);
    });
  });

  describe('roundToPlaces', function () {
    it('correctly rounds a number to 3 decimal places', function() {
      var number = 3.192538312,
        expected = 3.193;

      var result = roundToPlaces(number, 3);
      expect(result).toEqual(expected);
    });

    it('correctly rounds a number to 0 decimal places', function() {
      var number = 3.192538312,
        expected = 3;

      var result = roundToPlaces(number, 0);
      expect(result).toEqual(expected);
    });

    it('rounds a number to a max decimal places', function() {
      var number = 3.192538312,
        expected = 3.192538312;

      var result = roundToPlaces(number, 100);
      expect(result).toEqual(expected);
    });
  });

  describe('calculateMean', function () {
    it("cacluates the mean of a list", function() {
      var number = [1,2,3,4,5,1,4,2,23,4,5,3],
        expected = 4.75;

      var result = calculateMean(number);
      expect(result).toEqual(expected);
    });
  });

  describe('standardDeviation', function () {
    it('calculates the standard deviation of an array of numbers', function() {
      var number = [1,2,3,4,5,1,4,2,23,4,5,3],
        expected = /5.91031/;

      var result = standardDeviation(number);
      expect(result).toMatch(expected);
    });

    it('calculates the standard deviation when there is no variance of an array of numbers', function() {
      var number = [0,0,0,0,0,0,0],
        expected = 0;

      var result = standardDeviation(number);
      expect(result).toEqual(expected);
    });
  });

  describe('transpose', function () {
    it('should be able to create the transpose of a matrix', function() {
      var matrix = [[1,2,3],[3,4,2],[8,5,3],[0,1,6]],
        expected = [[1,3,8,0],[2,4,5,1],[3,2,3,6]];
      var result = transpose(matrix);
      expect(result).toEqual(expected);
    });

  });

  describe('subsetMatrix', function () {
    pending();
  });

  describe('createMatrix', function () {
    it('should be able to create filled matrix', function() {
      var nrow = 4,
        ncol = 3,
        value = 1,
        identity = false,
        expected = [[value, value, value],[value, value, value],[value, value, value],[value, value, value]];
      var result = createMatrix(value, nrow, ncol, identity);
      expect(result).toEqual(expected);
    });

    it('should be able to create an identity matrix', function() {
      var nrow = 3,
        ncol = 3,
        value = 0,
        identity = true,
        expected = [[1,0,0],[0,1,0],[0,0,1]];
      var result = createMatrix(value, nrow, ncol, identity);
      expect(result).toEqual(expected);
    });

    it('should not use the value when creating an identity matrix', function() {
      var nrow = 3,
        ncol = 3,
        value = 12390,
        identity = true,
        expected = [[1,0,0],[0,1,0],[0,0,1]];
      var result = createMatrix(value, nrow, ncol, identity);
      expect(result).toEqual(expected);
    });

    it('should throw an error when creating a non square identity matrix', function() {
      var nrow = 9,
        ncol = 3,
        value = 0,
        identity = true,
        expected = [[1,0,0],[0,1,0],[0,0,1]];
      expect(function() { createMatrix(value, nrow, ncol, identity); }).toThrow();
    });
  });

  describe('linearInterpolation', function () {
  });

  describe("makeFilledArrayn", function() {
    it("should make an array filled with the given value of the given length", function() {
      var val = 191,
        len =13,
        expected = [191,191,191,191,191,191,191,191,191,191,191,191,191];

      var result = makeFilledArray(len, val);
      expect(result).toEqual(expected);
    });
  });

  describe("makeSequenceArray", function() {

    it("should be able to make an array with integer values ", function() {
      var from = -10,
        to =10,
        stepsize = 1,
        expected = [-10, -9, -8, -7, -6, -5, -4 ,-3 ,-2 ,-1, 0, 1, 2, 3, 4, 5, 6, 7,8,9,10];

      var result = makeSequenceArray(stepsize,from, to);
      expect(result).toEqual(expected);
    });

    it("should be able to make an array with double values ", function() {
      var from = -1,
        to =1,
        stepsize = 0.25,
        expected = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

      var result = makeSequenceArray(stepsize,from, to);
      expect(result).toEqual(expected);
    });

    it("should be able to make an array with double values and should automatically round the numbers to 3 decimal places ", function() {
      var from = -1,
        to =1,
        stepsize = 0.33333,
        expected = [-1, -0.667, -0.333, 0, 0.333, 0.667, 1];

      var result = makeSequenceArray(stepsize,from, to);
      expect(result).toEqual(expected);
    });
  });

  describe("addPadding", function() {
    it("should add padding to an array with the value zero of lenght l", function() {
      var array = [1,2,3,4,5,6],
        expected = [0,0,0,0,1,2];
      var result = addPadding(array,4,0);
      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);
    });

    it('should return only zeros if the added padding is more then the length of the array', function() {
      var array = [1,2,3,4,5,6],
        expected = [0,0,0,0,0,0];
      var result = addPadding(array,10,0);
      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);

      result = addPadding(array,6,0);
      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);
    });

    it("should also make arrays with different values", function() {
      var array = [1,2,3,4,5,6],
        expected = [123,123,123,1,2,3];
      var result = addPadding(array,3,123);

      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);
    });
  });

  describe("discreteDerivative", function() {
    pending();
  });

  describe("findMinimumInRange", function() {
    it("should find the minimum in a specified range", function() {
      var array = [1,5,3,4,2,6,7,3,123,123,13,0,123,13333],
          from = 1,
          to = 10,
          expected = 2;
      var result = findMinimumInRange(array, from, to);

      expect(result).toEqual(expected);
    });
  });

  describe("findMinimum", function() {
    it("should find the minimum in an array", function() {
      var array = [1,2,3,4,5,6,7,3,123,123,13,0,123,13333]
          expected = 0;
      var result = findMinimum(array);

      expect(result).toEqual(expected);
    });
  });

  describe("selectionFromArray", function() {
    pending();
  });

  describe("findAllValleys", function() {
    pending();
  });

  describe("scaleMatrix", function() {
    it("should scale a matrix with the given integer value", function() {
      var matrix = [[1,2],[3,4],[5,6]],
          expected = [[10,20],[30,40],[50,60]];
      var result = scaleMatrix(matrix,10);

      expect(result).toEqual(expected);
      expect(result.length).toEqual(matrix.length);
    });

    it("should scale a matrix with the given double value", function() {
      var matrix = [[1,2],[3,4],[5,6]],
          expected = [[0.5,1],[1.5,2],[2.5,3]];
      var result = scaleMatrix(matrix, 0.5);

      expect(result).toEqual(expected);
      expect(result.length).toEqual(matrix.length);
    });
  });

  describe("scaleArray", function() {
    it("should scale an array with the given integer value", function() {
      var array = [1,2,3,4,5,6],
        expected = [10,20,30,40,50,60];
      var result = scaleArray(array,10);

      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);
    });

    it("should scale an array with the given double value", function() {
      var array = [1,2,3,4,5,6],
        expected = [0.5,1,1.5,2,2.5,3];
      var result = scaleArray(array, 0.5);

      expect(result).toEqual(expected);
      expect(result.length).toEqual(array.length);
    });
  });

  describe("arraySum", function() {
    it("should sum the an array of arrays", function() {
      var array = [1,2,3,4,5,6],
        array_two = [1,2,3,4,5,6],
        expected = [2,4,6,8,10,12];
      var result = arraySum([array, array_two]);

      expect(result).toEqual(expected);
    });
  });

  describe("cumulativeSummation", function() {
    pending();
  });

  describe("sign", function() {
    it('should return - when it is a negative number', function() {
      var result = -1;
      expect(sign(-1)).toEqual(result);
      expect(sign(-100)).toEqual(result);
      expect(sign(-0.124)).toEqual(result);
    });

    it('should return 0 when it zero', function() {
      var result = 0;
      expect(sign(-0)).toEqual(result);
      expect(sign(0)).toEqual(result);
    });

    it('should return 1 when it is a negative number', function() {
      var result = 1;
      expect(sign(1)).toEqual(result);
      expect(sign(100)).toEqual(result);
      expect(sign(0.124)).toEqual(result);
    });

    it('should return NaN when not a number is given', function() {
      var result = NaN;
      expect(sign('xdada')).toEqual(result);
      expect(sign('100')).toEqual(result);
      expect(sign()).toEqual(result);
    });
  });

});

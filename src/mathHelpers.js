/**
 * From http://tech.pro/tutorial/1527/matrix-multiplication-in-functional-javascript
 * @param first
 * @param second
 * @returns {Array}
 */
var multiplyMatrices = function (first, second) {

    if (is_scalar(first)) {
        return second.map(function (row) {
            return row.map(function (value) {
                return value * first;
            });
        });
    } else {
        var secondColumns = transpose(second);
        return first.map(function (row) {
            return secondColumns.map(function (column) {
                return column.reduce(function (sum, value, index) {
                    return sum + value * row[index];
                }, 0);
            });
        });
    }
};

/**
 * Kronecker product
 */
var kroneckerProduct = function (first, second) {
    dimensions_first = dimensions(first);
    dimensions_second = dimensions(second);
    size = pairWiseProduct(dimensions_first, dimensions_second);
    result = createMatrix(0, size[0], size[1], false);
    first.forEach(function (row, row_index) {
        row.forEach(function (value, col_index) {
            multiplyMatrices(value, second).forEach(function (resulting_row, resulting_row_index) {
                resulting_row.forEach(function (resulting_value, resulting_col_index) {
                    r = (row_index * (dimensions_first[0] - 1)) + resulting_row_index;
                    c = (col_index * (dimensions_first[1] - 1)) + resulting_col_index;
                    result[r][c] = resulting_value;
                });
            });
        });
    });
    return result;
};

var pairWiseProduct = function (vector_one, vector_two) {
    //TODO: fail if dimensions differ
    var result = new Array(vector_one.length);
    for (var i = 0, l = vector_one.length; i < l; i++) {
        result[i] = vector_one[i] * vector_two[i];
    }
    return result;
};

/**
 * from http://www.jsoneliners.com/function/is-scalar/
 */
var is_scalar = function (obj) {
    return (/string|number|boolean/).test(typeof obj);
};

/**
 *
 * The Math.sign function is currently not defined in safari, this is a workaround to add its implementation if it
 * does not exist
 *
 */
Math.sign = Math.sign || function (x) {
        return +x === x ? ((x === 0) ? x : (x > 0) ? 1 : -1) : NaN;
    };

/**
 *
 * @param matrices
 * @returns {Array}
 */
var sumMatrices = function (matrices) {
    var result = [];
    var r, c, m;
    for (r = 0; r < matrices[0].length; r++) {
        var temp = [];
        for (c = 0; c < matrices[0][r].length; c++) {
            var val = 0;
            for (m = 0; m < matrices.length; m++) {
                val += matrices[m][r][c];
            }
            temp.push(val);
        }
        result.push(temp);
    }
    return result;
};

/**
 * merge matrix into an array
 */
var mergeMatrix = function (matrix) {
    var merged = [].concat.apply([], matrix);
    if (merged[0].constructor === Array) {
        return mergeMatrix(merged);
    } else {
        return merged;
    }
};

/**
 * from http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
 * @param places
 * @returns {number}
 */
var roundToPlaces = function (number, places) {
    if (((number + "").split('.')[1] || []).length <= places) return number;
    return +(Math.round(number + "e+" + places) + "e-" + places);
};

var calculateMean = function (data) {
    return data.reduce(function (total, current) {
        return (total + current / data.length);
    }, 0);
};

var standardDeviation = function (data, mean) {
    if (mean === undefined) mean = calculateMean(data);
    return Math.sqrt(data.reduce(function (total, current) {
            return total + Math.pow((current - mean), 2);
        }, 0) / (data.length - 1));
};

/**
 * Prints the matrix to the console
 * @param matrix
 * @returns {boolean}
 */
var printMatrix = function (matrix) {
    var r, c, s;
    console.log('-----------------');
    console.log('Dimensions: ' + matrix.length + "x" + matrix[0].length);
    s = '   ';
    for (r = 0; r < matrix.length; r++) {
        s += r + ', ';
    }
    console.log(s.slice(0, -2));
    for (r = 0; r < matrix.length; r++) {
        s = r + ': ';
        for (c = 0; c < matrix[r].length; c++) {
            s += matrix[r][c] + ', ';
        }
        console.log(s.slice(0, -2));
    }
    console.log('-----------------');
    return true;
};

/**
 * Returns the dimensions of the matrix
 */
var dimensions = function (matrix) {
    rows = matrix.length;
    columns = matrix[0].length;
    return [rows, columns];
};

/**
 * From http://tech.pro/tutorial/1527/matrix-multiplication-in-functional-javascript
 * @param matrix
 * @returns {Array}
 */
var transpose = function (matrix) {
    return matrix[0].map(function (uselessValue, colIndex) {
        return matrix.map(function (uselessRow, rowIndex) {
            return matrix[rowIndex][colIndex];
        });
    });
};

/**
 *
 * @param matrix
 * @param from
 * @param to
 * @returns {Array}
 */
var subsetMatrix = function (matrix, from, to) {
    var subset = [];
    for (row = 0; row < matrix.length; row++) {
        subset.push(matrix[row].slice(from, to));
    }
    return subset;
};

/**
 *
 * @param value
 * @param nrow
 * @param ncol
 * @param identity
 */
var createMatrix = function (value, nrow, ncol, identity) {
    if (identity && nrow != ncol) throw new Error('Identity matrices should be square');
    var matrix = new Array(nrow);
    value = identity ? 0 : value;
    for (var i = 0; i < nrow; i++) {
        matrix[i] = makeFilledArray(ncol, value);
        if (identity) matrix[i][i] = 1;
    }
    return matrix;
};

/**
 *
 * @param matrix
 * @param factor
 * @returns {Array|*}
 */
var linearInterpolation = function (matrix, factor) {
    var i, r, c, row, row_result, length;
    var result = [];
    if (factor <= 1) return matrix;
    for (r = 0; r < matrix.length; r++) {
        row = matrix[r];
        length = row.length * factor - (factor - 1);
        row_result = [];
        for (c = 0; c < row.length; c++) {
            row_result[c * factor] = row[c];
            if (length > (c * factor + 1)) {
                var part = ((row[c + 1] - row[c]) / factor);
                for (i = 0; i < factor; i++) {
                    row_result.push(row[c] + part * i);
                }
            }
        }
        result.push(row_result);
    }
    return result;
};

/**
 *
 * @param len
 * @param value
 * @returns {Array|*}
 */
var makeFilledArray = function (len, value) {
    var row = [];
    while (len-- > 0) row.push(value);
    return row;
};

/**
 *
 * @param len
 * @param value
 * @returns {Array}
 */
var makeSequenceArray = function (stepsize, from, to) {
    var sequence = [];
    index = 0;
    for (value = from; value <= to; value += stepsize) {
        sequence[index] = roundToPlaces(value, 3);
        index++;
    }
    return sequence;
};

/**
 *
 * @param data
 * @param len
 * @param value
 * @returns {Array.<T>}
 */
var addPadding = function (data, len, value) {
    if (data.length <= len) return makeFilledArray(data.length, 0);
    var shifted_data = data.slice(0, data.length - len);
    return makeFilledArray(len, value).concat(shifted_data);
};

/**
 *
 * @param data
 */
var discreteDerivative = function (data) {
    var shifted_data = data.slice(1, data.length);
    shifted_data.push(0);
    return data.map(function (value, index) {
        return shifted_data[index] - value;
    });
};

/**
 *
 * @param data
 * @param from
 * @param to
 * @returns {number}
 */
var findMinimumInRange = function (data, from, to) {
    data = data.slice(from, to);
    return findMinimum(data);
};

var findMinimum = function (data) {
    return Math.min.apply(null, data);
};

/**
 *
 * @param data
 * @param locations
 */
var selectionFromArray = function (data, locations) {
    return locations.map(function (location, i) {
        return data[location]
    })
};


var findAllValleys = function (data) {
    var first_derivative = discreteDerivative(data);
    var i, prev;
    valleys = [];

    for (i = 0; i < first_derivative.length; i++) {
        if (prev != undefined && first_derivative[i] > 0 && prev < 0) {
            valleys.push(i);
        }
        prev = first_derivative[i];
    }
    return valleys;
};

/**
 *
 * @param matrix
 * @param factor
 * @returns {Array}
 */
var scaleMatrix = function (matrix, factor) {
    return matrix.map(function (array, _index) {
        return scaleArray(array, factor);
    });
};

/**
 *
 * @param array
 * @param factor
 * @returns {Array}
 */
var scaleArray = function (array, factor) {
    return array.map(function (value, i) {
        return value * factor;
    });
};

/**
 *
 * @param arrays_to_sum
 * @returns {Array}
 */
var arraySum = function (arrays_to_sum) {
    if (arrays_to_sum.length < 1) throw ('At least one array is needed for summation');
    var array_id, i, array;
    var sum_array = [];
    array = arrays_to_sum[0];
    for (i = 0; i < array.length; i++) {
        sum_array.push(0);
        for (array_id = 0; array_id < arrays_to_sum.length; array_id++) {
            sum_array[i] += arrays_to_sum[array_id][i];
        }
    }
    return sum_array;
};

/**
 *
 * @param data
 * @returns {Array}
 */
var cumulativeSummation = function (data) {
    var unused_sum = 0;
    return data.map(function (variable, index) {
        sum = 0;
        // The if statement is needed so it also works with 1d arrays.
        if (variable.length != undefined) {
            return variable.map(function (value, index) {
                return sum += value;
            });
        } else {
            return unused_sum += variable;
        }
    });
};

/**
 * Check the sign of a number
 * @params x the number to check the sign of
 * @returns 1 if +, 0 if 0, -1 if -, nan otherwise
 */
function sign(x) {
    if (+x === x) { // check if a number was given
        return (x === 0) ? 0 : (x > 0) ? 1 : -1;
    }
    return NaN;
}

/**
 * Shuffles the array provided to it in a random order
 * @param ordered array
 * @returns shuffled array
 */
var shuffle = function (array) {
    return array.sort(function () {
        return 0.5 - Math.random()
    });
};

var sample = function(array) {
    var res = []
    for(var i = 0 ; i < array.length; i++) {
        res.push(array[Math.floor(Math.random() * array.length)]);
    }
    return res;
};



var average = function (data) {
    return data.reduce(function (sum, a) {
            return sum + a
        }, 0) / (data.length == 0 ? 1 : data.length);
};

/**
 * Function scales the data around its average
 * @param data
 * @returns {Array}
 */
var centerArray = function (data) {
    var avg = average(data);
    var res = [];
    data.forEach(function (data_point) {
        res.push(data_point - avg);
    });
    return res;
};



var sortNumericalArray = function (array, direction) {
    return array.sort(function(a, b) {
        return direction == 'desc' ? b - a : a - b;
    });
};

var getQuantile = function(array, probs) {
    var n, index, hi, lo, qs, i, h;
    n = array.length;
    index = (n - 1) * probs;

    lo = Math.floor(index);
    hi = Math.ceil(index);

    sortNumericalArray(array, 'asc');

    qs = array[lo];

    h = index > lo ? Math.round((index - lo)*1000)/1000 : 0;

    return (1 - h) * qs + h * array[hi]
};


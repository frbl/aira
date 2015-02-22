/**
 * From http://tech.pro/tutorial/1527/matrix-multiplication-in-functional-javascript
 * @param first
 * @param second
 * @returns {Array}
 */
var multiplyMatrices = function (first, second) {
    var secondColumns = transpose(second);
    return first.map(function (row) {
        return secondColumns.map(function (column) {
            return column.reduce(function (sum, value, index) {
                return sum + value * row[index];
            }, 0);
        });
    });
};

var sumMatrices = function (matrices) {
    var result = [];
    var r, c, m;
    for(r = 0 ; r < matrices[0].length;r++) {
        var temp = [];
        for(c = 0; c < matrices[0][r].length; c++){
            var val = 0;
            for(m = 0 ; m < matrices.length; m++) {
                val += matrices[m][r][c];
            }
            temp.push(val);
        }
        result.push(temp);
    }
    return result;
};


var printMatrix = function(matrix) {
    var r, c, s;
    console.log('-----------------');
    console.log('Dimensions: ' + matrix.length +"x" + matrix[0].length);
    s = '   ';
    for(r = 0 ; r < matrix.length;r++) {
        s += r + ', ';
    }
    console.log(s.slice(0, -2));
    for(r = 0 ; r < matrix.length;r++) {
        s = r + ': ';
        for(c = 0; c < matrix[r].length; c++){
            s += matrix[r][c] + ', ';
        }
        console.log(s.slice(0, -2));
    }
    console.log('-----------------');
    return true
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
var subset_matrix = function (matrix, from, to) {
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
    var matrix = new Array(nrow);
    for (var i = 0; i < nrow; i++) {
        matrix[i] = makeFilledArray(ncol, value);
        if (identity) matrix[i][i] = 1;
    }
    return matrix;
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
 * @param data
 * @returns {Array}
 */
var cumulativeSummation = function(data) {
    var unused_sum = 0;
    return data.map(function(variable, index) {
        sum = 0;
        // The if statement is needed so it also works with 1d arrays.
        if(variable.length != undefined) {
            return variable.map(function(value, index) {
                return sum += value;
            });
        } else {
            return unused_sum += variable;
        }
    });
};
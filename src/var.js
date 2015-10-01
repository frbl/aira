var Var = function() {};

Var.prototype.compute = function(y_values, lags, exogen_values) {
  var T = y_values.length - lags;
  console.log(exogen_values);
  var k = y_values[0].length;
  var Y = transpose(y_values);
  var Z = createMatrix(0, k * lags, T, false);
  for (var i = 0; i < lags; i++) {
    for (var j = 0; j < k; j++) {
      for (var t = 0; t < T; t++) {
        row = j;
        col = (t - (i+1)) + lags;
        Z[(k * i) + j][(t)] = Y[row][col];
        //Z[(k * i) + j][(t)] = row + " " + col;
        //console.log(row + " " + col);
      }
    }
  }


  exogen_values = transpose(exogen_values);
  for (i = 0; i < exogen_values.length; i++) {
    Z.push(exogen_values[i]);
  }
printMatrix(transpose(Z));
  console.log();
  //Y = subsetMatrix(Y, 0, T);
  //Y = subsetMatrix(Y, lags-1, T + lags-1);
  Y = subsetMatrix(Y, lags, T + lags);
  console.log(Z);
  var result = multiplyMatrices(Z, transpose(Z));
  console.log(result);
  result = math.inv(result);
  result = multiplyMatrices(transpose(Z), result);
  console.log(dimensions(Y));
  result = multiplyMatrices(Y, result);
  console.log(dimensions(result));
  result = subsetMatrix(result, 0, k);
  return (result);
};

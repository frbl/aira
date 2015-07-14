var fabricateViewModelMock = function(prediction, threshold, interpolation, improvement){
  return new ViewModelMock(prediction, threshold, interpolation, improvement);
};

function ViewModelMock(prediction, threshold, interpolation, improvement){
  this.prediction = prediction;
  this.threshold = threshold;
  this.interpolation = interpolation;
  this.improvement = improvement;
}

ViewModelMock.prototype.get_steps = function () {
  return this.prediction();
};

ViewModelMock.prototype.get_threshold = function() {
  return this.threshold();
};

ViewModelMock.prototype.get_interpolation = function() {
  return this.interpolation();
};

ViewModelMock.prototype.get_improvement = function() {
  return this.improvement();
};

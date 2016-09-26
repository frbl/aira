var fabricateViewModelMock = function(prediction, threshold, interpolation, improvement, bootstrap_iterations, chk_bootstrap){
  return new ViewModelMock(prediction, threshold, interpolation, improvement, bootstrap_iterations, chk_bootstrap);
};

function ViewModelMock(prediction, threshold, interpolation, improvement, bootstrap_iterations, chk_bootstrap){
  this.prediction = prediction;
  this.threshold = threshold;
  this.interpolation = interpolation;
  this.improvement = improvement;
  this.bootstrap_iterations = bootstrap_iterations || 0;
  this.chk_bootstrap = chk_bootstrap || false;
}

ViewModelMock.prototype.get_steps = function () {
  return this.prediction;
};

ViewModelMock.prototype.get_threshold = function() {
  return this.threshold;
};

ViewModelMock.prototype.get_interpolation = function() {
  return this.interpolation;
};

ViewModelMock.prototype.get_improvement = function() {
  return this.improvement;
};

ViewModelMock.prototype.get_bootstrap_iterations = function() {
  return this.bootstrap_iterations;
};

ViewModelMock.prototype.get_chk_bootstrap = function() {
  return this.chk_bootstrap;
};
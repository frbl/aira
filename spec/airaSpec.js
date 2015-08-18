describe("Aira", function() {
  describe("Constructorn", function() {
    it('set the correct impulse response calculator and var model', function() {
      var var_model = ['varmodel'];
      var impulse_response_calculator = 'irf_calculator';
      var view_model = 'view_model_object';
      var aira = new Aira(impulse_response_calculator, var_model, view_model);
      expect(aira.impulse_response_calculator ).toBe(impulse_response_calculator);
      expect(aira.var_model).toBe(var_model);
      expect(aira.view_model).toBe(view_model);
    });

  });

  describe("DetermineBestNodeFromAll", function() {
    var var_model, view_model, impulse_response_model, aira;
    beforeEach(function () {
      var_model = fabricateVarModel(true);
      view_model = fabricateViewModelMock (5, 1, 300,0.1);
      impulse_response_calculator = new ImpulseResponseCalculator(var_model);
      aira = new Aira(impulse_response_calculator, var_model, view_model);
    });

    it('should contain the correct list of nodes', function() {
      var result = aira.determineBestNodeFromAll().map(function(obj){return obj.name;});
      expect(result).toEqual(var_model.node_names);
    });

    it('the results of the algorithm should be 0 for each of the variables when the number of prediction steps is 1', function() {
      view_model = fabricateViewModelMock (1, 1, 300,0.1);
      aira = new Aira(impulse_response_calculator, var_model, view_model);
      var result = aira.determineBestNodeFromAll().map(function(obj){return obj.val;});
      expect(result).toEqual(makeFilledArray(var_model.number_of_variables, 0));
    });

    it('the results should be correct for a simple matrix', function() {
      var_model = fabricateSimpleVarModel();
      view_model = fabricateViewModelMock (6, 1, 1,0.1);
      impulse_response_calculator = new ImpulseResponseCalculator(var_model);
      aira = new Aira(impulse_response_calculator, var_model, view_model);

      var outcome1 = 0, outcome2 = 0;
      // at shock
      outcome1 += 0;
      outcome2 += 0;
      // at t-1
      outcome1 += 0.3;
      outcome2 += 0.5;
      // at t-2 (no autocorrelation)
      outcome1 += 0;
      outcome2 += 0;
      // at t-3 (effect on the other * the connection strength)
      outcome1 += 0.3 * 0.5 * 0.3;
      outcome2 += 0.5 * 0.3 * 0.5;
      // at t-5 (no autocorrelation)
      outcome1 += 0;
      outcome2 += 0;
      // at t-6 (effect on the other * the connection strength)
      outcome1 += 0.3 * 0.5 * 0.3 * 0.5 * 0.3;
      outcome2 += 0.5 * 0.3 * 0.5 * 0.3 * 0.5;
      var expected = [outcome1, outcome2];

      var result = aira.determineBestNodeFromAll().map(function(obj){return obj.val;});
      expect(result).toEqual(expected);
    });

  });

  describe("determineOptimalNodeSimple", function() {
    pending();
  });

  describe("determineOptimalNode", function() {
    pending();
  });

  describe("findValleyInMean", function() {
    pending();
  });

  describe("getDegradationEffect", function() {
    pending();
  });

});


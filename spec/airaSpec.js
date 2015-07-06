describe("Aira", function() {
  describe("Constructorn", function() {
    it('set the correct impulse response calculator and var model', function() {
      var var_model = ['varmodel'];
      var impulse_response_calculator = 'irf_calculator';
      var aira = new Aira(impulse_response_calculator, var_model);
      expect(aira.impulse_response_calculator ).toBe(impulse_response_calculator);
      expect(aira.var_model).toBe(var_model);
    });

  });

  describe("DetermineBestNodeFromAll", function() {
    pending();
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


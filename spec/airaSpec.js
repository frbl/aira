describe("Aira", function() {
  describe("Constructorn", function() {
    it('set the correct impulse response calculator and var model', function() {
      var var_model = 'varmodel';
      var impulse_response_calulator = 'irf_calculator';
      var aira = new Aira(impulse_response_calulator, var_model);
      expect(aira.impulse_response_calulator).toBe(impulse_response_calulator);
      expect(aira.var_model).toBe(var_model);
    });

  });

  describe("DetermineBestNodeFromAll", function() {

  });

  describe("determineOptimalNodeSimple", function() {

  });

  describe("determineOptimalNode", function() {
  });

  describe("findValleyInMean", function() {

  });

  describe("getDegradationEffect", function() {

  });

});


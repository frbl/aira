describe("ImpulseResponseCalculator", function() {
  describe("constructor", function() {

  });

  describe("with calculator", function() {
    beforeEach(function() {
      this.var_model = fabricateVarModel(true);
      this.impulse_response_calculator = new ImpulseResponseCalculator(this.var_model);
    });

    describe("estimate vma coefficients", function() {

    });

    describe("calculateImpulseResponse", function() {

    });

    describe("runImpulseResponseCalculation", function() {

    });

    fdescribe("delta", function() {
      it('should return the B matrix until the index, if it fits in the matrix', function() {
        this.impulse_response_calculator.delta();
        //expect(condition).toEqual();
      });

    });

  });

});

